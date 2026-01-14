import { toast } from "sonner";
import api from "./axios";

export interface Model {
  model_uid: string;
  active: number;
  model_provider: string;
  model_name: string;
  model_image: string;
  model_plan: "free" | "standard" | "plus" | "custom" ;
  model_category?: "tts" | "stt" | "ag";
  preview?: string;
  favorite: boolean;
  response?: string;
  input_params?: Record<string, any>;
  valid_inputs?: string[];
  is_thinking_model?: boolean;
}

export interface ModelsResponse extends Array<Model> {}

export type ModelType = "chat" | "image" | "audio" | "video";

export const modelsApi = {
  getModels: async (type: ModelType): Promise<Model[]> => {
    try {
      const response = await api.get<ModelsResponse>(`/models/${type}`);
      return response.data;
    } catch (error: any) {
      // toast.error(error.response.data.error || error.response.data.message || 'Failed to fetch models');
      // console.error(`Error fetching ${type} models:`, error);
      throw error;
    }
  },

  toggleFavorite: async (
    modelUid: string,
    state: boolean
  ): Promise<{ success: boolean }> => {
    try {
      const response = await api.post("/models/favorite", {
        model: modelUid,
        state: state,
      });
      return response.data;
    } catch (error: any) {
      // toast.error(error.response.data.error || error.response.data.message || 'Failed to toggle favorite');
      // console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  getLatestSelectedModels: async (type: ModelType): Promise<Model[]> => {
    try {
      const response = await api.get(`/models/${type}/latest`);
      // console.log('Latest selected models response:', response.data);
      return response.data;
    } catch (error: any) {
      // toast.error(error.response.data.error || error.response.data.message || 'Failed to load last used models');
      // console.error('Error fetching latest selected models:', error);
      throw error;
    }
  },
};
