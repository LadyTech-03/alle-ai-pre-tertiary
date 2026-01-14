'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader, MessageSquare, Send, X } from 'lucide-react';
import { feedbackApi } from '@/lib/api/feedback';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FeedbackTooltipProps {
  responseId: string;
  isOpen: boolean;
  onClose: () => void;
  onFeedbackSubmitted?: () => void;
  onDislikeStateChange?: (responseId: string, state: 'disliked' | null, hasDislikeFeedback: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  className?: string;
}

export function FeedbackTooltip({ 
  responseId, 
  isOpen,
  onClose,
  onFeedbackSubmitted,
  onDislikeStateChange,
  triggerRef,
  className 
}: FeedbackTooltipProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate position based on trigger button
  useEffect(() => {
    if (isOpen && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Position above the trigger button, centered
      const top = triggerRect.top - tooltipRect.height - 8; // 8px gap
      const left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
      
      // Ensure it doesn't go off screen
      const adjustedLeft = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
      
      setPosition({ top, left: adjustedLeft });
    }
  }, [isOpen, triggerRef]);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit the feedback
      const feedbackResponse = await feedbackApi.submitFeedback({
        message: feedback.trim(),
        anonymous: false,
        response_id: responseId
      });

      if (feedbackResponse.status) {
        toast.success('Thank you for your feedback!');
        setFeedback('');
        onClose();
        
        // Notify parent components that feedback was submitted
        onDislikeStateChange?.(responseId, 'disliked', true);
        onFeedbackSubmitted?.();
      } else {
        toast.error('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      //   console.error('Error submitting feedback:', error);
      //   toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFeedback('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for clicking outside */}
      <div 
        className="fixed inset-0 z-40"
        onClick={handleCancel}
      />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <Card className={cn(
          "w-72 sm:w-80 p-3 sm:p-4 space-y-3 sm:space-y-4 bg-backgroundSecondary border border-borderColorPrimary shadow-lg",
          className
        )}>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 sm:p-1.5 rounded-full bg-red-500/10">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                  Help us improve
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="ml-auto h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <Textarea
              placeholder="What didn't work well with this response?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] sm:min-h-[80px] resize-none text-xs sm:text-sm focus-visible:outline-none"
              maxLength={500}
              disabled={isSubmitting}
            />
            
            <div className="flex items-center gap-1 sm:gap-2 pt-1 sm:pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 h-7 sm:h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting || !feedback.trim()}
                className="flex-1 h-7 sm:h-8 text-xs bg-red-500 hover:bg-red-600 text-white"
              >
                {isSubmitting ? <Loader className="h-3 w-3 animate-spin" /> : 'Submit'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
