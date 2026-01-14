"use client";

//@ts-ignore
import '@/app/globals.css';
import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { HelpButton } from '@/components/HelpButton';
import { MaintenancePage } from '@/components/features/maintenance/MaintenancePage';
import * as Frigade from '@frigade/react';
import { FooterText } from '@/components/FooterText';
import { useAuthStore, usePendingChatStateStore, useSidebarStore, useTutorialStore } from "@/stores";
import { usePathname } from 'next/navigation';
import { usePageTitle } from '@/hooks/use-page-title';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
// import { TutorialModal, sampleTutorialSlides } from '@/components/ui/TutorialModal';
import HearAboutUsModal, { HearAboutUsPayload } from '@/components/ui/modals/hear-about-us-modal';
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/features/auth/LoadingScreen";
import { toast } from "sonner";
import { onboardingApi } from '@/lib/api/onboarding';
import UpgradePill from '@/components/ui/UpgradePill';
import { PlansModal } from '@/components/ui/modals';
import { SettingsModal } from '@/components/ui/modals/settings-modal';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

import Snowfall from "react-snowfall";
import { getDefaultSnowfallColor } from '@/lib/utils/snowfallUtils';


const isMaintenance = false;

export function MainLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, setOpen } = useSidebarStore();
  // const { isCompleted } = useTutorialStore();
  const pathname = usePathname();
  usePageTitle(); 
  const isProjects = (pathname.startsWith("/project/") && pathname.split("/").length === 3)
  const router = useRouter();
  const { refreshPlan, isAuthenticated, token, user, plan } = useAuthStore();
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [showHearModal, setShowHearModal] = useState(false);
  const [showUpgradePill, setShowUpgradePill] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Snowfall state management
  const [snowfallEnabled, setSnowfallEnabled] = useState(false);
  const [snowfallColor, setSnowfallColor] = useState(getDefaultSnowfallColor());
  const [snowfallLoading, setSnowfallLoading] = useState(true);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const { pending, clearPending } = usePendingChatStateStore();
  

  // Treat share routes as public: skip auth checks here
  const isShareRoute = (
    pathname.startsWith('/chat/shares/') ||
    pathname.startsWith('/image/shares/') ||
    pathname.startsWith('/audio/shares/') ||
    pathname.startsWith('/video/shares/') ||
    pathname.startsWith('/share/')
  );

  // Ensure sidebar is closed when user is unauthenticated (especially for share routes)
  useEffect(() => {
    if (!isAuthenticated) {
      setOpen(false);
    }
  }, [isAuthenticated, setOpen]);

  useEffect(()=>{
    // console.log('Auth state:', { isAuthenticated, hasToken: !!token, isShareRoute });

    // Skip verification entirely for public share routes
    if (isShareRoute && !isAuthenticated && !token) {
      return;
    }

    const verifyAuth = async () =>{
      try{
        const result = await refreshPlan();
        const newPlan = result?.plan ?? null;
        const user_survey = result?.user?.survey_remind ?? false;

        if (!newPlan) {
          router.replace('/auth');
          return;
        }

        // Show onboarding modal if backend indicates so
        setShowHearModal(user_survey);

      } catch(error) {
        // toast.error('Something went wrong')
      }
    }

    verifyAuth();
    
  },[plan, refreshPlan, router, pathname, isShareRoute, isAuthenticated, token])

  // Fetch snowfall preferences and show notification
  useEffect(() => {

    if (pending) {
        clearPending();
      }

    const fetchSnowfallPreferences = async () => {
      try {
        const response = await fetch('/api/snowfall/preferences');
        const data = await response.json();
        
        setSnowfallEnabled(data.enabled ?? true); // Default to enabled
        setSnowfallColor(data.color || getDefaultSnowfallColor());
        setSnowfallLoading(false);
        
        // Check if we should show the notification
        const reminderCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('snowfall_reminder='));
        
        
        const hasSeenNotification = reminderCookie !== undefined;
        
        // Show notification after 2 seconds if user hasn't seen it
        if (!hasSeenNotification && !isShareRoute) {
          setTimeout(() => {
            toast.info("You can toggle the snowfall animation in settings ❄️", {
              duration: 10000,
              action: {
                label: "Open Settings",
                onClick: () => setSettingsModalOpen(true),
              },
              description: (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    toast.dismiss();
                    try {
                      await fetch('/api/snowfall/reminder', { method: 'POST' });
                    } catch (error) {
                      console.error('Failed to set reminder:', error);
                    }
                  }}
                  className="text-xs underline hover:no-underline text-foreground"
                >
                  Remind me later
                </button>
              ),
            });
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to fetch snowfall preferences:', error);
        setSnowfallLoading(false);
      }
    };

    fetchSnowfallPreferences();
  }, []);

  // Listen for snowfall preference changes from settings modal
  useEffect(() => {
    const handlePreferencesChanged = (event: CustomEvent) => {
      const { enabled, color } = event.detail;
      setSnowfallEnabled(enabled);
      setSnowfallColor(color);
    };

    window.addEventListener('snowfallPreferencesChanged', handlePreferencesChanged as EventListener);

    return () => {
      window.removeEventListener('snowfallPreferencesChanged', handlePreferencesChanged as EventListener);
    };
  }, []);

  // useEffect(() => {
  //   if (plan == 'free' && ['/chat', '/image', '/audio', '/video'].includes(pathname)) {
  //     // Delay the entrance for a smooth effect
  //     setTimeout(() => {
  //       setShowUpgradePill(true);
  //     }, 1500);
  //   } else {
  //     setShowUpgradePill(false);
  //   }
  // },[pathname, plan])

  // Do not block public share routes with loading screen when plan is unset
  if (!plan && !isShareRoute) {
    return <LoadingScreen />;
  }


  if (isMaintenance) {
    return (
      <MaintenancePage 
        type="outage"
        title="Service Unavailable"
        description="Our service is currently undergoing maintenance."
        estimatedTime="in approximately 24 hours"
        showRefreshButton={true}
        onRefresh={() => window.location.reload()}
      />
    );
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      // handleFileUpload(droppedFiles);
      // console.log(droppedFiles);
      // console.log(droppedFiles.length);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
        {/* <SidebarProvider> */}
       {/* <AppSidebar /> */}
        {isAuthenticated && <Sidebar />}
        <main 
        className="flex-1 flex flex-col h-full relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!snowfallLoading && snowfallEnabled && (
            <Snowfall snowflakeCount={20} color={snowfallColor} />
          )}
          {/* <SidebarTrigger /> */}
          {isAuthenticated ? <Header /> : <PublicHeader />}
          
          {/* Upgrade Pill - Awesome Entrance Animation */}
          {(showUpgradePill && isAuthenticated) && (
            <div className="hidden xs:block absolute top-4 left-[50%] z-40 animate-in slide-in-from-top-8 fade-in-0 duration-1000 ease-out">
              <div className="relative">
                {/* Glow effect behind the pill */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-300/20 via-slate-200/20 to-slate-300/20 dark:from-slate-500/15 dark:via-slate-400/15 dark:to-slate-500/15 rounded-full blur-lg scale-110 animate-pulse" />
                
                {/* Main pill with entrance animation */}
                <div className="relative transform transition-all duration-1000 ease-out animate-in zoom-in-95 slide-in-from-top-8 fade-in-0">
                  <UpgradePill 
                    onClick={() => setPlansModalOpen(true)}
                    className="shadow-2xl hover:shadow-slate-300/30 dark:hover:shadow-slate-500/25 transition-all duration-300"
                  >
                    Upgrade plan
                  </UpgradePill>
                </div>
              </div>
            </div>
          )}
          
          <div className={`flex-1 overflow-auto ${!isAuthenticated ? 'lg:pt-2' : ''}`}>
            {isDragging && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl pointer-events-none z-40">
                {/* <Upload className="h-16 w-16 text-primary mb-4" /> */}
                <Image src={'/images/file_types_upload.png'} alt="File Upload" className="mb-4" width={100} height={100} />
                <p className="font-medium text-md">Drop file(s) to attach to conversation</p>

              </div>
            )}
            {children}
          </div>
          <HelpButton />
          {(pathname === "/chat" || !isAuthenticated || (pathname.includes("/chat/") && pathname.includes("/project/"))) && (
            <FooterText 
              className={`fixed bottom-0 ${isOpen ? "right-[38%]" : "hidden md:block md:right-[36%] lg:right-[42%]"} h-6 transition-all duration-300`}
            />
          )}

        {/* <TutorialModal
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          slides={sampleTutorialSlides}
          showSkip={true}
        /> */}
        <HearAboutUsModal
          open={showHearModal}
          onOpenChange={setShowHearModal}
          onSubmit={async (payload: HearAboutUsPayload) => {
            try {
              await onboardingApi.submitHearAboutUs({
                heard_from: payload.heard_from,
                heard_from_user: payload.heard_from_user,
                age_range: payload.age_range,
                intents: payload.intents,
                remind_later: payload.remind_later,
              } as any);
            } catch (err: any) {
              // toast.error(err.response.data.error || err.response.data.message || 'Oops! Something went wrong');
            }
          }}
        />
        </main>
    {/* </SidebarProvider> */}
    <PlansModal
        isOpen={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
      />
    <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        defaultTabValue="personalization"
      />
      </div>
  );
}