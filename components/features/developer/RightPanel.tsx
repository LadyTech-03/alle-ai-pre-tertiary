"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Code2, History, Clock, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ApiHistory from "./base/apiHistory";
import ResponseField from "./base/responseField";
import useChatAPIStore from "@/stores/developer-benchmark";
import { motion, AnimatePresence } from "framer-motion";
import { useApiStatusStore } from "@/stores/developer-benchmark";
import {
  useFollowUpConversationStore,
  TabType,
} from "@/stores/playground-drawerStore";
import { usePathname } from "next/navigation";
import { PlaygroundDrawer } from "./base/playground-drawer";

interface RightPanelProps {
  selectedLanguage: string;
  setSelectedLanguage: (language: "curl" | "python" | "javascript") => void;
  handleCodeDownload: (language: string, query: string, model: string) => void;
  handleDownload: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  selectedLanguage,
  setSelectedLanguage,
  handleCodeDownload,
  handleDownload,
}) => {
  const { response, responseStats, history, clearHistory } = useChatAPIStore();
  const { apiCallStatus } = useApiStatusStore();
  const { showDrawer, activeTab, setActiveTab } =
    useFollowUpConversationStore();
  const pathname = usePathname();
  const isChatApi = pathname === "/developer/workbench/chat-api";

  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="h-full dark:bg-[#282828] flex flex-col overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabType)}
        className="flex flex-col h-full"
      >
        <div className="border-b px-6 py-2">
          <TabsList>
            <TabsTrigger value="response" className="flex items-center">
              <Code2 className="h-4 w-4 mr-2" />
              Response
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            {isChatApi && (
              <>
                {showDrawer ? (
                  <TabsTrigger
                    value="conversations"
                    className="flex items-center"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Conversations
                  </TabsTrigger>
                ) : (
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center px-3 py-1.5 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Conversations
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="max-w-[280px] p-3 text-sm"
                        sideOffset={5}
                      >
                        <p className="flex flex-col gap-1">
                          <span className="text-muted-foreground">
                            Select preferred model and make a request in
                            completions to view follow-up conversations
                          </span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            )}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "conversations" && isChatApi && showDrawer && (
            <motion.div
              key="conversations"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 overflow-hidden"
            >
              <PlaygroundDrawer isOpen={true} />
            </motion.div>
          )}

          {activeTab === "response" && (
            <motion.div
              key="response"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 overflow-hidden"
            >
              {/* Response Tab Content */}
              <div className="flex-shrink-0 px-6 pt-6 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Response Details</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-backgroundSecondary/30 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      Status
                    </div>
                    <div className="flex items-center">
                      {responseStats.statusCode !== "-" ? (
                        <Badge
                          variant={
                            Number(responseStats.statusCode) >= 400
                              ? "destructive"
                              : "outline"
                          }
                          className={
                            Number(responseStats.statusCode) >= 400
                              ? "bg-red-500/10 text-red-500 border-0"
                              : "bg-green-500/10 text-green-500 border-0"
                          }
                        >
                          {responseStats.statusCode} {responseStats.statusText}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-backgroundSecondary/30 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      Time
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="text-sm">{responseStats.time}</span>
                    </div>
                  </div>
                  <div className="bg-backgroundSecondary/30 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      Size
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm">{responseStats.size}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 px-6 py-4">
                <ResponseField
                  response={response}
                  handleDownload={handleDownload}
                  apiStatus={apiCallStatus}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 overflow-hidden"
            >
              <ApiHistory history={history} clearHistory={clearHistory} />
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default RightPanel;
