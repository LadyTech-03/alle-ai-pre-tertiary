"use client"

// @ts-nocheck
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Copy, Download, Terminal, Check } from "lucide-react";
import { ProcessingAnimation } from "./processing-animation";
import useChatAPIStore from "@/stores/developer-benchmark";
import MonacoEditor from "./monacoEdtor";

interface ResponseFieldProps {
  response: string;
  handleDownload: () => void;
  apiStatus: boolean;
}

const getActionText = (pathname: string) => {
  // For chat-api, always return "Run"
  if (pathname.includes("chat-api")) {
    return "Run";
  }

  // For other APIs, get the current mode from the store
  const store = useChatAPIStore.getState();
  
  if (pathname.includes("image-api")) {
    return store.imageMode === "generate" ? "Generate" : "Edit Image";
  } 
  
  if (pathname.includes("audio-api")) {
    switch (store.audioMode) {
      case "generate": return "Generate";
      case "tts": return "Generate";
      case "stt": return "Transcribe";
      default: return "Generate";
    }
  }
  
  if (pathname.includes("video-api")) {
    return store.videoMode === "generate" ? "Generate" : "Edit";
  }

  return "Run";
};

const ResponsePlaceholder = () => {
  const pathname = usePathname();
  const actionText = getActionText(pathname);
  
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
        <div className="relative flex items-center justify-center w-12 h-12 bg-primary/5 rounded-full">
          <Terminal className="w-6 h-6 text-primary/60" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        Ready to Process
      </h3>
      <p className="text-xs text-muted-foreground/60 max-w-[200px]">
        Select model(s) and click {actionText} to see the response
      </p>
    </div>
  );
};

const ResponseField: React.FC<ResponseFieldProps> = ({
  response,
  handleDownload,
  apiStatus,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [formattedContent, setFormattedContent] = useState<string>("");

  useEffect(() => {
    if (response) {
      try {
        // Try to parse as JSON to check if it's valid
        const parsedJson = JSON.parse(response);

        // Format with indentation for better display and handle long strings
        const formatted = JSON.stringify(
          parsedJson,
          (key, value) => {
            // Special handling for long string values to improve readability
            if (typeof value === "string" && value.length > 80) {
              // For very long strings, consider adding newlines if they contain natural breaks
              if (value.includes(",") && value.length > 150) {
                return value.replace(/,\s*/g, ",\n  ");
              }
            }
            return value;
          },
          2
        );

        setFormattedContent(formatted);
      } catch (e) {
        // Even if it's not valid JSON, we'll still display it as JSON
        setFormattedContent(response);
      }
    } else {
      setFormattedContent("");
    }
  }, [response]);

  const handleCopy = () => {
    navigator.clipboard.writeText(response).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="relative max-w-full rounded-lg overflow-hidden border border-borderColorPrimary">
      {/* Response label and controls */}
      <div className="flex items-center justify-between px-4 py-2 text-muted-foreground border-b border-borderColorPrimary">
        <span className="text-sm font-medium text-muted-foreground">JSON</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Copy code"
            title="Copy code"
            disabled={!response}
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleDownload}
            disabled={!response}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Response content with dynamic height and theme-consistent background */}
      <div className="h-auto min-h-[300px] max-h-[40vh] md:max-h-[45vh] lg:max-h-[50vh] xl:max-h-[55vh] overflow-auto transition-all duration-300 bg-[#FFFFFF] dark:bg-[#1E1E1E]">
        {!response && !apiStatus ? (
          <div className="h-full p-4">
            <ResponsePlaceholder />
          </div>
        ) : apiStatus ? (
          <div className="h-full p-4">
            <ProcessingAnimation />
          </div>
        ) : (
          <MonacoEditor
            value={formattedContent}
            height="100%"
            className="overflow-x-auto"
          />
        )}
      </div>
    </div>
  );
};

export default ResponseField;
