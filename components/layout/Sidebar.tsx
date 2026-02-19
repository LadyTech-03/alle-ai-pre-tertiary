"use client";

import { useState, useEffect, forwardRef, useRef, useCallback, useMemo } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuItem,
  ContextMenuContent,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuSeparator
} from "@/components/ui/context-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LayoutGrid, Plus, EllipsisVertical, Gem, ChevronDown, BookOpen, Pencil, Trash2, History, Search, ChartLine, ImageIcon, Music, Video, Loader, Share, Undo2, ChevronRight, Check, X, Settings, BadgeQuestionMark, BadgeInfo, Book, LogOut, Keyboard, GraduationCap } from "lucide-react";
import { BsFolder2Open } from "react-icons/bs";
import { ShortcutsModal } from "../ui/modals";
import Image from "next/image";
import { HiOutlinePencilAlt } from "react-icons/hi";
import {
  sidebarMenuItems,
} from "@/lib/constants";
import { useSidebarStore, useHistoryStore, useProjectStore, Project, useAuthStore, useWebSearchStore, useCombinedModeStore, useStreamingTitlesStore, useCompareModeStore } from "@/stores";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { PlansModal, ProjectModal, SearchHistoryModal } from "../ui/modals";
import { ModelSelectionModal } from "@/components/ui/modals/model-selection-modal";
import { SettingsModal } from "../ui/modals/settings-modal";
import { UserProfileModal } from "../ui/modals/user-profile-modal";
import { ProjectsListModal } from "@/components/ui/projects-sheet"
import { LogoutModal } from "../ui/modals"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Input } from "@/components/ui/input";
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
import { useConversationStore } from "@/stores/models";
import { historyApi } from "@/lib/api/history";
import { projectApi } from "@/lib/api/project";
import { toast } from "sonner"
import { authApi } from "@/lib/api/auth";
import { TextStream } from "@/components/ui/text-stream";
import { PiChatsCircle } from "react-icons/pi";
import { cn } from "@/lib/utils";
import { ShareLinkModal } from "../ui/modals/share-modal";

// Add color mapping for audio categories
const AUDIO_CATEGORY_COLORS = {
  tts: '#3B82F6', // blue
  stt: '#10B981', // green
  ag: '#A21CAF',  // purple
};

export function Sidebar() {
  const { isOpen, setCurrentPage, toggle, setCurrentConversationLink, setSectionId } = useSidebarStore();
  const pathname = usePathname();
  const router = useRouter();
  const isExamPrepPage = pathname === "/exam-prep";
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { history, removeHistory: removeItem, renameHistory: renameItem, getHistoryByType, isLoading, addHistory } = useHistoryStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [renamingHistoryId, setRenamingHistoryId] = useState<string | null>(null);
  const { projects, currentProject, setCurrentProject, removeProject, isLoading: projectsLoading, updateProject } = useProjectStore();
  const params = useParams();
  const [modelSelectionModalOpen, setModelSelectionModalOpen] = useState(false);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [historySearchModalOpen, setHistorySearchModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const { user, plan } = useAuthStore();
  const { setGenerationType, conversationId, clearConversation, setConversationId } = useConversationStore();
  ;

  // Add confirmation dialog state
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [historyToDelete, setHistoryToDelete] = useState<string | null>(null);

  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const [isLoadingBillingPortal, setIsLoadingBillingPortal] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  // For project renaming
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [movingConversationId, setMovingConversationId] = useState<string | null>(null);
  const [movingTargetProjectId, setMovingTargetProjectId] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [shareLinkModalOpen, setShareLinkModalOpen] = useState(false);
  // For tracking which projects are expanded in the sidebar
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  // Add state for the projects list modal
  const [projectsListModalOpen, setProjectsListModalOpen] = useState(false);

  // Add empty response counter to track when we've reached the end
  const [emptyResponseCount, setEmptyResponseCount] = useState(0);

  // Create a map to track which titles are currently streaming
  const { streamingTitles } = useStreamingTitlesStore();

  // Toggle project expansion
  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Get only the first 3 projects to display
  const visibleProjects = useMemo(() => projects.slice(0, 8), [projects]);
  const hasMoreProjects = projects.length > 8;

  // Add a ref to track the last loading time to implement a cooldown
  const lastLoadTimeRef = useRef<number>(0);
  const LOAD_COOLDOWN_MS = 1000; // 1 second cooldown between load attempts

  // Add this function to handle scroll events
  const handleHistoryScroll = useCallback(() => {
    if (!historyScrollRef.current || isLoading || isLoadingMore) return;

    const scrollElement = historyScrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!scrollElement) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;

    // Only check if we have more history to load
    if (!hasMoreHistory || emptyResponseCount >= 2) return;

    // Check cooldown period to prevent rapid firing
    const now = Date.now();
    if (now - lastLoadTimeRef.current < LOAD_COOLDOWN_MS) return;

    // Check if scrolled to bottom (with a larger threshold to prevent edge cases)
    if (scrollHeight - scrollTop - clientHeight < 100) {
      // Avoid multiple calls while already loading
      if (isLoadingMore) return;

      // Update the last load time
      lastLoadTimeRef.current = now;

      setIsLoadingMore(true);

      // Load more history
      const nextPage = historyPage + 1;
      setHistoryPage(nextPage);

      // Fetch more history items
      historyApi.getHistory(currentType, nextPage)
        .then((response) => {
          if (response.data.length > 0) {
            // Add new items to history
            const { addHistoryItems } = useHistoryStore.getState();
            addHistoryItems(response.data);

            // Reset empty response counter since we got data
            setEmptyResponseCount(0);
          } else {
            // Increment empty response counter
            setEmptyResponseCount(prev => prev + 1);

            // No more items to load
            setHasMoreHistory(false);
          }
          setIsLoadingMore(false);
        })
        .catch((error) => {
          // console.error('Error loading more history:', error);
          setHasMoreHistory(false);
          setEmptyResponseCount(2); // Set to threshold to prevent more attempts
          setIsLoadingMore(false);
        });
    }
  }, [historyPage, isLoading, isLoadingMore, hasMoreHistory, emptyResponseCount, setHistoryPage, setHasMoreHistory]);

  // Add effect to attach scroll listener
  useEffect(() => {
    const scrollContainer = historyScrollRef.current;
    if (scrollContainer) {
      // Get the actual scrollable viewport
      const scrollElement = scrollContainer.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.addEventListener('scroll', handleHistoryScroll);
        return () => {
          scrollElement.removeEventListener('scroll', handleHistoryScroll);
        };
      }
    }
  }, [handleHistoryScroll]);

  useEffect(() => {
    if (isMobile && isOpen) {
      toggle();
    }
  }, [isMobile]);

  const handleNewChat = () => {
    // Clear the conversation link when starting a new chat
    setCurrentConversationLink(null);
    clearConversation();

    // Reset web search and combined mode
    useWebSearchStore.getState().setIsWebSearch(false);
    useCombinedModeStore.getState().setIsCombinedMode(false);
    useCompareModeStore.getState().setIsCompareMode(false);
    let defaultTitle = "Chat";

    // Reset document title to default
    document.title = `${defaultTitle} - Alle-AI`;
    router.push("/chat");
  };

  const handleExamPrep = () => {
    setCurrentConversationLink(null);
    clearConversation();
    useWebSearchStore.getState().setIsWebSearch(false);
    useCombinedModeStore.getState().setIsCombinedMode(false);
    useCompareModeStore.getState().setIsCompareMode(false);
    document.title = "Exam Prep - Alle-AI";
    router.push("/exam-prep");
  };




  const isHistoryItemActive = (itemSession: string | undefined): boolean => {
    return pathname.includes(`/${itemSession}`);
  };

  useEffect(() => {
    //  console.log(pathname, 'This is the pathname')
    isHistoryItemActive(params?.chatId as string || params?.conversation_id as string || params?.shareId as string);
  }, [pathname])

  const handleRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const handleRenameSubmit = async (id: string) => {
    if (editingTitle.trim()) {
      try {
        setRenamingHistoryId(id);
        // Get the startStreamingTitle and stopStreamingTitle functions from the store
        const { startStreamingTitle, stopStreamingTitle } = useStreamingTitlesStore.getState();

        // Start streaming effect before API call
        startStreamingTitle(id);

        const response = await historyApi.renameConversation(id, editingTitle.trim());
        if (response.status && response.title) {
          renameItem(id, editingTitle.trim());

          // Streaming continues for a moment after rename for smooth effect
          setTimeout(() => {
            stopStreamingTitle(id);
          }, 800);
        }
      } catch (error: any) {
        // console.error('Error renaming conversation:', error);
        // stopStreamingTitle(id);
      }
    }
    setEditingId(null);
    setEditingTitle("");
    setRenamingHistoryId(null);
  };

  // Determine current content type based on pathname
  const getCurrentType = (): 'chat' | 'image' | 'audio' | 'video' => {
    if (pathname.startsWith('/image')) return 'image';
    if (pathname.startsWith('/audio')) return 'audio';
    if (pathname.startsWith('/video')) return 'video';
    return 'chat';
  };

  // Here we get the history of the various pages
  const currentType = getCurrentType();
  const currentHistory = getHistoryByType(currentType);

  // Add this helper function to get section-specific styles
  const getSectionStyles = (type: 'chat' | 'image' | 'audio' | 'video') => {
    switch (type) {
      case 'image':
        return {
          bgColor: 'bg-purple-500/30',
          darkBgColor: 'bg-purple-500/20',
          hoverBg: 'hover:bg-purple-500/20',
          iconColor: 'text-foreground'
        };
      case 'audio':
        return {
          bgColor: 'bg-blue-500/30',
          darkBgColor: 'bg-blue-500/20',
          hoverBg: 'hover:bg-blue-500/20',
          iconColor: 'text-foreground'
        };
      case 'video':
        return {
          bgColor: 'bg-yellow-500/30',
          darkBgColor: 'bg-yellow-500/20',
          hoverBg: 'hover:bg-yellow-500/20',
          iconColor: 'text-foreground'
        };
      default:
        return {
          bgColor: 'bg-green-500/30',
          darkBgColor: 'bg-green-500/20',
          hoverBg: 'hover:bg-green-500/20',
          iconColor: 'text-foreground'
        };
    }
  };

  // Helper function to get current section icon
  const getCurrentSectionIcon = () => {
    switch (true) {
      case pathname.startsWith("/image"):
        return HiOutlinePencilAlt;
      case pathname.startsWith("/audio"):
        return HiOutlinePencilAlt;
      case pathname.startsWith("/video"):
        return HiOutlinePencilAlt;
      default:
        return HiOutlinePencilAlt;
    }
  };

  const CurrentIcon = getCurrentSectionIcon();

  // Modify the handleHistoryItemClick function
  const handleHistoryItemClick = (item: string) => {
    // Clear the conversation link when switching to a different conversation
    setCurrentConversationLink(null);

    // Set the current section ID based on the type
    setSectionId(`${currentType}Id`, item);

    // Find the history item and set document title
    const historyItem = currentHistory.find(h => h.session === item);
    if (historyItem) {
      document.title = `${historyItem.title} - Alle-AI`;
    }
  };

  // Add this helper function for projects
  const handleProjectClick = (project: Project) => {
    setCurrentProject(project);
    router.replace(`/project/${project.uuid}`);
  };

  // Handle project rename
  const handleProjectRename = (uuid: string, currentName: string) => {
    setEditingProjectId(uuid);
    setEditingProjectName(currentName);
  };

  const handleProjectRenameSubmit = async (uuid: string) => {
    if (editingProjectName.trim() && editingProjectName !== projects.find(p => p.uuid === uuid)?.name) {
      try {
        setRenamingProjectId(uuid);
        // Get the streaming functions from the store
        const { startStreamingTitle, stopStreamingTitle } = useStreamingTitlesStore.getState();

        // Start streaming effect
        startStreamingTitle(`project-${uuid}`);

        const response = await projectApi.renameProject(uuid, editingProjectName.trim());
        if (response) {
          // Update the project in the store
          updateProject(uuid, { name: editingProjectName.trim() });
          // toast.success('Project renamed');

          // Streaming continues for a moment after rename
          setTimeout(() => {
            stopStreamingTitle(`project-${uuid}`);
          }, 800);
          setEditingProjectId(null);
          setEditingProjectName("");
        }
      } catch (error: any) {
        // console.error('Error renaming project:', error);
        // toast.error(error.response.data.error || error.response.data.message || 'Failed to rename project');
        setEditingProjectId(uuid);
      } finally {
        setRenamingProjectId(null);
      }
    } else {
      setEditingProjectId(null);
      setEditingProjectName("");
    }
  };

  // Handle project deletion
  const handleDeleteProject = async (projectUuid: string) => {
    try {
      setDeletingProjectId(projectUuid);
      const response = await projectApi.deleteProject(projectUuid);
      if (response) {
        // Remove the project from the store
        removeProject(projectUuid);
        // toast.success('Project deleted');

        // If we're deleting the current project, redirect to home
        if (currentProject?.uuid === projectUuid) {
          router.push('/chat');
        }
      }
    } catch (error: any) {
      // console.error('Error deleting project:', error);
      // toast.error(error.response.data.error || error.response.data.message || 'Failed to delete project');
    } finally {
      setDeletingProjectId(null);
      setProjectToDelete(null);
    }
  };

  const handleDeleteHistory = async (sessionId: string) => {
    try {
      const response = await historyApi.deleteHistory(sessionId);

      if (response.status) {
        // If we're on the conversation page, redirect
        if (sessionId === conversationId) {
          router.replace(`/${currentType}`);
        }

        // Remove from history store
        removeItem(sessionId);

        // Also remove from any projects that contain this conversation
        for (const project of projects) {
          if (project.histories && project.histories.some(h => h.session === sessionId)) {
            // Create updated project without this conversation
            const updatedProject = {
              ...project,
              histories: project.histories.filter(h => h.session !== sessionId)
            };

            // Update the project in the store
            updateProject(project.uuid, updatedProject);
          }
        }
      }
    } catch (error) {
      // console.error('Error deleting history item:', error);
      // toast.error('Failed to delete conversation');
    }

    setHistoryToDelete(null);
  };

  const handleMoveConversation = async (conversationId: string, targetProjectUuid?: string) => {
    try {
      setMovingConversationId(conversationId);
      setMovingTargetProjectId(targetProjectUuid || null);
      const response = await historyApi.moveConversation(conversationId, targetProjectUuid);
      if (response?.status) {
        // Remove conversation from any project that contains it
        for (const project of projects) {
          if (project.histories && project.histories.some(h => h.session === conversationId)) {
            const updatedProject = {
              ...project,
              histories: project.histories.filter(h => h.session !== conversationId)
            };
            updateProject(project.uuid, updatedProject);
          }
        }

        const moved = response.conversation || {} as any;
        const movedItem = {
          id: moved.session || conversationId,
          session: moved.session || conversationId,
          title: moved.title || '',
          type: (moved.type || 'chat') as 'chat' | 'image' | 'audio' | 'video',
          created_at: moved.created_at || new Date().toISOString(),
          updated_at: moved.updated_at || new Date().toISOString(),
        };

        if (targetProjectUuid) {
          // If moving INTO a project, remove from global history list immediately
          removeItem(conversationId);
          // Add to target project
          const target = projects.find(p => p.uuid === targetProjectUuid);
          if (target) {
            const targetHistories = Array.isArray(target.histories) ? target.histories : [];
            updateProject(target.uuid, { histories: [movedItem, ...targetHistories] });
          }
          toast.success(`Conversation moved to ${target?.name}`);
        } else {
          // No target: add back to global history
          addHistory({
            title: movedItem.title,
            session: movedItem.session,
            type: movedItem.type,
            created_at: movedItem.created_at,
            updated_at: movedItem.updated_at,
          } as any);
          toast.success(`Conversation removed from project`);
        }
      } else {
        toast.error(response?.message || 'Failed to move conversation');
      }
    } catch (error) {
      // toast.error('Failed to move conversation');
    } finally {
      setMovingConversationId(null);
      setMovingTargetProjectId(null);
    }
  };

  // Add effect to initialize hasMoreHistory based on initial API response
  useEffect(() => {
    // Reset states when content type changes
    setHistoryPage(1);
    setHasMoreHistory(true);
    setEmptyResponseCount(0);

    // Check if we should set hasMoreHistory based on initial history load
    if (!isLoading && currentHistory.length > 0) {
      // Set hasMoreHistory to true if we have any history items
      // It will be updated properly after the first scroll load
      setHasMoreHistory(true);
    }
  }, [isLoading, currentHistory.length, currentType]);

  const isPaidPlan =
    typeof plan === 'string' &&
    (plan === 'standard' || plan === 'plus' || plan.includes('standard') || plan.includes('plus') || plan.includes('pro') || plan.includes('custom'));

  const planDisplayName = plan?.split('_')[0].toLowerCase()

  function formatPlanName(planString: string) {
    // Split the string by underscores
    const parts = planString.split('_');

    if (parts.length < 3) {
      return planString; // Return as-is if the format is unexpected
    }

    const prefix = parts[0]; // e.g., "custom"
    const suffix = parts[parts.length - 1]; // e.g., "monthly" or "yearly"
    const features = parts.slice(1, -1); // Everything between

    // Join features with '+' and wrap in parentheses
    const featuresFormatted = features.join('+');

    return `${prefix} (${featuresFormatted})`;
  }

  return (
    <>
      {/* Backdrop overlay for mobile when sidebar is open */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={toggle}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 mt-14 h-[calc(100vh-3.5rem)]  transition-all duration-300 
          ${isOpen ? "w-60" : "w-16"} 
          ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
          border-r bg-sideBarBackground flex flex-col`}
      >
        {isOpen ? (
          <>
            {/* Top section with fixed content */}
            <div className="py-2 px-0 flex-shrink-0">
              <div className="flex flex-col gap-2 px-2">
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleNewChat();
                      (isMobile && isOpen) ? toggle() : '';
                    }}
                    variant="outline"
                    className={`flex-1 ${getSectionStyles(currentType).bgColor} ${getSectionStyles(currentType).iconColor} dark:${getSectionStyles(currentType).darkBgColor} ${getSectionStyles(currentType).hoverBg}`}
                  >
                    <HiOutlinePencilAlt className={`mr-2 h-4 w-4 ${getSectionStyles(currentType).iconColor} ${getSectionStyles(currentType).iconColor}`} />
                    OPEN CHAT
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className={`${getSectionStyles(currentType).bgColor} ${getSectionStyles(currentType).iconColor} dark:${getSectionStyles(currentType).darkBgColor} ${getSectionStyles(currentType).hoverBg}`}
                          onClick={() => {
                            (isMobile && isOpen) ? toggle() : '';
                            setModelSelectionModalOpen(true)
                          }}
                          aria-label="Model Selection"
                          id="tooltip-select-selector"
                        >
                          <LayoutGrid className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Select models</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button
                  onClick={() => {
                    handleExamPrep();
                    (isMobile && isOpen) ? toggle() : '';
                  }}
                  variant="outline"
                  className={cn(
                    "w-full justify-start",
                    isExamPrepPage
                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20"
                      : "border-borderColorPrimary bg-background text-foreground hover:bg-secondary/70"
                  )}
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  EXAM PREP
                </Button>
              </div>
            </div>

            {/* Divider between groups */}
            <div className="h-px bg-border/70 mx-4 mb-2"></div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-hidden flex flex-col mt-4">

              {/* Projects Section */}
              {(pathname.includes('chat') || pathname.includes('project')) && (

                <>
                  <div className="flex-shrink-0 px-2">
                    <div className="flex flex-col gap-2 items-start mx-2 text-sm font-medium text-muted-foreground mb-2">
                      <span>CLASS: BASIC 7 (JHS 1)</span>
                      <span>Subjects</span>
                    </div>
                  </div>


                  {/* Scrollable projects list */}
                  <ScrollArea className="flex-shrink-0 max-h-[600px] overflow-y-auto">
                    <div className="px-2 space-y-2 py-1">
                      {projectsLoading ? (
                        <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                          <Loader className="h-4 w-4 animate-spin text-muted-foreground mb-1" />
                        </div>
                      ) : visibleProjects.length > 0 ? (
                        <>
                          {visibleProjects.map((project) => (
                            <Collapsible
                              key={project.uuid}
                              open={expandedProjects[project.uuid]}
                              onOpenChange={() => toggleProjectExpanded(project.uuid)}
                            >
                              <ContextMenu>
                                <ContextMenuTrigger>
                                  <div className={`group relative flex items-center justify-between p-2 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${currentProject?.uuid === project.uuid && (pathname.startsWith(`/project/${project.uuid}`) || pathname.includes(`/project/${project.uuid}`))
                                    ? 'bg-secondary border-primary/20 shadow-sm'
                                    : 'bg-background hover:bg-secondary/50 border-border/40 hover:border-border'
                                    }`}>
                                    <div className="flex items-center gap-3 flex-1 min-w-0" onClick={(e) => {
                                      e.stopPropagation();
                                      handleProjectClick(project);
                                    }}>

                                      {/* Text Content */}
                                      <div className="flex flex-col min-w-0 overflow-hidden text-left flex-1 space-y-0.5">
                                        {editingProjectId === project.uuid ? (
                                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                            <Input
                                              value={editingProjectName}
                                              onChange={(e) => setEditingProjectName(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  handleProjectRenameSubmit(project.uuid);
                                                }
                                              }}
                                              autoFocus
                                              className="h-6 text-sm"
                                            />
                                            {renamingProjectId === project.uuid ? (
                                              <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                                            ) : (
                                              <>
                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleProjectRenameSubmit(project.uuid)}><Check className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditingProjectId(null); setEditingProjectName(""); }}><X className="h-4 w-4" /></Button>
                                              </>
                                            )}
                                          </div>
                                        ) : (
                                          <>
                                            <span className="text-xs font-bold truncate text-foreground group-hover:text-foreground">
                                              <TextStream
                                                text={project.name}
                                                className="truncate"
                                                isStreaming={streamingTitles[`project-${project.uuid}`] || false}
                                                streamDuration={800}
                                              />
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right controls */}
                                    <div className="flex items-center gap-1">
                                      <CollapsibleTrigger asChild>
                                        <div className="p-1 rounded-md text-muted-foreground/50 group-hover:text-muted-foreground hover:bg-background/80 transition-all">
                                          <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${expandedProjects[project.uuid] ? 'rotate-90' : ''}`} />
                                        </div>
                                      </CollapsibleTrigger>

                                      {!editingProjectId && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                              <EllipsisVertical className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="w-[160px] rounded-xl bg-backgroundSecondary">
                                            <DropdownMenuItem onClick={() => handleProjectRename(project.uuid, project.name)}><Pencil className="mr-2 h-4 w-4" /><span className="text-sm">Rename</span></DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setProjectToDelete(project.uuid)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /><span className="text-sm">Delete</span></DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>
                                  </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="bg-backgroundSecondary rounded-xl">
                                  <ContextMenuItem onClick={() => handleProjectRename(project.uuid, project.name)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span className="text-sm">Rename</span>
                                  </ContextMenuItem>
                                  <ContextMenuItem
                                    onClick={() => {
                                      setProjectToDelete(project.uuid);
                                    }}
                                    className="text-red-500 focus:text-red-500"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span className="text-sm">Delete</span>
                                  </ContextMenuItem>
                                </ContextMenuContent>
                              </ContextMenu>

                              <CollapsibleContent className="mt-1 space-y-1">
                                {project.histories && project.histories.length > 0 ? (
                                  <>
                                    {project.histories.slice(0, 3).map((chat) => (
                                      <>
                                      <motion.div
                                      initial={{ opacity: 0, y: 4}}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2 }}
                                      key={chat.session}
                                      >
                                        <ContextMenu>
                                          <ContextMenuTrigger>
                                            <div
                                              className="group relative flex items-center gap-1 px-3 py-1 pl-7 text-xs hover:bg-secondary/80 rounded-md cursor-pointer"
                                            >
                                              <PiChatsCircle className="h-3 w-3 mr-1.5" style={project.color ? { color: project.color } : {}} />
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <div className="truncate max-w-full relative z-50">
                                                      {editingId === chat.session ? (
                                                        <div className="flex items-center gap-1">
                                                          <Input
                                                            value={editingTitle}
                                                            onChange={(e) => setEditingTitle(e.target.value)}
                                                            onKeyDown={(e) => {
                                                              if (e.key === "Enter") {
                                                                handleRenameSubmit(chat.session);
                                                              }
                                                            }}
                                                            autoFocus
                                                            className="h-5 text-xs"
                                                            onClick={(e) => e.stopPropagation()}
                                                          />
                                                          {renamingHistoryId === chat.session ? (
                                                            <Loader className="h-3 w-3 animate-spin text-muted-foreground" />
                                                          ) : (
                                                            <>
                                                              <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-4 w-4 p-0"
                                                                onClick={(e) => { e.stopPropagation(); handleRenameSubmit(chat.session); }}
                                                                aria-label="Confirm Rename"
                                                              >
                                                                <Check className="h-3 w-3" />
                                                              </Button>
                                                              <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-4 w-4 p-0"
                                                                onClick={(e) => { e.stopPropagation(); setEditingId(null); setEditingTitle(""); }}
                                                                aria-label="Cancel Rename"
                                                              >
                                                                <X className="h-3 w-3" />
                                                              </Button>
                                                            </>
                                                          )}
                                                        </div>
                                                      ) : (
                                                        <div
                                                          onClick={() => {
                                                            setGenerationType('load');
                                                            setCurrentProject(project);
                                                            router.replace(`/project/${project.uuid}/chat/${chat.session}`);
                                                            (isMobile && isOpen) ? toggle() : '';
                                                            // Set document title
                                                            document.title = `${chat.title} - Alle-AI`;
                                                          }}
                                                        >
                                                          <TextStream
                                                            text={chat.title}
                                                            className="text-xs truncate"
                                                            isStreaming={streamingTitles[chat.session] || false}
                                                            streamDuration={800}
                                                          />
                                                        </div>
                                                      )}
                                                    </div>
                                                  </TooltipTrigger>
                                                  <TooltipContent side="right" className="max-w-[200px] text-xs break-words">
                                                    {chat.title}
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>

                                              {/* Gradient shadow at end of container */}
                                              <div className="absolute right-8 top-0 h-full w-5 bg-gradient-to-r from-transparent to-sideBarBackground group-hover:to-secondary/80" />

                                              {/* Three dots button */}
                                              {editingId !== chat.session && (
                                                <div className="ml-auto opacity-0 group-hover:opacity-100">
                                                  <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 p-0 border-none outline-none bg-transparent hover:bg-transparent"
                                                        onClick={(e) => e.stopPropagation()}
                                                      >
                                                        <EllipsisVertical className="h-3 w-3" />
                                                      </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[200px] bg-backgroundSecondary rounded-xl">
                                                      <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                          <BsFolder2Open className="mr-2 h-4 w-4" />
                                                          <span className="text-sm">Move to project</span>
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent className="bg-backgroundSecondary rounded-xl">
                                                          {projects.filter(p => p.uuid !== project.uuid).map(p => (
                                                            <DropdownMenuItem
                                                              key={p.uuid}
                                                              onClick={() => handleMoveConversation(chat.session, p.uuid)}
                                                              disabled={movingConversationId === chat.session}
                                                            >
                                                              <BsFolder2Open className="mr-2 h-4 w-4" style={{ color: p.color || undefined }} />
                                                              <span>{p.name}</span>
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
                                                        <span className="text-sm">Remove from {project.name}</span>
                                                      </DropdownMenuItem>
                                                      <DropdownMenuSeparator className="bg-borderColorPrimary" />
                                                      <DropdownMenuItem onClick={() => handleRename(chat.session, chat.title)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        <span className="text-sm">Rename</span>
                                                      </DropdownMenuItem>
                                                      {/* <DropdownMenuItem onClick={() => {}}>
                                                        <Archive className="mr-2 h-4 w-4" />
                                                        <span className="text-sm">Archive</span>
                                                      </DropdownMenuItem> */}
                                                      <DropdownMenuItem
                                                        onClick={() => setHistoryToDelete(chat.session)}
                                                        className="text-red-500 focus:text-red-500"
                                                      >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span className="text-sm">Delete</span>
                                                      </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>
                                                </div>
                                              )}
                                            </div>
                                          </ContextMenuTrigger>
                                          <ContextMenuContent className="w-[200px] bg-backgroundSecondary rounded-xl">
                                            <ContextMenuSub>
                                              <ContextMenuSubTrigger>
                                                <BsFolder2Open className="mr-2 h-4 w-4" />
                                                <span className="text-sm">Move to project</span>
                                              </ContextMenuSubTrigger>
                                              <ContextMenuSubContent className="bg-backgroundSecondary rounded-xl">
                                                {projects.filter(p => p.uuid !== project.uuid).map(p => (
                                                  <ContextMenuItem
                                                    key={p.uuid}
                                                    onClick={() => handleMoveConversation(chat.session, p.uuid)}
                                                    disabled={movingConversationId === chat.session}
                                                  >
                                                    <BsFolder2Open className="mr-2 h-4 w-4" style={{ color: p.color || undefined }} />
                                                    <span>{p.name}</span>
                                                  </ContextMenuItem>
                                                ))}
                                                {projects.length <= 1 && (
                                                  <ContextMenuItem disabled>
                                                    <span className="text-muted-foreground">No other projects</span>
                                                  </ContextMenuItem>
                                                )}
                                              </ContextMenuSubContent>
                                            </ContextMenuSub>
                                            <ContextMenuItem onClick={() => handleMoveConversation(chat.session)} disabled={movingConversationId === chat.session}>
                                              <Undo2 className="mr-2 h-4 w-4" />
                                              <span className="text-sm">Remove from {project.name}</span>
                                            </ContextMenuItem>
                                            <ContextMenuSeparator className="bg-borderColorPrimary" />
                                            <ContextMenuItem onClick={() => handleRename(chat.session, chat.title)}>
                                              <Pencil className="mr-2 h-4 w-4" />
                                              <span className="text-sm">Rename</span>
                                            </ContextMenuItem>
                                            {/* <ContextMenuItem onClick={() => {}}>
                                                <Archive className="mr-2 h-4 w-4" />
                                                <span className="text-sm">Archive</span>
                                              </ContextMenuItem> */}
                                            <ContextMenuItem
                                              onClick={() => setHistoryToDelete(chat.session)}
                                              className="text-red-500 focus:text-red-500"
                                            >
                                              <Trash2 className="mr-2 h-4 w-4" />
                                              <span className="text-sm">Delete</span>
                                            </ContextMenuItem>
                                          </ContextMenuContent>
                                        </ContextMenu>
                                      </motion.div>
                                      </>
                                    ))}

                                    {project.histories.length > 3 && (
                                      <div
                                        className="group pl-7 py-1.5 text-xs flex items-center justify-between hover:bg-secondary/80 rounded-md cursor-pointer"
                                        onClick={() => {
                                          handleProjectClick(project);
                                          (isMobile && isOpen) ? toggle() : '';
                                        }}
                                      >
                                        <span className="text-primary" style={{ color: project.color || '#10b981' }}>See more</span>
                                        <ChevronRight className="h-3 w-3 mr-2" style={{ color: project.color || '#10b981' }} />
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="pl-7 py-1 text-xs text-muted-foreground">
                                    No conversations
                                  </div>
                                )}
                              </CollapsibleContent>

                            </Collapsible>
                          ))}

                          {/* More projects button */}
                          {hasMoreProjects && (
                            <div
                              className="flex items-center gap-2 px-2 py-2 mt-1 text-primary hover:bg-secondary/80 rounded-md cursor-pointer"
                              onClick={() => setProjectsListModalOpen(true)}
                            >
                              <div className="flex items-center gap-1.5">
                                <ChevronRight className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">
                                  See all subjects
                                  {/* ({projects.length}) */}
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        // <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                        //   <span className="text-xs">No projects available</span>
                        // </div>
                        ''
                      )}
                    </div>
                  </ScrollArea>
                </>
              )}

              {/* Divider between groups */}
              {(pathname.startsWith('/chat') || pathname.startsWith('/project')) && <div className="h-px bg-border/70 mx-4"></div>}

              {/* History Section */}
              <div className="flex-shrink-0 px-2 mt-2">
                <div className="flex justify-between items-center mx-2 text-xs font-medium text-muted-foreground mb-2">
                  OPEN CHAT HISTORY
                </div>
              </div>

              {/* Scrollable history list */}
              <ScrollArea
                className="flex-1"
                scrollHideDelay={0}
                ref={historyScrollRef}
              >
                <div className="px-4 space-y-0.5">
                  {isLoading && historyPage === 1 ? (
                    <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                      <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : currentHistory.length > 0 ? (
                    currentHistory.map((item) => (
                      <ContextMenu key={item.session}>
                        <ContextMenuTrigger>
                          <div
                            className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${editingId === item.session ? "bg-secondary"
                              : isHistoryItemActive(item.session)
                                ? "bg-backgroundSecondary font-bold"
                                : "hover:bg-secondary/80"
                              }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[90%]">
                              {/* Add colored dot for audio items */}
                              {item.type === 'audio' &&
                                typeof item.conversation_category === 'string' &&
                                ['tts', 'stt', 'ag'].includes(item.conversation_category) && (
                                  <span
                                    className="inline-block w-2 h-2 rounded-full mr-1 flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        AUDIO_CATEGORY_COLORS[item.conversation_category as 'tts' | 'stt' | 'ag'],
                                    }}
                                  />
                                )}
                              {editingId === item.session ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleRenameSubmit(item.session);
                                      }
                                    }}
                                    autoFocus
                                    className="h-6 text-xs"
                                  />
                                  {renamingHistoryId === item.session ? (
                                    <Loader className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                  ) : (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 p-0"
                                        onClick={() => handleRenameSubmit(item.session)}
                                        aria-label="Confirm Rename"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 p-0"
                                        onClick={() => { setEditingId(null); setEditingTitle(""); }}
                                        aria-label="Cancel Rename"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    setGenerationType('load');
                                    const path = currentType === 'audio'
                                      ? `/audio/${item.conversation_category?.toLowerCase() || 'res'}/${item.session}`
                                      : `/${currentType}/res/${item.session}`;
                                    router.replace(path);
                                    handleHistoryItemClick(item.session);
                                    (isMobile && isOpen) ? toggle() : '';
                                    // Set document title
                                    document.title = `${item.title} - Alle-AI`;
                                  }}

                                  className="relative flex-1 min-w-0 max-w-[95%]">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="relative text-xs text-left cursor-pointer">
                                          <div className="whitespace-nowrap overflow-hidden">
                                            <TextStream
                                              text={item.title.length > 30
                                                ? `${item.title.substring(0, 30)}`
                                                : item.title}
                                              isStreaming={streamingTitles[item.session] || false}
                                              streamDuration={800}
                                            />
                                            <div className={`absolute right-0 top-0 h-full w-10 bg-gradient-to-r from-transparent ${isHistoryItemActive(item.session) ? 'to-backgroundSecondary group-hover:to-backgroundSecondary/10' : 'to-sideBarBackground group-hover:to-secondary/80'}`} />
                                          </div>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="right"
                                        className="max-w-[200px] text-xs break-words"
                                      >
                                        {item.title}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}
                            </div>
                            <div className="absolute right-4">
                              {movingConversationId === item.session ? (
                                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                              ) : editingId !== item.session ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 p-0 border-none opacity-0 group-hover:opacity-100 outline-none bg-transparent hover:bg-transparent"
                                      aria-label="More Actions"
                                    >
                                      <EllipsisVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[200px] bg-backgroundSecondary rounded-xl">
                                    {projects.length > 0 && (
                                      <>
                                        <DropdownMenuSub>
                                          <DropdownMenuSubTrigger>
                                            <BsFolder2Open className="mr-2 h-4 w-4" />
                                            <span className="text-sm">Move to project</span>
                                          </DropdownMenuSubTrigger>
                                          <DropdownMenuSubContent className="bg-backgroundSecondary rounded-xl">
                                            {projects.map(p => (
                                              <DropdownMenuItem
                                                key={p.uuid}
                                                onClick={() => handleMoveConversation(item.session, p.uuid)}
                                                disabled={movingConversationId === item.session}
                                              >
                                                <BsFolder2Open className="mr-2 h-4 w-4" style={{ color: p.color || undefined }} />
                                                <span>{p.name}</span>
                                              </DropdownMenuItem>
                                            ))}
                                          </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSeparator className="bg-borderColorPrimary" />
                                      </>
                                    )}
                                    <DropdownMenuItem onClick={() => {
                                      setConversationId(item.session);
                                      setShareLinkModalOpen(true);
                                    }}>
                                      <Share className="mr-2 h-4 w-4" />
                                      <span>Share</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRename(item.session, item.title)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      <span className="text-sm">Rename</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setHistoryToDelete(item.session)}
                                      className="text-red-500 focus:text-red-500"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span className="text-sm">Delete</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : null}
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="bg-backgroundSecondary rounded-xl">
                          {projects.length > 0 && (
                            <>
                              <ContextMenuSub>
                                <ContextMenuSubTrigger>
                                  <BsFolder2Open className="mr-2 h-4 w-4" />
                                  <span className="text-sm">Move to project</span>
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="bg-backgroundSecondary rounded-xl">
                                  {projects.map(p => (
                                    <ContextMenuItem
                                      key={p.uuid}
                                      onClick={() => handleMoveConversation(item.session, p.uuid)}
                                      disabled={movingConversationId === item.session}
                                    >
                                      <BsFolder2Open className="mr-2 h-4 w-4" style={{ color: p.color || undefined }} />
                                      <span>{p.name}</span>
                                    </ContextMenuItem>
                                  ))}
                                </ContextMenuSubContent>
                              </ContextMenuSub>
                              <ContextMenuSeparator className="bg-borderColorPrimary" />
                            </>
                          )}
                          <ContextMenuItem onClick={() => {
                            setConversationId(item.session);
                            setShareLinkModalOpen(true);
                          }}>
                            <Share className="mr-2 h-4 w-4" />
                            <span>Share</span>
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleRename(item.session, item.title)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span className="text-sm">Rename</span>
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => setHistoryToDelete(item.session)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span className="text-sm">Delete</span>
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))
                  ) : (
                    <div className="flex flex-col items-start justify-start py-4 text-muted-foreground">
                      <span className="text-xs">No history available</span>
                    </div>
                  )}

                  {/* Add loading indicator at the bottom when loading more */}
                  {isLoadingMore && (
                    <div className="flex justify-center py-2">
                      <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="px-2 pb-3">
              <Button variant={'destructive'} className="w-full flex items-center justify-start">
                <LogOut className="mr-3 h-4 w-4" />
                End Session
              </Button>
            </div>
            {/* User section at bottom - Premium Design */}
            <div className="flex-shrink-0 px-2 pb-3 mt-auto">
              <div className="bg-backgroundSecondary rounded-lg overflow-hidden shadow-lg border border-borderColorPrimary">
                {/* Main user info row */}
                <div className="flex items-center justify-between p-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <Image
                            src={user?.photo_url || "/user.jpg"}
                            alt="User"
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full ring-1 ring-border/20 group-hover:ring-primary/40 transition-all"
                          />
                          {/* <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-backgroundSecondary"></div> */}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm text-foreground truncate">{user?.first_name}</span>
                          <span
                            className="text-xs text-muted-foreground font-bold rounded-md"
                          >
                            {/* {plan ? plan.split('_')[0].charAt(0).toUpperCase() + plan.split('_')[0].slice(1) : <Loader className="h-3 w-3 animate-spin" />} */}
                            ALLE-AI EDU
                          </span>
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 bg-backgroundSecondary">
                      {/* User Header */}
                      <div className="px-3 py-2 border-b border-borderColorPrimary">
                        <div className="text-sm">
                          <div className="font-medium text-muted-foreground truncate" title={user?.email}>{user?.email}</div>
                        </div>
                      </div>

                      {/* Settings */}
                      <DropdownMenuItem onClick={() => setSettingsModalOpen(true)} className="cursor-pointer">
                        <Settings className="mr-3 h-4 w-4" />
                        <span className="text-sm">Settings</span>
                      </DropdownMenuItem>

                      {/* Separator */}
                      <DropdownMenuSeparator className="bg-borderColorPrimary" />

                      {/* Help with submenu */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="cursor-pointer">
                          <BadgeQuestionMark className="mr-3 h-4 w-4" />
                          <span className="text-sm">Help</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-backgroundSecondary border border-borderColorPrimary">
                          <DropdownMenuItem onClick={() => router.push('/docs/getting-started')} className="cursor-pointer">
                            <Book className="mr-3 h-4 w-4" />
                            <span className="text-sm">Documentation</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={'https://app.alle-ai.com/faq'} target="_blank">
                              <BookOpen className="mr-3 h-4 w-4" />
                              <span className="text-sm">FAQ</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push('/about/alle-ai')} className="cursor-pointer">
                            <BadgeInfo className="mr-3 h-4 w-4" />
                            <span className="text-sm">About</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      {/* Log out */}
                      <DropdownMenuItem
                        onClick={() => {
                          setIsLogoutModalOpen(true);
                        }}
                        className="cursor-pointer text-red-500 focus:text-red-500"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span className="text-sm">End Session</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full">
            <div className="space-y-2 px-2">
              <div className="flex flex-col space-y-2 mb-8">
                <Button
                  onClick={handleNewChat}
                  variant="outline"
                  className={`flex-1 ${getSectionStyles(currentType).bgColor} ${getSectionStyles(currentType).hoverBg} dark:${getSectionStyles(currentType).darkBgColor}`}
                >
                  <CurrentIcon className={`h-4 w-4 ${getSectionStyles(currentType).iconColor}`} />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExamPrep}
                  className={cn(
                    "flex-1",
                    isExamPrepPage
                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20"
                      : "border-borderColorPrimary bg-background text-foreground hover:bg-secondary/70"
                  )}
                >
                  <GraduationCap className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 ${getSectionStyles(currentType).bgColor} ${getSectionStyles(currentType).iconColor} dark:${getSectionStyles(currentType).darkBgColor}`}
                  onClick={() => setModelSelectionModalOpen(true)}
                  id="tooltip-select-selector"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>

              {/* Divider for collapsed view */}
              <div className="h-px bg-border/70"></div>

              {/* <Button
                variant="ghost"
                size="icon"
                className="w-full"
                onClick={() => setProjectModalOpen(true)}
              >
                <BsFolder2Open className="h-4 w-4 text-muted-foreground" />
              </Button> */}
            </div>

            <div className="mt-auto px-2 pb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <Image
                        src={user?.photo_url || "/user.jpg"}
                        alt="User"
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full ring-1 ring-border/20 group-hover:ring-primary/40 transition-all"
                      />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-56 bg-backgroundSecondary border border-borderColorPrimary">
                  {/* User Header */}
                  <div className="px-3 py-2 border-b border-borderColorPrimary">
                    <div className="text-xs">
                      <div className="font-medium text-muted-foreground">{user?.email}</div>
                    </div>
                  </div>

                  {/* Upgrade Plan */}
                  <DropdownMenuItem
                    onClick={() => (isPaidPlan ? router.push('/manage-subscription') : setPlansModalOpen(true))}
                    className="cursor-pointer"
                  >
                    <Gem className="mr-3 h-4 w-4" />
                    <span className="text-sm">{isPaidPlan ? 'Manage Subscription' : 'Upgrade Plan'}</span>
                  </DropdownMenuItem>

                  {/* Personalization */}
                  {/* <DropdownMenuItem onClick={() => setUserProfileModalOpen(true)} className="cursor-pointer">
                    <Clock className="mr-3 h-4 w-4" />
                    <span className="text-sm">Personalization</span>
                  </DropdownMenuItem> */}

                  {/* Settings */}
                  <DropdownMenuItem onClick={() => setSettingsModalOpen(true)} className="cursor-pointer">
                    <Settings className="mr-3 h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </DropdownMenuItem>

                  {/* Separator */}
                  <DropdownMenuSeparator className="bg-border/50" />

                  {/* Help with submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                      <BadgeQuestionMark className="mr-3 h-4 w-4" />
                      <span className="text-sm">Help</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-backgroundSecondary border border-borderColorPrimary">
                      <DropdownMenuItem onClick={() => router.push('/docs/getting-started')} className="cursor-pointer">
                        <Book className="mr-3 h-4 w-4" />
                        <span className="text-sm">API Docs</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/faq')} className="cursor-pointer">
                        <BookOpen className="mr-3 h-4 w-4" />
                        <span className="text-sm">FAQ</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShortcutsModalOpen(true)} className="cursor-pointer">
                        <Keyboard className="mr-3 h-4 w-4" />
                        <span className="text-sm">Keyboard shortcuts</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/about/alle-ai')} className="cursor-pointer">
                        <BadgeInfo className="mr-3 h-4 w-4" />
                        <span className="text-sm">About</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  {/* Log out */}
                  <DropdownMenuItem
                    onClick={() => {
                      setIsLogoutModalOpen(true);
                    }}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="text-sm">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </aside >
      <ModelSelectionModal
        isOpen={modelSelectionModalOpen}
        onClose={() => setModelSelectionModalOpen(false)}
      />
      <PlansModal
        isOpen={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
      />
      <SearchHistoryModal
        isOpen={historySearchModalOpen}
        onClose={() => setHistorySearchModalOpen(false)}
        currentType={currentType}
      />
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      <UserProfileModal
        isOpen={userProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
      />

      <ProjectsListModal
        isOpen={projectsListModalOpen}
        onClose={() => setProjectsListModalOpen(false)}
      />

      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      <ShareLinkModal
        isOpen={shareLinkModalOpen}
        onClose={() => setShareLinkModalOpen(false)}
      />


      {/* Add confirmation dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingProjectId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500 disabled:opacity-70"
              disabled={!!deletingProjectId}
            >
              {deletingProjectId ? (
                <>
                  Deleting
                  <Loader className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert dialog for deleting history */}
      <AlertDialog open={!!historyToDelete} onOpenChange={() => setHistoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete History Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => historyToDelete && handleDeleteHistory(historyToDelete)}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
