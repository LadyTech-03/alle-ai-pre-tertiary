import api from './axios';
import { toast } from 'sonner';

interface ProfileUpdateResponse {
  status: boolean;
  message: string;
  user: {
    first_name: string;
    last_name: string;
    photo_url: string;
  };
}

interface ProfileUpdateParams {
  firstname: string;
  lastname: string;
  profile_photo?: File;
}

export const profileApi = {
  updateProfile: async (params: ProfileUpdateParams): Promise<ProfileUpdateResponse> => {
    // console.log(params.profile_photo, 'This is the profile photo of the user')
    try {
      // Create FormData object to handle file upload
      const formData = new FormData();
      formData.append('firstname', params.firstname);
      formData.append('lastname', params.lastname);
      if (params.profile_photo) {
        formData.append('profile_photo', params.profile_photo);
      }

      const response = await api.post<ProfileUpdateResponse>('/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // console.log('Profile update response:', response.data);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to update profile');
      // console.error('Error updating profile:', error);
      throw error;
    }
  },
};