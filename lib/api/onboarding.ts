import api from './axios';

export interface HearAboutUsParams {
  heard_from?: string;
  heard_from_user?: string;
  age_range?: string;
  intents?: string[];
  remind_later?: boolean;
}

export interface HearAboutUsResponse {
  status: boolean;
  message?: string;
}

export const onboardingApi = {
  submitHearAboutUs: async (params: HearAboutUsParams): Promise<HearAboutUsResponse> => {
    try {
      const response = await api.post('/user-survey', params);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};


