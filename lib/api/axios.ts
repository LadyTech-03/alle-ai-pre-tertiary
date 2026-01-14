import axios from "axios";
import { useAuthStore } from "@/stores";
import { extractErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add a request interceptor to include the token for all requests
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check if the request data is FormData and adjust Content-Type accordingly
    if (config.data instanceof FormData) {
      // Remove the Content-Type header to let the browser set it with the boundary
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.status === false) {
      const error = new Error(response.data.error || response.data.message || "Request failed");
      (error as any).response = response; // make it look like a normal Axios error
      return Promise.reject(error);
    }

    return response; // normal succes
  },
  (error) => {
    // console.log(error, 'axios error code');
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/auth") {
        sessionStorage.setItem("returnUrl", currentPath);
      }

      useAuthStore.getState().clearAuth();
      window.location.href = "/auth";
      return;
    }

    const message = extractErrorMessage(error);
    // Prevent duplicate toasts (optional)
    if (!axios.isCancel(error)) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
