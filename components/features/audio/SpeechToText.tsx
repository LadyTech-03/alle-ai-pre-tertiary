"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Play, Pause, Download, Copy, FileText, FileJson, 
  FileSpreadsheet, FileCode, ChevronDown, ChevronUp,
  Volume2, VolumeX, Loader
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { chatApi } from '@/lib/api/chat';
import { useContentStore, useSelectedModelsStore, useSidebarStore } from "@/stores";
import { useConversationStore } from '@/stores/models';
import { useModelsStore } from '@/stores/models';
import { Skeleton } from "@/components/ui/skeleton";
import api from '@/lib/api/axios';
import { useRouter } from 'next/navigation';
import { useAudioTabStore } from '@/stores/audioTabStore';
import { useAudioCategorySelectionStore } from '@/stores/audioCategorySelectionStore';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import html2pdf from 'html2pdf.js';
import { PromptModal } from '@/components/ui/modals';
import { ModelSelectionModal } from "@/components/ui/modals/model-selection-modal";
import { useHistoryStore } from '@/stores';


// Type definitions
type TranscriptionResult = {
  id: string;
  model: {
    name: string;
    avatar: string;
    provider: string;
  };
  text: string;
};

interface UploadedFile {
  file_content: string;
  file_extension: string | null;
  file_name: string;
  file_size: string;
  file_type: string;
  file_url: string;
  index: number;
}

interface AudioResponse {
  prompt: string;
  prompt_id: number;
  input_content: {
    uploaded_files: UploadedFile[];
  };
  responses: Array<{
    id: number | string;
    model: {
      uid: string;
      name: string;
      image: string;
      provider: string;
    };
    body: string;
    liked: boolean | null;
  }>;
}

export default function SpeechToTextResult() {
  const params = useParams();
  const loadConversationId = params.audioid as string;
  const { conversationId, promptId, setConversationId, generationType, setGenerationType } = useConversationStore();
  const { selectedModels, inactiveModels, setTempSelectedModels, saveSelectedModels, setLoadingLatest } = useSelectedModelsStore();
  const { audioModels } = useModelsStore();
  const { content, setContent } = useContentStore();
  const { setActiveTab } = useAudioTabStore();
  const { setCategoryModel, getCategoryModel } = useAudioCategorySelectionStore();
  
  // Audio file details
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState('audio-file.mp3');
  
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [audioModelsLoaded, setAudioModelsLoaded] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const { isOpen } = useSidebarStore();

  const [conversationModels, setConversationModels] = useState<string[]>([]);
  const [previousSelectedModels, setPreviousSelectedModels] = useState<string[]>([]);
  const [promptConfig, setPromptConfig] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [modelSelectionModalOpen, setModelSelectionModalOpen] = useState(false);
  const { getHistoryItemById } = useHistoryStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();

  // Function to get model info from audioModels
  const getModelInfo = (modelId: string) => {
    const model = audioModels.find(model => model.model_uid === modelId);
    return model ? {
      name: model.model_name,
      avatar: model.model_image || '/images/default.webp',
      provider: model.model_provider
    } : null;
  };

  const getConversationModels = (conversationId: string) => {
    chatApi.getModelsForConversation(conversationId)
      .then(response => {
        // console.log('Models used in conversation:', response);
        const modelUids = response.map((model: any) => model.model_uid);

        // Get the store actions
        const store = useSelectedModelsStore.getState();
        
        // Filter models to only include those that exist in available chat models
        const availableAudioModelUids = audioModels.map(model => model.model_uid);
        const validModelUids = modelUids.filter((uid: string) => availableAudioModelUids.includes(uid));

        
        // Only set models that are available in the system
        if (validModelUids.length > 0) {
          setConversationModels(validModelUids);
          setTempSelectedModels(validModelUids);
          saveSelectedModels('audio');
          
          // Create a new array for inactive models based on the response,
          // but only include models that are in our valid list
          const inactiveModels = response
            .filter((model: { active: number; model_uid: string }) => 
              model.active === 0 && validModelUids.includes(model.model_uid))
            .map((model: { model_uid: string }) => model.model_uid);
          
          store.setInactiveModels(inactiveModels);
        } else {
          setConversationModels([]);
          setTempSelectedModels([]);
          saveSelectedModels('audio');
        }
      })
      .catch(error => {
        // console.error('Error fetching models for conversation:', error);
      })
      .finally(() => {
        setLoadingLatest(false);
      });
  };

  useEffect(() => {
    if(selectedModels.audio.length > 0 && conversationModels.length > 0){
      setPreviousSelectedModels(selectedModels.audio);
        if (JSON.stringify(conversationModels) !== JSON.stringify(selectedModels.audio)) {
          setPromptConfig({
            title: "Change Models",
            message: "Selecting new models will start a new conversation. Do you want to continue?",
            type: "warning",
            actions: [
              {
                label: "Cancel",
                onClick: () => {
                  setTempSelectedModels(previousSelectedModels);
                  saveSelectedModels('audio');
                  setShowPrompt(false);
                },
                variant: "default"
              },
              {
                label: "Proceed",
                onClick: () => {
                  router.replace(`/audio`);
                },
                variant: "default"
              }
            ]
          });
          setShowPrompt(true);

        }
    }
  }, [selectedModels]);

  useEffect(() => {
    // Check if chat models are loaded
    if (audioModels && audioModels.length > 0) {
      // console.log(audioModels, 'here are the audio models')
      setAudioModelsLoaded(true);
    }
  }, [audioModels]);

  useEffect(()=>{
    if (conversationId && generationType === 'load' && audioModelsLoaded) {
      getConversationModels(conversationId);
    }
  },[conversationId, generationType, audioModelsLoaded])
  
  // Load audio data from sessionStorage if available
  useEffect(() => {
    // Check if we have audio file URL in sessionStorage
    const storedAudioUrl = typeof window !== 'undefined' ? sessionStorage.getItem('audioFileUrl') : null;
    const storedFileName = typeof window !== 'undefined' ? sessionStorage.getItem('audioFileName') : null;
    
    if (storedAudioUrl) {
      // console.log('Retrieved audio URL from storage:', storedAudioUrl);
      setAudioUrl(storedAudioUrl);
    }
    
    if (storedFileName) {
      setOriginalFileName(storedFileName);
    }
    
    // Clean up sessionStorage when component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        // Only clear these specific items, not the entire sessionStorage
        sessionStorage.removeItem('audioFileUrl');
        sessionStorage.removeItem('audioFileName');
      }
    };
  }, []);

  // Handle initial response
  useEffect(() => {
    
    const handleInitialResponse = async () => {
      if (!conversationId || !promptId) return;
      
      setConversationModels(selectedModels.audio);
      setPreviousSelectedModels(selectedModels.audio);

      const activeModels = selectedModels.audio.filter(modelId => !inactiveModels.includes(modelId));
      
      if (activeModels.length === 0) return;
      
      const modelId = activeModels[0]; // Take the first model only
      
      try {
        setIsLoading(true); // Show skeleton loader during initial response
        setIsLoadingConversation(false); // Make sure conversation loader is hidden
        
        // console.log("Generating transcription with model:", modelId);
        const response = await chatApi.generateResponse({
          conversation: conversationId,
          model: modelId,
          is_new: true,
          prompt: promptId
        });
        
        if (response.status && response.data) {
          const modelInfo = getModelInfo(modelId);
          const transcriptionResult: TranscriptionResult = {
            id: response.data.id.toString(),
            model: {
              name: modelInfo?.name || 'Unknown Model',
              avatar: modelInfo?.avatar || '/images/default.webp',
              provider: modelInfo?.provider || 'Unknown Provider'
            },
            text: response.data.response
          };
          
          setResult(transcriptionResult);
        }
      } catch (error) {
        // console.error(`Error generating response for model ${modelId}:`, error);
        // toast.error("Failed to transcribe audio");
      } finally {
        setIsLoading(false);
      }
    };

    const loadConversation = async () => {
      if (!loadConversationId) {
        // console.log("No ID available");
        toast.error("No conversation found");
        return;
      }

      setConversationId(loadConversationId);     
      setIsLoadingConversation(true);
      setLoadingLatest(true);
      setIsLoading(false); // Don't show skeleton loader during conversation load
      setActiveTab('stt'); // Set active tab to 'stt' when loading conversation
      
      const historyItem = getHistoryItemById(loadConversationId);
      if (historyItem && historyItem.title) {
        document.title = `${historyItem.title} - Alle-AI`;
      }
      
      try {
        const response = await chatApi.getConversationContent('audio', loadConversationId) as unknown as AudioResponse[];
        // console.log('Loaded STT conversation content:', response);
        
        if (response && response[0]) {
          // Set the audio URL from uploaded_files inside input_content
          if (response[0].input_content?.uploaded_files && response[0].input_content.uploaded_files.length > 0) {
            const audioFile = response[0].input_content.uploaded_files[0];
            // console.log("Found audio file:", audioFile);
            setAudioUrl(audioFile.file_url);
            setOriginalFileName(audioFile.file_name || 'audio-file.mp3');
          } else {
            // console.log("No uploaded files found in response");
            toast.error("No audio file found in conversation");
          }

          // Get the first response (since STT only has one response)
          const sttResponse = response[0].responses[0];
          if (sttResponse) {
            const transcriptionResult: TranscriptionResult = {
              id: sttResponse.id.toString(),
              model: {
                name: sttResponse.model.name,
                avatar: sttResponse.model.image || '/images/default.webp',
                provider: sttResponse.model.provider
              },
              text: sttResponse.body
            };
            
            setResult(transcriptionResult);
            setCategoryModel('stt', sttResponse.model.uid);
            // After saving, set the selected model for the current tab from the store
            const storeModelId = getCategoryModel('stt');
            if (storeModelId) {
              setTempSelectedModels([storeModelId]);
            } else {
              setTempSelectedModels([]);
            }
            saveSelectedModels('audio');
          }
        }
      } catch (error) {
        // console.error('Error loading conversation:', error);
        router.replace('/audio');
        // toast.error('Failed to load conversation');
      } finally {
        setIsLoadingConversation(false);
      }
    };

    if (generationType === 'new') {
      handleInitialResponse();
    } else if (generationType === 'load') {
      loadConversation();
    }
  }, []);

  // Load audio data and set up audio element
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const setAudioData = () => {
      // console.log("Audio metadata loaded, duration:", audio.duration);
      setDuration(audio.duration);
    };
    
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const audioEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error("Audio loading error:", e);
      console.error("Audio element error details:", {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src
      });
    };
    
    // Event listeners
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', audioEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', audioEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioRef, isLoading, audioUrl]);

  // Update audio element when audioUrl changes
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      // console.log("Setting audio source to:", audioUrl);
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Using play() returns a Promise
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // console.log("Audio playback started successfully");
            })
            .catch(error => {
              console.error("Error playing audio:", error);
              // Handle autoplay restrictions
              if (error.name === "NotAllowedError") {
                toast.error("Playback was blocked. Please interact with the page first.");
              }
            });
        }
      }
      
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error toggling playback:", error);
      toast.error("Failed to play audio");
    }
  };

  // Function to seek in the audio
  const seek = (value: number[]) => {
    if (!audioRef.current) return;
    
    const seekTime = value[0];
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
    } else {
      audioRef.current.volume = 0;
    }
    
    setIsMuted(!isMuted);
  };

  // Copy text to clipboard
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Text copied to clipboard");
  };

  // Updated downloadTranscription function with proper Alle-AI branding
  const downloadTranscription = (format: string) => {
    if (!result) return;
    
    // Common branding elements
    const logoPath = "/svg/logo-desktop-mini.webp"; // Logo path in public folder
    const brandingUrl = "https://alle-ai.com";
    const currentDate = new Date().toLocaleDateString();
    
    switch (format) {
      case 'txt':
        const content = `ALLE-AI
-----------------------------------------
Transcription of: ${originalFileName}
Model: ${result.model.name}
Duration: ${formatTime(duration)}
Words: ${result.text.split(' ').length}
Date: ${currentDate}
-----------------------------------------

${result.text}

-----------------------------------------
Generated on Alle-AI | ${brandingUrl}`;
        
        const fileName = `${result.model.name}-transcription.txt`;
        const mimeType = 'text/plain';
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        break;
        
      case 'docx':
        // Create a new document using docx library with branding
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              // Header with logo
              new Paragraph({
                children: [
                  new TextRun({
                    text: "ALLE-AI",
                    bold: true,
                    size: 36,
                    color: "#000000", // Brand color
                  }),
                ],
                alignment: "center",
              }),
              
              // Logo - Unfortunately, docx library doesn't directly support images
              // We would need to use the docx-templates package for images
              
              // Horizontal line
              new Paragraph({
                children: [
                  new TextRun({
                    text: "─".repeat(50),
                    color: "#000000",
                  }),
                ],
                spacing: { before: 200, after: 200 },
                alignment: "center",
              }),
              
              // Document title
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Transcription of ${originalFileName}`,
                    bold: true,
                    size: 28,
                  }),
                ],
                spacing: { after: 200 },
              }),
              
              // Metadata section
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Model: ${result.model.name}`,
                    size: 24,
                  }),
                ],
                spacing: { before: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Duration: ${formatTime(duration)}`,
                    size: 24,
                  }),
                ],
                spacing: { before: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Words: ${result.text.split(' ').length}`,
                    size: 24,
                  }),
                ],
                spacing: { before: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Date: ${currentDate}`,
                    size: 24,
                  }),
                ],
                spacing: { before: 100, after: 400 },
              }),
              
              // Main content
              ...result.text.split('\n\n').map(paragraph => 
                new Paragraph({
                  children: [
                    new TextRun({
                      text: paragraph,
                      size: 24,
                    }),
                  ],
                  spacing: { before: 200 },
                })
              ),
              
              // Footer with branding
              new Paragraph({
                children: [
                  new TextRun({
                    text: "─".repeat(50),
                    color: "#000000",
                  }),
                ],
                spacing: { before: 400, after: 200 },
                alignment: "center",
              }),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Generated on Alle-AI | ${brandingUrl}`,
                    size: 20,
                    color: "#000000",
                    italics: true,
                  }),
                ],
                alignment: "center",
              }),
            ],
          }],
        });
        
        // Generate and save document
        Packer.toBlob(doc).then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${result.model.name}-transcription.docx`;
          a.click();
          URL.revokeObjectURL(url);
        });
        break;
        
      case 'pdf':
        try {
          // Create a temporary HTML element with the transcription content
          const element = document.createElement('div');
          
          // Apply styles directly to the element
          element.style.fontFamily = "'Segoe UI', Arial, sans-serif";
          element.style.maxWidth = "800px";
          element.style.margin = "0 auto";
          element.style.padding = "20px";
          element.style.backgroundColor = "#ffffff";
          element.style.color = "#000000"; // Ensure text is black for visibility
          
          // HTML content with text-based branding instead of image
          element.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="margin-bottom: 15px;">
                <a href="${brandingUrl}" style="text-decoration: none; color: #000000;"><h1 style="font-size: 28px; margin-bottom: 5px; color: #000000; font-weight: bold; letter-spacing: 1px;">ALLE-AI</h1></a>
                <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Speech to Text Transcription</div>
              </div>
              <div style="border-bottom: 2px solid #000000; margin: 10px auto 20px; width: 50%;"></div>
            </div>

            <div style="margin-bottom: 25px; background-color: #f7f7f7; padding: 15px; border-radius: 6px; border: 1px solid #e0e0e0;">
              <h2 style="font-size: 16px; margin-bottom: 12px; color: #000000; font-weight: bold;">Transcription of "${originalFileName}"</h2>
              <table style="width: 100%; border-collapse: collapse; color: #000000;">
                <tr>
                  <td style="padding: 6px 0; border-bottom: 1px solid #d0d0d0; width: 100px; font-weight: bold; color: #000000;">Model:</td>
                  <td style="padding: 6px 0; border-bottom: 1px solid #d0d0d0; color: #000000;">${result.model.name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; border-bottom: 1px solid #d0d0d0; font-weight: bold; color: #000000;">Duration:</td>
                  <td style="padding: 6px 0; border-bottom: 1px solid #d0d0d0; color: #000000;">${formatTime(duration)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; border-bottom: 1px solid #d0d0d0; font-weight: bold; color: #000000;">Words:</td>
                  <td style="padding: 6px 0; border-bottom: 1px solid #d0d0d0; color: #000000;">${result.text.split(' ').length}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; border-bottom: 1px solid #d0d0d0; font-weight: bold; color: #000000;">Date:</td>
                  <td style="padding: 6px 0; border-bottom: 1px solid #d0d0d0; color: #000000;">${currentDate}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 20px; margin-bottom: 30px; color: #000000;">
              ${result.text.split('\n\n').map(para => 
                `<p style="margin-bottom: 15px; line-height: 1.6; font-size: 16px; color: #000000;">${para}</p>`
              ).join('')}
            </div>

            <div style="margin-top: 40px; border-top: 1px solid #d0d0d0; padding-top: 15px; text-align: center; font-size: 12px;">
              <p style="color: #333333;">Generated on <a href="${brandingUrl}" style="color: blue; text-decoration: none; font-weight: bold;">Alle-AI</a> | ${currentDate}</p>
            </div>
          `;
          
          // Configure pdf options
          const options = {
            margin: [15, 15, 15, 15] as [number, number, number, number], // Cast as tuple
            filename: `${result.model.name}-transcription.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
              scale: 2,
              useCORS: true,
              logging: true
            },
            jsPDF: { 
              unit: 'mm', 
              format: 'a4', 
              orientation: 'portrait',
              compress: true
            }
          };
          
          // Generate and download PDF
          html2pdf()
            .from(element)
            .set(options)
            .save()
            .catch(error => {
              console.error('PDF generation error:', error);
              toast.error('Error generating PDF: ' + error.message);
            });
        } catch (error) {
          console.error('Error generating PDF:', error);
          toast.error('Failed to generate PDF');
        }
        break;
        
      case 'srt':
        // Simple SRT format with just one subtitle for the entire text
        const srtContent = `1\n00:00:00,000 --> ${formatTime(duration).replace(':', ':')}0,000\n${result.text}`;
        const srtFileName = `${result.model.name}-transcription.srt`;
        const srtMimeType = 'text/plain';
        
        const srtBlob = new Blob([srtContent], { type: srtMimeType });
        const srtUrl = URL.createObjectURL(srtBlob);
        const srtLink = document.createElement('a');
        srtLink.href = srtUrl;
        srtLink.download = srtFileName;
        srtLink.click();
        URL.revokeObjectURL(srtUrl);
        break;
    }
    
    toast.success(`Downloaded ${result.model.name} transcription as ${format.toUpperCase()}`);
  };

  // Toggle show full text
  const toggleShowFullText = () => {
    setShowFullText(!showFullText);
  };

  // Check for text length safely
  const textIsLong = result?.text && result.text.length > 300;

  return (
    <div className={`container max-w-full mx-auto py-6 px-4 ${isOpen ? "pl-40" : "pl-6"}`}>
      {isLoadingConversation ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-4 w-4 animate-spin" />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground mt-1">
                  Transcription of <span className="font-medium">{originalFileName}</span>
                </p>
              </div>
              
              {result && !isLoading && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-3 text-xs"
                    onClick={() => result && copyText(result.text)}
                  >
                    <Copy className="h-3.5 w-3.5 mr-2" />
                    Copy
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3 text-xs"
                      >
                        <Download className="h-3.5 w-3.5 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => downloadTranscription('txt')}>
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Text (.txt)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadTranscription('docx')}>
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Document (.docx)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadTranscription('pdf')}>
                        <FileText className="h-4 w-4 mr-2" />
                        <span>PDF (.pdf)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadTranscription('srt')}>
                        <FileCode className="h-4 w-4 mr-2" />
                        <span>Subtitles (.srt)</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            
            {result && !isLoading && (
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></span>
                  <span className="font-medium mr-1">Duration:</span> {formatTime(duration)}
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-1">Words:</span> {result.text.split(' ').length}
                </div>
              </div>
            )}
          </div>
          
          {/* Modern two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
            {/* Left column - Audio player and controls */}
            <div className="md:col-span-3">
              <Card className="overflow-hidden bg-backgroundSecondary border-borderColorPrimary sticky top-6">
                <div className="p-4 flex flex-col">
                  {/* File info and model */}
                  <div className="mb-4">
                    {result ? (
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-10 w-10 border border-borderColorPrimary">
                          <AvatarImage src={result.model.avatar} alt={result.model.name} />
                          <AvatarFallback className="text-xs">
                            {result.model.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-sm">{result.model.name}</h3>
                          <p className="text-xs text-muted-foreground">{result.model.provider}</p>
                        </div>
                      </div>
                    ) : (
                      isLoading && (
                        <div className="flex items-center gap-2 mb-3">
                          {selectedModels.audio[0] && getModelInfo(selectedModels.audio[0]) ? (
                            <>
                              <div className="relative">
                                {/* <Skeleton className="h-10 w-10 rounded-full absolute inset-0" /> */}
                                <Avatar className="h-10 w-10 border border-borderColorPrimary">
                                  <AvatarImage 
                                    src={getModelInfo(selectedModels.audio[0])?.avatar} 
                                    alt={getModelInfo(selectedModels.audio[0])?.name || ''} 
                                  />
                                  <AvatarFallback className="text-xs">
                                    {getModelInfo(selectedModels.audio[0])?.name?.slice(0, 2).toUpperCase() || 'MD'}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="space-y-1.5">
                                <div className="relative">
                                  {/* <Skeleton className="h-3.5 w-20 absolute inset-0" /> */}
                                  <p className="text-sm font-medium">{getModelInfo(selectedModels.audio[0])?.name}</p>
                                </div>
                                <div className="relative">
                                  {/* <Skeleton className="h-3 w-16 absolute inset-0" /> */}
                                  <p className="text-xs text-muted-foreground">{getModelInfo(selectedModels.audio[0])?.provider}</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="space-y-1.5">
                                <Skeleton className="h-3.5 w-20" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                            </>
                          )}
                        </div>
                      )
                    )}
                    
                    {!isLoading && !audioUrl && (
                      <div className="text-xs text-amber-500 flex items-center gap-1.5 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                          <path d="M12 9v4"></path>
                          <path d="M12 17h.01"></path>
                        </svg>
                        Audio file not available for playback
                      </div>
                    )}
                  </div>
                  
                  {/* Audio Waveform Visualization - Interactive */}
                  <div 
                    className="relative h-16 mb-4 bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      if (!audioRef.current || isLoading || !audioUrl) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const clickPosition = x / rect.width;
                      const newTime = clickPosition * duration;
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }}
                  >
                    {isLoading || !audioUrl ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-pulse flex space-x-0.5">
                          {[...Array(30)].map((_, i) => (
                            <div 
                              key={i} 
                              className="h-6 w-0.5 bg-primary/30 rounded"
                              style={{ height: `${Math.random() * 12 + 4}px` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex space-x-0.5 w-full px-2">
                          {[...Array(50)].map((_, i) => {
                            // Create a pseudo-random but consistent pattern based on index
                            const heightPercent = Math.sin(i * 0.2) * 0.5 + 0.5; // Value between 0 and 1
                            const height = 4 + heightPercent * 12; // Between 4px and 16px
                            
                            // Calculate if this bar is before or after current playback position
                            const position = i / 50;
                            const playbackPosition = currentTime / duration;
                            const isPlayed = position <= playbackPosition;
                            
                            return (
                              <div 
                                key={i} 
                                className={`w-0.5 rounded transition-all duration-150 ${isPlayed ? 'bg-primary' : 'bg-primary/30'}`}
                                style={{ 
                                  height: `${height}px`,
                                  transform: isPlayed && isPlaying ? 'scaleY(1.2)' : 'scaleY(1)'
                                }}
                              ></div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Playback position indicator */}
                    {/* {!isLoading && audioUrl && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-primary/80 shadow-sm shadow-primary/30"
                        style={{
                          left: `${(currentTime / duration) * 100}%`,
                          display: duration ? 'block' : 'none'
                        }}
                      ></div>
                    )} */}
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-primary/0 hover:bg-primary/5 transition-colors duration-200"></div>
                  </div>

                  {/* Audio Controls - More compact */}
                  <div className="space-y-3">
                    <div>
                      <Slider
                        disabled={isLoading || !audioUrl}
                        value={[currentTime]}
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={seek}
                        className="cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Play/Pause Button */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={togglePlayPause}
                        disabled={isLoading || !audioUrl}
                        className="h-9 w-9 rounded-full"
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6" />
                        )}
                      </Button>

                      {/* Volume Control - Inline */}
                      <div className="flex items-center gap-1 flex-1 ml-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={toggleMute}
                          disabled={isLoading || !audioUrl}
                          className="h-7 w-7"
                        >
                          {isMuted ? (
                            <VolumeX className="h-3.5 w-3.5" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        
                        <Slider
                          disabled={isLoading || !audioUrl}
                          value={[isMuted ? 0 : volume]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={handleVolumeChange}
                          className="flex-grow"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </Card>
            </div>
            
            {/* Right column - Transcription */}
            <div className="md:col-span-9">
              <Card className="overflow-hidden bg-backgroundSecondary border-borderColorPrimary">
                <div className="p-2 md:p-6">
                  {/* Transcription Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Transcription</h3>
                  </div>
                  
                  {/* Transcription Content */}
                  {isLoading ? (
                    <div className="space-y-3 py-3">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-5/6" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-4/5" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Paragraph View */}
                      <div className={`relative rounded-lg border border-borderColorPrimary p-5 bg-black/5 dark:bg-white/5 
                        ${!showFullText && textIsLong ? 'max-h-[500px]' : 'max-h-none'} 
                        overflow-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent`}
                      >
                        {result ? (
                          <div className="space-y-6">
                            {result.text.split('\n\n').map((paragraph, index) => {
                              // Skip empty paragraphs
                              if (!paragraph.trim()) return null;
                              
                              return (
                                <div 
                                  key={index} 
                                  className="pb-4 border-b border-borderColorPrimary/20 last:border-0 group"
                                >
                                  <p className="text-foreground/90 whitespace-pre-wrap text-md leading-relaxed">
                                    {paragraph}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">No transcription available</p>
                        )}
                        
                      </div>
                      
                      {/* Show More/Less Button */}
                      {textIsLong && (
                        <Button
                          variant="ghost"
                          onClick={toggleShowFullText}
                          className="w-full mt-2 text-xs h-7"
                        >
                          {showFullText ? (
                            <>
                              Show Less <ChevronUp className="h-3 w-3 ml-1" />
                            </>
                          ) : (
                            <>
                              Show More <ChevronDown className="h-3 w-3 ml-1" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <PromptModal 
            isOpen={showPrompt} 
            onClose={() => {
              setTempSelectedModels(previousSelectedModels);
              saveSelectedModels('audio');
              setShowPrompt(false);
            }}
            closeOnOutsideClick={false} // Disable closing when clicking outside
            {...promptConfig}
          />
          <ModelSelectionModal
            isOpen={modelSelectionModalOpen}
            onClose={() => setModelSelectionModalOpen(false)}
          />
          
          {/* Hidden audio element */}
          {audioUrl && (
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              preload="metadata" 
              controls={false}
              onCanPlay={() => {}}
              onLoadedMetadata={() => {}}
              onError={(e) => {
                // console.error("Audio element error:", e);
                toast.error("Failed to load audio file");
              }}
            />
          )}
        </>
      )}
    </div>
  );
}