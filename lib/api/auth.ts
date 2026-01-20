import { toast } from "sonner";
import api from "./axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  status: boolean;
  error?: string;
  message?: string;
  data: {
    to: string;
    token: string;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      is_verified: boolean;
      created_at: string;
      updated_at: string;
      ip_address: string;
      user_agent: string;
      registration_type: string;
      email_verified_at?: string | null;
    };
  };
}

export interface AuthResponse {
  status: boolean;
  data: {
    user: User;
    is_verified: boolean;
    to: string;
  };
  message: string;
  plan: string | null;
}
export interface OrganisationDetails {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  website_url: string;
  organisation_plan: string;
}

export interface LoginResponse {
  status: boolean;
  error?: string;
  data: {
    plan: string | null;
    to: string;
    token: string;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      is_verified: boolean;
      created_at: string;
      updated_at: string;
      ip_address: string;
      user_agent: string;
      registration_type: string;
      email_verified_at?: string | null;
      survey_remind?: boolean;
    };
  };
  organisationDetails?: OrganisationDetails;
}

interface ForgotPasswordResponse {
  status: boolean;
  message: string;
}

interface ResendVerificationResponse {
  status: boolean;
  message?: string;
  data: {
    to: string;
  };
}

interface CheckoutResponse {
  status: boolean;
  to: string;
  message?: string;
}

interface BillingPortalResponse {
  status: boolean;
  url?: string;
  message?: string;
}

interface SwitchSubscriptionResponse {
  status: boolean;
  message?: string;
  to?: string;
  subscription?: {
    name: string;
    stripe_status: string;
    price_id: string;
    plan: string; // e.g. "plus_yearly"
    trial_ends_at?: string | null;
    ends_at?: string | null;
  };
  requires_action?: boolean;
  payment_intent?: string;
  client_secret?: string;
  payment_status?: string;
  last_payment_error?: string;
}

interface CancelSubscriptionResponse {
  status: boolean;
  message: string;
  ends_at?: string;
}

interface ProrationDetailsResponse {
  status: boolean;
  message: string;
  proration: {
    amount_due: number;
    prorated_credit: number;
    prorated_charge: number;
    next_billing_date: string;
  };
}

interface DeleteAccountResponse {
  status: boolean;
  message: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  ip_address: string;
  user_agent: string;
  registration_type: string;
  email_verified_at?: string | null;
  photo_url?: string | null;
  google_id?: string | null;
  stripe_id?: string | null;
  pm_type?: string | null;
  pm_last_four?: string | null;
  referral_code?: string;
  referral_balance?: string;
  referral_amount_used?: string;
  combination?: number;
  comparison?: number;
  summary?: number;
  trial_ends_at?: string | null;
  subscription_cancel_at?: string | null;
  subscriptions?: any[];
  survey_remind?: boolean;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post("/login", credentials);
    // console.log('login response data', response.data);
    return response.data;
  },

  register: async (
    credentials: RegisterCredentials,
  ): Promise<RegisterResponse> => {
    const response = await api.post("/register", credentials);
    // console.log('register data', response.data);
    return response.data;
  },

  exchangeCode: async (code: string, orgId: string): Promise<LoginResponse> => {
    const response = await api.post(`/organisations/${orgId}/code-exchange`, {
      exchange_token: code,
    });
    return response.data;
  },

  handleGoogleCallback: async () => {
    try {
      const response = await api.get(`/auth/google`);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to handle Google callback');
      // console.error('Error handling Google callback:', error);
      throw error;
    }
  },

  logout: async () => {
    const response = await api.post("/logout");
    // console.log(response,'logged out')
    return response.data;
  },

  getUser: async (): Promise<AuthResponse> => {
    const response = await api.post("/auth");
    // console.log('checked', response.data);
    return response.data;
  },

  verifyEmail: async (data: { code: string }) => {
    try {
      const response = await api.post("/email/verify", data);
      // console.log('verification data', response);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to verify email');
      // console.error('Verification API error:', {
      //   status: error.response?.status,
      //   data: error.response?.data,
      //   code: data.code
      // });
      throw error;
    }
  },

  resendVerification: async (): Promise<ResendVerificationResponse> => {
    try {
      const response = await api.post("/resend/code");
      if (!response.data.status) {
        toast.error(response.data.message || "Failed to send code");
        throw new Error(response.data.message || "Failed to send code");
      }
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to send code');
      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await api.post("/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    const response = await api.post("/reset-password", data);
    return response.data;
  },

  verifyResetToken: async (data: { email: string; token: string }) => {
    const response = await api.post("/verify/token", data);
    return response.data;
  },

  checkout: async (data: {
    plan: "free" | "standard" | "plus" | "custom" | "pro";
    billing_cycle: "monthly" | "yearly";
  }): Promise<CheckoutResponse> => {
    const response = await api.post("/checkout", data);
    return response.data;
  },

  switchSubscription: async (data: {
    plan: string;
    invoice_now: boolean;
    prorate: boolean;
    anchor_now: boolean;
  }): Promise<SwitchSubscriptionResponse> => {
    // console.log('switchSubscription data', data);
    const response = await api.post("/subscription/switch", data);
    return response.data;
  },

  cancelSubscription: async (data: {
    immediately: boolean;
  }): Promise<CancelSubscriptionResponse> => {
    const response = await api.post("/subscription/cancel", data);
    return response.data;
  },

  deleteAccount: async (password: string): Promise<DeleteAccountResponse> => {
    const response = await api.post("/delete-account", { password });
    return response.data;
  },

  getBillingPortal: async (
    returnUrl: string,
  ): Promise<BillingPortalResponse> => {
    try {
      const response = await api.post("/billing-portal", {
        return_url: returnUrl,
      });
      return response.data;
    } catch (error) {
      // console.error('Error accessing billing portal:', error);
      throw error;
    }
  },

  getProrationDetails: async (data: {
    plan: string;
    invoice_now: boolean;
    prorate: boolean;
    anchor_now: boolean;
  }): Promise<ProrationDetailsResponse> => {
    const response = await api.post("/subscription/proration_details", data);
    return response.data;
  },

  getNextBillingDate: async (): Promise<{
    status: boolean;
    next_billing_date?: string;
    message?: string;
  }> => {
    const response = await api.get("/nextBillingDate");
    return response.data;
  },

  keepSubscription: async (): Promise<{
    status: boolean;
    message?: string;
  }> => {
    const response = await api.post("/keep-subscription");
    return response.data;
  },
};
