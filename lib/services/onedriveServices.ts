declare global {
    interface Window {
      OneDrive: {
        open(options: {
          clientId: string;
          action: "share" | "download" | "query";
          multiSelect?: boolean;
          advanced?: {
            filter?: string;
            redirectUri?: string;
          };
          success: (response: OneDriveResponse) => void;
          cancel?: () => void;
          error?: (error: Error) => void;
        }): void;
      }
    }
  }
  
  export interface OneDriveFile {
    id: string;
    name: string;
    size: number;
    webUrl: string;
    "@microsoft.graph.downloadUrl": string;
    file: {
      mimeType: string;
    };
  }
  
  export interface OneDriveResponse {
    value: OneDriveFile[];
  }
  
  class OneDriveService {
    private static instance: OneDriveService;
    private isInitialized: boolean = false;
  
    private constructor() {
      this.initializeSDK();
    }
  
    private initializeSDK(): void {
      if (typeof window !== 'undefined' && !this.isInitialized) {
        const script = document.createElement('script');
        script.src = 'https://js.live.net/v7.2/OneDrive.js';
        script.onload = () => {
          this.isInitialized = true;
        };
        script.onerror = (error) => {
          // console.error('Failed to load OneDrive SDK:', error);
        };
        document.head.appendChild(script);
      }
    }
  
    static getInstance(): OneDriveService {
      if (!OneDriveService.instance) {
        OneDriveService.instance = new OneDriveService();
      }
      return OneDriveService.instance;
    }
  
    openPicker(options: {
      success: (response: OneDriveResponse) => void;
      cancel?: () => void;
    }): void {
      if (typeof window === 'undefined' || !window.OneDrive) {
        // console.error('OneDrive SDK not loaded');
        return;
      }
  
      window.OneDrive.open({
        clientId: process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID!,
        action: "download",
        multiSelect: false,
        advanced: {
          filter: ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp",
          redirectUri: window.location.origin
        },
        success: options.success,
        cancel: options.cancel,
        error: (error) => {
          // console.error('OneDrive picker error:', error);
        }
      });
    }
  }
  
  export const oneDriveService = OneDriveService.getInstance();