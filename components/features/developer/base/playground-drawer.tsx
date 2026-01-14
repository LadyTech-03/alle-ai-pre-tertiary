"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Copy, ChevronRight, Bot, CheckCircle, XCircle, Zap, MessageSquare, Check, ChevronDown, Loader, User } from "lucide-react"
import { useFollowUpConversationStore } from "@/stores/playground-drawerStore"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable"
import { motion, AnimatePresence } from "framer-motion"
import MonacoEditor from "./monacoEdtor"

interface PlaygroundDrawerProps {
  isOpen: boolean;
  onClose?: () => void;
}

// Custom hook for auto-scroll management
const useAutoScroll = (dependencies: any[]) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const userScrolledUp = useRef(false)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Debounced scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (userScrolledUp.current) return // Don't auto-scroll if user scrolled up
    
    requestAnimationFrame(() => {
      const scrollArea = scrollAreaRef.current
      if (!scrollArea) return

      // Find the actual scrollable viewport within ScrollArea
      const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
      const scrollElement = viewport || scrollArea

      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth'
      })
    })
  }, [])

  // Check scroll position and update scroll button visibility
  const checkScrollPosition = useCallback(() => {
    const scrollArea = scrollAreaRef.current
    if (!scrollArea) return

    const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
    const scrollElement = viewport || scrollArea

    const { scrollTop, scrollHeight, clientHeight } = scrollElement
    const threshold = 100
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold
    
    // Update user scroll state
    userScrolledUp.current = !isNearBottom && scrollHeight > clientHeight
    
    // Show scroll button only if user has scrolled up and there's content to scroll
    setShowScrollButton(userScrolledUp.current)
  }, [])

  // Force scroll to bottom (ignores user scroll state)
  const forceScrollToBottom = useCallback(() => {
    userScrolledUp.current = false
    scrollToBottom()
  }, [scrollToBottom])

  // Set up scroll event listener
  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    if (!scrollArea) return

    const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
    const scrollElement = viewport || scrollArea

    scrollElement.addEventListener('scroll', checkScrollPosition, { passive: true })
    return () => scrollElement.removeEventListener('scroll', checkScrollPosition)
  }, [checkScrollPosition])

  // Auto-scroll when dependencies change
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, dependencies)

  return {
    scrollAreaRef,
    showScrollButton,
    scrollToBottom: forceScrollToBottom,
    checkScrollPosition
  }
}

export function PlaygroundDrawer({ isOpen, onClose }: PlaygroundDrawerProps) {
  const { conversations, isDrawerAnimationLoading } = useFollowUpConversationStore()
  const [activeModels, setActiveModels] = useState<{ [conversationId: string]: string }>({})
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set())
  const [copiedStates, setCopiedStates] = useState<{ [conversationId: string]: boolean }>({})

  // Use the custom auto-scroll hook
  const { scrollAreaRef, showScrollButton, scrollToBottom } = useAutoScroll([
    conversations.length,
    isDrawerAnimationLoading,
    expandedConversations.size,
    isOpen
  ])

  // Handle new conversations - expand the latest one
  useEffect(() => {
    if (conversations.length > 0) {
      const lastConversationId = conversations[conversations.length - 1].conversationId
      
      // Expand only the newest conversation
      setExpandedConversations(new Set([lastConversationId]))
    }
  }, [conversations.length])

  const getActiveModel = (conversationId: string, responses: { [key: string]: any }) => {
    return activeModels[conversationId] || Object.keys(responses)[0] || ""
  }

  const setActiveModel = (conversationId: string, modelId: string) => {
    setActiveModels((prev) => ({ ...prev, [conversationId]: modelId }))
  }

  const toggleConversationExpansion = (conversationId: string) => {
    setExpandedConversations((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId)
      } else {
        newSet.add(conversationId)
      }
      return newSet
    })
  }

  const copyToClipboard = async (conversationId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [conversationId]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [conversationId]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const getResponseTime = (response: any) => {
    return response?.responseTime || response?.response?.time || 0
  }

  const formatCodeContent = (response: any) => {
    if (response.status === "success") {
      try {
        const jsonStr = JSON.stringify(response.response, null, 2)
        return jsonStr.split('\n').map(line => {
          if (line.length > 80) {
            return line
              .replace(/,\s*/g, ',\n  ')
              .replace(/:\s*/g, ':\n  ')
          }
          return line
        }).join('\n')
      } catch (e) {
        return JSON.stringify(response.response, null, 2)
      }
    }
    return response.message?.content || JSON.stringify(response, null, 2)
  }

  const getCodeFromResponse = (response: any) => {
    return formatCodeContent(response)
  }

  if (!isOpen) return null

  return (
    <div className="h-full dark:bg-[#282828] w-full ">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={100} minSize={30} className="h-full">
          <div className="h-full flex flex-col bg-backgroundSecondary/30 border-l pl-4 border-borderColorPrimary relative">
            <ScrollArea 
              className="flex-1" 
              ref={scrollAreaRef}
            >
              <div className="h-full">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium text-center">
                      Start making requests to get follow-up conversations here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-12 p-6 max-w-[900px] mx-auto">
                    {conversations.map((conversation) => {
                      const activeModelId = getActiveModel(conversation.conversationId, conversation.responses)
                      const activeResponse = conversation.responses[activeModelId]
                      const isExpanded = expandedConversations.has(conversation.conversationId)

                      return (
                        <motion.div 
                          key={conversation.conversationId} 
                          className="space-y-8"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-start gap-4 ml-16 mb-8">
                            <div className="flex flex-col items-end gap-2 flex-1">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>You</span>
                                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                  <User className="w-3.5 h-3.5 text-primary" />
                                </div>
                              </div>
                              <div className="max-w-[70%] bg-primary/10 rounded-2xl px-4 py-3 shadow-sm">
                                <p className="text-foreground text-sm leading-relaxed break-words">
                                  {conversation.userMessage}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mr-16 space-y-4 pl-6">
                            <div className="w-full">
                              <div className="inline-flex bg-backgroundSecondary/40 rounded-lg border border-borderColorPrimary p-1 max-w-full overflow-x-auto shadow-sm">
                                {Object.entries(conversation.responses).map(([modelId, response]) => (
                                  <button
                                    key={modelId}
                                    type="button"
                                    onClick={() => setActiveModel(conversation.conversationId, modelId)}
                                    className={`
                                      px-4 py-2.5 text-sm font-medium rounded transition-all duration-200
                                      flex items-center gap-2 whitespace-nowrap
                                      ${activeModelId === modelId 
                                        ? "bg-primary text-primary-foreground shadow-sm" 
                                        : "text-muted-foreground hover:bg-backgroundSecondary hover:text-foreground"
                                      }
                                      ${response.status === "error" && activeModelId !== modelId ? "text-destructive hover:text-destructive" : ""}
                                    `}
                                  >
                                    {response.status === "success" ? (
                                      <CheckCircle className="w-3 h-3" />
                                    ) : (
                                      <XCircle className="w-3 h-3" />
                                    )}
                                    <span>{response.modelName}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {activeResponse && (
                              <div className="relative group">
                                <div className="absolute -left-14 top-6 w-10 h-10 bg-background border-2 border-foreground text-foreground rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                  <Bot className=" w-5 h-5" />
                                </div>
                                
                                <motion.div 
                                  className="bg-backgroundSecondary/40 border border-borderColorPrimary rounded-lg overflow-hidden hover:border-borderColorPrimary/80 hover:shadow-md transition-all duration-200"
                                  whileHover={{ scale: 1.002 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div
                                    className="flex justify-between items-center p-3 bg-backgroundSecondary/60 border-b border-borderColorPrimary cursor-pointer hover:bg-backgroundSecondary/80 transition-colors"
                                    onClick={() => toggleConversationExpansion(conversation.conversationId)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <motion.div
                                        animate={{ rotate: isExpanded ? 90 : 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                      </motion.div>
                                      <div className="flex items-center gap-3">
                                        <span className="font-semibold text-foreground">{activeResponse.modelName}</span>
                                        {activeResponse.status === "success" ? (
                                          <div className="flex items-center gap-1 text-muted-foreground">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-xs">Success</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1 text-destructive">
                                            <XCircle className="w-4 h-4" />
                                            <span className="text-xs">Error</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Zap className="w-3 h-3" />
                                        {getResponseTime(activeResponse)}ms
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          const editorContent = getCodeFromResponse(activeResponse)
                                          copyToClipboard(conversation.conversationId, editorContent)
                                        }}
                                        className="hover:bg-backgroundSecondary opacity-70 hover:opacity-100 transition-opacity"
                                      >
                                        {copiedStates[conversation.conversationId] ? (
                                          <Check className="w-3 h-3 mr-1 text-green-500" />
                                        ) : (
                                          <Copy className="w-3 h-3 mr-1" />
                                        )}
                                        {copiedStates[conversation.conversationId] ? "Copied!" : "Copy"}
                                      </Button>
                                    </div>
                                  </div>

                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                        className="relative overflow-hidden"
                                      >
                                        <div className="p-3 w-full">
                                          {activeResponse.status === "success" ? (
                                            <MonacoEditor
                                              value={getCodeFromResponse(activeResponse)}
                                              className="bg-backgroundSecondary/30 w-full rounded-md"
                                              height="300px"
                                              style={{ 
                                                maxWidth: '100%',
                                                width: '100%',
                                                overflowX: 'auto',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                                wordWrap: 'break-word',
                                                minHeight: '300px',
                                                maxHeight: '50vh'
                                              }}
                                            />
                                          ) : (
                                            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 w-full">
                                              <h4 className="text-sm font-semibold text-destructive mb-2">Error Details</h4>
                                              <MonacoEditor
                                                value={getCodeFromResponse(activeResponse)}
                                                className="bg-transparent border-none w-full"
                                                style={{ 
                                                  maxWidth: '100%',
                                                  width: '100%',
                                                  overflowX: 'auto'
                                                }}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}

                    {isDrawerAnimationLoading && (
                     <div className="flex items-center gap-3 pl-6 mt-8">
                     <motion.div
                       animate={{ rotate: 360 }}
                       transition={{
                         duration: 1.2,
                         repeat: Infinity,
                         ease: "linear"
                       }}
                     >
                       <Loader className="w-5 h-5 text-primary" />
                     </motion.div>
                     <p className="text-sm text-muted-foreground">Processing request...</p>
                   </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <AnimatePresence>
              {showScrollButton && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute bottom-6 right-6 z-10"
                >
                  <Button
                    onClick={scrollToBottom}
                    size="icon"
                    className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-background"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}