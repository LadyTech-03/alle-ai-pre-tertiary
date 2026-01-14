'use client';

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Image from 'next/image';
import { Pencil, Check, X, ChevronDown, Copy } from "lucide-react";
import { useAuthStore } from "@/stores";
import { ModelResponse } from "@/lib/types";
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion";

import { MessageAttachment } from "./MessageAttachment";


interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  position: [number, number];
  responses: ModelResponse[];
}

interface Branch {
  messages: Message[];
  startPosition: [number, number];
}

interface ChatMessageProps {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  position: [number, number];
  onEditMessage?: (newContent: string, position: [number, number]) => void;
  totalBranches?: number;
  currentBranch?: number;
  onBranchChange?: (branchIndex: number) => void;
  branches?: Branch[]; // Add this prop
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
  }> | null; // Add this prop
}

interface MessageTree {
  messageId: string;  // Unique ID for this message version
  parentId: string | null;  // ID of the parent message version (null for root)
  position: [number, number];
  branchId: string;  // Unique ID for this branch
}

export function ChatMessage({ 
  content, 
  sender, 
  timestamp, 
  position,
  onEditMessage,
  totalBranches = 1,
  currentBranch = 0,
  onBranchChange,
  branches = [],
  attachments = null
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const { user } = useAuthStore();
  ;

  const [x, y] = position;
  
  // Generate a unique ID for this message if it doesn't exist
  const messageId = `msg-${y}-${x}`;
  const branchId = `branch-${y}-${x}`;

  // Move findBranchPath function definition here, before it's used
  const findBranchPath = (branches: Branch[], pos: [number, number]): Branch[] => {
    const [x, y] = pos;
    const path: Branch[] = [];
    
    let currentPos: [number, number] = [x, y];
    while (currentPos[0] >= 0) {
      const branch = branches.find(b => 
        b.messages.some(m => 
          m.position[0] === currentPos[0] && 
          m.position[1] === currentPos[1]
        )
      );
      
      if (branch) {
        path.unshift(branch);
        // Move to parent branch
        currentPos = branch.startPosition;
      } else {
        break;
      }
    }
    
    return path;
  };

  // Now we can use findBranchPath in versionsOfThisMessage
  const versionsOfThisMessage = branches
    .flatMap(branch => branch.messages)
    .filter(msg => {
      if (msg.position[1] !== y || msg.sender !== sender) return false;
      
      if (msg.position[0] === 0) return true;
      
      const branchPath = findBranchPath(branches, position);
      
      return branchPath.some(pathBranch => 
        pathBranch.messages.some(m => 
          m.position[0] === msg.position[0] && 
          m.position[1] === msg.position[1]
        )
      );
    })
    .sort((a, b) => a.position[0] - b.position[0]);

  // Only show versioning if there are actual edits
  const shouldShowVersioning = versionsOfThisMessage.length > 1;
  
  // Current version is based on x position + 1
  const currentVersion = x + 1;
  
  // Total versions is the highest x value across ALL branches for this message + 1
  const totalVersions = shouldShowVersioning ? 
    Math.max(...versionsOfThisMessage.map(m => m.position[0])) + 1 : 
    1;

  // Check if content needs truncation
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const MAX_LINES = 6;

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseInt(getComputedStyle(contentRef.current).lineHeight);
      const contentHeight = contentRef.current.scrollHeight;
      const maxHeight = lineHeight * MAX_LINES;
      setNeedsTruncation(contentHeight > maxHeight);
    }
  }, [content]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    if (onEditMessage) {
      onEditMessage(editedContent, position);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleVersionChange = (direction: 'prev' | 'next') => {
    if (!shouldShowVersioning) return;

    const currentIndex = currentVersion - 1;
    const targetIndex = direction === 'next' 
      ? currentIndex + 1 
      : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < totalVersions) {
      // Find the branch path for the target version
      const targetMessage = versionsOfThisMessage[targetIndex];
      const branchPath = findBranchPath(branches, [targetIndex, y]);
      
      // Find the branch that contains this version and its sub-branches
      const targetBranch = branches.findIndex(branch => 
        branchPath.includes(branch)
      );

      if (targetBranch !== -1) {
        onBranchChange?.(targetBranch);
      }
    }
  };

  return (<>
  {attachments && attachments.length > 0 && (
    <div className={`flex ${attachments.length === 1 ? 'justify-end' : 'flex-wrap justify-end gap-2'} max-w-5xl sm:max-w-[90%] mx-auto w-full mb-1`}>
      {attachments.map((attachment, index) => (
        <MessageAttachment 
          key={index} 
          file={attachment} 
          isMultiple={attachments.length > 1}
        />
      ))}
    </div>
  )}

    <div className="max-w-5xl sm:max-w-[90%] mx-auto w-full">
      <div className="flex justify-end relative group">
        <Card className={`flex items-start gap-3 px-2 ${(needsTruncation) ? 'pb-6 pt-4' : 'py-2'} rounded-2xl ${attachments && attachments.length > 0 && 'rounded-tr-none'} bg-backgroundSecondary max-w-[80%] sm:w-fit sm:max-w-[70%]`}>
          {/* <div className="hidden sm:flex w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={user?.photo_url || '/user.jpg'}
              alt={sender}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div> */}
          {isEditing ? (
            <div className="flex-1 flex flex-col gap-2">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-1 bg-backgroundSecondary rounded-lg text-sm focus:outline-none bg-[#2C2C2C] resize-none min-h-[40px]"
                  placeholder="Edit message..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-sm rounded-full bg-black text-white dark:bg-white dark:text-black hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-sm rounded-full bg-white text-black dark:bg-black dark:text-white hover:bg-gray-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-start">
              <div className="flex-1 pr-2 relative">
                <AnimatePresence initial={false}>
                  <motion.p 
                    ref={contentRef}
                    initial={{ height: "auto" }}
                    animate={{ height: isExpanded ? "auto" : needsTruncation ? "7.5rem" : "auto" }}
                    exit={{ height: needsTruncation ? "7.5rem" : "auto" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`text-sm whitespace-pre-wrap break-words overflow-hidden ${
                      !isExpanded && needsTruncation ? 'line-clamp-6' : ''
                    }`}
                  >
                    {content}
                  </motion.p>
                </AnimatePresence>
                {needsTruncation && (
                  <motion.button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute -bottom-4 -left-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                    {isExpanded ? 'Show less' : 'Show more'}
                  </motion.button>
                )}
              </div>
              {/* <button
                onClick={()=>{
                  toast.info('This feature will be available soon')
                  // handleEditClick();
                }}
                className="text-muted-foreground hover:bg-gray-100 p-1 rounded-full transition-colors flex-shrink-0"
                aria-label="Edit message"
              >
                <Pencil size={16} />
              </button> */}
            </div>
          )}
        </Card>

        {/* Copy button - only show for user messages */}
        {sender === 'user' && (
          <motion.button
            onClick={handleCopyContent}
            className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full hover:bg-backgroundSecondary/80"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Copy message"
          >
            <Copy size={14} className="text-muted-foreground hover:text-foreground" />
          </motion.button>
        )}

        {/* {shouldShowVersioning && (
          <div className="mt-2 flex justify-end items-center gap-1 text-xs text-muted-foreground">
            <button
              onClick={() => handleVersionChange('prev')}
              disabled={currentVersion <= 1}
              className="px-2 py-1 rounded-md hover:bg-backgroundSecondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {"<"}
            </button>
            <span className="px-1">
              {`${currentVersion}/${totalVersions}`}
            </span>
            <button
              onClick={() => handleVersionChange('next')}
              disabled={currentVersion >= totalVersions}
              className="px-2 py-1 rounded-md hover:bg-backgroundSecondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {">"}
            </button>
          </div>
        )} */}
      </div>
    </div>
    </>
  );
}
