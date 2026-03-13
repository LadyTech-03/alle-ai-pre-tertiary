import api from './axios';

export interface StartSessionParams {
    name: string;
    class_group: string;
}

export interface StartSessionResponse {
    success: boolean;
    to: string;
    device_session: string;
    session_user: {
        name: string;
        class_group_name: string;
    };
    message: string;
}

export interface EndSessionResponse {
    success: boolean;
    message: string;
}

// Define the shape of a class group
export interface ClassGroup {
    name: string;
    slug: string;
    admin_id?: number;
    free_chat?: boolean;
}

export interface GetClassGroupsResponse {
    status: boolean;
    data: ClassGroup[];
}

export const orgDeviceApi = {
    startSession: async (orgId: string | number, params: StartSessionParams): Promise<StartSessionResponse> => {
        try {
            const response = await api.post<StartSessionResponse>(`/organisations/${orgId}/start-device-session`, params);
            return response.data;
        } catch (error) {
            console.error('Error starting device session:', error);
            throw error;
        }
    },

    endSession: async (orgId: string | number): Promise<EndSessionResponse> => {
        try {
            const response = await api.post<EndSessionResponse>(`/organisations/${orgId}/end-device-session`);
            return response.data;
        } catch (error) {
            console.error('Error ending device session:', error);
            throw error;
        }
    },

    getClassGroups: async (orgId: string | number): Promise<GetClassGroupsResponse> => {
        try {
            const response = await api.get<GetClassGroupsResponse>(`/organisations/${orgId}/class-groups`);
            return response.data;
        } catch (error) {
            console.error('Error fetching class groups:', error);
            throw error;
        }
    }
};
