// @ts-nocheck
"use client";
import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import RightPanel from "./RightPanel";
import { ModeSelector, Mode, Method } from "./base/mode-selector";
import { AnimatePresence, motion } from "framer-motion";
import { useFollowUpConversationStore } from "@/stores/playground-drawerStore";

import useChatAPIStore from "@/stores/developer-benchmark";
import { usePathname } from "next/navigation";
import DynamicFaq from "@/components/faq/DynamicFaq";
const routes = ["chat-api", "image-api", "audio-api", "video-api"];
interface SearchSettings {
  webSearch: boolean;
  fileUpload: {
    enabled: boolean;
    type: "pdf" | "image" | "docx" | "text" | null;
  };
  analysisMode: {
    summary: boolean;
    comparison: boolean;
  };
  highlightContent: boolean;
  additionalNotes: boolean;
}

interface UploadedFile {
  file: File;
  preview: string;
  type: string;
}

const downloadAsFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export function Workbench() {
  // Get shared state from Zustand store
  const { response, isLoading, setResponse, setIsLoading } = useChatAPIStore();
  const { showDrawer } = useFollowUpConversationStore();

  // Local component state
  const [selectedLanguage, setSelectedLanguage] = useState<
    "curl" | "python" | "javascript"
  >("curl");
  const [selectedMode, setSelectedMode] = useState<Mode>("Chat");
  const [selectedMethod, setSelectedMethod] = useState<Method>("");
  const [authToken, setAuthToken] = useState<string>(
    "sk-" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  );
  const pathname = usePathname();
  const getRoute = () => {
    for (const route of routes) {
      if (pathname === `/developer/workbench/${route}`) {
        return route;
      }
    }
    return null;
  };
  const generateRequestStructure = (query: string, model: string) => {
    return {
      model: model || "gpt-4",
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };
  };

  const handleDownload = () => {
    downloadAsFile(response, "response.txt");
  };

  const handleCodeDownload = (
    language: string,
    query: string,
    model: string
  ) => {
    const requestStructure = generateRequestStructure(query, model);

    const codeExamples = {
      curl: `curl -X POST https://api.example.com/v1/chat/completions \\\n-H "Content-Type: application/json" \\\n-H "Authorization: Bearer ${authToken}" \\\n-d '${JSON.stringify(
        requestStructure,
        null,
        2
      )}'`,
      python: `import requests\n\nheaders = {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer ${authToken}"\n}\n\npayload = ${JSON.stringify(
        requestStructure,
        null,
        2
      )}\n\nresponse = requests.post("https://api.example.com/v1/chat/completions", headers=headers, json=payload)\nprint(response.json())`,
      javascript: `fetch("https://api.example.com/v1/chat/completions", {\n    method: "POST",\n    headers: {\n        "Content-Type": "application/json",\n        "Authorization": "Bearer ${authToken}"\n    },\n    body: JSON.stringify(${JSON.stringify(
        requestStructure,
        null,
        2
      )})\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error("Error:", error));`,
    };

    // downloadAsFile(
    //   codeExamples[language as keyof typeof codeExamples],
    //   `example.${language === "javascript" ? "js" : language}`
    // );
  };
  const activeRoute = getRoute();
  return (
    <div className="h-[calc(100vh-56px)] flex flex-col overflow-hidden">
      <PanelGroup direction="horizontal" className="flex-1">
        <Panel defaultSize={40} minSize={25}>
          <div className="h-full flex flex-col overflow-hidden">
            {/* Fixed ModeSelector at the top with sticky positioning */}
            <div className="p-4 bg-background">
              <ModeSelector
                selectedMode={selectedMode}
                onModeChange={setSelectedMode}
                selectedMethod={selectedMethod}
                onMethodChange={setSelectedMethod}
              />
            </div>
            <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-2 " />

            {/* Scrollable content area with animation */}
            <div className="flex-1 overflow-auto p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeRoute}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <DynamicFaq faqName={activeRoute} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 bg-borderColorPrimary hover:bg-primary/60 transition-colors cursor-col-resize flex items-center justify-center">
          <div className="h-16 w-0.5 bg-primary/40 rounded-full"></div>
        </PanelResizeHandle>

        {/* Right Side Panel Group */}
        <Panel defaultSize={60} minSize={30}>
          <RightPanel
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            handleCodeDownload={handleCodeDownload}
            handleDownload={handleDownload}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
