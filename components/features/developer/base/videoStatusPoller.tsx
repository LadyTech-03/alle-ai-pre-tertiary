"use client";

import { useEffect, useRef, useCallback } from "react";
import { requestJson } from "@/lib/api/apiClient/requests";
import { VideoQueueItem } from "@/stores/developer-benchmark";
import useChatAPIStore from "@/stores/developer-benchmark";

interface ModelStatus {
  status: "InProgress" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
  model?: string;
}

interface VideoStatusPollerProps {
  items: VideoQueueItem[];
  onStatusUpdate: (
    id: string,
    status: "processing" | "completed" | "failed",
    error?: string,
    videoUrl?: string,
    modelStatuses?: ModelStatus[]
  ) => void;
  pollingInterval?: number;
  maxRetries?: number;
}

interface ModelInfo {
  status: string;
  url?: string;
  error?: string;
}

interface RequestTiming {
  requestStartTime: number;
  statusCheckStartTime?: number;
  retryCount: number;
}

interface PollingState {
  isActive: boolean;
  intervalId: number;
  activeRequests: Set<string>;
  processingItems: Set<string>;
  requestTimings: Map<string, RequestTiming>;
  abortController: AbortController;
}

export default function VideoStatusPoller({
  items,
  onStatusUpdate,
  pollingInterval = 10000,
  maxRetries = 3,
}: VideoStatusPollerProps) {
  const addHistoryItem = useChatAPIStore((state) => state.addHistoryItem);
  const history = useChatAPIStore((state) => state.history);
  const setVideoToast = useChatAPIStore((state) => state.setVideoToast);
  
  // Single state object to manage all polling state
  const pollingStateRef = useRef<PollingState>({
    isActive: false,
    intervalId: 0,
    activeRequests: new Set(),
    processingItems: new Set(),
    requestTimings: new Map(),
    abortController: new AbortController(),
  });
  
  // Ref to store current items to avoid stale closures
  const itemsRef = useRef<VideoQueueItem[]>(items);
  
  // Update items ref whenever items change
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Helper functions
  const historyItemExists = useCallback((requestId: string) => {
    return history.some(item => item.id === `video-${requestId}`);
  }, [history]);

  const calculateResponseSize = useCallback((response: any): string => {
    try {
      const responseString = JSON.stringify(response);
      const sizeInBytes = new Blob([responseString]).size;

      if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`;
      } else if (sizeInBytes < 1024 * 1024) {
        return `${(sizeInBytes / 1024).toFixed(1)} KB`;
      } else {
        return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
      }
    } catch {
      return "Unknown";
    }
  }, []);

  const formatDuration = useCallback((milliseconds: number): string => {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = Math.floor((milliseconds % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  }, []);

  const normalizeModelStatus = useCallback((status: string): "InProgress" | "completed" | "failed" => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus === "completed" || lowerStatus === "complete") {
      return "completed";
    } else if (
      lowerStatus === "inprogress" ||
      lowerStatus === "in progress" ||
      lowerStatus === "processing"
    ) {
      return "InProgress";
    } else if (
      lowerStatus === "failed" ||
      lowerStatus === "failure" ||
      lowerStatus === "error"
    ) {
      return "failed";
    } else {
      return "InProgress";
    }
  }, []);

  const createHistoryItem = useCallback((
    item: VideoQueueItem,
    response: any,
    statusCode: number,
    statusText: string,
    duration: number,
    isNetworkError = false
  ) => {
    const historyId = `video-${item.requestId}`;
    
    // Double-check if history item already exists
    if (historyItemExists(item.requestId)) {
      return;
    }

    const historyItem = {
      id: historyId,
      name: `VideoStatusCheck ${statusText} - ${item.prompt.substring(0, 30)}...`,
      timestamp: new Date(),
      statusCode,
      request: {
        requestId: item.requestId,
        endpoint: "/video/status",
      },
      response: isNetworkError ? JSON.stringify(response) : response,
      responseStats: {
        statusCode,
        statusText,
        time: formatDuration(duration),
        size: calculateResponseSize(response),
      },
    };

    addHistoryItem(historyItem);
  }, [addHistoryItem, historyItemExists, formatDuration, calculateResponseSize]);

  const removeItemFromProcessing = useCallback((itemId: string, reason: string = "completed") => {
    const state = pollingStateRef.current;
    
    state.processingItems.delete(itemId);
    state.activeRequests.delete(itemId);
    state.requestTimings.delete(itemId);
    
    // Stop polling if no items are processing
    if (state.processingItems.size === 0 && state.isActive) {
      stopPolling();
    }
  }, []);

  const checkVideoStatus = useCallback(async (item: VideoQueueItem): Promise<void> => {
    const state = pollingStateRef.current;
    
    // Early exits for various conditions
    if (!state.isActive) return;
    if (!state.processingItems.has(item.id)) return;
    if (state.activeRequests.has(item.id)) return;

    // Verify item is still processing in the current items array
    const currentItem = itemsRef.current.find(i => i.id === item.id);
    if (!currentItem || currentItem.status !== "processing") {
      removeItemFromProcessing(item.id, "status changed");
      return;
    }

    // Check if we've exceeded max retries
    const timing = state.requestTimings.get(item.id);
    if (timing && timing.retryCount >= maxRetries) {
      removeItemFromProcessing(item.id, "max retries exceeded");
      onStatusUpdate(item.id, "failed", "Maximum retry attempts exceeded");
      return;
    }

    // Mark request as active
    state.activeRequests.add(item.id);
    
    const statusCheckStartTime = Date.now();

    // Get or create timing info
    let requestTiming = state.requestTimings.get(item.id);
    if (!requestTiming) {
      requestTiming = {
        requestStartTime: Date.now(),
        statusCheckStartTime,
        retryCount: 0,
      };
      state.requestTimings.set(item.id, requestTiming);
    } else {
      requestTiming.statusCheckStartTime = statusCheckStartTime;
    }

    try {
      const response = await requestJson("/video/status", {
        requestId: item.requestId,
      });

      const statusCheckEndTime = Date.now();
      const statusCheckDuration = statusCheckEndTime - statusCheckStartTime;
      const totalDuration = statusCheckEndTime - requestTiming.requestStartTime;

      // Remove from active requests immediately
      state.activeRequests.delete(item.id);

      // Handle API error response
      if (response.error) {
        removeItemFromProcessing(item.id, "API error");
        
        createHistoryItem(
          item,
          response,
          400,
          "Failed",
          totalDuration
        );

        onStatusUpdate(item.id, "failed", response.error.message);
        return;
      }

      // Process model statuses
      const modelData = response.data;
      const modelStatuses: ModelStatus[] = [];

      if (modelData && typeof modelData === "object") {
        Object.keys(modelData).forEach((modelName) => {
          const modelInfo = modelData[modelName];
          
          const normalizedStatus = typeof modelInfo.status === "string" 
            ? normalizeModelStatus(modelInfo.status)
            : "InProgress";

          modelStatuses.push({
            model: modelName,
            status: normalizedStatus,
            videoUrl: modelInfo.url,
            error: modelInfo.error,
          });
        });
      }

      // Determine overall status with success priority
      let overallStatus: "processing" | "completed" | "failed" = "processing";
      let firstCompletedUrl: string | undefined = undefined;

      const hasInProgressModel = modelStatuses.some(
        (model) => model.status === "InProgress"
      );
      const hasCompletedModel = modelStatuses.some(
        (model) => model.status === "completed"
      );
      const hasFailedModel = modelStatuses.some(
        (model) => model.status === "failed"
      );

      if (hasInProgressModel) {
        overallStatus = "processing";
      } else if (hasCompletedModel) {
        overallStatus = "completed";
      } else if (hasFailedModel) {
        overallStatus = "failed";
      }

      // Get first completed video URL
      const completedModel = modelStatuses.find(
        (model) => model.status === "completed" && model.videoUrl
      );
      if (completedModel) {
        firstCompletedUrl = completedModel.videoUrl;
      }

      // Handle final states
      if (overallStatus !== "processing") {
        removeItemFromProcessing(item.id, `final status: ${overallStatus}`);
        
        createHistoryItem(
          item,
          response,
          overallStatus === "completed" ? 200 : 400,
          overallStatus === "completed" ? "Completed" : "Failed",
          totalDuration
        );

        // Add toast notification for final status
        if (overallStatus === "completed") {
          setVideoToast("Video generation completed successfully", "success");
        } else if (overallStatus === "failed") {
          setVideoToast("Video generation failed", "error");
        }

        // Reset retry count on successful processing status
        requestTiming.retryCount = 0;

        // Update item status
        onStatusUpdate(
          item.id,
          overallStatus,
          undefined,
          firstCompletedUrl,
          modelStatuses
        );
      } else {
        // Reset retry count on successful processing status
        requestTiming.retryCount = 0;
      }

    } catch (error) {
      const statusCheckEndTime = Date.now();
      const statusCheckDuration = statusCheckEndTime - statusCheckStartTime;
      const totalDuration = statusCheckEndTime - requestTiming.requestStartTime;

      // Remove from active requests
      state.activeRequests.delete(item.id);
      
      // Increment retry count
      requestTiming.retryCount++;

      // Check if we should retry or fail
      if (requestTiming.retryCount >= maxRetries) {
        removeItemFromProcessing(item.id, "network error - max retries exceeded");
        
        const errorResponse = {
          error: "Network error during status check",
          modelStatuses: [],
          overallStatus: "failed"
        };

        createHistoryItem(
          item,
          errorResponse,
          500,
          "Network Error",
          totalDuration,
          true
        );

        onStatusUpdate(item.id, "failed", "Network error during status check");
      }
    }
  }, [onStatusUpdate, maxRetries, removeItemFromProcessing, createHistoryItem, normalizeModelStatus, setVideoToast]);

  const checkAllProcessingItems = useCallback(async (): Promise<void> => {
    const state = pollingStateRef.current;
    
    if (!state.isActive) return;

    if (state.processingItems.size === 0) {
      stopPolling();
      return;
    }

    // Get current processing items from fresh items data
    const processingItems = itemsRef.current.filter((item) =>
      state.processingItems.has(item.id) && item.status === "processing"
    );

    // Remove items that are no longer processing
    const currentProcessingIds = new Set(processingItems.map(item => item.id));
    for (const itemId of state.processingItems) {
      if (!currentProcessingIds.has(itemId)) {
        removeItemFromProcessing(itemId, "no longer in items array");
      }
    }

    // Check status for each processing item
    const statusPromises = processingItems.map(item => 
      checkVideoStatus(item).catch(error => {
        // Keep error handling but remove console.error
      })
    );

    await Promise.allSettled(statusPromises);

    // Final check to stop polling if no items remain
    if (state.processingItems.size === 0 && state.isActive) {
      stopPolling();
    }
  }, [checkVideoStatus, removeItemFromProcessing]);

  const startPolling = useCallback(() => {
    const state = pollingStateRef.current;
    
    if (state.isActive) return;

    state.isActive = true;
    state.intervalId = ++state.intervalId; // Increment to handle race conditions
    
    const currentIntervalId = state.intervalId;

    // Initial check
    checkAllProcessingItems();

    // Set up interval
    const intervalHandle = setInterval(() => {
      // Only execute if this is still the current interval
      if (state.intervalId === currentIntervalId && state.isActive) {
        checkAllProcessingItems();
      }
    }, pollingInterval);

    // Store the interval handle for cleanup
    (state as any).intervalHandle = intervalHandle;
  }, [checkAllProcessingItems, pollingInterval]);

  const stopPolling = useCallback(() => {
    const state = pollingStateRef.current;
    
    if (!state.isActive) return;
    
    state.isActive = false;
    
    if ((state as any).intervalHandle) {
      clearInterval((state as any).intervalHandle);
      (state as any).intervalHandle = null;
    }

    // Abort any pending requests
    state.abortController.abort();
    state.abortController = new AbortController();
    
    // Clear active requests
    state.activeRequests.clear();
  }, []);

  const cleanupRefs = useCallback(() => {
    const state = pollingStateRef.current;
    const currentItemIds = new Set(itemsRef.current.map(item => item.id));
    
    // Clean up timing data for items no longer in the queue
    for (const [id] of state.requestTimings.entries()) {
      if (!currentItemIds.has(id)) {
        state.requestTimings.delete(id);
      }
    }

    // Clean up processing items for items no longer in the queue
    for (const id of state.processingItems) {
      if (!currentItemIds.has(id)) {
        state.processingItems.delete(id);
      }
    }

    // Clean up active requests for items no longer in the queue
    for (const id of state.activeRequests) {
      if (!currentItemIds.has(id)) {
        state.activeRequests.delete(id);
      }
    }
  }, []);

  // Main effect to manage polling lifecycle
  useEffect(() => {
    const state = pollingStateRef.current;
    
    // Clean up stale refs first
    cleanupRefs();
    
    // Get currently processing items
    const currentProcessingItems = items.filter(
      (item) => item.status === "processing"
    );

    // Update processing items set
    state.processingItems.clear();
    currentProcessingItems.forEach((item) => {
      state.processingItems.add(item.id);
      
      // Initialize timing info if not present
      if (!state.requestTimings.has(item.id)) {
        state.requestTimings.set(item.id, {
          requestStartTime: Date.now(),
          retryCount: 0,
        });
      }
    });

    // Start or stop polling based on processing items
    if (state.processingItems.size > 0) {
      if (!state.isActive) {
        startPolling();
      }
    } else {
      if (state.isActive) {
        stopPolling();
      }
    }

    // Cleanup function
    return () => {
      // Only stop polling if component is unmounting
      // (not just when dependencies change)
    };
  }, [items, pollingInterval, startPolling, stopPolling, cleanupRefs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      pollingStateRef.current.processingItems.clear();
      pollingStateRef.current.requestTimings.clear();
      pollingStateRef.current.activeRequests.clear();
    };
  }, [stopPolling]);

  return null;
}