"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ProjectView } from "@/components/features/projects/ProjectView";
import { useProjectStore, useSelectedModelsStore } from "@/stores";
import { Loader } from "lucide-react";
import { Model, modelsApi } from "@/lib/api/models";
import { useModelsStore } from "@/stores/models";


export default function ProjectPage() {
  const { 
    selectedModels,
    setTempSelectedModels, 
    saveSelectedModels, 
    setLoadingLatest,
    setInitialized, 
  } = useSelectedModelsStore();

  const { chatModels, setChatModels, setLoading: setModelsLoading, setError: setModelsError } = useModelsStore();

  const preferredOrder = ['gpt-4-5', 'o3-mini', 'deepseek-r1', 'grok-2-vision', 'o1', 'claude-3-5-sonnet', 'llama-3-1-70b-instruct', 'gpt-4o', 'claude-3-sonnet', 'grok-2', 'gemini-1-5-pro', 'llama-3-70b-instruct', 'deepseek-v3', 'mixtral-8x7b-instruct', 'gpt-4', 'o1-mini', 'phi-4'];

    // Load chat models on mount if not already loaded
    useEffect(() => {
      const loadChatModels = async () => {
        if (chatModels && chatModels.length > 0) {
          loadLatestSelectedModels();
          return;
        }
        setLoadingLatest(true);
        setModelsLoading(true);
        try {
          const models = await modelsApi.getModels('chat');
  
          const sortedChatModels = models.sort((a, b) => {
            const indexA = preferredOrder.indexOf(a.model_uid);
            const indexB = preferredOrder.indexOf(b.model_uid);
          
            // If both models are in the preferred order, sort by their index
            if (indexA !== -1 && indexB !== -1) {
              return indexA - indexB;
            }
            
            // If only a is in the preferred order, it should come first
            if (indexA !== -1) return -1;
            
            // If only b is in the preferred order, it should come first
            if (indexB !== -1) return 1;
          
            // If neither are in the preferred order, maintain their original order
            return 0;
          });
          setChatModels(sortedChatModels);
          
          // Now that we have chat models, load the latest selected models
          await loadLatestSelectedModels();
        } catch (err: any) {
          setModelsError(err.response.data.error || err.response.data.message || 'Failed to load chat models');
        } finally {
          setModelsLoading(false);
        }
      };
  
      // Define loadLatestSelectedModels inside the first useEffect
      const loadLatestSelectedModels = async () => {
        // If we already have selected models for chat, skip loading
        if (selectedModels.chat && selectedModels.chat.length > 0) return;
  
        setLoadingLatest(true);
        try {
          const latestModels = await modelsApi.getLatestSelectedModels('chat');
          const modelUids = latestModels.map(model => model.model_uid);
          // console.log(latestModels, 'Latest Used Models')
          // console.log(modelUids, 'Latest Used Model UIDS')
          setTempSelectedModels(modelUids);
          saveSelectedModels('chat');
  
          // Toggle inactive models using toggleModelActive
          latestModels.forEach((model: Model) => {
            if (model.active === 0) {
              useSelectedModelsStore.getState().toggleModelActive(model.model_uid);
            }
          });
  
        } catch (err: any) {
            return;
        } finally {
          setLoadingLatest(false);
          setInitialized(true);
        }
      };
  
      loadChatModels();
    }, [setChatModels, setModelsLoading, setModelsError, selectedModels.chat, chatModels]);

  return null;
  
} 