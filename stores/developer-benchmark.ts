import { create } from "zustand";
import { ModelType } from "@/lib/api/models";
import { persist, createJSONStorage } from "zustand/middleware";

import { ChatConfig } from "@/lib/constants/codeSnippets/dynamic/chatCodes";
import {
  TTSConfig,
  STTConfig,
  AudioGenConfig,
} from "@/lib/constants/codeSnippets/dynamic/audioCodes";
import {
  VideoGenerationConfig,
  VideoStatusConfig,
} from "@/lib/constants/codeSnippets/dynamic/videoCodes";
import {
  ImageGenerationConfig,
  ImageEditConfig,
} from "@/lib/constants/codeSnippets/dynamic/imageCodes";

// Model-specific status interface
interface ModelStatus {
  status: "InProgress" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
  model?: string;
}

// Video queue item interface
export interface VideoQueueItem {
  id: string;
  requestId: string;
  invocationId?: string;
  timestamp: Date;
  prompt: string;
  models: string[];
  status: "processing" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
  requestDetails?: any;
  progress?: number;
  modelStatuses?: ModelStatus[];
  isRetry?: boolean;
  retryAttempts?: number;
  maxRetries: 3;
}

// for chat benchmark
interface ChatState {
  chat: {
    systemMessage: string;
    userMessage: string;
  };
  setSystemMessage: (message: string) => void;
  setUserMessage: (message: string) => void;
  setMessage: (type: "systemMessage" | "userMessage", message: string) => void;
  resetChat: () => void;
}

// New interface for history items
interface HistoryItem {
  id: string;
  name: string;
  timestamp: Date;
  statusCode: number;
  request?: any;
  response?: string;
  responseStats?: {
    statusCode: number | string;
    statusText: string;
    time: string;
    size: string;
  };
}

// Add storage management interface
interface StorageStats {
  used: number;
  total: number;
  percentage: number;
}

interface StoragePreferences {
  autoCleanup: boolean;
  keepDays: number;
  warningThreshold: number;
}

// Add this with other interfaces at the top
interface VideoToast {
  message: string;
  type: "success" | "error";
}

// Extended interface with shared state
interface SharedState {
  // API Response state
  response: string;
  isLoading: boolean;
  responseStats: {
    statusCode: number | string;
    statusText: string;
    time: string;
    size: string;
  };

  // History state
  history: HistoryItem[];
  activeHistoryId: string | null; // Track which history item is being viewed

  // Image mode state
  imageMode: "generate" | "edit" | null;
  setImageMode: (mode: "generate" | "edit" | null) => void;

  // Audio mode state
  audioMode: "stt" | "tts" | "generate" | null;
  setAudioMode: (mode: "stt" | "tts" | "generate" | null) => void;

  // Video mode state
  videoMode: "generate" | "edit" | "queue" | null;
  setVideoMode: (mode: "generate" | "edit" | "queue" | null) => void;

  // Video queue state
  videoQueue: VideoQueueItem[];
  addVideoQueueItem: (item: VideoQueueItem) => void;
  updateVideoQueueItem: (id: string, updates: Partial<VideoQueueItem>) => void;
  removeVideoQueueItem: (id: string) => void;
  clearVideoQueue: () => void;
  getVideoQueueItem: (requestId: string) => VideoQueueItem | undefined;

  // Chat mode state
  chatMode:
    | "completions"
    | "combination"
    | "summary"
    | "search"
    | "comparison"
    | null;
  setChatMode: (
    mode:
      | "completions"
      | "combination"
      | "summary"
      | "search"
      | "comparison"
      | null
  ) => void;

  // Actions
  setResponse: (response: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setResponseStats: (stats: SharedState["responseStats"]) => void;
  addHistoryItem: (item: HistoryItem) => void;
  clearHistory: () => void;
  resetResponseData: () => void;
  viewHistoryItem: (item: HistoryItem) => void; // New function to view a history item

  // Storage management
  storageStats: StorageStats;
  storagePreferences: StoragePreferences;

  // Storage actions
  updateStorageStats: () => void;
  updateStoragePreferences: (prefs: Partial<StoragePreferences>) => void;
  cleanupOldHistory: (days: number) => void;
  cleanupFailedRequests: () => void;
  exportHistory: () => string;
}

// Code Configuration State
interface CodeConfigState {
  // Chat Configurations
  chatConfig: ChatConfig | null;

  // Audio Configurations
  ttsConfig: TTSConfig | null;
  sttConfig: STTConfig | null;
  audioGenConfig: AudioGenConfig | null;

  // Video Configurations
  videoGenConfig: VideoGenerationConfig | null;
  videoStatusConfig: VideoStatusConfig | null;

  // Image Configurations
  imageGenConfig: ImageGenerationConfig | null;
  imageEditConfig: ImageEditConfig | null;

  // Actions for updating configurations
  setChatConfig: (config: ChatConfig | null) => void;
  setTTSConfig: (config: TTSConfig | null) => void;
  setSTTConfig: (config: STTConfig | null) => void;
  setAudioGenConfig: (config: AudioGenConfig | null) => void;
  setVideoGenConfig: (config: VideoGenerationConfig | null) => void;
  setVideoStatusConfig: (config: VideoStatusConfig | null) => void;
  setImageGenConfig: (config: ImageGenerationConfig | null) => void;
  setImageEditConfig: (config: ImageEditConfig | null) => void;

  // Helper to reset all configurations
  resetAllConfigs: () => void;
}

// Combined type for the store
interface StoreState {
  userId: string | null;
  setUserId: (id: string | null) => void;
  chat: {
    systemMessage: string;
    userMessage: string;
  };
  setSystemMessage: (message: string) => void;
  setUserMessage: (message: string) => void;
  setMessage: (type: "systemMessage" | "userMessage", message: string) => void;
  resetChat: () => void;
  chatConfig: ChatConfig | null;
  ttsConfig: TTSConfig | null;
  sttConfig: STTConfig | null;
  audioGenConfig: AudioGenConfig | null;
  videoGenConfig: VideoGenerationConfig | null;
  videoStatusConfig: VideoStatusConfig | null;
  imageGenConfig: ImageGenerationConfig | null;
  imageEditConfig: ImageEditConfig | null;
  setChatConfig: (config: ChatConfig | null) => void;
  setTTSConfig: (config: TTSConfig | null) => void;
  setSTTConfig: (config: STTConfig | null) => void;
  setAudioGenConfig: (config: AudioGenConfig | null) => void;
  setVideoGenConfig: (config: VideoGenerationConfig | null) => void;
  setVideoStatusConfig: (config: VideoStatusConfig | null) => void;
  setImageGenConfig: (config: ImageGenerationConfig | null) => void;
  setImageEditConfig: (config: ImageEditConfig | null) => void;
  resetAllConfigs: () => void;
  response: string;
  isLoading: boolean;
  responseStats: {
    statusCode: number | string;
    statusText: string;
    time: string;
    size: string;
  };
  history: HistoryItem[];
  activeHistoryId: string | null;
  imageMode: "generate" | "edit" | null;
  setImageMode: (mode: "generate" | "edit" | null) => void;
  audioMode: "stt" | "tts" | "generate" | null;
  setAudioMode: (mode: "stt" | "tts" | "generate" | null) => void;
  videoMode: "generate" | "edit" | "queue" | null;
  setVideoMode: (mode: "generate" | "edit" | "queue" | null) => void;
  videoQueue: VideoQueueItem[];
  addVideoQueueItem: (item: VideoQueueItem) => void;
  updateVideoQueueItem: (id: string, updates: Partial<VideoQueueItem>) => void;
  removeVideoQueueItem: (id: string) => void;
  clearVideoQueue: () => void;
  getVideoQueueItem: (requestId: string) => VideoQueueItem | undefined;
  chatMode:
    | "completions"
    | "combination"
    | "summary"
    | "search"
    | "comparison"
    | null;
  setChatMode: (
    mode:
      | "completions"
      | "combination"
      | "summary"
      | "search"
      | "comparison"
      | null
  ) => void;
  setResponse: (response: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setResponseStats: (stats: SharedState["responseStats"]) => void;
  addHistoryItem: (item: HistoryItem) => void;
  clearHistory: () => void;
  resetResponseData: () => void;
  viewHistoryItem: (item: HistoryItem) => void;
  storageStats: StorageStats;
  storagePreferences: StoragePreferences;
  updateStorageStats: () => void;
  updateStoragePreferences: (prefs: Partial<StoragePreferences>) => void;
  cleanupOldHistory: (days: number) => void;
  cleanupFailedRequests: () => void;
  exportHistory: () => string;
  videoToast: VideoToast | null;
  setVideoToast: (message: string, type: "success" | "error") => void;
}

const useChatAPIStore = create<StoreState>()(
  persist(
    (set, get) => ({
      userId: null,
      setUserId: (id: string | null) => set({ userId: id }),
      chat: {
        systemMessage: "",
        userMessage: "",
      },

      // Code Configuration State - Initial values
      chatConfig: null,
      ttsConfig: null,
      sttConfig: null,
      audioGenConfig: null,
      videoGenConfig: null,
      videoStatusConfig: null,
      imageGenConfig: null,
      imageEditConfig: null,

      // Configuration Actions
      setChatConfig: (config) => set({ chatConfig: config }),
      setTTSConfig: (config) => set({ ttsConfig: config }),
      setSTTConfig: (config) => set({ sttConfig: config }),
      setAudioGenConfig: (config) => set({ audioGenConfig: config }),
      setVideoGenConfig: (config) => set({ videoGenConfig: config }),
      setVideoStatusConfig: (config) => set({ videoStatusConfig: config }),
      setImageGenConfig: (config) => set({ imageGenConfig: config }),
      setImageEditConfig: (config) => set({ imageEditConfig: config }),

      // Reset all configurations
      resetAllConfigs: () =>
        set({
          chatConfig: null,
          ttsConfig: null,
          sttConfig: null,
          audioGenConfig: null,
          videoGenConfig: null,
          videoStatusConfig: null,
          imageGenConfig: null,
          imageEditConfig: null,
        }),

      setSystemMessage: (message: string) =>
        set((state) => ({
          chat: {
            ...state.chat,
            systemMessage: message,
          },
        })),

      setUserMessage: (message: string) =>
        set((state) => ({
          chat: {
            ...state.chat,
            userMessage: message,
          },
        })),

      // Add a message with specified type
      setMessage: (type: "systemMessage" | "userMessage", message: string) =>
        set((state) => ({
          chat: {
            ...state.chat,
            [type]: message,
          },
        })),

      // Reset all messages
      resetChat: () =>
        set({
          chat: {
            systemMessage: "",
            userMessage: "",
          },
        }),

      // New shared state
      response: "",
      isLoading: false,
      responseStats: {
        statusCode: "-",
        statusText: "-",
        time: "-",
        size: "-",
      },
      history: [],
      activeHistoryId: null,

      // Image mode state
      imageMode: null,

      // Audio mode state
      audioMode: null,

      // Video mode state
      videoMode: null,

      // Video queue state
      videoQueue: [],

      // Chat mode state
      chatMode: "completions",

      // New actions for shared state
      setResponse: (response: string) =>
        set({ response, activeHistoryId: null }),

      setIsLoading: (isLoading: boolean) => set({ isLoading }),

      setResponseStats: (stats) => set({ responseStats: stats }),

      // Initialize storage management
      storageStats: {
        used: 0,
        total: 5 * 1024 * 1024, // 5MB default
        percentage: 0,
      },

      storagePreferences: {
        autoCleanup: true,
        keepDays: 30,
        warningThreshold: 80, // 80%
      },

      // Storage management actions
      updateStorageStats: () => {
        const state = get();
        const historySize = new Blob([JSON.stringify(state.history)]).size;
        const total = 5 * 1024 * 1024; // 5MB
        const percentage = (historySize / total) * 100;

        set({
          storageStats: {
            used: historySize,
            total,
            percentage,
          },
        });
      },

      updateStoragePreferences: (prefs) =>
        set((state) => ({
          storagePreferences: {
            ...state.storagePreferences,
            ...prefs,
          },
        })),

      // Override existing addHistoryItem to include storage management
      addHistoryItem: (item: HistoryItem) =>
        set((state) => {
          // Check if an item with the same ID already exists
          const exists = state.history.some(
            (historyItem) => historyItem.id === item.id
          );

          // If it exists, don't add it
          if (exists) {
            return state;
          }

          let historyItems = [item, ...state.history];

          // Calculate new size
          const newSize = new Blob([JSON.stringify(historyItems)]).size;
          const isOverLimit = newSize >= state.storageStats.total;

          // If over limit, try cleanup first
          if (
            isOverLimit ||
            (state.storagePreferences.autoCleanup &&
              state.storageStats.percentage >=
                state.storagePreferences.warningThreshold)
          ) {
            // Try aggressive cleanup first
            const cutoff = new Date();
            cutoff.setDate(
              cutoff.getDate() -
                (isOverLimit ? 1 : state.storagePreferences.keepDays)
            );
            historyItems = historyItems.filter(
              (item) => new Date(item.timestamp) >= cutoff
            );

            // If still over limit after cleanup
            const sizeAfterCleanup = new Blob([JSON.stringify(historyItems)])
              .size;
            if (sizeAfterCleanup >= state.storageStats.total) {
              // Keep only the new item if we can't store more
              historyItems = [item];
            }
          }

          // Update storage stats after modification
          setTimeout(() => get().updateStorageStats(), 0);

          return {
            history: historyItems,
            activeHistoryId: null,
          };
        }),

      // Image mode action
      setImageMode: (mode: "generate" | "edit" | null) =>
        set({
          imageMode: mode,
          imageGenConfig: null,
          imageEditConfig: null,
        }),

      // Audio mode action
      setAudioMode: (mode: "stt" | "tts" | "generate" | null) =>
        set({
          audioMode: mode,
          ttsConfig: null,
          sttConfig: null,
          audioGenConfig: null,
        }),

      // Video mode action
      setVideoMode: (mode: "generate" | "edit" | "queue" | null) =>
        set({
          videoMode: mode,
          videoGenConfig: null,
          videoStatusConfig: null,
        }),

      // Chat mode action
      setChatMode: (
        mode:
          | "completions"
          | "combination"
          | "summary"
          | "search"
          | "comparison"
          | null
      ) =>
        set({
          chatMode: mode,
          chatConfig: null,
        }),

      // Video queue actions
      addVideoQueueItem: (item: VideoQueueItem) =>
        set((state) => ({
          videoQueue: [item, ...state.videoQueue],
        })),

      updateVideoQueueItem: (id: string, updates: Partial<VideoQueueItem>) =>
        set((state) => ({
          videoQueue: state.videoQueue.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      removeVideoQueueItem: (id: string) =>
        set((state) => ({
          videoQueue: state.videoQueue.filter((item) => item.id !== id),
        })),

      clearVideoQueue: () =>
        set({
          videoQueue: [],
        }),

      getVideoQueueItem: (requestId: string) => {
        return get().videoQueue.find((item) => item.requestId === requestId);
      },

      // Add back the missing required functions
      clearHistory: () =>
        set((state) => {
          setTimeout(() => get().updateStorageStats(), 0);
          return {
            history: [],
            videoQueue: [],
            activeHistoryId: null,
          };
        }),

      resetResponseData: () =>
        set({
          response: "",
          responseStats: {
            statusCode: "-",
            statusText: "-",
            time: "-",
            size: "-",
          },
          activeHistoryId: null,
        }),

      viewHistoryItem: (item: HistoryItem) =>
        set({
          response:
            typeof item.response === "string"
              ? item.response
              : JSON.stringify(item.response, null, 2),
          responseStats: item.responseStats || {
            statusCode: item.statusCode,
            statusText: item.statusCode >= 400 ? "Error" : "OK",
            time: "-",
            size: "-",
          },
          activeHistoryId: item.id,
        }),

      cleanupOldHistory: (days) =>
        set((state) => {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          const newHistory = state.history.filter(
            (item) => new Date(item.timestamp) >= cutoff
          );

          // Update storage stats after cleanup
          setTimeout(() => get().updateStorageStats(), 0);

          return {
            history: newHistory,
          };
        }),

      cleanupFailedRequests: () =>
        set((state) => {
          const newHistory = state.history.filter(
            (item) => item.statusCode < 400
          );
          const newVideoQueue = state.videoQueue.filter(
            (item) => item.status !== "failed"
          );

          // Update storage stats after cleanup
          setTimeout(() => get().updateStorageStats(), 0);

          return {
            history: newHistory,
            videoQueue: newVideoQueue,
          };
        }),

      exportHistory: () => {
        const state = get();
        const exportData = {
          exportDate: new Date().toISOString(),
          totalHistoryItems: state.history.length,
          totalVideoItems: state.videoQueue.length,
          storageStats: {
            used: `${(state.storageStats.used / (1024 * 1024)).toFixed(2)}MB`,
            total: `${(state.storageStats.total / (1024 * 1024)).toFixed(2)}MB`,
            percentage: Math.round(state.storageStats.percentage),
          },
          history: state.history.map((item) => ({
            id: item.id,
            name: item.name,
            timestamp: item.timestamp,
            statusCode: item.statusCode,
            request: item.request,
            response: item.response,
            responseStats: item.responseStats,
          })),
          videoQueue: state.videoQueue.map((item) => ({
            id: item.id,
            requestId: item.requestId,
            timestamp: item.timestamp,
            prompt: item.prompt,
            models: item.models,
            status: item.status,
            videoUrl: item.videoUrl,
            error: item.error,
            modelStatuses: item.modelStatuses,
          })),
        };
        return JSON.stringify(exportData, null, 2);
      },

      videoToast: null,
      setVideoToast: (message: string, type: "success" | "error") =>
        set({ videoToast: { message, type } }),
    }),
    {
      name: "chat-api-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => localStorage.getItem(name),
        setItem: (name, value) => localStorage.setItem(name, value),
        removeItem: (name) => localStorage.removeItem(name),
      })),
      partialize: (state) => ({
        userId: state.userId,
        history: state.history,
        videoQueue: state.videoQueue,
        storagePreferences: state.storagePreferences,
      }),
    }
  )
);

export default useChatAPIStore;

//  api cle
interface ApiKeyState {
  apiKey: string;
  setApiKey: (key: string) => void;
}

// api key store
export const useApiKeyStore = create<ApiKeyState>((set) => ({
  apiKey: "",
  setApiKey: (key) => set({ apiKey: key }), // Update API key
}));

// Model option structure
export interface ModelOption {
  value: string;
  label: string;
  model_category?: string;
  valid_inputs?: string[];
}

// Simple model API store interface
interface ModelAPIState {
  // Models cached by type
  models: {
    chat: ModelOption[];
    image: ModelOption[];
    audio: ModelOption[];
    video: ModelOption[];
  };

  // Actions
  setModels: (type: ModelType, models: ModelOption[]) => void;
  getModels: (type: ModelType, subType?: string) => ModelOption[];
  clearCache: (type?: ModelType) => void;
}

// Create the simple model API store
export const useModelAPIStore = create<ModelAPIState>((set, get) => ({
  // Models data
  models: {
    chat: [],
    image: [],
    audio: [],
    video: [],
  },

  // Set models for a specific type
  setModels: (type: ModelType, models: ModelOption[]) =>
    set((state) => ({
      models: {
        ...state.models,
        [type]: models,
      },
    })),

  // Get models with optional subType filtering
  getModels: (type: ModelType, subType?: string) => {
    const models = get().models[type];

    // If subType is provided, filter by model_category
    if (subType && subType.trim() !== "") {
      return models.filter((model) => model.model_category === subType);
    }

    // Otherwise return all models of this type
    return models;
  },

  // Clear cache for specific type or all types
  clearCache: (type?: ModelType) => {
    if (type) {
      // Clear specific type
      set((state) => ({
        models: {
          ...state.models,
          [type]: [],
        },
      }));
    } else {
      // Clear all
      set({
        models: {
          chat: [],
          image: [],
          audio: [],
          video: [],
        },
      });
    }
  },
}));
// Status store interface
interface StatusState {
  apiCallStatus: boolean;
  setApiCallStatus: (status: boolean) => void;
}

// Create the status store
export const useApiStatusStore = create<StatusState>((set) => ({
  apiCallStatus: false,
  setApiCallStatus: (status: boolean) => set({ apiCallStatus: status }),
}));
