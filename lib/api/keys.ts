import api from './axios';
import { toast } from 'sonner';

interface CreateApiKeyResponse {
  status: boolean;
  id: number;
  key: string;
  name: string;
  last_used_at: string;
  created_at: string;
}

interface CreateApiKeyParams {
  name: string;
}

interface EditApiKeyResponse {
  status: boolean;
  message: string;
  api_key: {
    id: number;
    name: string;
  };
}

interface EditApiKeyParams {
  id: number;
  name: string;
}

interface ToggleApiKeyResponse {
  message: string;
  active: boolean;
}

interface DeleteApiKeyResponse {
  message: string;
  deleted_at: string | null;
}

export interface ApiKeyData {
  id: number;
  name: string;
  key: string;
  active: number;
  last_used_at: string;
  created_at: string;
}

export const keysApi = {
  createApiKey: async (params: CreateApiKeyParams): Promise<CreateApiKeyResponse> => {
    try {
      const response = await api.post<CreateApiKeyResponse>('/api-keys/create', {
        name: params.name
      });
      
      // console.log('Create API key response:', response.data);
      return response.data;
    } catch (error: any) {
      toast.error( error?.response?.data?.error || error?.response?.data?.message || 'Failed to create key');
      // console.error('Error creating API key:', error);
      throw error;
    }
  },

  editApiKey: async (params: EditApiKeyParams): Promise<EditApiKeyResponse> => {
    try {
      const response = await api.post<EditApiKeyResponse>(`/api-keys/${params.id}`, {
        id: params.id,
        name: params.name
      });
      
      // console.log('Edit API key response:', response.data);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to edit key');
      // console.error('Error editing API key:', error);
      throw error;
    }
  },

  getAllApiKeys: async (): Promise<ApiKeyData[]> => {
    try {
      const response = await api.get<ApiKeyData[]>('/api-keys');
      // console.log('Get all API keys response:', response.data);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to get keys');
      // console.error('Error getting API keys:', error);
      throw error;
    }
  },

  disableApiKey: async (id: string): Promise<ToggleApiKeyResponse> => {
    try {
      const response = await api.post<ToggleApiKeyResponse>(`/api-keys/${id}/disable`, {
        id: parseInt(id)
      });
      
      // console.log('Disable API key response:', response.data);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to disable key');
      // console.error('Error disabling API key:', error);
      throw error;
    }
  },

  enableApiKey: async (id: string): Promise<ToggleApiKeyResponse> => {
    try {
      const response = await api.post<ToggleApiKeyResponse>(`/api-keys/${id}/enable`, {
        id: parseInt(id)
      });
      
      // console.log('Enable API key response:', response);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to enable key');
      // console.error('Error enabling API key:', error);
      throw error;
    }
  },

  deleteApiKey: async (id: string): Promise<DeleteApiKeyResponse> => {
    try {
      const response = await api.delete<DeleteApiKeyResponse>(`/api-keys/${id}`, {
        data: {
          id: parseInt(id)
        }
      });
      
      // console.log('Delete API key response:', response.data);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to delete key');
      // console.error('Error deleting API key:', error);
      throw error;
    }
  },
};