import { toast } from 'sonner';
import api from './axios';

interface CreateConversationResponse {
    status?: boolean;
    status_code?: number | string;
    message: string;
    comeback_time: string;
    session: string;
    title: string;
    created_at?: string;
    updated_at?: string;
}

interface CreateNewConversationResponse{
    status?: boolean;
    status_code?: number | string;
    message: string;
    comeback_time: string;
    data: {
      conversation:{
        title: string;
        session: string;
        created_at?: string;
        updated_at?: string;
        shared?: boolean;
        shared_at?: any;
        project_id?: string | null;

      },
      promptData:{
        id: string;
        input_content: any
      }
    }
}

interface CreatePromptResponse {
  id: string;
  input_content: any;
  status: boolean;
  status_code: number | string;
  message: string;
  comeback_time: string;
  error?: string;
}

interface ToggleModelResponse {
  status: boolean;
  message: string;
}

interface GenerateResponseParams {
  conversation: string;  // conversation uuid
  model: string;        // model uid
  is_new: boolean;      // true for new generation
  prompt: string;       // prompt id
  prev?: [string, string][] | null; // Optional [prompt_id, response_id] pairs for continuations
}

interface GenerateResponseResult {
  status: boolean;
  message: string;
  data: {
    id: number;
    model_uid: string;
    response: string;
    model_plan: string;
    input_cost: string;
    // ... any other fields from the response
  };
}

interface CreatePromptParams {
  // conversation: string;
  // prompt: string;
  // position?: [number, number];
  input_content?: {
    uploaded_files: Array<{
      file_name: string;
      file_size: string;
      file_type: string;
      file_content: string;
    }>;
  };
}

export type LikeState = 'liked' | 'disliked' | 'none';

interface LikeStateResponse {
  status: boolean;
  message: string;
  hasDislikeFeedback?: boolean;
}

// Add this interface for the web search parameters
interface WebSearchParams {
  prompt_id: string;
  conversation_id: string;
  // follow_up: boolean;
  messages?: null | [string, string][]; // Array of [prompt_id, response_id] pairs
}

export interface Message {
  id: string;
  content: string;
  position: [number, number];
  sender: 'user' | 'ai';
  timestamp: Date;
  parentId?: string;
  summaryEnabled?: boolean;
  responses?: Array<{
    id: string;
    modelId: string;
    content: string;
    status: 'loading' | 'complete' | 'error';
    error?: string;
  }>;
}

export interface ModelResponse {
  id: string; // response ID
  modelId: string; // model_uid
  content: string;
  status: 'loading' | 'complete' | 'error';
  error?: string;
}

export interface Branch {
  id: string;
  messages: Message[];
  startPosition: [number, number];
  parentBranchId?: string;
}

export interface ChatMessageProps {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  position: [number, number];
  onEditMessage: (content: string, position: [number, number]) => void;
  totalBranches: number;
  currentBranch: number;
  onBranchChange: (index: number) => void;
  branches: Branch[];
}

interface CombinationResponse {
  status: boolean;
  message: string;
  combination: string;
  id: number;
}

interface GetCombinationParams {
  promptId: string;
  modelResponsePairs: number[];
}
interface SummaryResponse {
  status: boolean;
  message: string;
  summary: string;
  id: number;
}

interface GetSummaryParams {
  messageId: string;
  modelResponsePairs: number[];
}

interface ConversationContent {
  prompt: string;
  responses: ModelResponse[];
}

// Define the response structure for image conversations
interface LoadedImageResponse {
  prompt: string;
  prompt_id: number;
  responses: Array<{
    id: number | string;
    model: {
      provider: string;
      uid: string;
      name: string;
      image: string;
      model_plan: string;
    };
    body: string;
    liked: boolean | null;
  }>;
}

interface UpdateSummaryResponse {
  status: boolean;
  message: string;
  value: boolean;
}

interface VideoGenerationStatus {
  data: {
    message: string;
    status: "inProgress" | "Completed";
    url: string;
  }
}

interface ShareConversationResponse {
  status: boolean;
  is_shared?: boolean;
  shared_uuid?: string;
  share?: {
    id: number;
    user_id: number;
    organisation_id: number | null;
    uuid: string;
    item_id: number;
    item_type: string;
    object_shared: {
      id: number;
      user_id: number;
      title: string;
      project_id: number | null;
      uuid: string;
      ip_address: string;
      user_agent: string;
      type: string;
      organisation_id: number | null;
      shared_at: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    shared_at: string;
  };
  message: string;
}

interface CheckShareStatusResponse {
  status: boolean;
  shared: boolean;
  shared_uuid?: string;
  message: string;
}

export const chatApi = {
  // Upload a file to the backend and return its metadata (including uuid)
  uploadFile: async (
    file: File,
    project_uuid?: string | null
  ): Promise<{ success: boolean; file: { uuid: string; [key: string]: any } }> => {
    try {
      // console.log('uploading file')
      const formData = new FormData();
      formData.append('file', file);
      if (project_uuid) formData.append('project_uuid', project_uuid);

      const response = await api.post('/files', formData);
      // console.log('response from upload file', response)  
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete uploaded file
  removeFile: async (fileUuid: string): Promise<any> => {
    try {
      const response = await api.delete(`/files/${fileUuid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  
  createConversation: async (models: string[], type: 'chat' | 'image' | 'audio' | 'video', combine: boolean = false, compare: boolean = false): Promise<CreateConversationResponse> => {
    // console.log('I have created the conversation', models, type, combine, compare)
    try {
      const response = await api.post<CreateConversationResponse>('/create/conversation', {
        models,
        type,
        combine,
        compare
      });
      // console.log('Response from createConversation:', response);
      return response.data;
    } catch (error) {
      // toast.error('Something went wrong', {
      //   description: 'Please try again',
      // });
      // console.error('Error creating conversation:', error);
      throw error;
    }
  },

  newConversation: async (
    models: string[], 
    type: 'chat' | 'image' | 'audio' | 'video', 
    prompt: string, 
    combine: boolean = false, 
    compare: boolean = false, 
    web_search: boolean = false,
    project_id: string | null = null,
    options?: { input_content?: CreatePromptParams['input_content'] },
    file_uuids?: string[]
  ): Promise<CreateNewConversationResponse> => {
    try {
      // console.log('creating new conversation  with uploaded file uuids: ', file_uuids)
      const uploadedFiles = options?.input_content?.uploaded_files || [];
      const hasFileObject = uploadedFiles.some(
        file => typeof file.file_content === 'object' && file.file_content !== null &&
                'name' in file.file_content && 'size' in file.file_content && 'type' in file.file_content
      );

      if (hasFileObject) {
        const formData = new FormData();

        // Basic fields
        formData.append('models', JSON.stringify(models));
        formData.append('type', type);
        formData.append('prompt', prompt);
        formData.append('combine', combine.toString());
        formData.append('compare', compare.toString());
        formData.append('web_search', web_search.toString());
        if (project_id) formData.append('project_id', project_id);

        // Add uploaded file UUIDs if provided
        if (file_uuids && file_uuids.length > 0) {
          file_uuids.forEach((uuid, index) => {
            formData.append(`file_uuids[${index}]`, uuid);
          });
        }

        // Add files
        uploadedFiles.forEach((file, index) => {
          formData.append(`input_content[uploaded_files][${index}][file_name]`, file.file_name);
          formData.append(`input_content[uploaded_files][${index}][file_size]`, file.file_size);
          formData.append(`input_content[uploaded_files][${index}][file_type]`, file.file_type);

          if (typeof file.file_content === 'object' && file.file_content !== null &&
              'name' in file.file_content && 'size' in file.file_content && 'type' in file.file_content) {
            formData.append(`input_content[uploaded_files][${index}][file_content]`, file.file_content as Blob, (file.file_content as any).name);
          } else {
            formData.append(`input_content[uploaded_files][${index}][file_content]`, String(file.file_content));
          }
        });
        // console.log('formData', formData)

        const response = await api.post<CreateNewConversationResponse>('/create/first-prompt', formData);
        return response.data;
      } else {
        // No files, send as JSON
        // console.log(models, type, prompt, combine, compare, web_search, project_id, options?.input_content)
        const response = await api.post<CreateNewConversationResponse>('/create/first-prompt', {
          models,
          type,
          prompt,
          combine,
          compare,
          web_search,
          project_id,
          ...(file_uuids && file_uuids.length > 0 ? { file_uuids } : {}),
          ...(options?.input_content && { input_content: options.input_content })
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
      return null as any; // Return null to signal error in calling code
    }
  },

  createPrompt: async (
    conversation: string, 
    prompt: string,
    position?: [number, number],
    options?: { input_content?: CreatePromptParams['input_content'] },
    combine: boolean = false,
    compare: boolean = false,
    web_search: boolean = false,
    file_uuids?: string[]
  ): Promise<CreatePromptResponse> => {
    // console.log('creating prompt  with uploaded file uuids: ', file_uuids)
    // console.log('Prompt params', 'conversation: ', conversation, 'prompt: ', prompt, 'position: ', position, 'optionssss: ', options, 'combine: ', combine, 'compare: ', compare)
    try {
      // Check if we have file content and if it contains a File object
    const hasFileObject = options?.input_content?.uploaded_files?.some(
      file => typeof file.file_content === 'object' && file.file_content !== null && 
             'name' in file.file_content && 'size' in file.file_content && 'type' in file.file_content
    );
  
      if (hasFileObject) {

        // console.log(options, 'This is the hasObject function options')
        // Create FormData for multipart/form-data request
        const formData = new FormData();
        
        // Add basic fields
        formData.append('conversation', conversation);
        formData.append('prompt', prompt);
        
        if (position) {
          formData.append('position[0]', position[0].toString());
          formData.append('position[1]', position[1].toString());
        }

        // Add combine and compare parameters
        formData.append('combine', combine.toString());
        formData.append('compare', compare.toString());
        formData.append('web_search', web_search.toString());

        // Add uploaded file UUIDs if provided
        if (file_uuids && file_uuids.length > 0) {
          file_uuids.forEach((uuid, index) => {
            formData.append(`file_uuids[${index}]`, uuid);
          });
        }

        // Add each file with proper structure for Laravel
        if (options?.input_content?.uploaded_files) {
          options.input_content.uploaded_files.forEach((file, index) => {
            // Add file metadata
            formData.append(`input_content[uploaded_files][${index}][file_name]`, file.file_name);
            formData.append(`input_content[uploaded_files][${index}][file_size]`, file.file_size);
            formData.append(`input_content[uploaded_files][${index}][file_type]`, file.file_type);
            
            // If it's a File-like object, append it directly
          if (typeof file.file_content === 'object' && file.file_content !== null && 
            'name' in file.file_content && 'size' in file.file_content && 'type' in file.file_content) {
          formData.append(`input_content[uploaded_files][${index}][file_content]`, 
            file.file_content as Blob, 
            (file.file_content as any).name);
        } else {
          // For text content, append as string
          formData.append(`input_content[uploaded_files][${index}][file_content]`, 
            String(file.file_content));
        }
          });
        }

        // console.log('FormData for prompt:', formData);
  
        // Send as multipart/form-data (Content-Type will be set by axios interceptor)
        const response = await api.post<CreatePromptResponse>('/create/prompt', formData);

        // console.log(response, 'prompt response');
        
        return response.data;
      } else {
        // Regular JSON request for non-file content
        // console.log(conversation, prompt, position, options?.input_content, combine, compare, web_search)
        const response = await api.post<CreatePromptResponse>('/create/prompt', {
          conversation,
          prompt,
          position,
          combine,
          compare,
          web_search,
          ...(file_uuids && file_uuids.length > 0 ? { file_uuids } : {}),
          ...(options?.input_content && { input_content: options.input_content })
        });
        // console.log('promptResponse', response);
        return response.data;
      }
    } catch (error) {
      // toast.error('Something went wrong', {
      //   description: 'Please try again',
      // });
      // console.error('Error creating prompt:', error);
      throw error;
    }
  },

  toggleModelInstance: async (conversationId: string, model_uid: string, active: boolean): Promise<ToggleModelResponse> => {
    try {
      const response = await api.post<ToggleModelResponse>('/conversation-model-instance/update-active-status', {
        conversation_id: conversationId,
        model_instance: model_uid,
        active: active
      });
      // console.log('Response from toggleModelInstance:', response.data);
      // Return the response data directly since we just need to know if it was successful
      return {
        status: response.data.status,
        message: response.data.message
      };
    } catch (error) {
      // toast.error('An error occured')
      // console.error('Error toggling model instance:', error);
      throw error;
    }
  },

  generateResponse: async (params: GenerateResponseParams): Promise<GenerateResponseResult> => {
    // console.log('Generating response with params:', params);
    try {
      const response = await api.post('/ai-response', {
        conversation: params.conversation,
        model: params.model,
        is_new: params.is_new,
        prompt: params.prompt,
        prev: params.prev
      });
      // console.log('Response from generateResponse:', response);
      return response.data;
    } catch (error: any) {
      // toast.error(error.response.data.error || error.response.data.message || 'Failed to generate response')
      // toast.error(error.response.data.message || error.message || 'Failed to generate response')
      throw error;
    }
  },

  updateLikeState: async (responseId: string, state: LikeState): Promise<LikeStateResponse> => {
    // console.log('Updating like state for response:', responseId, 'to state:', state);
    try {
      const response = await api.post<LikeStateResponse>('/like-state', {
        response: responseId,
        state: state
      });
      // console.log('Response from updateLikeState:', response.data);
      return response.data;
    } catch (error: any) {
      // toast.error(error.response.data.error || error.response.data.message || 'Something went wrong')
      // console.error('Error updating like state:', error);
      throw error;
    }
  },

  webSearch: async (params: WebSearchParams): Promise<any> => {
    // console.log('web search prompt id', params.prompt_id);
    // console.log('Messages', params.messages);
    try {
      const response = await api.post('/web-search', {
        prompt_id: params.prompt_id,
        conversation_id: params.conversation_id,
        // follow_up: params.follow_up,
        messages: params.messages
      });
      // console.log('Web search response:', response.data);
      return response.data;
    } catch (error: any) {
      // toast.error(error.response.data.error || error.response.data.message || 'Error searching the web')
      // console.error('Error in web search:', error);
      throw error;
    }
  },

  getCombination: async ({ promptId, modelResponsePairs }: GetCombinationParams): Promise<CombinationResponse> => {
    // console.log('Getting combination with params:', promptId, modelResponsePairs);
    try {
      const response = await api.post('/combine', {
        prompt: promptId,
        responses: modelResponsePairs
      });
      // console.log('Combination response:', response.data);
      return response.data;
    } catch (error: any) {
      // toast.error(error.response.data.error || error.response.data.message || 'Failed to generate Combined Response')
      // console.error('Error in combination response:', error);
      throw error;
    }
  },

  getSummary: async ({ messageId, modelResponsePairs }: GetSummaryParams): Promise<SummaryResponse> => {
    // console.log('Getting summary with params:', messageId, modelResponsePairs);
    try {
      const response = await api.post('/compare', {
        prompt: messageId,
        responses: modelResponsePairs
      });
      // console.log('Combination response:', response.data);
      return response.data;
    } catch (error: any) {
      // toast.error(error.response.data.error || error.response.data.message || 'Failed to generate Compared Response')
      // console.error('Error in combination response:', error);
      throw error;
    }
  },

  getConversationContent: async (conversationType: 'chat' | 'image' | 'audio' | 'video', conversationId: string): Promise<LoadedImageResponse[]> => {
    try {
      const response = await api.get(`/conversations/${conversationType}/${conversationId}`);
      // console.log(response, 'this is the response')
      return response.data;
    } catch (error: any) {
      // toast.error(error.response.data.error || error.response.data.message || 'Failed to load conversation')
      // console.error(`Error loading ${conversationType} conversation:`, error);
      throw error;
    }
  },

  updateSummaryPreference: async (enabled: boolean): Promise<UpdateSummaryResponse> => {
    // console.log(enabled, 'this is the switch toggle from the call')
    try {
      const response = await api.post<UpdateSummaryResponse>('/summary/toggle', {
        summary_toggle_value: enabled
      });
      // console.log('Response from updateSummaryPreference:', response.data);
      return response.data;
    } catch (error) {

      // console.log('Error updating summary preference:', error);
      throw error;
    }
  },

  getModelsForConversation: async (conversationId: string) => {
    try {
      const response = await api.get(`/models/${conversationId}`);
      return response.data;
    } catch (error: any) {
      // toast.error(error.response.data.error || error.response.data.message || 'Failed to load conversation models')
      // console.error('Error getting models for conversation:', error);
      throw error;
    }
  },

  checkVideoGenerationStatus: async (responseId: string): Promise<VideoGenerationStatus> => {
    try {
      const response = await api.post(`/generation-response-status`, {
        // job_id: jobId,
        response_id: responseId
      });
      return response.data;
    } catch (error) {
      // toast.error('Failed to check video generation status')
      // console.error('Error checking video generation status:', error);
      throw error;
    }
  },

  shareConversation: async (conversationId: string): Promise<ShareConversationResponse> => {
    try {
      const response = await api.post<ShareConversationResponse>(`/share/conversation/${conversationId}`);
      return response.data;
    } catch (error) {
      // toast.error('Failed to share conversation', {
      //   description: 'Please try again',
      // });
      throw error;
    }
  },

  checkShareConversation: async (conversationId: string): Promise<ShareConversationResponse> => {
    try {
      const response = await api.get<ShareConversationResponse>(`/conversation/${conversationId}/is_shared`);
      return response.data;
    } catch (error) {
      // toast.error('Failed to share conversation', {
      //   description: 'Please try again',
      // });
      throw error;
    }
  },

  getShareConversation: async (shareUuid: string): Promise<LoadedImageResponse[]> => {
    try {
      const response = await api.get(`/share/${shareUuid}/content`);
      return response.data;
    } catch (error: any) {
      console.error(`Error loading shared conversation:`, error);
      throw error;
    }
  },

  replicateSharedConversation: async (shareUuid: string): Promise<any> => {
    try {
      const response = await api.post(`/share/${shareUuid}`);
      return response.data;
    } catch (error: any) {
      // console.error('Error replicating shared conversation:', error);
      throw error;
    }
  },
};