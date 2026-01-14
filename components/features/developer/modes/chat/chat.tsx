
"use client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import RequestOptionsContent from "./requestOptionsContent";
import ChatActions from "./chatActions";
// import AdditionalMessageList from "./additionalMessageList";
import {
  X,
  Image,
  Check,
  Link,
  CodeXml,
  Settings2,
  AlertCircle,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import CodeModal from "../../base/codeModal";
import ModelsPicker from "../../base/ModelsPicker";
import { toast } from "sonner";
import { useChatState } from "./useChatState";

export default function Chat() {
  // Use our custom hook for all state and logic
  const {
    // State
    isLoading,
    query,
    selectedModels,
    showSystemPrompt,
    systemPrompt,
    followUpData,
    additionalMessages,
    temperature,
    maxTokens,
    searchSettings,
    linkUrl,
    linkDialogOpen,
    codeModalOpen,
    uploadedFile,
    attachedImage,
    isValidUrl,
    urlError,
    chatMode,
    hasFollowUp,
    
    // Setters
    setQuery,
    setSelectedModels,
    setShowSystemPrompt,
    setSystemPrompt,
    setFollowUpData,
    setAdditionalMessages,
    setTemperature,
    setMaxTokens,
    setSearchSettings,
    setLinkUrl,
    setLinkDialogOpen,
    setCodeModalOpen,
    setUploadedFile,
    setAttachedImage,
    setIsValidUrl,
    setUrlError,
    
    // Functions
    validateImageUrl,
    generateRequestStructure,
    // handleInsertLink,
    // handleFileUpload,
    handleRun,
    handleClear,
    handleMessageChange,
    handleMessageDelete,
    // handleTypeToggle,
    // handleAddMessage,
    clearFollowUpState,
  } = useChatState();

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 relative">
                <ModelsPicker
                  modelType="chat"
                  selectedModels={selectedModels}
                  onSelectionChange={(newModels) => {
                    if (newModels.length <= 5) {
                      setSelectedModels(newModels);
                    } else {
                      toast.error("Maximum of 5 models allowed", {
                        description: "You can select up to 5 models at a time",
                        position: "top-center",
                      });
                      setSelectedModels(newModels.slice(0, 5));
                    }
                  }}
                  width="200px"
                  buttonClassName="h-9"
                />

                {/* Combination mode floating alert */}
                <AnimatePresence>
                  {chatMode === "combination" && selectedModels.length < 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-10 left-0 z-50 min-w-[250px] flex items-center gap-2 p-2 pl-3 rounded-md shadow-md bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 text-sm border border-amber-200 dark:border-amber-800"
                    >
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Combination requires at least 2 models</span>
                      <div className="absolute -top-2 left-8 w-4 h-4 bg-amber-100 dark:bg-amber-900/80 border-t border-l border-amber-200 dark:border-amber-800 transform rotate-45"></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* compare mode floating alert */}
                <AnimatePresence>
                  {chatMode === "comparison" && selectedModels.length < 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-10 left-0 z-50 min-w-[250px] flex items-center gap-2 p-2 pl-3 rounded-md shadow-md bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 text-sm border border-amber-200 dark:border-amber-800"
                    >
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Comparison requires at least 2 models</span>
                      <div className="absolute -top-2 left-8 w-4 h-4 bg-amber-100 dark:bg-amber-900/80 border-t border-l border-amber-200 dark:border-amber-800 transform rotate-45"></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs border-borderColorPrimary bg-backgroundSecondary/30"
                    >
                      Request Options
                    </Button>
                  </PopoverTrigger>
                  <RequestOptionsContent
                    searchSettings={searchSettings}
                    setSearchSettings={setSearchSettings}
                    temperature={temperature}
                    setTemperature={setTemperature}
                    maxTokens={maxTokens}
                    setMaxTokens={setMaxTokens}
                    chatMode={chatMode}
                  />
                </Popover>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8  bg-backgroundSecondary/30"
                  onClick={() => setCodeModalOpen(true)}
                >
                  <CodeXml className="w-4 h-4 " />
                  &nbsp; code
                </Button>
              </div>
            </div>
            <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-4 " />

            {/* System Prompt Section */}
            <div className="border border-borderColorPrimary rounded-md p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Settings2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <h3 className="text-sm font-medium">System Prompt</h3>
                </div>
                <Switch
                  checked={showSystemPrompt}
                  onCheckedChange={setShowSystemPrompt}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <AnimatePresence mode="sync">
                {showSystemPrompt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <Textarea
                      placeholder="Enter system instructions for the AI..."
                      className="min-h-[80px] border border-borderColorPrimary bg-backgroundSecondary/30 resize-none"
                      value={systemPrompt.text}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setSystemPrompt({
                          ...systemPrompt,
                          text: e.target.value,
                        })
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Main Input Area */}
            <div className="border border-borderColorPrimary rounded-md p-3 mb-4">
              <Textarea
                placeholder='Enter chat query, e.g., "What is the future of AI?"'
                className="min-h-[150px] border-borderColorPrimary bg-backgroundSecondary/30 resize-none"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setQuery(e.target.value)
                }
              />

              {/* Attached Image Display */}
              {attachedImage && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <div className="group relative bg-backgroundSecondary/30 rounded-md p-2 pr-8 text-sm flex items-center">
                    <Link className="h-4 w-4 mr-2" />
                    <span className="truncate max-w-[200px]">
                      {attachedImage}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setAttachedImage(null);
                        toast.success("Image link removed");
                      }}
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500 transition-colors" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Messages Section */}
            {/* <AdditionalMessageList
              additionalMessages={additionalMessages}
              selectedModels={selectedModels}
              onMessageChange={handleMessageChange}
              onMessageDelete={handleMessageDelete}
            /> */}

            {/* Action Buttons */}
            <div className="w-full mt-4">
              <ChatActions
                isLoading={isLoading}
                query={query}
                hasFollowUp={hasFollowUp}
                followUpData={followUpData}
                selectedModels={selectedModels}
                chatMode={chatMode}
                handleClear={handleClear}
                clearFollowUpState={clearFollowUpState}
                setActiveTab={(tab) => {
                  // This is handled in the hook via effects
                }}
                handleRun={handleRun}
                setQuery={setQuery}
                setFollowUpData={setFollowUpData}
                setLinkDialogOpen={setLinkDialogOpen}
                attachedImage={attachedImage}
              />
            </div>

            {/* Link Dialog */}
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
              <DialogContent className="sm:max-w-[425px] bg-background border-borderColorPrimary">
                <DialogHeader>
                  <DialogTitle>Insert Image Link</DialogTitle>
                  <DialogDescription>
                    <span className="block">
                      Enter the URL of the image you want to include. Supported
                      formats: JPG, PNG, GIF, WebP.
                    </span>
                    {attachedImage && (
                      <span className="block text-yellow-500 mt-1 text-sm">
                        Adding a new image will replace the existing one.
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="relative">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={linkUrl}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        setLinkUrl(newUrl);
                        validateImageUrl(newUrl);
                      }}
                      className={cn(
                        "border-borderColorPrimary bg-backgroundSecondary/30 pr-8",
                        urlError
                          ? "border-red-500 focus-visible:ring-red-500"
                          : isValidUrl
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                      )}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {linkUrl &&
                        (isValidUrl ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ))}
                    </div>
                  </div>
                  {urlError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-red-500 flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {urlError}
                    </motion.div>
                  )}
                  {isValidUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-green-500 flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Valid image URL
                    </motion.div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      if (isValidUrl) {
                        setAttachedImage(linkUrl);
                        setLinkUrl("");
                        setIsValidUrl(false);
                        setUrlError(null);
                        setLinkDialogOpen(false);
                        toast.success(
                          attachedImage
                            ? "Image link replaced"
                            : "Image link added"
                        );
                      }
                    }}
                    disabled={!isValidUrl}
                    className={cn(
                      "bg-primary hover:bg-primary/90",
                      !isValidUrl && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {attachedImage ? "Replace Image" : "Add Image"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Display uploaded file if any */}
            {uploadedFile && (
              <div className="flex items-center justify-between bg-backgroundSecondary/30 px-3 py-2 rounded-md mt-2 border border-borderColorPrimary/50">
                <div className="flex items-center">
                  <Image className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[400px]">
                    {uploadedFile.file.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setUploadedFile(null)}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <CodeModal
          mode="chat"
          open={codeModalOpen}
          onOpenChange={setCodeModalOpen}
          chatConfig={generateRequestStructure().codeConfig as any}
        />
      </div>
    </ScrollArea>
  );
}
