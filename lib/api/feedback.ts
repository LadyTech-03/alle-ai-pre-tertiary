import api from './axios';

interface FeedbackResponse {
  status: boolean;
  message: string;
}

interface FeedbackParams {
  message: string;
  rating?: number;
  anonymous: boolean;
  response_id?: string;
}

export const feedbackApi = {
  submitFeedback: async (params: FeedbackParams): Promise<FeedbackResponse> => {
    try {
      const response = await api.post<FeedbackResponse>('/feedback', {
        message: params.message,
        rating: params.rating,
        anonymous: params.anonymous,
        response_id: params.response_id
      });
      // console.log('Response from submitFeedback:', response.data);
      return response.data;
    } catch (error) {
      // console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  submitCancellationFeedback: async (params: {
    reason: string;
  }): Promise<FeedbackResponse> => {
    try {
      const response = await api.post<FeedbackResponse>('/cancellation-feedback', {
        reason: params.reason,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};