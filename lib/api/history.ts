import { toast } from 'sonner';
import api from './axios';

export interface HistoryItem {
  id: string;
  title: string;
  session: string;
  conversation_category?: string;
  type: 'chat' | 'image' | 'audio' | 'video';
  created_at: string;
  updated_at: string;
}

export interface HistoryResponse {
  data: HistoryItem[];
  page: number;
  hasMore: boolean;
}

interface GetTitleResponse {
  status: boolean;
  title: string;
}

interface DeleteHistoryResponse {
  message: string;
  deleted_at: string | null;
  status: boolean;
}


export const historyApi = {
  getHistory: async (type: string, page: number = 1): Promise<HistoryResponse> => {
    try {
      const response = await api.get(`/conversations/${type}`, {
        params: { page }
      });
      // console.log('History response:', response.data);
      return {
        data: response.data.map((item: any) => ({
          id: item.session,
          title: item.title,
          session: item.session,
          conversation_category: item.conversation_category,
          type: type as 'chat' | 'image' | 'audio' | 'video',
          timestamp: new Date(item.created_at || Date.now()),
          created_at: item.created_at,
          updated_at: item.updated_at
        })),
        page,
        hasMore: response.data.length > 0
      };
    } catch (error: any) {
        //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to load history');
      // console.error(`Error fetching ${type} history:`, error);
      throw error;
    }
  },

  getConversationTitle: async (conversation: string, prompt: string, type: string): Promise<GetTitleResponse> => {
    try {
      const response = await api.post<GetTitleResponse>('/get-title', {
        conversation: conversation,
        prompt: prompt,
        type: type as 'chat' | 'image' | 'audio' | 'video',
      });
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to get conversation title');
      // console.error('Error getting conversation title:', error);
      throw error;
    }
  },

  renameConversation: async (conversation: string, new_name: string): Promise<GetTitleResponse> => {
    try {
      const response = await api.post<GetTitleResponse>(`/conversation/title/${conversation}`, {
        conversation,
        title: new_name,
      });
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to rename conversation');
      // console.error('Error getting conversation title:', error);
      throw error;
    }
  },

  deleteHistory: async (conversation: string): Promise<DeleteHistoryResponse> => {
    // console.log('Deleting history for conversation:', conversation);
    try {
      const response = await api.delete<DeleteHistoryResponse>(`/delete/conversation/${conversation}`, {
        data: {
          conversation,
        }
      });
      
      // console.log('Delete history key response:', response.data);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to delete history');
      // console.error('Error deleting history key:', error);
      throw error;
    }
  },

  moveConversation: async (conversation: string, projectId?: number | string | null): Promise<any> => {
    try {
      const body = (projectId === undefined)
        ? { project: null }
        : { project: projectId ?? null };
      const response = await api.post(`/conversation/move/${conversation}`, body);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to move conversation');
      throw error;
    }
  },
};
