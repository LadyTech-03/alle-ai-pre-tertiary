import { Button } from "@/components/ui/button";
import { Play, Loader,  Link } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TabType } from "@/stores/playground-drawerStore";

interface ChatActionsProps {
  isLoading: boolean;
  query: string;
  hasFollowUp: boolean;
  followUpData: { models: string[]; messages: any[] } | null;
  selectedModels: string[];
  chatMode: "search" | "completions" | "combination" | "summary"|"comparison"| null;
  handleClear: () => void;
  clearFollowUpState: () => void;
  setActiveTab: (tab: TabType) => void;
  handleRun: () => void;
  setQuery?: (query: string) => void;
  setFollowUpData?: (data: { models: string[]; messages: any[] } | null) => void;
  setLinkDialogOpen?: (open: boolean) => void;
  attachedImage?: string | null;
}

const ChatActions: React.FC<ChatActionsProps> = ({
  isLoading,
  query,
  hasFollowUp,
  followUpData,
  selectedModels,
  chatMode,
  handleClear,
  clearFollowUpState,
  setActiveTab,
  handleRun,
  setQuery,
  setFollowUpData,
  setLinkDialogOpen,
  attachedImage,
}) => {
  // Helper function to determine the run button tooltip text
  const getRunTooltip = () => {
    if (!query.trim()) {
      return "Please enter your query to run";
    }

    if (chatMode === "combination" || chatMode === "comparison") {
      if (selectedModels.length < 2) {
        return "Select at least two models to run";
      }
    } else if (selectedModels.length === 0) {
      return "Select at least one model to run";
    }

    return null;
  };

  return (
    <div className="flex justify-between items-center w-full">
      {/* Attach Image Button - Far Left */}
      {setLinkDialogOpen && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-borderColorPrimary bg-backgroundSecondary/30 text-xs flex items-center space-x-2"
                  onClick={() => setLinkDialogOpen(true)}
                >
                  <Link className="h-4 w-4" />
                  <span>Attach Image{attachedImage ? " (1)" : ""}</span>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>Add an image URL to your message</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Other Buttons - Far Right */}
      <div className="flex space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-borderColorPrimary bg-backgroundSecondary/30"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>Clear all input fields and response</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 border-borderColorPrimary",
                    hasFollowUp
                      ? "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                      : "bg-backgroundSecondary/30 opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (hasFollowUp) {
                      clearFollowUpState();
                      if (followUpData != null && setFollowUpData) {
                        setFollowUpData(null);
                      }
                      if (setQuery) {
                        setQuery("");
                      }
                      setActiveTab("response" as TabType);
                    }
                  }}
                  disabled={!hasFollowUp}
                >
                  New Request
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {hasFollowUp
                ? "Clear current conversation and start a new request with selected models"
                : "You have no active request - submit one to start a conversation"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  size="sm"
                  className="h-8 bg-primary hover:bg-primary/90"
                  onClick={handleRun}
                  disabled={
                    isLoading ||
                    !query.trim() ||
                    (chatMode === "combination" || chatMode === "comparison"
                      ? selectedModels.length < 2
                      : selectedModels.length === 0)
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run
                    </>
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            {getRunTooltip() && (
              <TooltipContent>{getRunTooltip()}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ChatActions;
