import { useState, useRef, useEffect } from 'react';
import { X, ExternalLink, Globe, BookOpen, Trophy, Tv, FileText } from 'lucide-react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Source } from '@/lib/types'
import Image from 'next/image';

interface SourcesWindowProps {
  sources: Source[];
  isOpen: boolean;
  onClose: () => void;
  responseId: string;
  userPrompt: string;
}

// Create a singleton pattern for the window position
const windowPosition = {
  current: { x: window.innerWidth - 400, y: 100 }
};

export function SourcesWindow({ sources, isOpen, onClose, responseId, userPrompt }: SourcesWindowProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 300 
          }}
          className="fixed right-0 top-0 h-screen w-[300px] 
                     bg-backgroundSecondary border-l border-borderColorPrimary 
                     shadow-2xl z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-backgroundSecondary/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm" title={userPrompt}>
                {userPrompt.length > 20 ? userPrompt.substring(0, 17) + '...' : userPrompt}
              </h3>
              <div className="text-xs text-muted-foreground px-2 py-0.5 bg-secondary/50 rounded-full">
                [{sources.length}]
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-secondary/20"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Sources Content */}
          <ScrollArea className="h-[calc(100vh-65px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={responseId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 p-2"
              >
                {sources.map((source, index) => (
                  <motion.div
                    key={source.url}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded-xl 
                                bg-background hover:bg-secondary/10
                                border border-borderColorPrimary hover:border-secondary/20
                                transition-all duration-200 ease-in-out
                                hover:shadow-lg hover:shadow-secondary/5
                                hover:-translate-y-0.5"
                    >
                      {/* Source Type Header */}
                      <div className="flex items-center gap-0.5 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 
                                      flex items-center justify-center
                                      group-hover:bg-secondary/20 
                                      transition-colors duration-200">
                          <Image 
                          src={source.favicon ? source.favicon : '/icons/default.png'} 
                          alt={source.title} 
                          width={32}
                          height={32}
                          className="w-4 h-4 object-cover rounded-full" />
                        </div>
                        <h4 className="text-xs font-semibold leading-snug 
                                     text-foreground/90 group-hover:text-primary 
                                     transition-colors duration-200">
                          {source.title}
                        </h4>
                      </div>
                      
                      {/* Title and Description */}
                      <div className="space-y-2">
                        {/* <h4 className="text-xs font-semibold leading-snug 
                                     text-foreground/90 group-hover:text-primary 
                                     transition-colors duration-200">
                          {source.title}
                        </h4> */}
                        <p className="text-xs text-muted-foreground/70 
                                   group-hover:text-muted-foreground/90
                                   line-clamp-2 leading-relaxed">
                          {source.summary ? (
                            source.summary.length > 200 
                              ? source.summary.substring(0, 200) + '...' 
                              : source.summary
                          ) : null}
                        </p>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}