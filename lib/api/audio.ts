import api from './axios';

interface CreatePromptResponse {
  status: boolean;
  status_code: number;
  message: string;
  comeback_time: string;  
  id: string;
}

export const audioApi = {
  createPromptTTS: async (
    conversation: string, 
    prompt: string,
    voice?: string,
    speed?: number,
    output_format?: string,
    voice_instructions?: string
  ): Promise<CreatePromptResponse> => {
    try {
      // Simple payload with exactly what the backend needs
      const payload = {
        conversation,
        prompt,
        voice,
        speed,
        output_format,
        voice_instructions
      };
      // console.log(payload, 'This is the audio payload')
      // Simple JSON request with only required parameters
      const response = await api.post<CreatePromptResponse>('/create/prompt', payload);
      // console.log(payload, 'This is the audio payload')
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createPromptSTT: async (conversationId: string, prompt: string, options?: any) => {
    // console.log(conversationId, options);
    
    try {
      // Check if we have file content in the options
      if (options?.input_content?.uploaded_files) {
        // Create FormData for multipart/form-data request
        const formData = new FormData();
        
        // Add basic fields
        formData.append('conversation', conversationId);
        formData.append('prompt', prompt);
        
        // Add each file with proper structure for backend
        options.input_content.uploaded_files.forEach((file: any, index: number) => {
          // Add file metadata
          formData.append(`input_content[uploaded_files][${index}][file_name]`, file.file_name);
          formData.append(`input_content[uploaded_files][${index}][file_size]`, file.file_size);
          formData.append(`input_content[uploaded_files][${index}][file_type]`, file.file_type);
          
          // If file_content is a blob URL, fetch the file and append it
          if (typeof file.file_content === 'string' && file.file_content.startsWith('blob:')) {
            // We need to fetch the actual file from the blob URL
            // This will be handled in the layout component
            formData.append(`input_content[uploaded_files][${index}][file_content]`, 
              "BLOB_URL_PLACEHOLDER"); // This will be replaced with actual file
          } else if (typeof file.file_content === 'object' && file.file_content !== null) {
            // If it's already a File object, append it directly
            formData.append(`input_content[uploaded_files][${index}][file_content]`, 
              file.file_content, 
              file.file_name);
          }
        });
        
        // Send as multipart/form-data
        const response = await api.post<CreatePromptResponse>('/create/prompt', formData);
        // console.log(response.data, 'This is the response from the audio api prompt creation')
        return response.data;
      } else {
        // Regular JSON request if no files
        const response = await api.post(`/create/prompt`, {
          conversation: conversationId,
          prompt,
          ...options
        });
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  createPromptAG: async (conversationId: string, prompt: string) => {
    const response = await api.post(`/create/prompt`, {
      conversation: conversationId,
      prompt
    });
    // console.log(response.data, 'This is the response from the audio api prompt creation')
    return response.data;
  }
}
