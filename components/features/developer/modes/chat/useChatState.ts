import { useState, useEffect, useCallback } from "react";
import { requestJson } from "@/lib/api/apiClient/requests";
import { extractChatResponseData } from "@/lib/utils";
import useChatAPIStore from "@/stores/developer-benchmark";
import { useApiStatusStore } from "@/stores/developer-benchmark";
import {
  useFollowUpConversationStore,
  createConversationEntry,
  TabType,
} from "@/stores/playground-drawerStore";
import { toast } from "sonner";

// Types from chat.tsx
type UserMessageItem = {
  user: Array<{
    type: string;
    text?: string;
    image_url?: string;
  }>;
};

type AssistantMessageItem = {
  assistants: {
    [modelId: string]: Array<{
      type: string;
      text?: string;
    }>;
  };
};

type MessageItem = UserMessageItem | AssistantMessageItem;
type ChatMode = "search" | "completions" | "combination" | "summary"|"comparison";

interface SearchSettings {
  webSearch: boolean;
  combination: boolean;
  comparison: boolean;
  fileUpload: {
    enabled: boolean;
    type: "pdf" | "image" | "docx" | "text" | "code" | "document" | null;
  };
}

interface UploadedFile {
  file: File;
  preview: string;
  type: string;
}

interface MessageContent {
  type: string;
  text?: string;
  model_specific?: { [model: string]: string };
}

// Helper function to check if we can do a follow-up
const canDoFollowUp: (
  previousModels: string[],
  currentModels: string[]
) => boolean = (previousModels, currentModels) => {
  if (!previousModels || !currentModels) return false;
  if (previousModels.length !== currentModels.length) return false;

  // Sort both arrays to ensure consistent comparison
  const sortedPrevious = [...previousModels].sort();
  const sortedCurrent = [...currentModels].sort();

  // Check if all models match
  return sortedPrevious.every((model, index) => model === sortedCurrent[index]);
};

export function useChatState() {
  // Get shared state from Zustand stores
  const { response, setResponse, setResponseStats, addHistoryItem } =
    useChatAPIStore();
  const chatMode = useChatAPIStore((state) => state.chatMode) as ChatMode;
  const {
    showDrawer,
    openDrawer,
    closeDrawer,
    setHasFollowUp,
    hasFollowUp,
    clearFollowUpState,
    addConversation,
    setDrawerAnimationLoading,
    setActiveTab,
  } = useFollowUpConversationStore();
  const { setApiCallStatus } = useApiStatusStore();

  // Local component states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState<boolean>(false);
  const [systemPrompt, setSystemPrompt] = useState<MessageContent>({
    type: "text",
    text: "You are a helpful assistant.",
    model_specific: {},
  });

  // Update the followUpData state with a more specific type
  const [followUpData, setFollowUpData] = useState<{
    models: string[];
    messages: any[];
  } | null>(null);

  // Update the type definition for additionalMessages to match the AdditionalMessageList component
  const [additionalMessages, setAdditionalMessages] = useState<MessageItem[]>(
    []
  );
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(2000);

  // Enhanced search settings
  const [searchSettings, setSearchSettings] = useState<SearchSettings>({
    webSearch: false,
    combination: false,
    comparison: false,
    fileUpload: {
      enabled: false,
      type: null,
    },
  });

  // Model specific settings
  const [modelSettings, setModelSettings] = useState<{
    [model: string]: any;
  }>({});

  // Response format settings
  const [responseFormat, setResponseFormat] = useState<{
    type: string;
    model_specific?: { [model: string]: string };
  }>({
    type: "text",
    model_specific: {},
  });

  // Message history
  const [messageHistory, setMessageHistory] = useState<any[]>([]);

  // Local component states
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [linkDialogOpen, setLinkDialogOpen] = useState<boolean>(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  // Add these near the other state declarations
  const [messageType, setMessageType] = useState<
    "user" | "system" | "assistant"
  >("user");
  const [assistantMessages, setAssistantMessages] = useState<{
    [model: string]: string;
  }>({});

  // Modify the state to only hold one image URL instead of an array
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  // Add these states for validation
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Add this validation function
  const validateImageUrl = (url: string) => {
    if (!url.trim()) {
      setIsValidUrl(false);
      setUrlError(null);
      return;
    }

    try {
      new URL(url); // Check if it's a valid URL format
      if (!/^https?:\/\//i.test(url)) {
        setIsValidUrl(false);
        setUrlError("URL must start with http:// or https://");
        return;
      }
      if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
        setIsValidUrl(false);
        setUrlError(
          "URL must end with a valid image extension (.jpg, .png, .gif, .webp)"
        );
        return;
      }
      setIsValidUrl(true);
      setUrlError(null);
    } catch {
      setIsValidUrl(false);
      setUrlError("Please enter a valid URL");
    }
  };

  // Update the generateRequestStructure function
  const generateRequestStructure = () => {
    // For Search mode, force web_search to true
    if (chatMode === "search" && !searchSettings.webSearch) {
      setSearchSettings((prev) => ({ ...prev, webSearch: true }));
    }

    // Check if we can do a follow-up
    const canDoFollowUpNow =
      followUpData &&
      chatMode === "completions" &&
      canDoFollowUp(followUpData.models, selectedModels);

    const requestBody = {
      models: selectedModels || [],
      messages: [] as any[],
      web_search: searchSettings?.webSearch || chatMode === "search",
      combination:
        chatMode === "combination" ||
        (chatMode === "completions" && searchSettings.combination),
      comparison:
        chatMode === "comparison" ||
        (chatMode === "completions" && searchSettings.comparison),
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 2000,
      frequency_penalty: 0.2,
      presence_penalty: 0.3,
      top_p: 1.0,
    };

    // If we can do follow-up and we're in completions mode
    if (canDoFollowUpNow) {
      requestBody.messages = [
        ...followUpData.messages,
        {
          user: [
            {
              type: "text",
              text: query,
            },
            // Add single image URL if it exists
            ...(attachedImage
              ? [
                  {
                    type: "image_url",
                    image_url: attachedImage,
                  },
                ]
              : []),
          ],
        },
      ];
    } else {
      // Add system message if present
      if (showSystemPrompt && systemPrompt?.text?.trim()) {
        requestBody.messages.push({
          system: [
            {
              type: "text",
              text: systemPrompt.text || "",
            },
          ],
        });
      }

      // Add initial user message with image if exists
      if (query?.trim() || attachedImage) {
        const userMessage = {
          user: [
            {
              type: "text",
              text: query || "",
            },
            // Add single image URL if it exists
            ...(attachedImage
              ? [
                  {
                    type: "image_url",
                    image_url: attachedImage,
                  },
                ]
              : []),
          ],
        };
        requestBody.messages.push(userMessage);
      }

      // Add additional messages
      if (Array.isArray(additionalMessages)) {
        additionalMessages.forEach((msg) => {
          if ("user" in msg) {
            requestBody.messages.push({
              user: [
                {
                  type: "text",
                  text: msg.user[0]?.text || "",
                },
                // Include image URL if it exists in the message
                ...(msg.user.find(
                  (item: { type: string; text?: string; image_url?: string }) =>
                    item.type === "image_url"
                )
                  ? [
                      msg.user.find(
                        (item: {
                          type: string;
                          text?: string;
                          image_url?: string;
                        }) => item.type === "image_url"
                      ),
                    ]
                  : []),
              ],
            });
          } else if ("assistants" in msg) {
            requestBody.messages.push({
              assistants: Object.entries(msg.assistants).reduce(
                (acc: Record<string, any[]>, [modelId, responses]) => {
                  acc[modelId] = [
                    {
                      type: "text",
                      text: responses[0]?.text || "",
                    },
                  ];
                  return acc;
                },
                {} as Record<string, any[]>
              ),
            });
          }
        });
      }
    }

    // Add mode to config for code generation
    const codeConfig = {
      ...requestBody,
      mode: chatMode,
      stream: false,
    };

    return {
      requestBody,
      codeConfig,
    };
  };

  // Handle running the query
  const handleRun = async () => {
    // Don't run if requirements aren't met
    if (selectedModels.length === 0) return;
    if (!query.trim()) return;

    // Only validate sequence in additional messages mode (no follow-up)
    if (!followUpData && additionalMessages.length > 0) {
      // Check for empty messages
      const emptyMessage = additionalMessages.find((msg) => {
        if ("user" in msg) {
          return !msg.user[0]?.text?.trim();
        }
        if ("assistants" in msg) {
          // Check if any of the selected models have empty responses
          return selectedModels.some(
            (modelId) => !msg.assistants[modelId]?.[0]?.text?.trim()
          );
        }
        return true; // Invalid message structure
      });

      if (emptyMessage) {
        toast.error("Empty message found", {
          description:
            "Please fill in all messages before running the conversation.",
          duration: 5000,
        });
        return;
      }

      // First message must be Assistant (since main input is User)
      const firstIsAssistant = "assistants" in additionalMessages[0];
      if (!firstIsAssistant) {
        toast.error("Invalid message sequence", {
          description:
            "First additional message must be an Assistant response after your main input.",
          duration: 5000,
        });
        return;
      }

      // Check if any two consecutive messages are of the same type
      for (let i = 0; i < additionalMessages.length - 1; i++) {
        const currentIsUser = "user" in additionalMessages[i];
        const nextIsUser = "user" in additionalMessages[i + 1];
        if (currentIsUser === nextIsUser) {
          toast.error("Invalid message sequence", {
            description:
              "Messages must strictly alternate between User and Assistant responses.",
            duration: 5000,
          });
          return;
        }
      }

      // Check if the sequence ends with an Assistant message
      const lastMessage = additionalMessages[additionalMessages.length - 1];
      if ("assistants" in lastMessage) {
        toast.error("Invalid message sequence", {
          description: "The conversation must end with a User message.",
          duration: 5000,
        });
        return;
      }
    }

    // Set loading state
    setResponseStats({
      statusCode: "-",
      statusText: "-",
      time: "-",
      size: "-",
    });
    setIsLoading(true);
    setApiCallStatus(true);
    setDrawerAnimationLoading(true);

    try {
      // Check if we can do follow-up only when actually running
      const canContinueConversation: boolean =
        !!followUpData && canDoFollowUp(followUpData.models, selectedModels);

      // Get the request structure
      const requestStructure = generateRequestStructure();

      // Set API endpoint based on chat mode
      let apiUrl;
      if (chatMode === "search") {
        apiUrl = "/ai/web-search";
      } else if (chatMode === "combination") {
        apiUrl = "/chat/combination";
      } else if (chatMode === "comparison") {
        apiUrl = "/chat/comparison";
      } else {
        apiUrl = "/chat/completions";
      }

      // Make the API request
      const result = await requestJson(apiUrl, requestStructure.requestBody);

      // Process the response
      if ("error" in result) {
        // Format error as JSON
        const errorResponse = {
          error: {
            message: result?.error,
            type: "api_error",
            param: null,
            code: "error",
          },
        };
        const erStatus = result?.error.status || null;
        // Set formatted error response
        setApiCallStatus(false);
        setResponse(JSON.stringify(errorResponse, null, 2));

        // Update response stats
        setResponseStats({
          statusCode: erStatus,
          statusText: "Error",
          time: `${Math.floor(Math.random() * 300) + 100}ms`,
          size: `${
            new TextEncoder().encode(JSON.stringify(errorResponse)).length
          } bytes`,
        });

        // Add error to history
        addHistoryItem({
          id: Date.now().toString(),
          name: `Chat ${chatMode} request (Error)`,
          timestamp: new Date(),
          statusCode: erStatus,
          request: requestStructure.requestBody,
          response: errorResponse as unknown as string,
          responseStats: {
            statusCode: erStatus,
            statusText: "Error",
            time: `${Math.floor(Math.random() * 300) + 100}ms`,
            size: `${
              new TextEncoder().encode(JSON.stringify(errorResponse)).length
            } bytes`,
          },
        });
      } else {
        // Handle successful response
        setApiCallStatus(false);
        setResponse(JSON.stringify(result, null, 2));

        // If in completions mode and response is successful
        if (chatMode === "completions" && result.success) {
          const extracted = extractChatResponseData(result);
          if (extracted) {
            setDrawerAnimationLoading(false);
            // Create and add conversation entry
            const entry = createConversationEntry(query, result);
            addConversation(entry);

            setHasFollowUp(true); // Always set hasFollowUp true when we have a successful completion

            // Save the current image state before clearing it
            const currentImage = attachedImage;

            // Update follow-up data based on whether it's a continuation or new conversation
            if (!canContinueConversation) {
              setFollowUpData({
                models: selectedModels,
                messages: [
                  {
                    user: [
                      { type: "text", text: query },
                      // Include the image URL if it exists (using saved value)
                      ...(currentImage
                        ? [{ type: "image_url", image_url: currentImage }]
                        : []),
                    ],
                  },
                  {
                    assistants: extracted.messages.assistants,
                  },
                ],
              });
            } else {
              setFollowUpData({
                models: selectedModels,
                messages: [
                  ...(followUpData?.messages || []),
                  {
                    user: [
                      { type: "text", text: query },
                      // Include the image URL if it exists (using saved value)
                      ...(currentImage
                        ? [{ type: "image_url", image_url: currentImage }]
                        : []),
                    ],
                  },
                  {
                    assistants: extracted.messages.assistants,
                  },
                ],
              });
            }
          }
        }

        // Clear the attachedImage state after a successful request and after setting followUpData
        // This allows the user to add a new image for their next message
        setAttachedImage(null);

        // Update response stats
        setResponseStats({
          statusCode: 200,
          statusText: "OK",
          time: `${Math.floor(Math.random() * 500) + 100}ms`,
          size: `${
            new TextEncoder().encode(JSON.stringify(result)).length
          } bytes`,
        });

        // Add to history
        addHistoryItem({
          id: Date.now().toString(),
          name: `Chat ${chatMode} request`,
          timestamp: new Date(),
          statusCode: 200,
          request: requestStructure.requestBody,
          response: result,
          responseStats: {
            statusCode: 200,
            statusText: "OK",
            time: `${Math.floor(Math.random() * 500) + 100}ms`,
            size: `${
              new TextEncoder().encode(JSON.stringify(result)).length
            } bytes`,
          },
        });
      }
    } catch (error: any) {
      // Format unexpected error as JSON
      const errorResponse = {
        error: {
          message: error.message || "An unexpected error occurred",
          type: "runtime_error",
          param: null,
          code: "error",
        },
      };

      // Set formatted error response
      setApiCallStatus(false);
      setResponse(JSON.stringify(errorResponse, null, 2));

      // Update response stats
      setResponseStats({
        statusCode: 500,
        statusText: "Error",
        time: `${Math.floor(Math.random() * 300) + 100}ms`,
        size: `${
          new TextEncoder().encode(JSON.stringify(errorResponse)).length
        } bytes`,
      });

      // Fix the error with requestBody
      const requestStructure = generateRequestStructure();

      // Add the error to history
      addHistoryItem({
        id: Date.now().toString(),
        name: `Chat ${chatMode} request (Error)`,
        timestamp: new Date(),
        statusCode: 500,
        request: requestStructure.requestBody,
        response: errorResponse as unknown as string,
        responseStats: {
          statusCode: 500,
          statusText: "Error",
          time: `${Math.floor(Math.random() * 300) + 100}ms`,
          size: `${
            new TextEncoder().encode(JSON.stringify(errorResponse)).length
          } bytes`,
        },
      });
    } finally {
      setIsLoading(false);
      setApiCallStatus(false);
    }
  };

  // Clear follow-up data when clearing the form
  const handleClear = () => {
    setQuery("");
    setUploadedFile(null);
    setResponse("");
    setAdditionalMessages([]); // Clear additional messages
    setResponseStats({
      statusCode: "-",
      statusText: "-",
      time: "-",
      size: "-",
    });
    // Only clear follow-up if we're not in a follow-up conversation
    if (!hasFollowUp) {
      setFollowUpData(null);
    }
  };

  // Modify the handleMessageChange function to handle image URLs
  const handleMessageChange = useCallback(
    (index: number, value: string, modelId: string | null = null) => {
      setAdditionalMessages((prev) => {
        // Create a deep copy to ensure we're not mutating the previous state
        const newMessages = JSON.parse(JSON.stringify(prev));

        if (modelId) {
          // Update assistant message for specific model
          const currentMsg = newMessages[index];
          if ("assistants" in currentMsg) {
            // It's an assistant message
            if (!currentMsg.assistants[modelId]) {
              currentMsg.assistants[modelId] = [];
            }

            // Set the new text value
            currentMsg.assistants[modelId] = [
              {
                type: "text",
                text: value,
              },
            ];
          }
        } else {
          // Update user message while preserving any existing image URLs
          const currentMsg = newMessages[index];
          if ("user" in currentMsg) {
            // It's a user message
            const existingImageUrls = currentMsg.user.filter(
              (item: { type: string; text?: string; image_url?: string }) =>
                item.type === "image_url"
            );

            // Create a new user message with updated text
            newMessages[index] = {
              user: [
                {
                  type: "text",
                  text: value,
                },
                ...existingImageUrls,
              ],
            };
          }
        }

        return newMessages;
      });
    },
    []
  );

  const handleMessageDelete = useCallback((index: number) => {
    setAdditionalMessages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleTypeToggle = useCallback(
    (index: number) => {
      setAdditionalMessages((prev) => {
        const newMessages = [...prev];
        const currentMsg = newMessages[index];
        const isCurrentlyUser = "user" in currentMsg;

        if (isCurrentlyUser) {
          // Convert to assistant message
          const assistantMessage: AssistantMessageItem = {
            assistants: {} as {
              [key: string]: Array<{ type: string; text: string }>;
            },
          };

          // Use a separate step to populate the assistants object
          selectedModels.forEach((model) => {
            (assistantMessage.assistants as any)[model] = [
              {
                type: "text",
                text: "",
              },
            ];
          });

          newMessages[index] = assistantMessage;
        } else {
          // Convert to user message
          const userMessage: UserMessageItem = {
            user: [
              {
                type: "text",
                text: "",
              },
            ],
          };
          newMessages[index] = userMessage;
        }
        return newMessages;
      });
    },
    [selectedModels]
  );

  const handleAddMessage = useCallback(() => {
    // Don't allow adding messages if main query is empty
    if (!query.trim()) {
      toast.error("Please enter a main message first");
      return;
    }

    setAdditionalMessages((prev) => {
      const lastMessage = prev[prev.length - 1];

      // If no previous messages, add an assistant message
      if (!lastMessage) {
        const initialAssistantMessage: AssistantMessageItem = {
          assistants: {} as {
            [key: string]: Array<{ type: string; text: string }>;
          },
        };

        // Use a separate step to populate the assistants object
        selectedModels.forEach((model) => {
          (initialAssistantMessage.assistants as any)[model] = [
            {
              type: "text",
              text: "",
            },
          ];
        });

        return [initialAssistantMessage];
      }

      // Add alternating message type based on last message
      const isLastMessageAssistant = "assistants" in lastMessage;

      if (isLastMessageAssistant) {
        const newUserMessage: UserMessageItem = {
          user: [
            {
              type: "text",
              text: "",
            },
          ],
        };
        return [...prev, newUserMessage];
      } else {
        const newAssistantMessage: AssistantMessageItem = {
          assistants: {} as {
            [key: string]: Array<{ type: string; text: string }>;
          },
        };

        // Use a separate step to populate the assistants object
        selectedModels.forEach((model) => {
          (newAssistantMessage.assistants as any)[model] = [
            {
              type: "text",
              text: "",
            },
          ];
        });

        return [...prev, newAssistantMessage];
      }
    });
  }, [query, selectedModels]);

  // Reset state when chat mode changes
  useEffect(() => {
    // Reset searchSettings based on the new mode
    if (chatMode !== "search" && searchSettings.webSearch) {
      setSearchSettings((prev) => ({ ...prev, webSearch: false }));
    }

    if (chatMode !== "combination" && searchSettings.combination) {
      setSearchSettings((prev) => ({ ...prev, combination: false }));
    }

    if (chatMode !== "comparison" && searchSettings.comparison) {
      setSearchSettings((prev) => ({ ...prev, comparison: false }));
    }
  }, [chatMode]);

  // Only clear follow-up when chat mode changes
  useEffect(() => {
    if (chatMode !== "completions") {
      clearFollowUpState();
    }
  }, [chatMode, clearFollowUpState]);

  // Update followUpData when hasFollowUp changes
  useEffect(() => {
    if (!hasFollowUp) {
      setFollowUpData(null);
    }
  }, [hasFollowUp]);

  // Add effect to watch model selection changes
  useEffect(() => {
    if (followUpData && hasFollowUp) {
      const canContinue = canDoFollowUp(followUpData.models, selectedModels);
      if (!canContinue) {
        clearFollowUpState();
        closeDrawer();
        setFollowUpData(null);
      }
    }
  }, [
    selectedModels,
    followUpData,
    hasFollowUp,
    clearFollowUpState,
    closeDrawer,
  ]);

  // Add effect to automatically control drawer visibility based on hasFollowUp
  useEffect(() => {
    if (hasFollowUp) {
      openDrawer();
    } else {
      closeDrawer();
    }
  }, [hasFollowUp, openDrawer, closeDrawer]);

  return {
    // State
    isLoading,
    query,
    selectedModels,
    showSystemPrompt,
    systemPrompt,
    followUpData,
    additionalMessages,
    temperature,
    maxTokens,
    searchSettings,
    modelSettings,
    responseFormat,
    messageHistory,
    linkUrl,
    linkDialogOpen,
    codeModalOpen,
    uploadedFile,
    messageType,
    assistantMessages,
    attachedImage,
    isValidUrl,
    urlError,
    chatMode,
    hasFollowUp,

    // Setters
    setQuery,
    setSelectedModels,
    setShowSystemPrompt,
    setSystemPrompt,
    setFollowUpData,
    setAdditionalMessages,
    setTemperature,
    setMaxTokens,
    setSearchSettings,
    setModelSettings,
    setResponseFormat,
    setMessageHistory,
    setLinkUrl,
    setLinkDialogOpen,
    setCodeModalOpen,
    setUploadedFile,
    setMessageType,
    setAssistantMessages,
    setAttachedImage,
    setIsValidUrl,
    setUrlError,

    // Functions
    validateImageUrl,
    generateRequestStructure,
    handleRun,
    handleClear,
    handleMessageChange,
    handleMessageDelete,
    clearFollowUpState,
    // handleTypeToggle,
    // handleAddMessage,
  };
}
