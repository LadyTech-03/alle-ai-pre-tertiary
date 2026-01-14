"use client";

import { useState } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
  History,
  RefreshCw,
  Clock,
  Info,
  Settings,
  Download,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip } from "react-tooltip";
import useChatAPIStore from "@/stores/developer-benchmark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useEffect } from "react";

// Add interface for message structure
interface MessageContent {
  type: string;
  text: string;
}

interface Message {
  user?: MessageContent[];
  system?: MessageContent[];
  assistants?: { [key: string]: MessageContent[] };
}

interface HistoryItem {
  id: string;
  name: string;
  timestamp: Date;
  statusCode: number;
  request?: {
    messages?: Message[];
    model?: string;
    prompt?: string;
    inputText?: string;
    generationPrompt?: string;
    editInstructions?: string;
  };
  response?: string;
  responseStats?: {
    statusCode: number | string;
    statusText: string;
    time: string;
    size: string;
  };
}

interface ApiHistoryProps {
  history: HistoryItem[];
  clearHistory: () => void;
}

const ApiHistory: React.FC<ApiHistoryProps> = ({ history, clearHistory }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    viewHistoryItem,
    activeHistoryId,
    response,
    storageStats,
    storagePreferences,
    updateStoragePreferences,
    cleanupOldHistory,
    cleanupFailedRequests,
    exportHistory,
    updateStorageStats,
  } = useChatAPIStore();

  // Initialize storage stats when component mounts
  useEffect(() => {
    updateStorageStats();
  }, [updateStorageStats]);

  // Handle refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Shorter delay if no history
    const delay = history.length === 0 ? 400 : 800;
    updateStorageStats();
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsRefreshing(false);
  };

  // Format bytes to human readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Handle export
  const handleExport = (shouldClear: boolean = false) => {
    try {
      const historyData = exportHistory();
      const blob = new Blob([historyData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alle-ai-api-history-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Only clear if shouldClear is true
      if (shouldClear) {
        clearHistory();
      }
    } catch (error) {
      console.error("Failed to export history:", error);
      // will consider showing a toast/notification here
    }
  };

  // Determine if restore button should be disabled for a specific item
  const isRestoreDisabled = (itemId: string) => {
    if (activeHistoryId === itemId) return true;
    if (history.length === 1 && response && response.trim() !== "") return true;
    return false;
  };

  // Format timestamp to readable format
  const formatTimestamp = (timestamp: Date) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid time";
    }
  };

  // Get status badge color based on status code
  const getStatusBadgeClass = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return "bg-green-500/10 text-green-500 border-0";
    } else if (statusCode >= 400) {
      return "bg-red-500/10 text-red-500 border-0";
    } else {
      return "bg-yellow-500/10 text-yellow-500 border-0";
    }
  };

  // Truncate long text
  const truncateText = (text: string, maxLength = 50) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <History className="h-4 w-4 mr-2 text-muted-foreground" />
            <h3 className="text-sm font-medium">History</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Manage History Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary text-xs h-7 px-3 flex items-center gap-1"
                  disabled={history.length === 0}
                >
                  Manage History
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 dark:bg-[#383838]"
              >
                <DropdownMenuItem
                  onClick={clearHistory}
                  className="flex items-center"
                >
                  <History className="h-4 w-4 mr-2" />
                  Clear All
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => cleanupOldHistory(30)}
                  className="flex items-center"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Clear Older than 30 Days
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={cleanupFailedRequests}
                  className="flex items-center"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Clear Failed Requests
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport(true)}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export & Clear
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleExport(false)}
              data-tooltip-id="export-tooltip"
              data-tooltip-content="Export history"
              disabled={history.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Tooltip
              id="export-tooltip"
              place="bottom"
              className="bg-backgroundSecondary/30 text-muted-foreground"
              style={{
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            />

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 dark:bg-[#383838] "
              >
                <DropdownMenuItem
                  onClick={() =>
                    updateStoragePreferences({
                      autoCleanup: !storagePreferences.autoCleanup,
                    })
                  }
                  className="flex items-center justify-between"
                >
                  <span>Auto Cleanup</span>
                  <div
                    className={`h-4 w-4 rounded-full border ${
                      storagePreferences.autoCleanup
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {storagePreferences.autoCleanup && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-background"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateStoragePreferences({
                      keepDays: storagePreferences.keepDays === 30 ? 7 : 30,
                    })
                  }
                  className="flex items-center justify-between"
                >
                  <span>Keep History For</span>
                  <span className="text-xs text-muted-foreground">
                    {storagePreferences.keepDays} days
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateStoragePreferences({
                      warningThreshold:
                        storagePreferences.warningThreshold === 80 ? 50 : 80,
                    })
                  }
                  className="flex items-center justify-between"
                >
                  <span>Warning Threshold</span>
                  <span className="text-xs text-muted-foreground">
                    {storagePreferences.warningThreshold}%
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh Stats Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-tooltip-id="refresh-tooltip"
              data-tooltip-content="Refresh storage stats"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Tooltip
              id="refresh-tooltip"
              place="bottom"
              className="bg-backgroundSecondary/30 text-muted-foreground"
              style={{
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            />

            <Info
              data-tooltip-id="history-tooltip"
              data-tooltip-content="History is saved in browser storage. Export to keep it permanently, as it will be lost when browser cache is cleared or manually cleared"
              size={16}
              className="cursor-pointer text-blue-500 hover:text-blue-700 transition-colors"
            />
            <Tooltip
              id="history-tooltip"
              place="bottom"
              className="bg-backgroundSecondary/30 text-muted-foreground"
              style={{
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            />
          </div>
        </div>

        {/* Storage Status */}
        <div className={`mb-4 bg-backgroundSecondary/30 p-3 rounded-md transition-opacity duration-200 ${isRefreshing ? 'opacity-50' : ''}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">
              Storage Used: {formatBytes(storageStats.used)} /{" "}
              {formatBytes(storageStats.total)}
            </span>
            <span className="text-xs text-muted-foreground">
              {storageStats.percentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={storageStats.percentage} className="h-1" />
          {storagePreferences.autoCleanup && (
            <div className="flex items-center mt-2">
              <span className="text-xs text-muted-foreground">
                Auto cleanup enabled ({storagePreferences.keepDays} days)
              </span>
            </div>
          )}
        </div>

        {/* Warning Banner */}
        {storageStats.percentage >= storagePreferences.warningThreshold && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-xs text-yellow-500">
                Storage is {storageStats.percentage.toFixed(1)}% full. Old items
                will be automatically cleaned up.
              </span>
            </div>
          </div>
        )}

        <Separator className="my-2" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-hidden px-6 py-2">
        <ScrollArea className="h-full w-full">
          {isRefreshing ? (
            <div className="space-y-3 pr-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="px-4 py-3 border rounded-md border-borderColorPrimary bg-backgroundSecondary/5"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-24 bg-gradient-to-r from-backgroundSecondary/30 to-backgroundSecondary/10 rounded-full"></div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-backgroundSecondary/20 rounded-full mr-1"></div>
                        <div className="h-4 w-16 bg-gradient-to-r from-backgroundSecondary/30 to-backgroundSecondary/10 rounded"></div>
                      </div>
                    </div>
                    <div className="h-5 w-20 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-full"></div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-5 w-3/4 bg-gradient-to-r from-backgroundSecondary/30 to-backgroundSecondary/10 rounded"></div>
                    <div className="h-4 w-1/2 bg-gradient-to-r from-backgroundSecondary/20 to-backgroundSecondary/5 rounded"></div>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-12 bg-gradient-to-r from-backgroundSecondary/30 to-backgroundSecondary/10 rounded"></div>
                      <div className="h-4 w-12 bg-gradient-to-r from-backgroundSecondary/30 to-backgroundSecondary/10 rounded"></div>
                    </div>
                    <div className="h-7 w-16 bg-gradient-to-r from-backgroundSecondary/20 to-backgroundSecondary/5 rounded flex items-center justify-center">
                      <div className="h-3 w-3 bg-backgroundSecondary/20 rounded-full mr-1"></div>
                      <div className="h-3 w-8 bg-backgroundSecondary/20 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <History className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
              <p className="text-muted-foreground text-sm">
                No request history available
              </p>
            </div>
          ) : (
            <div className="space-y-3 pr-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`px-4 py-3 border rounded-md transition-all
                    ${
                      activeHistoryId === item.id
                        ? "border-primary bg-primary/5"
                        : "border-borderColorPrimary hover:border-primary/50 hover:bg-backgroundSecondary/30"
                    }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className={`mr-2 ${
                          item.request?.model ? "" : "bg-muted/50"
                        }`}
                      >
                        {item.request?.model || "API Request"}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1 inline" />
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    <Badge
                      variant={
                        item.statusCode >= 400 ? "destructive" : "outline"
                      }
                      className={getStatusBadgeClass(item.statusCode)}
                    >
                      {item.statusCode} {item.responseStats?.statusText || ""}
                    </Badge>
                  </div>

                  <div className="text-sm font-medium mb-1">
                    {truncateText(item.name, 60)}
                  </div>

                  {/* Add user input display */}
                  {(() => {
                    // For chat messages - get the last non-empty user message
                    const userMessage = item.request?.messages
                      ?.findLast(m => 'user' in m && m.user?.[0]?.text?.trim() !== '')
                      ?.user?.[0]?.text;
                    
                    // For image/audio/video
                    const prompt = item.request?.prompt ||                  // Image/Audio
                                item.request?.inputText ||                // Audio
                                item.request?.generationPrompt ||         // Video
                                item.request?.editInstructions;           // Video
                    
                    const input = userMessage || prompt;
                    
                    return input ? (
                      <div className="text-xs text-muted-foreground mb-2">
                        {truncateText(input, 40)}
                      </div>
                    ) : null;
                  })()}

                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-muted-foreground">
                      {item.responseStats?.time || "0ms"} •{" "}
                      {item.responseStats?.size || "0B"}
                    </div>

                    {!isRestoreDisabled(item.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 text-muted-foreground hover:text-primary"
                        onClick={() => viewHistoryItem(item)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ApiHistory;
