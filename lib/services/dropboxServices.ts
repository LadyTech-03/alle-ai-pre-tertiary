// Add type definitions for Dropbox global object
declare global {
  interface Window {
    Dropbox: {
      choose(options: {
        success: (files: DropboxFile[]) => void;
        cancel?: () => void;
        linkType?: 'preview' | 'direct';
        multiselect?: boolean;
        folderselect?: boolean;
        extensions?: string[];
        sizeLimit?: number;
      }): void;
    };
  }
}

interface DropboxFile {
  id: string;
  name: string;
  link: string;
  bytes: number;
  icon: string;
  thumbnailLink?: string;
  isDir: boolean;
}

class DropboxService {
  private static instance: DropboxService;
  private isInitialized: boolean = false;

  private constructor() {
    this.initializeSDK();
  }

  private initializeSDK(): void {
    // Only initialize in browser environment
    if (typeof window !== 'undefined' && !this.isInitialized) {
      try {
        const script = document.createElement('script');
        script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
        script.id = 'dropboxjs';
        script.setAttribute('data-app-key', process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID!);
        
        // Add load event listener to track initialization
        script.onload = () => {
          this.isInitialized = true;
          // console.log('Dropbox SDK loaded successfully');
        };

        script.onerror = (error) => {
          // console.error('Failed to load Dropbox SDK:', error);
        };

        document.head.appendChild(script);
      } catch (error) {
        // console.error('Error initializing Dropbox SDK:', error);
      }
    }
  }

  static getInstance(): DropboxService {
    if (!DropboxService.instance) {
      DropboxService.instance = new DropboxService();
    }
    return DropboxService.instance;
  }

  openChooser(options: {
    success: (files: DropboxFile[]) => void;
    cancel?: () => void;
    linkType?: 'preview' | 'direct';
    multiselect?: boolean;
    folderselect?: boolean;
    extensions?: string[];
    sizeLimit?: number;
  }): void {
    // Check if SDK is loaded and initialized
    if (typeof window === 'undefined' || !window.Dropbox) {
      // console.error('Dropbox Chooser not loaded. Please ensure:');
      // console.error('1. Your app key is correct');
      // console.error('2. Your domain is registered in the Dropbox App Console');
      // console.error('3. The Dropbox SDK has loaded properly');
      return;
    }

    window.Dropbox.choose({
      success: options.success,
      cancel: options.cancel,
      linkType: options.linkType || 'direct',
      multiselect: options.multiselect || false,
      folderselect: options.folderselect || false,
      extensions: options.extensions || ['.pdf', '.doc', '.docx', '.txt', '.jpg','.jpeg','.png','.webp'],
      sizeLimit: options.sizeLimit || 100 * 1024 * 1024, // 100MB default limit
    });
  }
}

export const dropboxService = DropboxService.getInstance();