import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, FileText, Settings, FilePlus2, MessageSquare, Check, Loader, MessagesSquare, Palette, NotebookPen, EllipsisVertical, Share, Trash2, Folder, Undo2, X } from "lucide-react";
import { BsFolder2Open } from "react-icons/bs";
import { ChatInput } from "@/components/features/ChatInput";
import { ProjectFilesModal, ProjectInstructionsModal } from "@/components/ui/modals";
import { useProjectStore, useSelectedModelsStore, useContentStore, useStreamingTitlesStore, useUsageRestrictionsStore, useCompareModeStore, useCombinedModeStore, useSidebarStore, useHistoryStore } from "@/stores";
import { Badge } from "@/components/ui/badge";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { projectApi, ProjectFile } from "@/lib/api/project";
import { chatApi } from "@/lib/api/chat";
import { historyApi } from "@/lib/api/history";
import { useConversationStore } from '@/stores/models';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import RenderPageContent from "@/components/RenderPageContent";
import { PiChatsCircle } from "react-icons/pi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FileAvatars = ({ files }: { files: any[] }) => {
  const maxVisible = 3;
  const remainingCount = files.length - maxVisible;
  const visibleFiles = files.slice(0, maxVisible);
  const { currentProject } = useProjectStore();

  const fileColors = ["#10b981", "#ec4899", "#ec4899"]; // Green, Pink, Pink for the file icons

  return (
    <div className="flex items-center">
      <div className="flex -space-x-4">
        {visibleFiles.map((file, index) => (
          <div
            key={file.id}
            className="h-10 w-10 rounded-xl flex items-center justify-center border-4 border-background"
            style={{ backgroundColor: fileColors[index % fileColors.length], zIndex: maxVisible - index }}
          >
            <FileText className="h-5 w-5 text-white" />
          </div>
        ))}
      </div>
    </div>
  );
};

interface ProjectViewProps {
  onCreateConversation: (input: string, fileContent?: {
    uploaded_files: Array<{
      file_name: string;
      file_size: string;
      file_type: string;
      file_content: string;
    }>;
  }) => Promise<void>;
  isLoading: boolean;
}

export function ProjectView({ onCreateConversation, isLoading }: ProjectViewProps) {
  const { currentProject, updateProject, addProjectHistory, projects } = useProjectStore();
  const { selectedModels } = useSelectedModelsStore();
  const { setContent } = useContentStore();
  const { setConversationId, setPromptId, setGenerationType, generationType } = useConversationStore();
  const { startStreamingTitle, stopStreamingTitle } = useStreamingTitlesStore();
  const router = useRouter();
  const { isOpen } = useSidebarStore();
  // State handlers
  const [inputValue, setInputValue] = React.useState("");
  const [isLoadingFiles, setIsLoadingFiles] = React.useState(false);
  const [filesModalOpen, setFilesModalOpen] = React.useState(false);
  const [instructionsModalOpen, setInstructionsModalOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState(currentProject?.name || "");
  const [projectDescription, setProjectDescription] = React.useState(currentProject?.description || "");
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isRenamingLoading, setIsRenamingLoading] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [projectConversations, setProjectConversations] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const { setIsCombinedMode } = useCombinedModeStore();
  const { setIsCompareMode } = useCompareModeStore();
  const descriptionMaxLength = 50;
  // Conversation rename/delete state
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingConversationTitle, setEditingConversationTitle] = useState("");
  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [movingConversationId, setMovingConversationId] = useState<string | null>(null);
  const [movingTargetProjectId, setMovingTargetProjectId] = useState<string | null>(null);

  // Update local state when the current project changes
  useEffect(() => {
    if (currentProject) {
      setProjectName(currentProject.name);
      setProjectDescription(currentProject.description || "Chat with the Integrated Science Syllabus and Book");
    }
  }, [currentProject]);

  // Keep conversations in sync with store updates (e.g., Sidebar move/remove)
  useEffect(() => {
    if (currentProject?.histories && Array.isArray(currentProject.histories)) {
      setProjectConversations(currentProject.histories);
    }
  }, [currentProject?.histories]);

  // Fetch project conversations when component mounts
  useEffect(() => {
    if (currentProject?.uuid) {
      const fetchProjectConversations = async () => {
        try {
          setIsLoadingConversations(true);
          
          // Check if the project already has histories loaded
          if (currentProject.histories && currentProject.histories.length > 0) {
            setProjectConversations(currentProject.histories);
            setIsLoadingConversations(false);
            return;
          }
          
          // Fetch conversations from the API
          const conversations = await projectApi.getProjectConversations(currentProject.uuid);
          // console.log(conversations, 'This is the loaded conversations from the projectview component');
          
          if (Array.isArray(conversations) && conversations.length > 0) {
            // Format conversations to match the expected format
            const formattedConversations = conversations.map(conv => ({
              id: conv.session,
              session: conv.session,
              title: conv.title,
              type: 'chat' as const,
              created_at: conv.created_at,
              updated_at: conv.updated_at,
            }));
            
            setProjectConversations(formattedConversations);
            
            // Update the current project with the fetched conversations
            updateProject(currentProject.uuid, {
              histories: formattedConversations,
            });
          }
        } catch (error: any) {
          // console.error('Error fetching project conversations:', error);
          // toast.error(error.response.data.error || error.response.data.message || 'Failed to load project conversations');
        } finally {
          setIsLoadingConversations(false);
        }
      };
      
      fetchProjectConversations();
    }
  }, [currentProject?.uuid, updateProject]);

  // Fetch project files when component mounts
  useEffect(() => {
    if (currentProject?.uuid) {
      const fetchProjectFiles = async () => {
        try {
          setIsLoadingFiles(true);
          
          // Check if the project already has files loaded
          if (currentProject.files && currentProject.files.length > 0) {
            setProjectFiles(currentProject.files);
            setIsLoadingFiles(false);
            return;
          }
          
          const filesData = await projectApi.getProjectFiles(currentProject.uuid);
          // console.log('Fetched project files outside:', filesData);
          
          if (Array.isArray(filesData)) {
            // console.log('Fetched project files:', filesData);
            // Convert API response to the format expected by the store
            const formattedFiles = filesData.map((file, index) => ({
              id: String(file.index || index + 1), // Use the index from the API or fallback to index+1
              name: file.file_name,
              status: 'accessible' as const,
              type: file.file_type,
              size: file.file_size || 0,
              mimeType: `${file.file_type}/${file.file_extension.replace('.', '')}`,
              url: file.file_url || undefined,
              createdAt: new Date()
            }));

            setProjectFiles(formattedFiles);
            
            // Update the current project with the fetched files
            updateProject(currentProject.uuid, {
              files: formattedFiles,
            });
          }

          setIsLoadingFiles(false);
        } catch (error: any) {
          // console.error('Error fetching project files:', error);
          // toast.error(error.response.data.error || error.response.data.message || 'Failed to load project files');
          setIsLoadingFiles(false);
        }
      };
      
      fetchProjectFiles();
    }
  }, [currentProject?.uuid, updateProject]);

  // Early return if no project is selected
  if (!currentProject) {
    return;
  }

  const handleSend = (fileContent?: {
    uploaded_files: Array<{
      file_name: string;
      file_size: string;
      file_type: string;
      file_content: string;
    }>;
  }) => {

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
    

    onCreateConversation(inputValue, fileContent);
    setInputValue("");
  };

  const handleColorSelect = async (color: string) => {
    if (currentProject) {
      try {
        // Call the API to update the color
        const response = await projectApi.updateProjectColor(currentProject.uuid, color);
        
        // Update local state with either the returned color_code from API or the original color
        updateProject(currentProject.uuid, { 
          color: response.data.color_code || color 
        });
        setColorPickerOpen(false);
      } catch (error: any) {
        // console.error('Error updating project color:', error);
        // toast.error(error.response.data.error || error.response.data.message || 'Failed to update project color');
      }
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[300px] text-center p-8">
      <div 
        className="rounded-full p-3 mb-4 flex items-center justify-center"
        style={{ backgroundColor: `${currentProject.color}10` }}
      >
        <MessagesSquare style={{color: currentProject.color}} className="h-6 w-6" />
      </div>
      <h3 className="font-semibold mb-2">No chat history in {projectName}</h3>
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-3 rounded-lg">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          <span>{currentProject.files?.length || 0} file in {projectName}</span>
        </div>
        <span className="text-border">•</span>
        <div className="flex items-center gap-1.5">
          <Settings className="h-3.5 w-3.5" />
          <span>
            {currentProject.instructions 
              ? "Instructions added" 
              : "No instructions"}
          </span>
        </div>
      </div>
    </div>
  );

  const handleConversationClick = (conversationId: string) => {
    setGenerationType('load');
    // console.log('Navigating to conversation:', conversationId, 'in project:', currentProject.uuid);
    router.push(`/project/${currentProject.uuid}/chat/${conversationId}`);
  };

  const handleConversationRename = (id: string, currentTitle: string) => {
    setEditingConversationId(id);
    setEditingConversationTitle(currentTitle);
  };

  const handleConversationRenameSubmit = async (id: string) => {
    const current = projectConversations.find((c) => c.session === id);
    if (editingConversationTitle.trim() && current && editingConversationTitle !== current.title) {
      try {
        setRenamingConversationId(id);
        startStreamingTitle(id);
        const response = await historyApi.renameConversation(id, editingConversationTitle.trim());
        if (response.status && response.title) {
          const updated = projectConversations.map((c) => c.session === id ? { ...c, title: editingConversationTitle.trim() } : c);
          setProjectConversations(updated);
          updateProject(currentProject.uuid, { histories: updated });
          setTimeout(() => stopStreamingTitle(id), 800);
        }
        setEditingConversationId(null);
        setEditingConversationTitle("");
      } catch (error: any) {
        stopStreamingTitle(id);
        // toast.error('Failed to rename conversation');
        setEditingConversationId(id);
      } finally {
        setRenamingConversationId(null);
      }
    } else {
      setEditingConversationId(null);
      setEditingConversationTitle("");
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      setDeletingConversationId(id);
      const response = await historyApi.deleteHistory(id);
      if (response.status) {
        const updated = projectConversations.filter((c) => c.session !== id);
        setProjectConversations(updated);
        updateProject(currentProject.uuid, { histories: updated });
        // toast.success('Conversation deleted');
      }
    } catch (error: any) {
      // toast.error(error.response.data.message || 'Failed to delete conversation');
    } finally {
      setDeletingConversationId(null);
      setConversationToDelete(null);
    }
  };

  const handleMoveConversation = async (conversationId: string, targetProjectUuid?: string) => {
    try {
      setMovingConversationId(conversationId);
      setMovingTargetProjectId(targetProjectUuid || null);
      const response = await historyApi.moveConversation(conversationId, targetProjectUuid);
      if (response?.status) {
        // Remove from current project's UI list
        const remaining = projectConversations.filter(c => c.session !== conversationId);
        setProjectConversations(remaining);
        updateProject(currentProject.uuid, { histories: remaining });

        // Build moved conversation item
        const moved = response.conversation || {};
        const movedItem = {
          id: moved.session || conversationId,
          session: moved.session || conversationId,
          title: moved.title || '',
          type: 'chat' as const,
          created_at: moved.created_at || new Date().toISOString(),
          updated_at: moved.updated_at || new Date().toISOString(),
        };

        if (targetProjectUuid) {
          // Add to target project in store if present
          const target = projects.find(p => String(p.uuid) === String(targetProjectUuid));
          if (target) {
            const targetHistories = Array.isArray(target.histories) ? target.histories : [];
            const updatedTargetHistories = [movedItem, ...targetHistories];
            updateProject(target.uuid, { histories: updatedTargetHistories });
          }
          toast.success(`Conversation moved to ${target?.name}`);
        } else {
          // No target project means remove from project → add back to global history
          const addHistory = useHistoryStore.getState().addHistory;
          addHistory({
            title: movedItem.title,
            session: movedItem.session,
            type: 'chat',
            created_at: movedItem.created_at,
            updated_at: movedItem.updated_at,
          } as any);
          toast.success('Conversation removed from project');
        }
      } else {
        toast.error(response?.error || response?.message || 'Failed to move conversation');
      }
    } catch (error: any) {
      // toast.error(error.response.data.message || 'Failed to move conversation');
    } finally {
      setMovingConversationId(null);
      setMovingTargetProjectId(null);
    }
  };

  const handleEditProject = () => {
    setIsEditingProject(true);
  };

  const handleSaveProject = async () => {
    if (currentProject) {
      try {
        setIsRenamingLoading(true);
        
        // Call API to update project name and description
        const response = await projectApi.editProject(currentProject.uuid, {
          name: projectName,
          description: projectDescription
        });
        
        // Update local state with the response
        updateProject(currentProject.uuid, {
          name: response.data.name || projectName,
          description: response.data.description || projectDescription
        });
        
        setIsEditingProject(false);
        // toast.success("Project updated successfully");
      } catch (error: any) {
        // console.error('Error updating project:', error);
        // toast.error(error.response.data.error || error.response.data.message || 'Failed to update project');
      } finally {
        setIsRenamingLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    // Reset to current project values
    setProjectName(currentProject?.name || "");
    setProjectDescription(currentProject?.description || "Your project workspace for organized conversations");
    setIsEditingProject(false);
  };


  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= descriptionMaxLength) {
      setProjectDescription(value);
    }
  };

  return (
      <div className={`flex flex-col w-full max-w-5xl mx-auto px-4 ${isOpen ? "pl-40" : "pl-6"}`}>
        {/* 1. Project Header with Title and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-start gap-2">
            <Button
              variant={'ghost'} 
              size={'icon2'}
              onClick={()=> setColorPickerOpen(true)}
              className="rounded-full flex items-center justify-center shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
              style={{ backgroundColor: `${currentProject.color}10` }}
            >
              <BsFolder2Open style={{color: currentProject.color}} className={`w-8 h-8`}  />
            </Button>
            {isEditingProject ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="text-xl font-semibold bg-transparent rounded-lg border border-borderColorPrimary focus:outline-none px-1"
                    placeholder="Project name"
                    disabled={isRenamingLoading}
                  />
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={handleSaveProject}
                      disabled={isRenamingLoading}
                    >
                      {isRenamingLoading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground" 
                      onClick={handleCancelEdit}
                      disabled={isRenamingLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <textarea
                  value={projectDescription}
                  onChange={handleDescriptionChange}
                  className="text-sm text-muted-foreground bg-transparent border border-borderColorPrimary rounded-md h-20 px-3 py-2 resize-none focus-visible:outline-none"
                  placeholder="Project description"
                  disabled={isRenamingLoading}
                  maxLength={descriptionMaxLength}
                />
                <div className="flex justify-end mt-1">
                    <span className="text-xs text-muted-foreground">
                      {projectDescription.length}/{descriptionMaxLength}
                    </span>
                  </div>
              </div>
            ) : (
              <div className="relative group">
                <div>
                  <h1 className="text-xl font-semibold">{currentProject.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {currentProject.description || "Your project workspace for organized conversations"}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute -right-10 top-0 transition-opacity h-8 w-8 p-0 rounded-xl" 
                  onClick={handleEditProject}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 2. New Chat Input Section */}
        <div className="mb-8 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                isLoading={isLoading}
                isWeb={true}
                isCombined={true}
                otherSytles={'!mx-0'}
                dynamicPrompts={true}
              />
            </div>
          </div>
        </div>

        {/* 3. Quick Actions Bar */}
        <div className="grid max-w-3xl  gap-4 mb-8">
          <Button 
            variant="outline" 
            size="lg" 
            className="h-auto py-4 px-6 rounded-2xl"
            onClick={() => setFilesModalOpen(true)}
          >
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between w-full">
                {isLoadingConversations || isLoadingFiles ? (
                  <>
                    <div className="flex flex-col items-start space-y-2 w-full">
                      <Skeleton className="h-4 w-24 rounded-md" /> {/* Title skeleton */}
                      <Skeleton className="h-3 w-48 rounded-md" /> {/* Subtitle skeleton */}
                    </div>
                    <div className="flex">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-start">
                      <h3 className="text-sm">
                        {currentProject.files && currentProject.files.length > 0 
                          ? "Subject Materials" 
                          : "No Subject Materials"
                        }
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 text-left">
                        {currentProject.files && currentProject.files.length > 0 
                          ? `${currentProject.files.length} files` 
                          : "Chats in this subject have access to the subject materials"
                        }
                      </p>
                    </div>
                    
                    {currentProject.files && currentProject.files.length > 0 ? (
                      <FileAvatars files={currentProject.files} />
                    ) : (
                      <div className="h-4 w-4 rounded-xl flex items-center justify-center">
                        <FilePlus2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="h-auto py-2 px-4 rounded-2xl"
            onClick={() => setInstructionsModalOpen(true)}
          >
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between w-full">
                {isLoadingConversations || isLoadingFiles ? (
                  <>
                    <div className="flex flex-col items-start space-y-2 w-full">
                      <Skeleton className="h-4 w-28 rounded-md" /> {/* Title skeleton */}
                      <Skeleton className="h-3 w-40 rounded-md" /> {/* First line of text */}
                      <Skeleton className="h-3 w-32 rounded-md" /> {/* Second line of text */}
                    </div>
                      <Skeleton className="h-10 w-10 rounded-xl" /> {/* Pencil icon skeleton */}
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-start">
                      <h3 className="text-sm">
                        {currentProject.instructions 
                          ? "Instructions" 
                          : "Instructions Not Set"
                        }
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 text-left">
                {currentProject.instructions 
                  ? currentProject.instructions
                          : "Set custom instructions for how you want your response"
                        }
                      </p>
                    </div>
                    
                    {!currentProject.instructions && (
                      <div className="h-4 w-4 rounded-xl flex items-center justify-center">
                        <NotebookPen  className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Button>
        </div>

        {/* 4. Chat History Section with heading */}
        <div className="flex-1 flex flex-col space-y-4 max-w-3xl">
          <div className="flex items-center justify-between">
            {/* <h2 className="text-lg font-semibold">Chats in this project</h2> */}
            {(!isLoadingConversations && (projectConversations && projectConversations.length > 0)) && (
              <span className="text-sm text-muted-foreground">
                {projectConversations.length > 0 && 'Chats in this project'}
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-hidden relative rounded-lg p-1">
            {isLoadingConversations ? (
              <div className="space-y-2">
                {/* Skeleton for 3 conversation items */}
                {[1, 2, 3].map((item) => (
                  <div key={item} className="p-2 rounded-xl">
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col">
                          <Skeleton className="h-4 w-40 rounded-md" />
                          <Skeleton className="h-3 w-20 rounded-md mt-1" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projectConversations && projectConversations.length > 0 ? (
              <ScrollArea className="max-h-[calc(100vh-20rem)] pr-2">
                <div className="">
                  {projectConversations.map((chat, index) => (
                    <div 
                      key={chat.id || index}
                      className="group p-2 rounded-xl hover:bg-secondary hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => {
                        handleConversationClick(chat.session);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <div 
                          className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" 
                          // style={{ 
                          //   backgroundColor: `${currentProject.color}10` // Using hex color with 10 opacity (12.5%)
                          // }}
                        >
                          <PiChatsCircle style={{color: currentProject.color}} className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col">
                            {editingConversationId === chat.session ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={editingConversationTitle}
                                  onChange={(e) => setEditingConversationTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleConversationRenameSubmit(chat.session);
                                    }
                                  }}
                                  autoFocus
                                  className="text-sm font-medium bg-transparent rounded-lg border border-borderColorPrimary focus:outline-none px-1"
                                  placeholder="Conversation title"
                                  disabled={renamingConversationId === chat.session}
                                />
                                {renamingConversationId === chat.session ? (
                                  <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => { e.stopPropagation(); handleConversationRenameSubmit(chat.session); }}
                                      aria-label="Confirm Rename"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => { e.stopPropagation(); setEditingConversationId(null); setEditingConversationTitle(''); }}
                                      aria-label="Cancel Rename"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <h3 className="font-medium truncate">{chat.title}</h3>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(chat.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Dropdown menu for actions */}
                        <div onClick={(e) => e.stopPropagation()} className={`${movingConversationId === chat.session ? '' : 'opacity-0 group-hover:opacity-100'}`}>
                          {movingConversationId === chat.session ? (
                            <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 border-none outline-none bg-transparent hover:bg-transparent"
                              >
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px] bg-backgroundSecondary rounded-xl">
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Folder className="mr-2 h-4 w-4" />
                                  <span className="text-sm">Move to project</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="bg-backgroundSecondary rounded-xl">
                                  {projects
                                    .filter(p => p.uuid !== currentProject.uuid)
                                    .map(p => (
                                      <DropdownMenuItem 
                                        key={p.uuid}
                                        onClick={() => handleMoveConversation(chat.session, String(p.uuid))}
                                        disabled={movingConversationId === chat.session}
                                      >
                                        <Folder className="mr-2 h-4 w-4" style={{ color: p.color || undefined }} />
                                        <span className="flex items-center gap-2">
                                          {p.name}
                                          {(movingConversationId === chat.session && movingTargetProjectId === String(p.uuid)) && (
                                            <Loader className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                          )}
                                        </span>
                                      </DropdownMenuItem>
                                    ))}
                                  {projects.length <= 1 && (
                                    <DropdownMenuItem disabled>
                                      <span className="text-muted-foreground">No other projects</span>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuItem onClick={() => handleMoveConversation(chat.session)} disabled={movingConversationId === chat.session}>
                                <Undo2 className="mr-2 h-4 w-4" />
                                <span className="text-sm">Remove from {currentProject.name}</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-borderColorPrimary"/>
                              <DropdownMenuItem onClick={() => handleConversationRename(chat.session, chat.title)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span className="text-sm">Rename</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setConversationToDelete(chat.session)}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span className="text-sm">Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* Modals */}
        <ProjectFilesModal
          isOpen={filesModalOpen}
          onClose={() => setFilesModalOpen(false)}
          projectName={currentProject.name}
        />

        <ProjectInstructionsModal
          isOpen={instructionsModalOpen}
          onClose={() => setInstructionsModalOpen(false)}
          projectName={currentProject.name}
        />

        {/* Color Picker Modal */}
        <ColorPicker
          isOpen={colorPickerOpen}
          onClose={() => setColorPickerOpen(false)}
          onColorSelect={handleColorSelect}
          initialColor={currentProject.color || "#FFD700"}
        />
      
      {/* Delete conversation confirmation dialog */}
      <AlertDialog open={!!conversationToDelete} onOpenChange={() => setConversationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingConversationId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => conversationToDelete && handleDeleteConversation(conversationToDelete)}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500 disabled:opacity-70"
              disabled={!!deletingConversationId}
            >
              {deletingConversationId ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
  );
}
