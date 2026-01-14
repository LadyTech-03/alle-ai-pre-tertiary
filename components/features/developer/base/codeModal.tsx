import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ShowCodes from "./showCodes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

// Import generator functions
import {
  generateCompletionsCurl,
  generateCompletionsPython,
  generateCompletionsNode,
  generateCombinationCurl,
  generateCombinationPython,
  generateCombinationNode,
  generateSearchCurl,
  generateSearchPython,
  generateSearchNode,
  generateSummaryCurl,
  generateSummaryPython,
  generateSummaryNode,
} from "@/lib/constants/codeSnippets/dynamic/chatCodes";

import {
  generateTTSCurl,
  generateTTSPython,
  generateTTSNode,
  generateSTTCurl,
  generateSTTPython,
  generateSTTNode,
  generateAudioGenCurl,
  generateAudioGenNode,
  generateAudioGenPython,
} from "@/lib/constants/codeSnippets/dynamic/audioCodes";

import {
  generateImageGenerationCurl,
  generateImageGenerationPython,
  generateImageGenerationNode,
  generateImageEditCurl,
  generateImageEditPython,
  generateImageEditNode,
} from "@/lib/constants/codeSnippets/dynamic/imageCodes";

import {
  generateVideoGenerationCurl,
  generateVideoGenerationPython,
  generateVideoGenerationNode,
} from "@/lib/constants/codeSnippets/dynamic/videoCodes";

interface languageProps {
  language: string;
  code: string;
}

interface MessageContent {
  type: string;
  text: string;
}

interface SystemMessage {
  system: MessageContent[];
}

interface UserMessage {
  user: MessageContent[];
}

interface AssistantMessage {
  assistants: {
    [model: string]: MessageContent[];
  };
}

type Message = SystemMessage | UserMessage | AssistantMessage;

interface ChatConfig {
  mode?: "completions" | "combination" | "search" | "summary"|"comparison";
  models: string[];
  messages: Array<{
    system?: Array<MessageContent>;
    user?: Array<MessageContent>;
    assistant?: Array<MessageContent>;
  }>;
  web_search?: boolean;
  combination?: boolean;
  summary?: boolean;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  stream: boolean;
  comparison?: boolean;
}

interface CodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: string;
  imageMode?: string | "";
  audioMode?: string | "";
  videoMode?: string | "";
  chatConfig?: ChatConfig;
  imageGenConfig?: any;
  imageEditConfig?: any;
  ttsConfig?: any;
  sttConfig?: any;
  audioGenConfig?: any;
  videoGenConfig?: any;
}

// Animation variants for the modal
const modalVariants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

const CodeModal: React.FC<CodeModalProps> = ({
  open,
  onOpenChange,
  mode,
  imageMode,
  videoMode,
  audioMode,
  chatConfig,
  imageGenConfig,
  imageEditConfig,
  ttsConfig,
  sttConfig,
  audioGenConfig,
  videoGenConfig,
}) => {
  // Helper function to generate code snippets based on mode
  const getCodeSnippets = () => {
    if (mode === "chat" && chatConfig) {
      const { mode: chatMode = "completions", ...config } = chatConfig;

      const generators = {
        combination: [
          generateCombinationPython,
          generateCombinationNode,
          generateCombinationCurl,
        ],
        search: [generateSearchPython, generateSearchNode, generateSearchCurl],
        summary: [
          generateSummaryPython,
          generateSummaryNode,
          generateSummaryCurl,
        ],
        completions: [
          generateCompletionsPython,
          generateCompletionsNode,
          generateCompletionsCurl,
        ],
        comparison: [
          generateSummaryPython,
          generateSummaryNode,
          generateSummaryCurl,
        ],
      } as const;

      // Type guard to ensure chatMode is a valid key
      const isValidMode = (mode: string): mode is keyof typeof generators => {
        return mode in generators;
      };

      const [pythonGen, nodeGen, curlGen] =
        generators[isValidMode(chatMode) ? chatMode : "completions"];

      return [
        { language: "python", code: pythonGen(config) },
        { language: "node", code: nodeGen(config) },
        { language: "curl", code: curlGen(config) },
      ];
    }

    if (mode === "image") {
      if (imageMode === "generate" && imageGenConfig) {
        return [
          {
            language: "python",
            code: generateImageGenerationPython(imageGenConfig),
          },
          {
            language: "node",
            code: generateImageGenerationNode(imageGenConfig),
          },
          {
            language: "curl",
            code: generateImageGenerationCurl(imageGenConfig),
          },
        ];
      }
      if (imageMode === "edit" && imageEditConfig) {
        return [
          {
            language: "python",
            code: generateImageEditPython(imageEditConfig),
          },
          {
            language: "node",
            code: generateImageEditNode(imageEditConfig),
          },
          {
            language: "curl",
            code: generateImageEditCurl(imageEditConfig),
          },
        ];
      }
    }

    if (mode === "audio") {
      if (audioMode === "tts" && ttsConfig) {
        return [
          {
            language: "python",
            code: generateTTSPython(ttsConfig),
          },
          {
            language: "node",
            code: generateTTSNode(ttsConfig),
          },
          {
            language: "curl",
            code: generateTTSCurl(ttsConfig),
          },
        ];
      }
      if (audioMode === "stt" && sttConfig) {
        return [
          {
            language: "python",
            code: generateSTTPython(sttConfig),
          },
          {
            language: "node",
            code: generateSTTNode(sttConfig),
          },
          {
            language: "curl",
            code: generateSTTCurl(sttConfig),
          },
        ];
      }
      if (audioMode === "generate" && audioGenConfig) {
        return [
          {
            language: "python",
            code: generateAudioGenPython(audioGenConfig),
          },
          {
            language: "node",
            code: generateAudioGenNode(audioGenConfig),
          },
          {
            language: "curl",
            code: generateAudioGenCurl(audioGenConfig),
          },
        ];
      }
    }

    if (mode === "video" && videoMode === "generate" && videoGenConfig) {
      return [
        {
          language: "python",
          code: generateVideoGenerationPython(videoGenConfig),
        },
        {
          language: "node",
          code: generateVideoGenerationNode(videoGenConfig),
        },
        {
          language: "curl",
          code: generateVideoGenerationCurl(videoGenConfig),
        },
      ];
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence mode="wait">
        {open && (
          <DialogContent
            className="bg-background border-borderColorPrimary mt-8 top-0 translate-y-0 max-w-3xl w-[700px]"
            style={{ alignSelf: "flex-start" }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogHeader>
                <DialogTitle>View Code</DialogTitle>
                <DialogDescription className="mb-3">
                  Copy the snippet below and start building instantly.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[400px]">
                {getCodeSnippets() ? (
                  <ShowCodes autoFormat={true} languages={getCodeSnippets()!} />
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No configuration available. Please configure your request
                    first.
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default CodeModal;
