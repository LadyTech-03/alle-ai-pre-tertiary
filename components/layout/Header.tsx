'use client';

import { forwardRef, useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Text } from "@radix-ui/themes";
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { 
  PanelLeftClose,
  Bell,
  ALargeSmall,
  MessageCircleWarning,
  HelpCircle,
  LogOut,
  Share,
  Crown,
  Gem,
  Loader,
  PanelRightClose,
  ExternalLink,
  PlusCircle,
  Repeat,
} from 'lucide-react';
import { MdOutlineIosShare } from "react-icons/md";
import { TbMessageReport } from "react-icons/tb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { navItems, userMenuItems, notifications as notificationData} from '@/lib/constants';
import { NotificationItem } from "@/lib/types";
import { useSidebarStore, useSelectedModelsStore, useAuthStore } from "@/stores";
import { useModelsStore } from "@/stores/models";
import { useAudioTabStore } from '@/stores/audioTabStore';
import { ThemeToggle } from "../ui/theme-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuShortcut } from "../ui/dropdown-menu";
import { TextSizeModal, FeedbackModal, ReferModal, LogoutModal, OrganizationModal } from "../ui/modals";
import { ModelSelectionModal } from "@/components/ui/modals/model-selection-modal";
import { SettingsModal } from "../ui/modals/settings-modal";
import { UserProfileModal } from "../ui/modals/user-profile-modal";
import { AlbumModal } from "../ui/modals/favorite-modal";
import { ShareLinkModal } from "../ui/modals/share-modal";

import { useMediaQuery } from "@/hooks/use-media-query";
import { usePathname } from 'next/navigation';
import { toast } from "sonner"


import { useAuth } from '@/components/providers/AuthProvider';
import { NotificationsPanel } from "@/components/NotificationWindow";
import { NotificationModal } from "@/components/ui/modals";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { chatApi } from "@/lib/api/chat";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStore, useHistoryStore } from "@/stores";
import ProjectBreadcrumb from "@/components/features/projects/ProjectBreadCrumb"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoGenerationTracker } from '@/components/features/video/VideoGenerationTracker';

// Add color mapping for audio categories
const AUDIO_CATEGORY_COLORS = {
  tts: '#3B82F6', // blue
  stt: '#10B981', // green
  ag: '#A21CAF',  // purple
};

export function Header() {
  // const { isSubscribed } = useAuth();

  const { isOpen, toggle } = useSidebarStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const pathname = usePathname();
  const router = useRouter();

  const { user } = useAuthStore();
  const { activeTab, setActiveTab } = useAudioTabStore();

  const [mounted, setMounted] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>(notificationData);
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>(notificationData);
  const [textSizeModalOpen, setTextSizeModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [referModalOpen, setReferModalOpen] = useState(false);
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [shareLinkModalOpen, setShareLinkModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [organizationModalOpen, setOrganizationModalOpen] = useState(false);
  const [loadingModels, setLoadingModels] = useState<string[]>([]);
  const conversationId = pathname.includes('/chat/res/') ? pathname.split('/').pop() : null;

  // Add this state to track if the models dropdown is open
  const [modelsDropdownOpen, setModelsDropdownOpen] = useState(false);
  const [modelSelectionModalOpen, setModelSelectionModalOpen] = useState(false);


  const getCurrentType = (): 'chat' | 'image' | 'audio' | 'video' => {
    if (pathname.startsWith('/image')) return 'image';
    if (pathname.startsWith('/audio')) return 'audio';
    if (pathname.startsWith('/video')) return 'video';
    return 'chat';
  };

  const currentType = getCurrentType();

  const getSectionStyles = (type: 'chat' | 'image' | 'audio' | 'video') => {
    switch (type) {
      case 'image':
        return {
          bgColor: 'bg-purple-500',
        };
      case 'audio':
        return {
          bgColor: 'bg-blue-500',
        };
      case 'video':
        return {
          bgColor: 'bg-yellow-500',
        };
      default:
        return {
          bgColor: 'bg-green-500',
        };
    }
  };

  const { getSelectedModelNames, toggleModelActive, inactiveModels, lastUpdate, isLoadingLatest, initialized, selectedModels  } = useSelectedModelsStore(
    (state) => ({
      getSelectedModelNames: state.getSelectedModelNames,
      toggleModelActive: state.toggleModelActive,
      inactiveModels: state.inactiveModels,
      lastUpdate: state.lastUpdate,
      isLoadingLatest: state.isLoadingLatest,
    initialized: state.initialized,
    selectedModels: state.selectedModels,
    })
  );

  const { currentPage } = useSidebarStore();

  // Get current selected model names based on the current page
  const { chatModels } = useModelsStore();
  const selectedModelNames = useMemo(() => 
    getSelectedModelNames(currentPage as 'chat' | 'image' | 'audio' | 'video'),
    [currentPage, getSelectedModelNames, inactiveModels, lastUpdate, chatModels]
  );

  const currentPageModels = selectedModels[currentPage as 'chat' | 'image' | 'audio' | 'video'];

  // If UIDs exist but models haven't resolved yet, keep showing a loading indicator, not the "Select Models" button
  const hasSelectedUids = (currentPageModels).length > 0;
  const showModelsLoading = isLoadingLatest || (hasSelectedUids && selectedModelNames.length === 0);

  const isChangelogPage = pathname.includes('changelog');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNotificationClick = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setNotificationModalOpen(true);
    markAsRead(notification.id);
  };

  const renderNavItem = (item: any, index: number) => {

    //navItems that triggers a function
    if (item.interactionType === "function") {
      const functionMap = {
        [HelpCircle.name]: handleTour,
      };

      const handleClick = () => {
        const handler = functionMap[item.type.name];
        if (handler) {
          handler();
        }
      };

      return (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClick}
                className="hidden md:flex w-8 h-8 p-1 rounded-full text-muted-foreground border border-borderColorPrimary select-none"
              >
                <item.type className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tour</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // navItems that triggers a modal
    if (item.interactionType === "modal") {
      const openModal = () => {
        if (item.type === ALargeSmall) {
          setTextSizeModalOpen(true);
        } else if (item.type === TbMessageReport) {
          setFeedbackModalOpen(true);
        }
      };

      return (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={openModal}
                className={`${item.type !== TbMessageReport ? '' : ''} hidden md:flex w-8 h-8 p-1 rounded-full text-muted-foreground border border-borderColorPrimary select-none`}
              >
                <item.type className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.type === ALargeSmall ? 'Text Size' : 'Feedback'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // navItems that triggers a dropdown
    return (
      <TooltipProvider key={index}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden sm:flex relative w-8 h-8 p-1 rounded-full text-muted-foreground border border-borderColorPrimary select-none"
                >
                  <item.type className="h-5 w-5" />
                  {recentNotifications.some(n => !n.read) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={`${unreadNotifications.length === 0 ? 'w-fit' : 'w-64 md:w-80'} mr-20 rounded-xl p-1 md:p-2 bg-backgroundSecondary`}>
                {unreadNotifications.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center px-3 border-b border-borderColorPrimary">
                      <h4 className="font-small text-sm">Notifications</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-muted-foreground hover:text-primary"
                        onClick={() => {
                          // Mark all as read instead of clearing
                          setRecentNotifications(recentNotifications.map(n => ({ ...n, read: true })));
                          setAllNotifications(allNotifications.map(n => ({ ...n, read: true })));
                        }}
                      >
                        Mark all read
                      </Button>
                    </div>
                    {unreadNotifications.map((notification) => (
                      <DropdownMenuItem 
                        key={notification.id}
                        className="flex flex-col items-start p-2 cursor-pointer hover:bg-hoverColorPrimary gap-1 bg-primary/5"
                        onClick={() => {
                          markAsRead(notification.id);
                          handleNotificationClick(notification);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-xs">{notification.title}</div>
                          <span className="w-2 h-2 bg-primary rounded-full" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {notification.message.length > 50 ? notification.message.slice(0, 50) + '...' : notification.message}
                        </div>
                        <div className="text-[0.6rem] text-muted-foreground">
                          {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                            Math.round((notification.timestamp.getTime() - Date.now()) / (1000 * 60)),
                            'minute'
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-xs text-muted-foreground hover:text-primary"
                      onClick={() => setNotificationsPanelOpen(true)}
                    >
                      See all notifications
                    </Button>
                  </>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">No unread notifications</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-xs text-muted-foreground hover:text-primary"
                      onClick={() => setNotificationsPanelOpen(true)}
                    >
                      See all notifications
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            Notifications {unreadNotifications.length > 0 ? `(${unreadNotifications.length} unread)` : ''}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const handleUserMenuItemClick = (item: any) => {
    switch (item.interactionType) {
      case 'modal':
        if (item.label === 'Organization') {
          setOrganizationModalOpen(true);
        } else if (item.label === 'Settings') {
          setSettingsModalOpen(true);
        } else if (item.label === 'Refer') {
          // setReferModalOpen(true);
          toast.info('This feature will be available soon');

        } else if (item.label === 'Favorites') {
          setAlbumModalOpen(true);
        }
        break;
      case 'link':
        if (item.openInNewTab) {
          window.open(item.href, '_blank');
        } else if (item.href) {
          router.push(item.href);
        }
        break;
      case 'function':
        const functionMap = {
          [LogOut.name]: handleLogOut,
        };
  
        const handleMenuItemClick = () => {
          const handler = functionMap[item.label.name];
          if (handler) {
            handler();
          }
        };
        handleMenuItemClick();
        break;
    }
  };

  // Mark as read
  const markAsRead = (notificationId: string) => {
    setRecentNotifications(recentNotifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
    
    setAllNotifications(allNotifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
  };
  

  const handleTour = () => {
    toast.info('This feature will be available soon');
  };
  const handleLogOut = () => {
    setIsLogoutModalOpen(true);
  };

  // Get only unread notifications for the header dropdown
  const unreadNotifications = useMemo(() => 
    recentNotifications.filter(notification => !notification.read),
    [recentNotifications]
  );

  const handleModelToggle = async (model: { name: string, uid: string, isActive: boolean }) => {
    // Only validate when trying to deactivate a model
    if (model.isActive) {
      const activeModelsCount = selectedModelNames.filter(m => m.isActive).length;
      // If there are only 1 or fewer active models and trying to disable one
      if (activeModelsCount <= 1) {
        toast.info('You must have at least 1 active model');
        return;
      }
    }

    if (!conversationId) {
      toggleModelActive(model.uid);
      return;
    }

    setLoadingModels(prev => [...prev, model.uid]);
    
    try {
      const newActiveState = !model.isActive;
      
      const response = await chatApi.toggleModelInstance(
        conversationId, 
        model.uid,
        newActiveState
      );

      // If the server returns status: true, then update the UI
      if (response.status) {
        toggleModelActive(model.uid);
      } else {
        toast.error('Failed to toggle model');
      }
    } catch (error) {
      toast.error('Failed to toggle model');
    } finally {
      setLoadingModels(prev => prev.filter(id => id !== model.uid));
    }
  };

  const specialRoutes = ['/organization', '/plans', '/manage-subscription'];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        {!pathname.includes('/plans') && !pathname.includes('/manage-subscription') ? (
        <div className={`absolute left-0 h-14 flex items-center justify-center transition-all duration-6300 z-50
          ${isOpen ? 'w-60' : 'w-16'} 
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          px-4  ${pathname.includes('/organization') ? 'bg-background/95' : 'bg-sideBarBackground border-r'}`}
        >
          {isOpen ? (
            mounted && (
              <div className="h-8 w-32 flex items-center justify-center overflow-hidden">
                <Image 
                  src={resolvedTheme === 'dark' ? "/svgs/logo-desktop-full.webp" : "/svgs/logo-desktop-dark-full.webp"}
                  alt="Logo"
                  width={100}
                  height={30}
                  className="rounded object-contain"
                  priority
                />
              </div>
            )
          ) : (
            mounted && (
              <div className="h-8 w-8 flex items-center justify-center overflow-hidden">
                <Image 
                  src={resolvedTheme === 'dark' ? "/svgs/logo-desktop-mini.webp" : "/svgs/logo-desktop-mini-dark.webp"}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="rounded object-contain"
                  priority
                />
              </div>
            )
          )}
          {!pathname.includes('/organization') && (
            <Button 
            variant="outline" 
            size="icon" 
            onClick={toggle}
            className={`h-8 w-8 absolute p-0 -right-3 transition-all duration-300 bg-transparent border-none text-muted-foreground ${isMobile ? ( isOpen ? '-right-3' : 'right-[-2.5rem]') : "-right-8" }`}
            aria-label="Toggle Sidebar"
          >
            {isOpen ? (
              <PanelLeftClose className="h-6 w-6" />
            ) : (
              <PanelRightClose className="h-6 w-6" />
            )}
          </Button>
          )}
          
        </div>
        ) : (
          ''
        )}

        <div className={`flex h-14 items-center transition-all duration-300 
        ${!specialRoutes.includes(pathname) ? (isMobile ? 'ml-4' : (isOpen ? 'ml-60' : 'ml-16')) : 'justify-around'}`}
        >
          {!isChangelogPage && mounted && !specialRoutes.some(route => pathname.includes(route)) ? (
            showModelsLoading ? (
              <div className="flex items-center ml-10 rounded-md py-1 w-fit">
                <div className="flex items-center gap-1">
                  <span className="text-sm">Selected Models</span> <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            ) :
            (selectedModelNames.length > 0) ? (
              <>
                <DropdownMenu open={modelsDropdownOpen} onOpenChange={setModelsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <div 
                      className={`bg-backgroundSecondary w-fit overflow-hidden whitespace-nowrap flex items-center ml-10 ${!isLoadingLatest ? 'border border-muted-foreground' : 'border-none'} rounded-md py-1 cursor-pointer hover:bg-backgroundSecondary/50 transition-colors`}
                    >
                      {/* For small screens, show only the first model + count */}
                      <div className="sm:hidden flex items-center">
                        {selectedModelNames.length > 0 && (
                          <span 
                            className={`flex items-center gap-1 text-xs px-1 ${
                              !selectedModelNames[0].isActive ? 'text-muted-foreground opacity-50' : 'dark:text-gray-400 text-gray-800'
                            }`}
                          >
                            {selectedModelNames[0].name}
                            {(selectedModelNames[0].type === 'standard' || selectedModelNames[0].type === 'plus') && (
                              <div className={`inline-flex items-center ml-1
                                ${selectedModelNames[0].type === 'standard' 
                                  ? 'bg-gradient-to-r from-gray-300/90 to-gray-400/90' 
                                  : selectedModelNames[0].type === 'plus' ? 'bg-gradient-to-r from-yellow-500/90 to-yellow-600/90': ''} 
                                rounded-sm p-0.5`}>
                                <Image
                                  src={'/svgs/logo-desktop-mini.webp'}
                                  height={10}
                                  width={10}
                                  alt={`${selectedModelNames[0].type}-alle-ai`}
                                  priority
                                />
                              </div>
                            )}
                          </span>
                        )}
                        {selectedModelNames.length > 1 && (
                          <span className="text-xs font-medium bg-primary/20 text-primary rounded-full px-2 py-0.5 ml-1">
                            +{selectedModelNames.length - 1}
                          </span>
                        )}
                      </div>

                      {/* For larger screens, show all models */}
                      <div className="hidden sm:flex">
                        {selectedModelNames.map((model, index) => (
                          <span 
                            key={`${model}-${index}`} 
                            className={`flex items-center gap-1 text-xs border-r px-1 border-muted-foreground last:border-none ${
                              !model.isActive ? 'text-muted-foreground opacity-50' : 'dark:text-gray-400 text-gray-800'
                            }`}
                          >
                            {model.name}
                            {(model.type === 'standard' || model.type === 'plus') && (
                              <div className={`inline-flex items-center ml-1
                                ${model.type === 'standard' 
                                  ? 'bg-gradient-to-r from-gray-300/90 to-gray-400/90' 
                                  : model.type === 'plus' ? 'bg-gradient-to-r from-yellow-500/90 to-yellow-600/90': ''} 
                                rounded-sm p-0.5`}>
                                <Image
                                  src={'/svgs/logo-desktop-mini.webp'}
                                  height={10}
                                  width={10}
                                  alt={`${model.type}-alle-ai`}
                                  priority
                                />
                              </div>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" sideOffset={5} className="w-64 p-0">
                    <div className="w-full bg-backgroundSecondary rounded-lg">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-borderColorPrimary">
                        <Text className="text-xs font-medium">Selected Models</Text>
                        <Text className="text-xs text-muted-foreground">
                          {selectedModelNames.filter(model => model.isActive).length} active
                        </Text>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto py-2">
                        {selectedModelNames.map((model, index) => {
                          const isLoading = loadingModels.includes(model.uid);
                          return (
                            <div 
                              key={index}
                              className={`flex items-center justify-between px-4 py-2 hover:bg-hoverColorPrimary cursor-pointer ${
                                !model.isActive ? 'opacity-50' : ''
                              }`}
                            >
                              <div className={`flex items-center gap-2 rounded-lg p-0.5`}>
                                <div className={`flex flex-col`}>
                                  <Text className={`text-xs ${!model.isActive ? 'text-foreground' : ''} `}>
                                    {model.name}
                                    {(model.type === 'standard' || model.type === 'plus') && (
                                      <div className={`inline-flex items-center ml-1
                                        ${model.type === 'standard' 
                                          ? 'bg-gradient-to-r from-gray-300/90 to-gray-400/90' 
                                          : model.type === 'plus' ? 'bg-gradient-to-r from-yellow-500/90 to-yellow-600/90': ''} 
                                        rounded-sm p-0.5`}>
                                        <Image
                                          src={'/svgs/logo-desktop-mini.webp'}
                                          height={10}
                                          width={10}
                                          alt={`${model.type}-alle-ai`}
                                          priority
                                        />
                                      </div>
                                    )}
                                  </Text>
                                </div>
                              </div>
                              <div className="relative ml-2">
                                {isLoading ? (
                                  <div className="w-8 h-5 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                                  </div>
                                ) : (
                                  <Switch
                                    variant="sm"
                                    checked={model.isActive}
                                    onCheckedChange={() => handleModelToggle(model)}
                                    disabled={loadingModels.includes(model.uid)}
                                    className={`${model.isActive ? getSectionStyles(currentType).bgColor : ''}`}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="py-2 border-t border-borderColorPrimary">
                        <div 
                        className="w-full flex gap-2 items-center justify-center hover:underline cursor-pointer" 
                        onClick={() => setModelSelectionModalOpen(true)}>
                          <Text className="text-xs">Change Models</Text>
                          <Repeat className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // <div className="flex items-center ml-8 border border-red-500 rounded-md py-1">
                <Button onClick={() => setModelSelectionModalOpen(true)} variant="destructive" className="h-8 ml-8 p-1 gap-1">
                  <Text className="text-xs">Select Models</Text>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              // {/* </div> */}
            )
          ) : (
            specialRoutes.includes(pathname) && mounted && (
              <Image
              src={resolvedTheme === 'dark' ? "/svgs/logo-desktop-full.webp" : "/svgs/logo-desktop-dark-full.webp"}
                alt="Logo"
                width={100}
                height={100}
                className="rounded md:mx-auto"
                priority
              />
            )
          )}
          
          {/* Audio tabs - Only show on audio page */}
          {pathname.startsWith('/audio') && (
            <div className="ml-2">
              <Tabs value={activeTab} onValueChange={(value) => {
                setActiveTab(value as 'tts' | 'stt' | 'ag');
                // If we're on a result page and switching tabs, go back to main audio page
                if (pathname.includes('/audio/tts/') || pathname.includes('/audio/stt/') || pathname.includes('/audio/ag/')) {
                  router.push('/audio');
                }
              }} className="w-auto">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="tts" className="text-xs data-[state=active]:bg-tabBackgroundColor">
                    <span className="flex items-center" style={{ color: AUDIO_CATEGORY_COLORS.tts }}>
                      <span className={`hidden sm:inline-block`}>Text-to-Speech</span>
                      <span className="inline-block sm:hidden">TTS</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="stt" className="text-xs data-[state=active]:bg-tabBackgroundColor">
                    <span className="flex items-center" style={{ color: AUDIO_CATEGORY_COLORS.stt }}>
                      <span className="hidden sm:inline-block">Speech-to-Text</span>
                      <span className="inline-block sm:hidden">STT</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="ag" className="text-xs data-[state=active]:bg-tabBackgroundColor">
                    <span className="flex items-center" style={{ color: AUDIO_CATEGORY_COLORS.ag }}>
                      <span className="hidden sm:inline-block">Audio Generation</span>
                      <span className="inline-block sm:hidden">AG</span>
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
          {/* Project breadcrumb navigation */}
          <ProjectBreadcrumb />

          <div className={`flex items-center gap-2 ${!specialRoutes.includes(pathname) ? 'ml-auto mr-4 sm:mr-8' : 'md:mx-auto'}`}>
            {(pathname.includes("/chat/") || pathname.includes("/image/")) && (
              <Button
              variant={'outline'}
              className="h-8 rounded-full gap-1 p-2 text-muted-foreground"
              onClick={() => setShareLinkModalOpen(true)}
              >
                <MdOutlineIosShare  className="w-4 h-4"/>
                Share
              </Button>
            )}
            
            {/* <VideoGenerationTracker /> */}
            {/* <ThemeToggle /> */}
            {navItems.filter(item => 
              !pathname.includes('/plans') || 
              !pathname.includes('/manage-subscription') ||
              !(item.type === HelpCircle || item.type === ALargeSmall)
            ).map((item, index) => renderNavItem(item, index))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Image
                  src={user?.photo_url || "/user.jpg"}
                alt="User Image"
                width={35}
                height={35}
                className="h-8 w-8 rounded-full mx-auto cursor-pointer select-none"
              />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-8 rounded-xl max-w-full p-2 bg-background dark:bg-backgroundSecondary shadow-lg">
              {pathname.includes('/plans') || pathname.includes('/manage-subscription') ? (
                <DropdownMenuItem
                className="flex items-start p-2 gap-4 cursor-pointer">
                <Image
                  src={user?.photo_url || "/user.jpg"}
                  alt="User Image"
                  width={35}
                  height={35}
                  className="rounded-full mx-auto cursor-pointer"
                />
                <div className="flex flex-col mr-4">
                  <Text className="text-sm">{user?.first_name} {user?.last_name}</Text>
                  <Text className="text-xs">{user?.email}</Text>
                </div>
              </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  // onClick={() => setUserProfileModalOpen(true)}
                  onClick={() => setSettingsModalOpen(true)}
                  className="flex items-start p-2 gap-4 cursor-pointer">
                  <Image
                    src={user?.photo_url || "/user.jpg"}
                    alt="User Image"
                    width={35}
                    height={35}
                    className="h-10 w-10 rounded-full mx-auto cursor-pointer"
                  />
                  <div className="flex flex-col mr-4">
                    <Text className="text-sm">{user?.first_name} {user?.last_name}</Text>
                    <Text className="text-xs">{user?.email}</Text>
                  </div>
                </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-2 bg-foreground/20"/>
                {userMenuItems.filter(item => 
                  !pathname.includes('/plans') || 
                  !pathname.includes('/manage-subscription') ||
                  !(item.label === 'Profile' || item.label === 'Organization' || item.label === 'Developer' || item.label === 'Refer' || item.label === 'Favorites' || item.label === 'Settings')
                ).map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => handleUserMenuItemClick(item)}
                    className="flex items-center gap-4 cursor-pointer hover:bg-hoverColorPrimary w-full"
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {/* {item.interactionType === 'link' && item.openInNewTab && (
                      <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
                    )} */}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <ModelSelectionModal
        isOpen={modelSelectionModalOpen}
        onClose={() => setModelSelectionModalOpen(false)}
      />
      <TextSizeModal 
        isOpen={textSizeModalOpen} 
        onClose={() => setTextSizeModalOpen(false)} 
      />
      <FeedbackModal 
        isOpen={feedbackModalOpen} 
        onClose={() => setFeedbackModalOpen(false)} 
      />
      <SettingsModal 
        isOpen={settingsModalOpen} 
        onClose={() => setSettingsModalOpen(false)} 
      />
      <UserProfileModal 
        isOpen={userProfileModalOpen} 
        onClose={() => setUserProfileModalOpen(false)} 
      />
      <OrganizationModal 
        isOpen={organizationModalOpen} 
        onClose={() => setOrganizationModalOpen(false)} 
      />
      <ReferModal 
        isOpen={referModalOpen} 
        onClose={() => setReferModalOpen(false)} 
      />
      <AlbumModal 
        isOpen={albumModalOpen} 
        onClose={() => setAlbumModalOpen(false)} 
      />
      <ShareLinkModal 
        isOpen={shareLinkModalOpen} 
        onClose={() => setShareLinkModalOpen(false)} 
      />
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
      />
      <NotificationsPanel
        open={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
        notifications={allNotifications}
        onNotificationClick={handleNotificationClick}
      />
      
      <NotificationModal
        notification={selectedNotification}
        open={notificationModalOpen}
        onClose={() => {
          setNotificationModalOpen(false);
          setSelectedNotification(null);
        }}
      />
    </>
  );
}