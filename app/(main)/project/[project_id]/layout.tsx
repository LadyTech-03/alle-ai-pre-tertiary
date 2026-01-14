"use client"

import { useState } from "react";
import { historyApi } from "@/lib/api/history";
import { projectApi } from "@/lib/api/project";
import { useHistoryStore, useProjectStore, useSidebarStore, useContentStore, useSelectedModelsStore, useUsageRestrictionsStore, useCompareModeStore, useCombinedModeStore, useWebSearchStore } from "@/stores";
import { Loader } from "lucide-react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";
import { useModelsStore } from "@/stores/models";
import { modelsApi } from "@/lib/api/models";
import { useConversationStore } from "@/stores/models";
import { ProjectView } from "@/components/features/projects/ProjectView";
import { chatApi } from "@/lib/api/chat";
import { useStreamingTitlesStore } from "@/stores";
import { QuickLoader } from "@/components/QuickLoader";
import { PlansModal } from "@/components/ui/modals";


export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebarStore();
  const pathname = usePathname();
  const params = useParams();
  const { projects, currentProject, setCurrentProject, isLoading, setLoading, setError, updateProject, setProjects, addProjectHistory } = useProjectStore();
  const { addHistory, updateHistoryTitle, getHistoryByType, setHistory, setLoading: setHistoryLoading, setError: setHistoryError } = useHistoryStore();
  const { chatModels, setChatModels, setLoading: setModelsLoading, setError: setModelsError } = useModelsStore();
  const { setConversationId, setPromptId, setGenerationType } = useConversationStore();
  const { setContent } = useContentStore();
  const { selectedModels, inactiveModels } = useSelectedModelsStore();
  const { startStreamingTitle, stopStreamingTitle } = useStreamingTitlesStore();
  const projectUuid = params.project_id as string;
  const router = useRouter();
  const { setRestriction, restrictions, clearRestriction } = useUsageRestrictionsStore();
  const [plansModalOpen, setPlansModalOpen] = useState(false);

  const { setIsCombinedMode } = useCombinedModeStore();
  const { setIsCompareMode } = useCompareModeStore();

  const [preLoading, setPreLoading ] = useState(false);
  

  // Reset the value of preloader when pathname changes
  useEffect(()=>{
    setPreLoading(false);
  },[pathname])



  // Check if we're on the main project page (not in a chat)
  const isProjectMainPage = pathname.match(new RegExp(`^/project/${projectUuid}/?$`)) !== null;
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const preferredOrder = ['gpt-4-5', 'o3-mini', 'deepseek-r1', 'grok-2-vision', 'o1', 'claude-3-5-sonnet', 'llama-3-1-70b-instruct', 'gpt-4o', 'claude-3-sonnet', 'grok-2', 'gemini-1-5-pro', 'llama-3-70b-instruct', 'deepseek-v3', 'mixtral-8x7b-instruct', 'gpt-4', 'o1-mini', 'phi-4'];
  
  // console.log('isProjectMainPage out of the useEffect', isProjectMainPage);

  useEffect(() => {
    // console.log('isProjectMainPage', isProjectMainPage);
    // console.log('pathname', pathname);
  }, [isProjectMainPage]);
  // Load chat models on mount if not already loaded
  useEffect(() => {

    const loadChatModels = async () => {
      if (chatModels && chatModels.length > 0) return;

      setModelsLoading(true);
      try {
        const models = await modelsApi.getModels('chat');
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
        setModelsError(err.response.data.error || err.response.data.message || 'Failed to load chat models');
      } finally {
        setModelsLoading(false);
      }
    };

    loadChatModels();
  }, [setChatModels, setModelsLoading, setModelsError]);


  // Load project details (conversations and files)
  const loadProjectDetails = async (projectUuid: string) => {
    try {
      const conversations = await projectApi.getProjectConversations(projectUuid);

      // console.log(conversations, 'this is the conversations');
      

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
        updateProject(projectUuid, { histories: formattedConversations });
      }
      
      // Load files
      const filesData = await projectApi.getProjectFiles(projectUuid);
      if (Array.isArray(filesData) && filesData.length > 0) {
        // Convert API response to the format expected by the store
        const formattedFiles = filesData.map((file, index) => ({
          id: String(file.index || index + 1),
          name: file.file_name,
          status: 'accessible' as const,
          type: file.file_type,
          size: file.file_size || 0,
          mimeType: `${file.file_type}/${file.file_extension.replace('.', '')}`,
          url: file.file_url || undefined,
          createdAt: new Date()
        }));
        
        // Update project with files
        updateProject(projectUuid, { files: formattedFiles });
        // console.log('loadProjectDetails is finished');
      }
    } catch (error: any) {
      // toast.error(error.response.data.error || error.response.data.message || 'Failed to load project');
      // console.error('Error loading project details:', error);
    }
  };

  // Load projects if none exist
  useEffect(() => {
    const loadProjects = async () => {
      // console.log('loadProjects is running');
      const { projects, setLoading, setError, setProjects } = useProjectStore.getState();
      
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
                // console.error(`Error loading conversations for project ${project.uuid}:`, err);
                // toast.error(err.response.data.error || err.response.data.message || `Error loading conversations for project ${project.uuid}`);
                // Continue with other projects even if one fails
              }
            }
          }
        } else {
          toast.error('Failed to load projects');
          router.replace('/chat');
          // Continue with other projects even if one fails
        }
      } catch (error: any) {
        // console.error('Error loading projects:', error);
        setError(error.response.data.error || error.response.data.message || 'Failed to load projects');
        router.replace('/chat');
      } finally {
        setLoading(false);
        // console.log('loadProjects is finished');
      }
    };
    
    loadProjects();
    // console.log('the project uuid is', projectUuid);
    loadProjectDetails(projectUuid);
  }, []);

  useEffect(() => {
    const setProjectFromUrl = async () => {
      // If we don't have projects yet or current project is already set, do nothing
      if (projects.length === 0 || currentProject) return;
      
      // console.log('Setting current project from URL parameter:', projectUuid);
      const project = projects.find(p => p.uuid.toString() === projectUuid);
      
      if (project) {
        // console.log('Found project in store:', project);
        setCurrentProject(project);
      } else {
        // console.log('Project not found in store, fetching directly');
        try {
          // Fetch the project directly if not found in the store
          const projectData = await projectApi.getProject(projectUuid);
          if (projectData) {
            // Format the project data as needed
            const formattedProject = {
              id: projectData.id.toString(),
              uuid: projectData.uuid.toString(),
              name: projectData.name,
              description: projectData.description || "",
              files: [],
              histories: [],
              instructions: projectData.instructions || "",
              createdAt: projectData.created_at ? new Date(projectData.created_at) : new Date(),
              color: projectData.color_code || undefined,
            };
            
            // Set as current project
            setCurrentProject(formattedProject);
          }
        } catch (error: any) {
          // toast.error(error.response.data.error || error.response.data.message || 'Failed to load project');
            router.replace('/chat');
          // console.error('Error fetching project:', error);
        }
      }
    };
    
    setProjectFromUrl();
  }, [projects, projectUuid, currentProject, setCurrentProject]);

  // Load chat history
  useEffect(() => {
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
  }, []);

    // Add a helper function to handle streaming of conversation titles in the project
    const streamHistoryTitle = (conversationId: string, title: string, histories: any[], projectUuid: string) => {
      const { startStreamingTitle, stopStreamingTitle } = useStreamingTitlesStore.getState();
      const { updateProject } = useProjectStore.getState();
  
      // Start streaming effect
      startStreamingTitle(conversationId);
      
      // Create updated histories array
      const updatedHistories = [...histories];
      const conversationIndex = updatedHistories.findIndex(h => h.session === conversationId);
      
      if (conversationIndex !== -1) {
        // Update the conversation title
        const updatedConversation = {
          ...updatedHistories[conversationIndex],
          title: title
        };
        
        // Remove from current position
        updatedHistories.splice(conversationIndex, 1);
        
        // Add to the beginning of the array to ensure it appears at the top
        updatedHistories.unshift(updatedConversation);
      } else {
        // Add as new at the beginning of the array
        updatedHistories.unshift({
          session: conversationId,
          id: conversationId,
          title: title,
          type: 'chat' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      // Update project
      updateProject(projectUuid, {
        histories: updatedHistories
      });
      
      // Stop streaming after animation
      setTimeout(() => {
        stopStreamingTitle(conversationId);
      }, 800);
      
      return updatedHistories;
    };
    
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
      restrictions.compare.isRestricted, restrictions.compare.comebackTime
    ]);

  // This function will be passed to ProjectView
  const handleCreateConversation = async (inputValue: string, fileContent?: {
    uploaded_files: Array<{
      file_name: string;
      file_size: string;
      file_type: string;
      file_content: string;
    }>;
  }) => {
    if (!inputValue.trim() || !currentProject) return;
    
    try {
      setIsCreatingConversation(true);
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

      const NewConversationResponse = await projectApi.createNewProjectConversation(
        allSelectedModels,
        'chat',
        inputValue,
        useCombinedModeStore.getState().isCombinedMode,
        useCompareModeStore.getState().isCompareMode,
        useWebSearchStore.getState().isWebSearch,
        currentProject.uuid,
        options
      );

      // console.log(NewConversationResponse, 'this is the new conversation response');

      switch (NewConversationResponse.status_code) {
        case 'combine_false':
          setIsCombinedMode(false);
          toast.info(NewConversationResponse.message || 'You have reached the limit of 3 combinations per day!', {
            duration: 4000,
          });
          setRestriction('combine', NewConversationResponse.message, NewConversationResponse.comeback_time);
          return;
      
        case 'compare_false':
          setIsCompareMode(false);
          toast.info(NewConversationResponse.message || 'You have reached the limit of 3 comparisons per day!', {
            duration: 4000,
          });
          setRestriction('compare', NewConversationResponse.message, NewConversationResponse.comeback_time);
          return;
      
        case 'limit_reached':
          setRestriction('chat', NewConversationResponse.message, NewConversationResponse.comeback_time);
          return;
      }

      if(!NewConversationResponse.status) {
        setIsCreatingConversation(false);
        setPreLoading(false);
        toast.info(`${NewConversationResponse.error}`,{
          action: {
            label: 'Upgrade',
            onClick: () => setPlansModalOpen(true)
          },
        });
        return;
      }
      
      const conversationId = NewConversationResponse.data.conversation.session;
      const promptData = NewConversationResponse.data.promptData;

      // Set these values BEFORE navigation
      setConversationId(conversationId);
      setPromptId(promptData.id);
      setGenerationType('new');
      setContent("chat", "input", inputValue);
      router.push(`/project/${currentProject.uuid}/chat/${conversationId}`);

      
      // Store the conversation in the project's history
      if (currentProject.uuid) {
        addProjectHistory(currentProject.uuid, {
          session: conversationId,
          title: NewConversationResponse.data.conversation.title || 'New Conversation',
          type: 'chat' as const,
          created_at: NewConversationResponse.data.conversation.created_at!,
          updated_at: NewConversationResponse.data.conversation.updated_at!
        });
        
        // Get actual title based on prompt
        historyApi.getConversationTitle(conversationId, inputValue, 'chat')
          .then(response => {
            if (response.title) {
              if (currentProject.uuid) {
                // Use the helper function to handle streaming
                streamHistoryTitle(
                  conversationId, 
                  response.title, 
                  currentProject.histories || [], 
                  currentProject.uuid
                );
              }
              document.title = `${response.title} - Alle-AI`;
            }
          })
          .catch(error => {
            // console.error('Error getting conversation title:', error);
          });
      }
            
    } catch (error) {
      setPreLoading(false);
      // console.error('Error in project chat flow:', error);
      // toast.error('Failed to create conversation');
    } finally {
      setIsCreatingConversation(false);
      setPreLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader className="h-4 w-4 animate-spin mx-auto mb-2" />
          {/* <h2 className="text-lg font-medium">Loading projects...</h2> */}
        </div>
      </div>
    );
  }

  return (
    <>
    <div className={`flex flex-col min-h-[calc(100vh-3.5rem)] transition-all duration-300 ${isOpen ? "pl-40" : "pl-0"}`}>
        {/* Show ProjectView only on the main project page */}
        {/* {isProjectMainPage && <ProjectView onCreateConversation={handleCreateConversation} isLoading={isCreatingConversation} />} */}
        {isProjectMainPage && (
        currentProject ? (
        <>
          {preLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <QuickLoader size="sm" />
            </div>
            ) : (
              <ProjectView onCreateConversation={handleCreateConversation} isLoading={isCreatingConversation} />
            )}
        </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader className="h-4 w-4 animate-spin mx-auto mb-2" />
          </div>
        )
      )}
        <div className="flex-1 sm:flex-none">{children}</div>
      </div>
      <PlansModal
        isOpen={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
      />
    </>
  );
}