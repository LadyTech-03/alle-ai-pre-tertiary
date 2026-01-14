import { toast } from 'sonner';
import api from './axios';
import { InvoicesResponse } from '@/lib/types';

interface PaymentMethodResponse {
  status: boolean;
  message: string;
  payment_method: {
    id: string;
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
  };
}

interface ProcessPaymentResponse {
  status: boolean;
  transaction_id: string;
  amount: number;
  client_secret: string;
  payment_intent: {
    credit_balance: number;
  };
  payment_method?: {
    id: string;
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
  };
}

interface PayWithSavedCardResponse {
    success: boolean;
    transaction_id: string;
    amount: number;
    client_secret: string;
  }

interface CreditDetails {
  success: boolean;
  credit_balance: number;
  payment_methods: {
    id: string;
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
  };
  auto_reload?: {
    threshold: number;
    amount: number;
    payment_method_id: string;
    enabled: boolean;
  };
}

interface RemovePaymentMethodResponse {
  status: boolean;
}

interface AutoReloadSetupResponse {
  success: boolean;
  auto_reload: {
    threshold: number;
    amount: number;
    payment_method_id: string;
    enabled: boolean;
  };
}

interface SetDefaultPaymentMethodResponse {
  status: boolean;
  message: string;
}

export const paymentApi = {
  savePaymentMethod: async (stripePaymentMethod: any): Promise<PaymentMethodResponse> => {
    try {
      const response = await api.post<PaymentMethodResponse>('/save-card-details', {
        payment_method: stripePaymentMethod
      });

      // console.log('Save payment method response:', response.data);
      if (!response.data.status) {
        toast.info( '', {
          description: response.data.message  || `You've reached the maximum number of payment methods.`
        });
        return response.data;
      }
      
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.message || error?.message || 'Something went wrong');
      // console.error('Error saving payment method:', error);
      throw error;
    }
  },

  processPayment: async (stripePaymentMethod: any, amount: number, save: boolean): Promise<ProcessPaymentResponse> => {
    try {
      const response = await api.post<ProcessPaymentResponse>('/initiate-payment', {
        payment_method: stripePaymentMethod,
        amount: amount,
        save_card: save
      });
      
      // console.log('Process payment response:', response.data);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.message || error?.message || 'Something went wrong');
      // console.error('Error processing payment:', error);
      throw error;
    }
  },

  payWithSavedCard: async (paymentMethodId: string, amount: number): Promise<PayWithSavedCardResponse> => {
    try {
      const response = await api.post<PayWithSavedCardResponse>('/card-initiate-payment', {
        payment_method_id: paymentMethodId,
        amount: amount
      });
      
      // console.log('Pay with saved card response:', response.data);
      return response.data;
    } catch (error: any) {
      // console.error('Error paying with saved card:', error);
      toast.error( error?.response?.data?.message || error?.message || 'Something went wrong');
      throw error;
    }
  },

  removePaymentMethod: async (paymentMethodId: string): Promise<RemovePaymentMethodResponse> => {
    // console.log('remove payment params:', paymentMethodId);
    try {
      const response = await api.post<RemovePaymentMethodResponse>('/remove-payment-method', {
        payment_method_id: paymentMethodId
      });
      
      // console.log('Remove payment method response:', response);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.message || error?.message || 'Something went wrong');
      // console.error('Error removing payment method:', error);
      throw error;
    }
  },

  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<SetDefaultPaymentMethodResponse> => {
    try {
      const response = await api.post<SetDefaultPaymentMethodResponse>('/payment-method/default', {
        payment_method_id: paymentMethodId
      });
      
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.message || error?.message || 'Something went wrong');
      // console.error('Error setting default payment method:', error);
      throw error;
    }
  },

  setupAutoReload: async (
    threshold: number,
    amount: number,
    paymentMethodId: string,
    enabled: boolean = true
  ): Promise<AutoReloadSetupResponse> => {
    try {
      const response = await api.post<AutoReloadSetupResponse>('/setup-auto-reload', {
        threshold,
        amount,
        payment_method_id: paymentMethodId,
        enabled
      });
      
      // console.log('Auto reload setup response:', response.data);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.message || error?.message || 'Something went wrong');
      // console.error('Error setting up auto reload:', error);
      throw error;
    }
  },

  getCreditDetails: async (): Promise<CreditDetails> => {
    try {
      const response = await api.get<CreditDetails>('/payment_methods');
      // console.log('Credit details response:', response.data);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.message || error?.message || 'Something went wrong');
      // console.error('Error fetching credit details:', error);
      throw error;
    }
  },

  getDefaultPaymentMethod: async (): Promise<{
    status: boolean;
    payment_method: {
      id: string;
      last4: string;
      brand: string;
      exp_month: number;
      exp_year: number;
    };
  }> => {
    try {
      const response = await api.get('/payment-method/default');
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.message || error?.message || 'Something went wrong');
      throw error;
    }
  },

  getInvoices: async (): Promise<InvoicesResponse> => {
    try {
      const response = await api.get<InvoicesResponse>('/invoices');
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.message || error?.message || 'Failed to fetch invoices');
      throw error;
    }
  }
};