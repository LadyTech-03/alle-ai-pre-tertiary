import { toast } from 'sonner';
import api from './axios';


export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface Project {
  data: {
    id: number;
    uuid: string;
    name: string;
    description: string;
    instructions: null | string;
    uploaded_files: null | any[];
    created_at?: string;
    updated_at?: string;
    color_code?: string;
    status?: string;
    error?: string;
    message?: string;
  },
  id: number;
  uuid: string;
  name: string;
  description: string;
  instructions: null | string;
  uploaded_files: null | any[];
  created_at?: string;
  updated_at?: string;
  color_code?: string;
  status?: boolean;
  message?: string;
  error?: string;
}

export interface ProjectResponse {
  status?: boolean;
  message?: string;
  data?: Project;
}

export interface ProjectsListResponse {
  status?: boolean;
  message?: string;
  data?: Project[];
}

export interface ProjectFile {
  file_name: string;
  file_size: string;
  file_type: string;
  file_extension: string;
  file_url: string | null;
  file_content: string | null;
}

interface CreateConversationResponse {
  data: {
    status: boolean;
    status_code: number | string;
    message: string;
    comeback_time: string;
    session: string;
    title: string;
    created_at?: string;
    updated_at?: string;
  }
  comeback_time: string;
  status_code: number | string;
  message: string;
  status?: boolean;
  error?: string;
}

interface CreateNewConversationResponse{
    status?: boolean;
    status_code?: number | string;
    message: string;
    error?: string;
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

interface ProjectConversation {
  title: string;
  session: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export const projectApi = {
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await api.post('/projects', data);
    // console.log('Create project response:', response.data);
    return response.data;
  },
  
  getProjects: async (): Promise<Project[]> => {    
    const response = await api.get('/projects');
    // console.log('Get projects response:', response.data);
    return Array.isArray(response.data.data) ? response.data.data : [];
  },
  
  getProject: async (projectId: number|string): Promise<Project> => {
    const response = await api.get(`/projects/${projectId}`);
    if (response.data.status === false) {
      throw new Error(response.data.error || response.data.message);
    }
    // console.log('Get project response:', response.data);
    return response.data;
  },
  
  renameProject: async (projectId: number|string, name: string): Promise<Project> => {
    const response = await api.post(`/projects/${projectId}/update`, { name });
    if (response.data.status === false) {
      throw new Error(response.data.error || response.data.message);
    }
    // console.log('Rename project response:', response.data);
    return response.data;
  },
  
  editProject: async (projectId: number|string, data: { name?: string; description?: string }): Promise<Project> => {
    const response = await api.post(`/projects/${projectId}/update`, data);
    if (response.data.status === false) {
      throw new Error(response.data.error || response.data.message);
    }
    // console.log('Edit project response:', response.data);
    return response.data;
  },
  
  deleteProject: async (projectId: number|string): Promise<any> => {
    const response = await api.delete(`/projects/${projectId}/delete`);
    if (response.data.status === false) {
      throw new Error(response.data.error || response.data.message);
    }
    // console.log('Delete project response:', response.data);
    return response.data;
  },
  
  setProjectInstructions: async (projectId: number|string, instructions: string): Promise<Project> => {
    const response = await api.post(`/projects/${projectId}/instructions`, { instructions });
    if (response.data.status === false) {
      throw new Error(response.data.error || response.data.message);
    }
    // console.log('Set project instructions response:', response.data);
    return response.data;
  },
  
  uploadProjectFiles: async (projectId: number|string, files: ProjectFile[]): Promise<Project> => {
    const response = await api.post(`/projects/${projectId}/upload`, { files });
    if (response.data.status === false) {
      throw new Error(response.data.error || response.data.message);
    }
    // console.log('Upload project files response:', response.data);
    return response.data;
  },
  
  getProjectFiles: async (projectId: number|string): Promise<any> => {
    const response = await api.get(`/projects/${projectId}/files`);
    if (response.data.status === false) {
      throw new Error(response.data.error || response.data.message);
    }
    // console.log('Get project files response:', response.data);
    return response.data.data;
  },

  updateProjectColor: async (projectId: number|string, color_code: string): Promise<Project> => {
    const response = await api.post(`/projects/${projectId}/color`, { color_code });
    if (response.data.status === false) {
      throw new Error(response.data.error || response.data.message);
    }
    // console.log('Update project color response:', response.data);
    return response.data;
  },
  
  removeProjectFiles: async (projectId: number|string, selectedFiles: number[]): Promise<any> => {
    // console.log('I removed', selectedFiles);
    const response = await api.post(`/projects/${projectId}/remove_files`, { selected_files: selectedFiles });
    if (response.data.status === false) {
      throw new Error(response.data.error || response.data.message);
    }
    // console.log('Remove project files response:', response.data);
    return response.data;
  },

  createProjectConversation: async (models: string[], type: 'chat' | 'image' | 'audio' | 'video', project_id: string, combine: boolean = false, compare: boolean = false): Promise<CreateConversationResponse> => {
    try {
      const response = await api.post<CreateConversationResponse>('/create/conversation', {
        models,
        type,
        project_id,
        combine,
        compare
      });
      // console.log('Response from createConversation:', response.data);
      return response.data;
    } catch (error) {
      // console.error('Error creating conversation:', error);
      throw error;
    }
  },


    createNewProjectConversation: async (
      models: string[], 
      type: 'chat' | 'image' | 'audio' | 'video', 
      prompt: string, 
      combine: boolean = false, 
      compare: boolean = false, 
      web_search: boolean = false,
      project_id: string | null = null,
      options?: { input_content?: CreatePromptParams['input_content'] },
    ): Promise<CreateNewConversationResponse> => {
      try {
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
            ...(options?.input_content && { input_content: options.input_content })
          });
          return response.data;
        }
      } catch (error: any) {
        // toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to create conversation');
        throw error;
      }
    },

  getProjectConversations: async (projectId: number|string): Promise<ProjectConversation[]> => {
    // console.log('fetching project conversation')
    try {
      const response = await api.get(`/projects/${projectId}/conversations`);
      if (response.data.status === false) {
        throw new Error(response.data.error || response.data.message);
      }
      // console.log('Project conversations response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      // toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to load project conversations');
      throw error;
    }
  },
}; 