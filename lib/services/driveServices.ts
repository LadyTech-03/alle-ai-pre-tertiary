import { toast } from 'sonner';
import { useDriveAuthStore } from '@/stores';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY!;
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
];
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

class GoogleDriveService {
  private static instance: GoogleDriveService;

  private isInitialized = false;
  private isAuthenticated = false;

  private gapi: any = null;
  private tokenClient: any = null;

  private constructor() {}

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  /* -------------------- LOAD SCRIPTS -------------------- */

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }

  private async loadGapi(): Promise<void> {
    await this.loadScript('https://apis.google.com/js/api.js');
    this.gapi = window.gapi;
  }

  private async loadGIS(): Promise<void> {
    await this.loadScript('https://accounts.google.com/gsi/client');
  }

  /* -------------------- INIT -------------------- */

  async init(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      await this.loadGapi();
      await this.loadGIS();

      await new Promise<void>((resolve) => {
        this.gapi.load('client', async () => {
          await this.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
          });
          resolve();
        });
      });

      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: () => {},
      });

      this.isInitialized = true;
    } catch (error) {
      console.error(error);
      toast.error('Failed to initialize Google Drive');
    }
  }

  /* -------------------- AUTH -------------------- */

  async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.init();
    }

    return new Promise((resolve) => {
      this.tokenClient.callback = (tokenResponse: any) => {
        if (tokenResponse.error) {
          toast.error('Google authentication failed');
          resolve(false);
          return;
        }

        this.gapi.client.setToken({
          access_token: tokenResponse.access_token,
        });

        useDriveAuthStore.getState().setAuth(
          tokenResponse.access_token,
          tokenResponse.expires_in
        );

        this.isAuthenticated = true;
        toast('Signed into Google Drive');
        resolve(true);
      };

      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  async signOut(): Promise<void> {
    const token = this.gapi?.client.getToken()?.access_token;

    if (token && window.google) {
      window.google.accounts.oauth2.revoke(token);
    }

    this.gapi?.client.setToken(null);
    this.isAuthenticated = false;
    useDriveAuthStore.getState().clearAuth();
  }

  /* -------------------- HELPERS -------------------- */

  isSignedIn(): boolean {
    return this.isAuthenticated;
  }

  getGapi() {
    return this.gapi;
  }
}

export const driveService = GoogleDriveService.getInstance();
