"use client";
import { useState, useRef, useEffect } from "react";
import GreetingMessage from "@/components/features/GreetingMessage";
import { ChatInput } from "@/components/features/ChatInput";
import { useSidebarStore, useContentStore, useWebSearchStore, useHistoryStore, useCombinedModeStore, useProjectStore, useStreamingTitlesStore, useUsageRestrictionsStore, useCompareModeStore, useAuthStore } from "@/stores";
import { useRouter, usePathname } from "next/navigation";
import RenderPageContent from "@/components/RenderPageContent";
import { SquareTerminal, Lightbulb, Code, Bug, Wrench, Sparkles, NotebookPen, Brain  } from "lucide-react";
import { chatApi } from '@/lib/api/chat';
import { historyApi } from '@/lib/api/history';
import { projectApi } from '@/lib/api/project';
import { useSelectedModelsStore } from '@/stores';
import { useConversationStore } from '@/stores/models';
import { toast } from "sonner"
import { modelsApi } from '@/lib/api/models';
import { useModelsStore } from "@/stores/models";
import { AutoFeedbackModal } from "@/components/ui/modals";
import { QuickLoader } from "@/components/QuickLoader";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { setContent } = useContentStore();
  const router = useRouter();
  const pathname = usePathname();
  const { setIsWebSearch } = useWebSearchStore();
  const { setIsCombinedMode } = useCombinedModeStore();
  const { setIsCompareMode } = useCompareModeStore();
  const { isOpen } = useSidebarStore();
  const { selectedModels, inactiveModels } = useSelectedModelsStore();
  const { setConversationId, setPromptId, setGenerationType, generationType } = useConversationStore();
  const { addHistory, updateHistoryTitle, getHistoryByType, setHistory, setLoading: setHistoryLoading, setError: setHistoryError } = useHistoryStore();
  const { chatModels, setChatModels, setLoading: setModelsLoading, setError: setModelsError } = useModelsStore();
  const { startStreamingTitle, stopStreamingTitle } = useStreamingTitlesStore();
  const { setRestriction, restrictions, clearRestriction } = useUsageRestrictionsStore();
  const [preLoading, setPreLoading ] = useState(false);
  const { isAuthenticated, token } = useAuthStore();

  const [autoFeedbackModal, setAutoFeedbackModal] = useState(false);

    // Treat share routes as public: skip auth checks here
  const isShareRoute = (
    pathname.startsWith('/chat/shares/') ||
    pathname.startsWith('/image/shares/') ||
    pathname.startsWith('/audio/shares/') ||
    pathname.startsWith('/video/shares/') ||
    pathname.startsWith('/share/')
  );

  // Calculate number of active models
  const activeModelsCount = selectedModels.chat.filter(
    modelId => !inactiveModels.includes(modelId)
  ).length;

  const setCurrentPage = useSidebarStore((state) => state.setCurrentPage);

  useEffect(() => {
    setCurrentPage("chat");
  }, [setCurrentPage]);
  
  // Reset the value of preloader when pathname changes
  useEffect(()=>{
    setPreLoading(false);
  },[pathname])

  // Add effect to track restriction timers
  useEffect(() => {
    // Check all restriction types that have comeback times
    const restrictionTypes = ['chat', 'combine', 'compare'] as const;
    
    restrictionTypes.forEach(type => {
      const restriction = restrictions[type];
      
      // Check if restricted and has a comeback time
      if (restriction.isRestricted && restriction.comebackTime) {
        const comebackTime = new Date(restriction.comebackTime).getTime();
        const now = Date.now();
        const timeUntilComeback = comebackTime - now;

        // If comeback time is in the future, set a timer
        if (timeUntilComeback > 0) {
          const timer = setTimeout(() => {
            clearRestriction(type);
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} restrictions have been lifted!`);
          }, timeUntilComeback);

          // Cleanup timer on unmount
          return () => clearTimeout(timer);
        } else {
          // If comeback time has already passed, clear restriction immediately
          clearRestriction(type);
        }
      }
    });
  }, [
    restrictions.chat.isRestricted, restrictions.chat.comebackTime,
    restrictions.combine.isRestricted, restrictions.combine.comebackTime, 
    restrictions.compare.isRestricted, restrictions.compare.comebackTime,
    clearRestriction, restrictions
  ]);

  const handleSend = async (fileContent?: {
    uploaded_files: Array<{
      file_name: string;
      file_size: string;
      file_type: string;
      file_content: string;
    }>;
  }, fileUUIDs?: string[]) => {
    if (!input.trim()) return;

    const { isRestricted, restrictions } = useUsageRestrictionsStore.getState();
    const { isCombinedMode } = useCombinedModeStore.getState();
    const { isCompareMode } = useCompareModeStore.getState();

    // Only check restrictions for active modes
    if ((isCombinedMode && isRestricted('combine')) || (isCompareMode && isRestricted('compare')) || isRestricted('chat')) {
      // Handle the specific restriction
      if (isCombinedMode && isRestricted('combine')) {
        const restriction = restrictions.combine;
        toast.error(restriction.message || "You've reached the limit for combination mode on free plan", {
          duration: 4000,
        });
        setIsCombinedMode(false);
        return;
      }
      
      if (isCompareMode && isRestricted('compare')) {
        const restriction = restrictions.compare;
        toast.error(restriction.message || "You've reached the limit for comparison mode on free plan", {
          duration: 4000,
        });
        setIsCompareMode(false);
        return;
      }
      
      if (isRestricted('chat')) {
        const restriction = restrictions.chat;
        if (restriction.comebackTime) {
          const formattedTime = new Date(restriction.comebackTime).toLocaleTimeString();
          // You can display a toast or return something here if needed
          // console.log(`Please come back at ${formattedTime}`);
        }
        return;
      }
    }
    
    try {
      setIsLoading(true);
      setPreLoading(true);
       
      const allSelectedModels = selectedModels.chat;

      const options = fileContent && fileContent.uploaded_files && fileContent.uploaded_files.length > 0 ? {
        input_content: {
          uploaded_files: fileContent.uploaded_files.map(file => ({
            file_name: file.file_name,
            file_size: file.file_size,
            file_type: file.file_type,
            file_content: file.file_content,
          }))
        }
      } : undefined;

      const newConversationResponse = await chatApi.newConversation(
        allSelectedModels,
        'chat',
        input,
        useCombinedModeStore.getState().isCombinedMode,
        useCompareModeStore.getState().isCompareMode,
        useWebSearchStore.getState().isWebSearch,
        null,
        options,
        fileUUIDs
      );

      if (!newConversationResponse) {
        setPreLoading(false);
        return;
      }
      // console.log(newConversationResponse, 'New Conversation Response in the Chat Layout');

      switch (newConversationResponse.status_code) {
        case 'combine_false':
          setIsCombinedMode(false);
          toast.info(newConversationResponse.message || 'You have reached the limit of 3 combinations per day!', {
            duration: 4000,
          });
          setRestriction('combine', newConversationResponse.message, newConversationResponse.comeback_time);
          return;
      
        case 'compare_false':
          setIsCompareMode(false);
          toast.info(newConversationResponse.message || 'You have reached the limit of 3 comparisons per day!', {
            duration: 4000,
          });
          setRestriction('compare', newConversationResponse.message, newConversationResponse.comeback_time);
          return;
      
        case 'limit_reached':
          setRestriction('chat', newConversationResponse.message, newConversationResponse.comeback_time);
          return;
      }
      

      // const conversationId = conversationResponse.session;
      const conversationId = newConversationResponse.data.conversation.session;
      const promptData = newConversationResponse.data.promptData;
      // console.log(conversationId, 'this is the conversation id for chat');
      
      setPromptId(promptData.id);
      setConversationId(conversationId);
      setContent("chat", "input", input);


      // Set attachment BEFORE navigation so ChatArea can access it in handleInitialResponse
      // Parse input_content if it's a string
      let parsedInputContent;
      if (typeof promptData.input_content === 'string') {
        try {
          parsedInputContent = JSON.parse(promptData.input_content);
        } catch (e) {
          console.error('Failed to parse input_content:', e);
        }
      } else {
        parsedInputContent = promptData.input_content;
      }
      
      if (parsedInputContent?.uploaded_files && parsedInputContent.uploaded_files.length > 0) {
        const file = parsedInputContent.uploaded_files[0];
        const isImage = file.file_type === 'image';
        
        setContent("chat", "attachment", {
          name: file.file_name,
          type: file.file_type,
          size: parseInt(file.file_size),
          url: isImage ? file.file_content : ''
        });
      }
      
      setGenerationType('new');
      router.push(`/chat/res/${conversationId}`);
      setInput("");

      // Add all required properties when adding to history
      addHistory({
        session: conversationId,
        title: newConversationResponse.data.conversation.title,
        type: 'chat',
        created_at: newConversationResponse.data.conversation.created_at!,
        updated_at: newConversationResponse.data.conversation.updated_at!,
      });

      // Get actual title based on prompt
      historyApi.getConversationTitle(conversationId, input, 'chat')
        .then(response => {
          // Trigger streaming effect
          startStreamingTitle(conversationId);

          // console.log('The conversation title payload', response)
          
          // Update the title
          updateHistoryTitle(conversationId, response.title);
          
          // Set document title
          document.title = `${response.title} - Alle-AI`;
          
          // Stop streaming effect after animation completes
          setTimeout(() => {
            stopStreamingTitle(conversationId);
          }, 800);
        })
        .catch(error => {
          // console.error('Error getting conversation title:', error);
          // toast.error('Error getting conversation title');
        });

    } catch (error) {
      // console.error('Error in chat flow:', error);
      setPreLoading(false);
      toast.error('Failed to create conversation', {
        action: {
          label: 'New Chat',
          onClick: () => router.replace('/chat')
        },
      })

    } finally {
      setIsLoading(false);

    }
  };

    // Load chat models on mount if not already loaded
    useEffect(() => {

      // Skip verification entirely for public share routes
      if (isShareRoute && !isAuthenticated && !token) {
        return;
      }
      
      const loadChatModels = async () => {
        if (chatModels && chatModels.length > 0) return;
  
        setModelsLoading(true);
        try {
          const models = await modelsApi.getModels('chat');
          const preferredOrder = ['gpt-4-5', 'o3-mini', 'deepseek-r1', 'grok-2-vision', 'o1', 'claude-3-5-sonnet', 'llama-3-1-70b-instruct', 'gpt-4o', 'gpt-4-1', 'claude-3-sonnet', 'grok-2', 'gemini-1-5-pro', 'llama-3-70b-instruct', 'deepseek-v3', 'mixtral-8x7b-instruct', 'gpt-4', 'o1-mini', 'phi-4'];
          const sortedChatModels = models.sort((a, b) => {
            const indexA = preferredOrder.indexOf(a.model_uid);
            const indexB = preferredOrder.indexOf(b.model_uid);
          
            // If both models are in the preferred order, sort by their index
            if (indexA !== -1 && indexB !== -1) {
              return indexA - indexB;
            }
            // If only a is in the preferred order, it should come first
            if (indexA !== -1) return -1;
            // If only b is in the preferred order, it should come first
            if (indexB !== -1) return 1;
          
            // If neither are in the preferred order, maintain their original order
            return 0;
          });
          // console.log('Chat models loaded', sortedChatModels);
          setChatModels(sortedChatModels);
        } catch (err: any) {
          setModelsError(err.response.data.error || err.response.data.message || 'Failed to load audio models');
        } finally {
          setModelsLoading(false);
        }
      };
  
      loadChatModels();
    }, [setChatModels, setModelsLoading, setModelsError, chatModels, isAuthenticated, isShareRoute, token]);

    // Load chat history
    useEffect(() => {

      // Skip verification entirely for public share routes
      if (isShareRoute && !isAuthenticated && !token) {
        return;
      }

      const loadHistory = async () => {
        const chatHistory = getHistoryByType('chat');
        if (chatHistory && chatHistory.length > 0) {
          return;
        }
  
        setHistoryLoading(true);
        try {
          const response = await historyApi.getHistory('chat');
          setHistory(response.data);
        } catch (err: any) {
          setHistoryError(err.response.data.error || err.response.data.message || 'Failed to load chat history');
        } finally {
          setHistoryLoading(false);
        }
      };
  
      loadHistory();
    }, [getHistoryByType, isAuthenticated, isShareRoute, setHistory, setHistoryError, setHistoryLoading, token]);

    // Load projects
    useEffect(() => {

      // Skip verification entirely for public share routes
      if (isShareRoute && !isAuthenticated && !token) {
        return;
      }
    
      const loadProjects = async () => {
        const { projects, setLoading, setError, setProjects, updateProject } = useProjectStore.getState();
        
        // Check if we already have projects loaded
        if (projects.length > 0) {
          return;
        }
        
        setLoading(true);
        try {
          const projectsData = await projectApi.getProjects();
          // console.log('Loaded projects from API:', projectsData);
          
          if (Array.isArray(projectsData) && projectsData.length > 0) {
            // Convert backend project format to local format
            const formattedProjects = projectsData.map(project => {
              // Create basic project structure
              const formattedProject = {
                id: project.id.toString(),
                uuid: project.uuid.toString(),
                name: project.name,
                description: project.description || "",
                files: [],
                histories: [],
                instructions: project.instructions || "",
                createdAt: project.created_at ? new Date(project.created_at) : new Date(),
                color: project.color_code || undefined, 
              };

              // console.log('Formatted project:', formattedProject);
              
              // Add history if available (backend might return it as a custom property)
              if ((project as any).history && Array.isArray((project as any).history)) {
                formattedProject.histories = (project as any).history.map((h: any) => ({
                  id: h.uuid,
                  session: h.uuid,
                  title: h.title || "New Chat",
                  type: 'chat' as const,
                  created_at: h.created_at,
                  updated_at: h.updated_at,
                }));
              }
              
              return formattedProject;
            });
            
            // console.log('Formatted projects for store:', formattedProjects);
            setProjects(formattedProjects);
            
            // Load conversations for projects that don't have histories from the API
            for (const project of formattedProjects) {
              if (!project.histories || project.histories.length === 0) {
                try {
                  const conversations = await projectApi.getProjectConversations(project.uuid);
                  if (Array.isArray(conversations) && conversations.length > 0) {
                    // Format conversations to match history item format
                    const formattedConversations = conversations.map(conv => ({
                      id: conv.session,
                      session: conv.session,
                      title: conv.title,
                      type: 'chat' as const,
                      created_at: conv.created_at,
                      updated_at: conv.updated_at,
                    }));
                    
                    // Update project with conversations
                    updateProject(project.uuid, { histories: formattedConversations });
                  }
                } catch (err: any) {
                  // toast.error(err.response.data.error || err.response.data.message || `Error loading conversations for project ${project.uuid}`);
                  // Continue with other projects even if one fails
                }
              }
            }
          } else {
            // console.log('No projects returned from API or invalid format');
          }
        } catch (error: any) {
          console.error('Error loading projects:', error);
          setError(error.response.data.message || 'Failed to load projects');
        } finally {
          setLoading(false);
        }
      };
      
      loadProjects();
    }, [isAuthenticated, isShareRoute, token]);

  const handleClicked = (opt: { label: string }) => {
    setInput(opt.label);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

    const handleWebSearchToggle = (enabled: boolean) => {
      setIsWebSearch(enabled);
    };

    const handleCombinedToggle = (enabled: boolean) => {
      setIsCombinedMode(enabled);
    };

    const handleAutoFeedbackSubmit = () => {
      // console.log('Auto feedback submitted');
    };

  return (
    <div className={`flex flex-col min-h-[calc(100vh-3.5rem)] transition-all duration-300 ${isOpen ? "pl-40" : "pl-0"}`}>
      {pathname === "/chat" && (
        <>        
          <div className={`flex-1 flex flex-col sm:mb-32`}>
            {preLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <QuickLoader size="sm" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center gap-8">
                <GreetingMessage
                  // options={options}
                  handlePressed={handleClicked}
                />
                {/* <Button onClick={() => setAutoFeedbackModal(true)}>Open Auto Feedback Modal</Button> */}
                
                <div className="w-full fixed bottom-0 md:bottom-6 sm:relative max-w-3xl sm:px-4">
                  <ChatInput
                    value={input}
                    onChange={setInput}
                    onSend={handleSend}
                    inputRef={inputRef}
                    isLoading={isLoading}
                    isWeb={true}
                    isCombined={true}
                    onWebSearchToggle={handleWebSearchToggle}
                    onCombinedToggle={handleCombinedToggle}
                    dynamicPrompts={true}
                  />
                </div>
              </div>
            )}
          </div>
          <AutoFeedbackModal
            isOpen={autoFeedbackModal}
            onClose={() => setAutoFeedbackModal(false)}
            onSubmit={handleAutoFeedbackSubmit}
            onAskLater={() => setAutoFeedbackModal(false)}
          />
        </>

      )}
      <div className="flex-1 sm:flex-none">{children}</div>
    </div>
  );
}
