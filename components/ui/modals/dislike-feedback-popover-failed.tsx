'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { MessageSquare, Send } from 'lucide-react';
import { feedbackApi } from '@/lib/api/feedback';
import { chatApi } from '@/lib/api/chat';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FeedbackPopoverProps {
  responseId: string;
  trigger: React.ReactNode;
  onFeedbackSubmitted?: () => void;
  onDislikeStateChange?: (responseId: string, state: 'disliked' | null, hasDislikeFeedback: boolean) => void;
  className?: string;
}

export function FeedbackPopover({ 
  responseId, 
  trigger, 
  onFeedbackSubmitted,
  onDislikeStateChange,
  className 
}: FeedbackPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDislikeFeedback, setHasDislikeFeedback] = useState(false);

  const handleDislikeClick = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // First, make the dislike API call
      const dislikeResponse = await chatApi.updateLikeState(responseId, 'disliked');
      
      if (dislikeResponse.status) {
        // Update local state
        setHasDislikeFeedback(dislikeResponse.hasDislikeFeedback || false);
        
        // Notify parent component about the dislike state change
        onDislikeStateChange?.(responseId, 'disliked', dislikeResponse.hasDislikeFeedback || false);
        
        // Only show popover if hasDislikeFeedback is false
        if (!dislikeResponse.hasDislikeFeedback) {
          setIsOpen(true);
        }
        
        toast.success('Response disliked');
      } else {
        toast.error('Failed to update dislike state. Please try again.');
      }
    } catch (error) {
      //   console.error('Error updating dislike state:', error);
      //   toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        setIsOpen(false);
        
        // Update local state to indicate feedback was provided
        setHasDislikeFeedback(true);
        
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
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Always render the trigger button */}
      <div onClick={handleDislikeClick}>
        {trigger}
      </div>
      
      {/* Conditionally render the popover based on API response */}
      {isOpen && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverContent 
            className={cn(
              "w-72 sm:w-80 p-3 sm:p-4 space-y-3 sm:space-y-4",
              className
            )}
            side="top"
            align="end"
            sideOffset={8}
          >
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
              </div>
              
              <Textarea
                placeholder="What didn't work well with this response?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] sm:min-h-[80px] resize-none text-xs sm:text-sm"
                maxLength={500}
                disabled={isSubmitting}
              />
              
              {/* <div className="flex items-center justify-end text-xs text-muted-foreground">
                <span>{feedback.length}/500</span>
              </div> */}
              
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
                  <Send className="h-3 w-3 mr-1" />
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
