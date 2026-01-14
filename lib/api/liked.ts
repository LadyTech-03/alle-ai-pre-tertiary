import api from './axios';
import { toast } from 'sonner';

export interface LikedResponse {
    id: string | number;
    type: 'image' | 'video' | 'audio';
    body: string; // URL
    liked: number; // 1 for liked
    model: {
      uid: string;
      name: string;
      provider: string;
      image: string;
      model_plan: string;
    };
  }

export interface GetLikedResponsesResult {
  status: boolean;
  message: string;
  data: LikedResponse[];
}

export const likedApi = {
  getLikedResponses: async (): Promise<GetLikedResponsesResult> => {
    try {
      const response = await api.get<GetLikedResponsesResult>('/liked-responses');
      // console.log('Liked responses:', response.data);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to load favorite media');
      // console.error('Error fetching liked responses:', error);
      throw error;
    }
  },
  getLikedImageResponses: async (): Promise<GetLikedResponsesResult> => {
    try {
      const response = await api.get<GetLikedResponsesResult>('/liked-responses/image');
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to load favorite images');
      throw error;
    }
  },
  getLikedVideoResponses: async (): Promise<GetLikedResponsesResult> => {
    try {
      const response = await api.get<GetLikedResponsesResult>('/liked-responses/video');
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to load favorite video');
      throw error;
    }
  },
  getLikedAudioResponses: async (): Promise<GetLikedResponsesResult> => {
    try {
      const response = await api.get<GetLikedResponsesResult>('/liked-responses/audio');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};