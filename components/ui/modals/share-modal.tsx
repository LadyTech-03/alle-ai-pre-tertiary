"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Link, Copy, Share, CheckCircle, Settings } from "lucide-react";
import { toast } from "sonner";
import { useSidebarStore } from "@/stores";
import { useSharedLinksStore } from "@/stores";
import { useHistoryStore } from "@/stores";
import { useTheme } from "next-themes";
import Image from "next/image";
import { SettingsModal } from "./settings-modal";
import { cn } from "@/lib/utils";
import { socialMediaOptions } from "@/lib/constants";
import { useConversationStore } from "@/stores/models";
import { chatApi } from "@/lib/api/chat";
import { usePathname } from "next/navigation";


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareLinkModal({ isOpen, onClose }: ModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [isNewlyCreated, setIsNewlyCreated] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [shareUuid, setShareUuid] = useState<string | null>(null);
  const [isAlreadyShared, setIsAlreadyShared] = useState(false);
  const [copied, setCopied] = useState(false);
  const { getHistoryItemById, getHistoryByType} = useHistoryStore();
  const { currentConversationLink, setCurrentConversationLink, sectionIds } = useSidebarStore();
  const { conversationId } = useConversationStore();
  const historyItem = getHistoryItemById(conversationId || '');
// const conversationId = '25'
  const pathname = usePathname();
  const { theme } = useTheme();
  const dark = theme === "dark";
    // Determine current content type based on pathname
  const getCurrentType = useCallback((): 'chat' | 'image' | 'audio' | 'video' => {
    if (pathname.startsWith('/image')) return 'image';
    if (pathname.startsWith('/audio')) return 'audio';
    if (pathname.startsWith('/video')) return 'video';
    return 'chat';
  }, [pathname]);

  const generateLink = useCallback(async () => {
    if (!conversationId) {
      toast.info('Conversation not found!');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await chatApi.shareConversation(conversationId);
      
      if (response.status && response.share) {
        setIsAlreadyShared(true);
        setShareUuid(response.share.uuid);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const newLink = `${baseUrl}/${getCurrentType()}/shares/${response.share.uuid}`;
        setCurrentConversationLink(newLink);
        setIsNewlyCreated(true);
        toast.success('Share link has been created');
      } else {
        // toast.error('Failed to create share link');
      }
    } catch (error) {
    //   toast.error('Failed to create share link');
    } finally {
    setIsLoading(false);
    }
  }, [conversationId, getCurrentType, setCurrentConversationLink]);

  const checkShareStatus = useCallback(async () => {
    if (!conversationId) {
        toast.error("Can't find conversation, Please open a conversation or check network connection");
      return;
    }

    setIsInitialLoading(true);
    
    try {
      // console.log('checking share status', conversationId);
      const response = await chatApi.checkShareConversation(conversationId);
      
      if (response.status && response.is_shared && response.shared_uuid) {
        setIsAlreadyShared(true);
        setShareUuid(response.shared_uuid);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const existingLink = `${baseUrl}/${getCurrentType()}/shares/${response.shared_uuid}`;
        setCurrentConversationLink(existingLink);
        
        // Automatically update the existing link
        await generateLink();
      } else {
        // Not shared yet, automatically generate a new link
        setIsAlreadyShared(false);
        setShareUuid(null);
        setCurrentConversationLink(null);
        await generateLink();
      }
    } catch (error) {
      // If conversation is not shared yet, generate a new one
      setIsAlreadyShared(false);
      setShareUuid(null);
      setCurrentConversationLink(null);
      await generateLink();
    } finally {
      setIsInitialLoading(false);
    }
  }, [conversationId, getCurrentType, setCurrentConversationLink, generateLink]);

  const copyToClipboard = async () => {
    if (!currentConversationLink) return;
    
    try {
      await navigator.clipboard.writeText(currentConversationLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link')
    }
  };

  // Check share status when modal opens
  useEffect(() => {
    if (isOpen && conversationId) {
      checkShareStatus();
    }
  }, [isOpen, conversationId, checkShareStatus]);

  // Reset newly created state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsNewlyCreated(false);
    }
  }, [isOpen]);

  // Reset state when section IDs change
  useEffect(() => {
    setCurrentConversationLink(null);
    setIsNewlyCreated(false);
    setShareUuid(null);
    setIsAlreadyShared(false);
    setCopied(false);
  }, [sectionIds, setCurrentConversationLink]);

  const handleShare = (platform: typeof socialMediaOptions[0]) => {
    if (!currentConversationLink) return;
    window.open(platform.handler(currentConversationLink), '_blank');
  };
  
  const getButtonConfig = () => {
    if (isLoading) {
      return {
        text: "",
        icon: <Loader className="h-4 w-4 animate-spin" />,
        action: undefined,
        variant: "default" as const
      };
    }

    if (!currentConversationLink) {
      return {
        text: "Generate",
        // icon: <Share className="w-4 h-4" />,
        action: generateLink,
        variant: "default" as const
      };
    }

    return {
      text: "Update Link",
      icon: <Link className="w-4 h-4" />,
      action: generateLink,
      variant: "default" as const
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            {/* <Share className="h-4 w-4 text-primary" /> */}
              {isInitialLoading ? '' : historyItem?.title || 'Share'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {isInitialLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Info Banner */}
                <div className="rounded-lg py-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium">
                      {currentConversationLink 
                          ? 'Anyone with the link can view this conversation.' 
                          : 'Your name and future messages in this conversation remain private.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Share Options Grid - Show when link exists */}
                {currentConversationLink && (
                  <>
                    <div className="grid grid-cols-4 gap-3">
                      {/* Copy Link Button */}
                      <Button
                        variant="outline"
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 h-20 rounded-lg transition-colors",
                          copied && "border-green-500 bg-green-50 dark:bg-green-950/30"
                        )}
                        onClick={copyToClipboard}
                        aria-label="Copy link"
                      >
                        {copied ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Link className="h-4 w-4" />
                        )}
                        <span className="text-xs font-medium">
                          {copied ? 'Copied!' : 'Copy Link'}
                        </span>
                      </Button>

                      {/* Social Media Share Buttons */}
                      {socialMediaOptions.map((platform) => (
                        <Button
                          key={platform.name}
                          variant="outline"
                          className="flex flex-col items-center justify-center gap-2 h-20 rounded-lg hover:bg-muted/50 transition-colors"
                          onClick={() => handleShare(platform)}
                          aria-label={`Share on ${platform.name}`}
                        >
                          <Image
                            src={platform.name === 'X' ? (dark ? '/svgs/x_white.png' : '/svgs/x_black.png') : platform.icon}
                            alt={platform.name}
                            width={20}
                            height={20}
                            className="w-5 h-5"
                          />
                          <span className="text-xs font-medium">{platform.name}</span>
                        </Button>
                      ))}
                    </div>

                    {/* Manage Button - Show when link exists */}
                    <div className="flex items-center justify-end pt-2 border-t">
                      <Button
                        variant="link"
                        size="sm"
                        className="gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          onClose();
                          setSettingsModalOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                        Manage Shares
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <SettingsModal 
        isOpen={settingsModalOpen} 
        onClose={() => setSettingsModalOpen(false)}
        defaultTabValue="data controls"
      />
    </>
  );
}
