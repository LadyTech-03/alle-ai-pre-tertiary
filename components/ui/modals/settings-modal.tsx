import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { useSelectedModelsStore, useDriveAuthStore, 
    useVoiceStore, useSettingsStore, useAuthStore, useTextSizeStore, useCompareModeStore, 
} from "@/stores";
import { useModelsStore } from '@/stores/models';
import Image from "next/image";
import { ArrowUpDown, BarChart2, Boxes, DatabaseBackup, Gauge, Loader, Music, Settings, Shield, Type, User, Volume2, Pencil, Camera, X, Info, Save, Gem, Snowflake } from "lucide-react";
import { toast } from "sonner";
import { SNOWFALL_COLORS } from "@/lib/utils/snowfallUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Minus, Plus, Globe } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { profileApi } from "@/lib/api/profile";

// Services
import { driveService } from '@/lib/services/driveServices';
import { Switch } from "../switch";
import { DataExportModal, LogoutAllDevicesModal, SharedLinksModal, PromptModal, PlansModal, LogoutModal } from "../modals";
import { GoogleDriveModal } from "../modals/google-drive-modal";
import { TransactionHistoryModal } from "../transaction-history";
import { DeleteAccountModal } from "./delete-account-modal";
import { cn } from "@/lib/utils";



interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTabValue?: string;
  }

  type UserPlan = 'free' | 'standard' | 'plus' | 'custom' | 'pro';
  type TimeRange = '24h' | '7d' | '30d' | '90d';
  type ChartType = 'bar' | 'pie' | 'line';

export function SettingsModal({ isOpen, onClose, defaultTabValue }: ModalProps) {
    const { theme, setTheme } = useTheme();
    const { selectedModels, inactiveModels, isLoadingLatest } = useSelectedModelsStore();
    const { isLoading } = useModelsStore();
    const { size, setSize } = useTextSizeStore();
    const [disabled, setDisabled] = useState(true);
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
    const [logoutAllModalOpen, setLogoutAllModalOpen] = useState(false);
    const [manageSharedLinksOpen, setManageSharedLinksOpen] = useState(false);
    ;
    const { isAuthenticated } = useDriveAuthStore();
    const [showDriveModal, setShowDriveModal] = useState(false);
    const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const voiceSettings = useVoiceStore((state) => state.settings);
    const availableVoices = useVoiceStore((state) => state.availableVoices);
    const { setVoice, setPitch, setRate, setVolume } = useVoiceStore();
    const [activeChart, setActiveChart] = useState<ChartType>('bar');
    const [timeRange, setTimeRange] = useState<TimeRange>('7d');
    // const [isLoading, setIsLoading] = useState(false);
    const [logoutDeviceId, setLogoutDeviceId] = useState<string | number | null>(null);
    const [isDevicesOpen, setIsDevicesOpen] = useState(true);
    const [showSummaryPrompt, setShowSummaryPrompt] = useState(false);
    const { isCompareMode } = useCompareModeStore();
    
    // Account/Profile state
    const { user: authUser, token, plan: userPlan, setAuth } = useAuthStore();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
    const [isLoadingBillingPortal, setIsLoadingBillingPortal] = useState(false);
    const router = useRouter();
    
    // Snowfall state
    const [snowfallEnabled, setSnowfallEnabled] = useState(true);
    const [snowfallColor, setSnowfallColor] = useState(SNOWFALL_COLORS[1].hex);
    const [isSavingSnowfall, setIsSavingSnowfall] = useState(false);
    
    // Profile form state
    const [profileFormData, setProfileFormData] = useState({
      firstname: '',
      lastname: '',
      profilePhoto: null as File | null
    });

    // Track original values for comparison
    const [originalProfileData, setOriginalProfileData] = useState({
      firstname: '',
      lastname: '',
      profilePhoto: null as File | null
    });

    // Check if there are changes
    const hasChanges = useMemo(() => {
      const hasNameChanges = (
        profileFormData.firstname !== originalProfileData.firstname ||
        profileFormData.lastname !== originalProfileData.lastname ||
        profileFormData.profilePhoto !== null
      );
      
      const isValidForm = (
        profileFormData.firstname.trim() !== '' &&
        profileFormData.lastname.trim() !== ''
      );
      
      return hasNameChanges && isValidForm;
    }, [profileFormData, originalProfileData]);
  
    // Calculate active models count
    const activeModelsCount = selectedModels.chat.filter(
      modelId => !inactiveModels.includes(modelId)
    ).length;
  
    const [promptConfig, setPromptConfig] = useState<any>(null);
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [plansModalOpen, setPlansModalOpen] = useState(false);
  
    const { personalization, setPersonalizationSetting } = useSettingsStore();
    const isFreeUser = userPlan === 'free' || !userPlan;
  
    // Effect to handle summary toggle based on active models
    useEffect(() => { 
  
      
      
      if ( activeModelsCount < 2) {
        
        if(activeModelsCount === 0){
          return;
        }
  
        const { isCompareMode, setIsCompareMode } = useCompareModeStore.getState();
        if (!isCompareMode) {
          return;
        }
  
        setIsCompareMode(false);     
        setPersonalizationSetting('summary', false);
      }
  
    }, [activeModelsCount, setPersonalizationSetting]);

  // Fetch snowfall preferences on modal open
  useEffect(() => {
    const fetchSnowfallPreferences = async () => {
      if (!isOpen) return;
      
      try {
        const response = await fetch('/api/snowfall/preferences');
        const data = await response.json();
        setSnowfallEnabled(data.enabled ?? true);
        setSnowfallColor(data.color || SNOWFALL_COLORS[0].hex);
      } catch (error) {
        console.error('Failed to fetch snowfall preferences:', error);
      }
    };

    fetchSnowfallPreferences();
  }, [isOpen]);

  // Save snowfall preferences
  const saveSnowfallPreferences = async (enabled: boolean, color: string) => {
    setIsSavingSnowfall(true);
    try {
      const response = await fetch('/api/snowfall/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, color }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      // Dispatch custom event to notify MainLayoutClient of changes
      window.dispatchEvent(new CustomEvent('snowfallPreferencesChanged', {
        detail: { enabled, color }
      }));
      
      toast.success('Snowfall settings updated');
    } catch (error) {
      console.error('Failed to save snowfall preferences:', error);
      toast.error('Failed to save snowfall settings');
    } finally {
      setIsSavingSnowfall(false);
    }
  };
  
    // Group voices by language/category with safety checks
    const voiceCategories = useMemo(() => {
      return availableVoices.reduce((acc, voice) => {
        if (!voice?.lang) return acc;
        
        const category = voice.lang.split('-')[0];
        if (!acc[category]) acc[category] = [];
        acc[category].push(voice);
        return acc;
      }, {} as Record<string, SpeechSynthesisVoice[]>);
    }, [availableVoices]);
  
    // Add useEffect to initialize voices
    useEffect(() => {
      const initVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          useVoiceStore.getState().initVoices();
        }
      };
  
      // Try to get voices immediately
      initVoices();
  
      // Also listen for the voiceschanged event
      window.speechSynthesis.addEventListener('voiceschanged', initVoices);
  
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', initVoices);
      };
    }, []);
  
    const settingsData = {
      general: {
        theme: {
          title: "Theme",
          value: theme,
        },
        textSize: {
          title: "Text size",
          value: `${size} px`,
        },
      },
      personalization: {
        // summary: {
        //   title: "Compare",
        //   description:
        //   "Get a concise overview of all AI responses. Summarizes and distills the key points from each AI model for easy understanding",
        //   enabled: isCompareMode,
        // },
        personalizedAds: {
          title: "Sponsored content",
          description: "See relevant contents based on your prompt and responses. Turning this off will disable ads.",
          enabled: personalization.personalizedAds,
        },
      },
      data_controls: {
        sharedLinks: {
          title: "Shared links",
          description: "See and manage shared conversations",
          action: "Manage",
        },
        transactionHistory: {
          title: "Invoice",
          description: "",
          action: "View",
        },
        // extportMyData: {
        //   title: "Export data",
        //   description: "",
        //   action: "Export",
        // },
        deleteMyAccount: {
          title: "Delete account",
          description: "",
          action: "Delete",
        },
      },
      linked_apps: {
        google_drive: {
          title: "Google Drive",
          icon: <Image src={'/icons/google-drive.webp'} alt="google_drive_logo" width={16} height={16} /> ,
          description: "Upload Google Docs, Sheets, Slides and other files.",
          action: isAuthenticated ? "Unlink" : "Link"
        },
        one_drive: {
          title: "One Drive",
          icon: <Image src={'/icons/onedrive.webp'} alt="google_drive_logo" width={16} height={16} /> ,
          description: "Upload Microsoft Word, Excel, PowerPoint and other files.",
          action: "Link"
        },
        dropbox: {
          title: "Dropbox",
          icon: <Image src={'/icons/dropbox.webp'} alt="google_drive_logo" width={16} height={16} /> ,
          description: "Upload Docs and other files.",
          action: "Link"
        },
      },
      analytics: {
        myAnalytics: {
          title: "Coming soon...",
          description: "Gain insights and track your usage with personalized analytics.",
        },
      },
      security: {
        logoutAll: {
          title: "Log out of all devices",
          description:
            "Log out from all active sessions on every device, including your current one. Other devices may take up to 30 minutes to be logged out.",
          action: "Log out",
        },
        devices: {
          title: "Connected Devices",
          description: "Manage individual device access to your account",
          activeDevices: [
            {
              id: 1,
              name: "MacBook Pro",
              browser: "Chrome",
              location: "San Francisco, US",
              lastActive: "Active now",
              device: "desktop",
              current: true,
            },
            {
              id: 2,
              name: "iPhone 13",
              browser: "Safari",
              location: "New York, US",
              lastActive: "2 hours ago",
              device: "mobile",
              current: false,
            },
            {
              id: 3,
              name: "iPad Air",
              browser: "Safari",
              location: "London, UK",
              lastActive: "1 day ago",
              device: "tablet",
              current: false,
            }
          ],
        },
      },
    };
  
    const tabs = [
      {
        value: "account",
        label: "Account",
        icon: <User className="h-4 w-4" />,
      },
      {
        value: "general",
        label: "General",
        icon: <Settings className="h-4 w-4" />,
      },
      {
        value: "personalization",
        label: "Personalization",
        icon: <User className="h-4 w-4" />,
      },
      {
        value: "data controls",
        label: "Data controls",
        icon: <DatabaseBackup className="h-4 w-4" />,
      },
      {
        value: "linked apps",
        label: "Linked apps",
        icon: <Boxes className="h-4 w-4" />,
      },
      {
        value: "analytics",
        label: "My Analytics",
        icon: <BarChart2 className="h-4 w-4" />,
      },
      {
        value: "security",
        label: "Security",
        icon: <Shield className="h-4 w-4" />,
      },
    ];
  
    // Profile-related functions
    function formatPlanName(planString: string) {
      const parts = planString.split('_');
      if (parts.length < 3) {
        return planString;
      }
      const prefix = parts[0];
      const suffix = parts[parts.length - 1];
      const features = parts.slice(1, -1);
      const featuresFormatted = features.join('+');
      return `${prefix} (${featuresFormatted})`;
    }
    
    function parsePlanDetails(planString: string): { tier: string; cycle?: string; features: string[] } {
      if (!planString || typeof planString !== 'string') {
        return { tier: 'Free', cycle: undefined, features: [] };
      }
      const parts = planString.split('_').filter(Boolean);
      if (parts.length === 0) {
        return { tier: 'Free', cycle: undefined, features: [] };
      }
      const last = parts[parts.length - 1];
      const cycle = last === 'monthly' ? 'Billed monthly' : last === 'yearly' ? 'Billed yearly' : 'forever';
      const tierRaw = parts[0];
      const tierMap: Record<string, string> = {
        free: 'Free',
        standard: 'Standard',
        plus: 'Plus',
        custom: 'Custom',
        pro: 'Pro',
      };
      const tier = tierMap[tierRaw] || (tierRaw.charAt(0).toUpperCase() + tierRaw.slice(1));
      const featuresStart = 1;
      const featuresEnd = cycle ? parts.length - 1 : parts.length;
      const rawFeatures = parts.slice(featuresStart, featuresEnd);
      const prettify = (s: string) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const features = rawFeatures.map(prettify);
      return { tier, cycle, features };
    }

    // Update profile form data when user data changes
    useEffect(() => {
      if (authUser) {
        const userData = {
          firstname: authUser.first_name || '',
          lastname: authUser.last_name || '',
          profilePhoto: null as File | null
        };
        setProfileFormData(userData);
        setOriginalProfileData(userData);
      }
    }, [authUser]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const validTypes = ['image/jpeg', 'image/webp', 'image/jpg', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          toast.error('Invalid file type. Supported files(JPEG, PNG, JPG, WEBP, or GIF)');
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          toast.error('File too large, less than 2MB required');
          return;
        }
        setProfileFormData(prev => ({ ...prev, profilePhoto: file }));
      }
    };

    const handleProfileEditToggle = async () => {
      if (isEditingProfile) {
        setIsSubmittingProfile(true);
        try {
          const response = await profileApi.updateProfile({
            firstname: profileFormData.firstname,
            lastname: profileFormData.lastname,
            ...(profileFormData.profilePhoto && { profile_photo: profileFormData.profilePhoto })
          });
          
          if (response.status && response.user) {
            setAuth(
              {
                ...authUser!,
                first_name: response.user.first_name,
                last_name: response.user.last_name,
                photo_url: response.user.photo_url
              },
              token!,
              userPlan
            );
          }
          toast.success('Profile updated');
          setIsEditingProfile(false);
          // Update original data to reflect saved changes
          setOriginalProfileData({
            firstname: profileFormData.firstname,
            lastname: profileFormData.lastname,
            profilePhoto: null
          });
          setProfileFormData(prev => ({ ...prev, profilePhoto: null }));
        } catch (error) {
          toast.error('Failed to update profile');
        } finally {
          setIsSubmittingProfile(false);
        }
      } else {
        setIsEditingProfile(true);
      }
    };

    const handleCancelEdit = () => {
      // Reset form data to original values
      setProfileFormData({
        firstname: originalProfileData.firstname,
        lastname: originalProfileData.lastname,
        profilePhoto: null
      });
      setIsEditingProfile(false);
    };

    const handleManageSubscription = async () => {
      try {
        setIsLoadingBillingPortal(true);
        const response = await authApi.getBillingPortal(window.location.href);
        if (response.status && response.url) {
          window.location.href = response.url;
        } else {
          toast.error('Something went wrong, please try again');
        }
      } catch (error) {
        // toast.error('Something went wrong, check your internet connection');
      } finally {
        setIsLoadingBillingPortal(false);
      }
    };

    const isPaidPlan = 
      typeof userPlan === 'string' && 
      (userPlan === 'standard' || userPlan === 'plus' || userPlan.includes('standard') || userPlan.includes('plus') || userPlan.includes('pro') || userPlan.includes('custom'));

    const handleGoogleDriveAction = async () => {
      if (isAuthenticated) {
        // Handle unlinking
        try {
          await driveService.signOut();
          useDriveAuthStore.getState().clearAuth();
          
          toast.success('Google Drive unlinked');
        } catch (error) {
          // console.error('Failed to unlink Google Drive:', error);
          toast.error('Failed to unlinked Google Drive');
  
        }
      } else {
        setShowDriveModal(true);
      }
    };
  
    const handleSwitchChange = async (key: keyof typeof personalization, checked: boolean) => {
      if (activeModelsCount < 2) {
        setShowSummaryPrompt(true);
        return;
      }
  
      if (key === "summary") {
        if (isFreeUser) {
          setPromptConfig({
            title: "Upgrade Required",
            message: "Please upgrade your plan to enable the Compare & Comparison feature.",
            actions: [
              {
                label: "Upgrade Plan",
                onClick: () => {
                  setShowPromptModal(false);
                  setPlansModalOpen(true)},
                  variant: "outline"
              },
            ],
          });
          setShowPromptModal(true);
          return;
        }
      
        // Use the Compare Mode store instead of the API call
        const { setIsCompareMode } = useCompareModeStore.getState();
        
        // Update the compare mode state
        setIsCompareMode(checked);
        
        // Still update the local personalization setting
        setPersonalizationSetting(key, checked);
      }
    };
  
    function safeDisplayLanguageName(languageCode: string) {
      try {
        return new Intl.DisplayNames(['en'], { type: 'language' }).of(languageCode) || languageCode;
      } catch (error) {
        // console.error('Error displaying language name:', error);
        return languageCode; // Fallback to just showing the language code
      }
    }
  
    return (
      <>
        <Dialog open={isOpen} onOpenChange={(open) => {
          if (!open) {
            handleCancelEdit(); // Cancel editing when modal closes
          }
          onClose();
        }}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2"></DialogTitle>
          </DialogHeader>
          <DialogContent className="w-[800px] h-[600px] max-w-[90vw] max-h-[90vh] rounded-lg overflow-hidden p-0">
            {/* Fixed Layout Container */}
            <div className="flex flex-col sm:flex-row h-full w-full">
              <Tabs 
                defaultValue={`${defaultTabValue ? defaultTabValue : 'account'}`} 
                className="flex flex-col sm:flex-row w-full h-full"
                onValueChange={(value) => {
                  if (isEditingProfile) {
                    handleCancelEdit(); // Cancel editing when switching tabs
                  }
                }}
              >
                {/* Tabs - Responsive */}
                <div className="w-full sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-borderColorPrimary bg-muted/20 mt-4">
                  <TabsList className="flex flex-row sm:flex-col h-auto sm:h-full sm:justify-start w-full bg-transparent p-2 sm:p-3 gap-1 flex-wrap sm:flex-nowrap">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex-shrink-0 sm:w-full justify-start gap-2 sm:gap-3 data-[state=inactive]:text-muted-foreground rounded-md whitespace-nowrap"
                      >
                        {tab.icon}
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
  
                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto min-h-0 mt-4">
                  <div className="p-4 sm:p-6 h-[500px]">
                    <TabsContent value="account" className="mt-0 space-y-6">
                    {/* Profile Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-borderColorPrimary">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Profile Information
                          </h4>
                          <p className="text-[0.75rem] text-muted-foreground">
                            Manage your personal information and profile photo
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {isEditingProfile && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="h-8 px-3"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant={isEditingProfile ? "default" : "outline"}
                            size="sm"
                            onClick={handleProfileEditToggle}
                            disabled={isSubmittingProfile || (isEditingProfile && !hasChanges)}
                            className="h-8 px-3"
                          >
                            {isSubmittingProfile ? (
                              <div className="flex items-center gap-2">
                                <Loader className="h-4 w-4 animate-spin" />
                                <span>Saving...</span>
                              </div>
                            ) : isEditingProfile ? (
                              <div className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                <span>Save</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Pencil className="h-4 w-4" />
                                <span>Edit</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Profile Display/Edit */}
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-4">
                          <div className="relative group">
                            <Avatar className="h-16 w-16 border-2 border-primary/20">
                              <AvatarImage
                                src={profileFormData.profilePhoto 
                                  ? URL.createObjectURL(profileFormData.profilePhoto)
                                  : authUser?.photo_url || "/user.jpg"}
                                alt="Profile"
                              />
                              <AvatarFallback>
                                {authUser?.first_name?.[0]}{authUser?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            {isEditingProfile && (
                              <label 
                                htmlFor="profile-photo" 
                                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                <Camera className="h-5 w-5 text-white" />
                                <input
                                  id="profile-photo"
                                  type="file"
                                  className="hidden"
                                  onChange={handleFileChange}
                                  accept="image/jpeg,image/webp,image/jpg,image/webp,image/gif"
                                />
                              </label>
                            )}
                            {isEditingProfile && profileFormData.profilePhoto && (
                              <button
                                onClick={() => setProfileFormData(prev => ({ ...prev, profilePhoto: null }))}
                                className="absolute -top-1 -right-1 p-1 bg-destructive rounded-full hover:bg-destructive/90 transition-colors"
                              >
                                <X className="h-3 w-3 text-white" />
                              </button>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {isEditingProfile ? "Edit Profile" : `${authUser?.first_name} ${authUser?.last_name}`}
                            </div>
                            <div className="text-xs text-muted-foreground">{authUser?.email}</div>
                            {typeof userPlan === 'string' ? (
                              (() => {
                                const { tier } = parsePlanDetails(userPlan);
                                return (
                                  <Badge variant="default" className="mt-1 text-xs">
                                    {tier}
                                  </Badge>
                                );
                              })()
                            ) : (
                              <Badge variant="default" className="mt-1 text-xs">
                                Free
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Form Fields */}
                        {isEditingProfile && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">First name</label>
                              <Input
                                value={profileFormData.firstname}
                                onChange={(e) => setProfileFormData(prev => ({ 
                                  ...prev, 
                                  firstname: e.target.value 
                                }))}
                                placeholder="Enter your first name"
                                className="bg-background border-borderColorPrimary"
                                maxLength={255}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Last name</label>
                              <Input
                                value={profileFormData.lastname}
                                onChange={(e) => setProfileFormData(prev => ({ 
                                  ...prev, 
                                  lastname: e.target.value 
                                }))}
                                placeholder="Enter your last name"
                                className="bg-background border-borderColorPrimary"
                                maxLength={255}
                                required
                              />
                            </div>
                          </div>
                        )}

                        {/* File Requirements */}
                        {isEditingProfile && (
                          <div className="rounded-lg border border-primary/20 p-3 bg-muted/30">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Info className="h-4 w-4" />
                              <span>Profile Photo Requirements</span>
                            </div>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                              <li>• Accepted formats: JPEG, PNG, JPG, WEBP, GIF</li>
                              <li>• Maximum file size: 2MB</li>
                              <li>• Recommended size: 400x400 pixels</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subscription Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-borderColorPrimary">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Gem className="h-4 w-4 text-primary" />
                            Subscription
                          </h4>
                          <p className="text-[0.75rem] text-muted-foreground">
                            Manage your subscription and billing
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-muted/30 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium mb-2">Current Plan</div>
                            {typeof userPlan === 'string' ? (
                              (() => {
                                const { tier, cycle, features } = parsePlanDetails(userPlan);
                                return (
                                  <>
                                    <div className="flex items-center gap-2 mb-2">
                                    
                                    <div 
                                        className={cn(
                                        "text-lg font-semibold",
                                        tier === "Free" && "text-foreground",
                                        tier === "Standard" && "bg-gradient-to-r from-gray-300 via-gray-500 to-gray-200 dark:from-gray-100 dark:via-gray-400 dark:to-gray-200 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient",
                                        tier === "Plus" && "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient",
                                        tier === "Pro" || tier === "Custom" && "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient"
                                    )}>
                                        {tier}
                                      </div>
                                      <Badge variant="default" className="text-xs font-semibold rounded-sm p-1 h-4">
                                        {cycle}
                                      </Badge>
                                    </div>
                                    {features.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mb-3">
                                        {features.slice(0, 3).map((f, idx) => (
                                          <Badge
                                            key={idx}
                                            variant="default"
                                            className="h-5 px-2 py-0 text-xs leading-none rounded-full"
                                          >
                                            {f}
                                          </Badge>
                                        ))}
                                        {features.length > 3 && (
                                          <Badge
                                            variant="default"
                                            className="h-5 px-1.5 py-0 text-xs leading-none rounded-full"
                                          >
                                            +{features.length - 3}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </>
                                );
                              })()
                            ) : (
                            //   An error notice to inform the user Failed to load subscription: No subscription found for account. Contact support@alle-ai.com if error persists.
                            <div className="text-xs border border-destructive rounded-md p-2 text-destructive">
                              Failed to load subscription: No subscription found for account. Contact support@alle-ai.com if error persists.
                            </div>
                            )}
                          </div>
                          <Button 
                            className="text-xs" 
                            variant="outline" 
                            onClick={() => {
                              if (isPaidPlan) {
                                router.push('/manage-subscription');
                              } else {
                                setPlansModalOpen(true);
                              }
                            }}
                            disabled={isLoadingBillingPortal}
                          >
                            {isPaidPlan ? "MANAGE" : "UPGRADE"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                    <TabsContent value="general" className="mt-0 space-y-6">
                    <div className="flex items-center justify-between border-b border-borderColorPrimary">
                      <span className="text-sm">Theme</span>
                      <Select
                        defaultValue={theme}
                        onValueChange={(value) => setTheme(value)}
                      >
                        <SelectTrigger className="w-24 p-2 border-none focus:outline-none focus:border-b">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent className="bg-backgroundSecondary">
                          <SelectItem
                            className="text-sm cursor-pointer focus:outline-none"
                            value="system"
                          >
                            System
                          </SelectItem>
                          <SelectItem
                            className="text-sm cursor-pointer focus:outline-none"
                            value="light"
                          >
                            Light
                          </SelectItem>
                          <SelectItem
                            className="text-sm cursor-pointer focus:outline-none"
                            value="dark"
                          >
                            Dark
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between border-b border-borderColorPrimary">
                      <span className="text-sm">Text size</span>
                        <Select value={size.toString()} onValueChange={(value) => setSize(Number(value))}>
                        <SelectTrigger className="w-24 p-2 border-none focus:outline-none">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent className="bg-backgroundSecondary">
                          {[12, 14, 16, 18, 20].map((size) => (
                            <SelectItem
                              key={size}
                              value={size.toString()}
                              className="cursor-pointer focus:outline-none"
                            >
                              {size} px
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
  
                    <TabsContent value="personalization" className="mt-0 space-y-6">
                    {Object.entries(settingsData.personalization).map(
                      ([key, setting]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between space-x-4 pb-2 border-b border-borderColorPrimary last:border-none"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {/* {setting.icon && setting.icon} */}
                              <h4 className="text-sm font-medium flex items-center gap-2">
                                {setting.title}
                              </h4>
                            </div>
                            <p className="text-[0.75rem] text-muted-foreground">
                              {setting.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              className="data-[state=unchecked]:bg-borderColorPrimary"
                              checked={setting.enabled}
                              disabled={key === "personalizedAds"}
                              onCheckedChange={(checked) => 
                                handleSwitchChange(
                                  key as "summary" | "personalizedAds",
                                  checked
                                )
                              }
                            />
                          </div>
                        </div>
                      )
                    )}
                    
                    {/* Snowfall Animation Control */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-borderColorPrimary">
                        <div className="space-y-1 flex-1">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Snowflake className="h-4 w-4 text-primary" />
                            Snowfall Animation
                          </h4>
                          <p className="text-[0.75rem] text-muted-foreground">
                            Show festive seasonal snowfall animation ❄️
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            className="data-[state=unchecked]:bg-borderColorPrimary"
                            checked={snowfallEnabled}
                            disabled={isSavingSnowfall}
                            onCheckedChange={(checked) => {
                              setSnowfallEnabled(checked);
                              saveSnowfallPreferences(checked, snowfallColor);
                            }}
                          />
                        </div>
                      </div>

                      {/* Color Palette - Only show when enabled */}
                      {snowfallEnabled && (
                        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <div 
                              className="h-4 w-4 rounded-full border border-borderColorPrimary" 
                              style={{ backgroundColor: snowfallColor }}
                            />
                            Snowfall Color
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {SNOWFALL_COLORS.map((color) => (
                              <button
                                key={color.hex}
                                onClick={() => {
                                  setSnowfallColor(color.hex);
                                  saveSnowfallPreferences(snowfallEnabled, color.hex);
                                }}
                                disabled={isSavingSnowfall}
                                className={cn(
                                  "group relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all hover:scale-105",
                                  snowfallColor === color.hex
                                    ? "border-primary bg-primary/10"
                                    : "border-borderColorPrimary hover:border-primary/50"
                                )}
                                title={color.name}
                              >
                                <div 
                                  className="h-8 w-8 rounded-full border-2 border-background shadow-sm" 
                                  style={{ backgroundColor: color.hex }}
                                />
                                {/* <span className="text-xs">{color.emoji}</span> */}
                                {snowfallColor === color.hex && (
                                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                    <Loader 
                                      className={cn(
                                        "h-3 w-3 text-primary-foreground",
                                        isSavingSnowfall && "animate-spin"
                                      )} 
                                    />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground italic">
                            {SNOWFALL_COLORS.find(c => c.hex === snowfallColor)?.name || "Custom color"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-borderColorPrimary">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Music className="h-4 w-4 text-primary" />
                            Text-to-Speech Settings
                          </h4>
                          <p className="text-[0.75rem] text-muted-foreground">
                            Customize how the AI speaks to you
                          </p>
                        </div>
                      </div>
  
                      {/* Main Voice Selection */}
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Type className="h-4 w-4 text-primary" />
                            Voice
                          </label>
                          <Select
                            value={voiceSettings.voice}
                            onValueChange={setVoice}
                          >
                            <SelectTrigger className="w-full border border-borderColorPrimary">
                              <SelectValue placeholder="Select a voice" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(voiceCategories).length > 0 ? (
                                Object.entries(voiceCategories).map(([category, voices]) => (
                                  <SelectGroup key={category}>
                                    <SelectLabel className="flex items-center gap-2">
                                      <Globe className="h-3 w-3" />
                                      {/* {new Intl.DisplayNames([category], { type: 'language' }).of(category)} */}
                                      {/* {safeDisplayLanguageName(category)} */}
                                    </SelectLabel>
                                    {voices.map((voice) => (
                                      <SelectItem 
                                        key={voice.voiceURI} 
                                        value={voice.voiceURI}
                                      >
                                        <div className="flex items-center justify-between w-full">
                                          <span>{voice.name}</span>
                                          <Badge variant="outline" className="text-xs">
                                            {voice.lang}
                                          </Badge>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                ))
                              ) : (
                                <SelectItem value="default" disabled>
                                  <span className="flex items-center gap-2">
                                    <Loader className="h-3 w-3 animate-spin" />
                                    Loading voices...
                                  </span>
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
  
                        {/* Quick Test Button */}
                        <Button 
                          variant="outline"
                          onClick={() => {
                            const utterance = new SpeechSynthesisUtterance("Hello! This is a test of your selected voice.");
                            const selectedVoice = availableVoices.find(v => v.voiceURI === voiceSettings.voice);
                            if (selectedVoice) utterance.voice = selectedVoice;
                            window.speechSynthesis.speak(utterance);
                          }}
                          className="w-full gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Test Voice
                        </Button>
  
                        {/* Advanced Settings Drawer Trigger */}
                        <Drawer>
                          <DrawerTrigger asChild>
                            <Button variant="ghost" className="w-full gap-2">
                              <Settings className="h-4 w-4" />
                              Advanced Voice Settings
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent className="px-4">
                            <DrawerHeader>
                              <DrawerTitle>Advanced Voice Settings</DrawerTitle>
                              <DrawerDescription>
                                Fine-tune your voice settings for the perfect experience
                              </DrawerDescription>
                            </DrawerHeader>
  
                            <div className="grid gap-6 p-4">
                              {/* Pitch Control */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium flex items-center gap-2">
                                    <ArrowUpDown className="h-4 w-4 text-primary" />
                                    Pitch
                                  </label>
                                  <span className="text-xs text-muted-foreground">
                                    {voiceSettings.pitch.toFixed(1)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setPitch(Math.max(0, voiceSettings.pitch - 0.1))}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Slider
                                    value={[voiceSettings.pitch]}
                                    min={0}
                                    max={2}
                                    step={0.1}
                                    onValueChange={([value]) => setPitch(value)}
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setPitch(Math.min(2, voiceSettings.pitch + 0.1))}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
  
                              {/* Speed Control */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium flex items-center gap-2">
                                    <Gauge className="h-4 w-4 text-primary" />
                                    Speed
                                  </label>
                                  <span className="text-xs text-muted-foreground">
                                    {voiceSettings.rate.toFixed(1)}x
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setRate(Math.max(0.1, voiceSettings.rate - 0.1))}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Slider
                                    value={[voiceSettings.rate]}
                                    min={0.1}
                                    max={10}
                                    step={0.1}
                                    onValueChange={([value]) => setRate(value)}
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setRate(Math.min(10, voiceSettings.rate + 0.1))}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
  
                              {/* Volume Control */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium flex items-center gap-2">
                                    <Volume2 className="h-4 w-4 text-primary" />
                                    Volume
                                  </label>
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(voiceSettings.volume * 100)}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setVolume(Math.max(0, voiceSettings.volume - 0.1))}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Slider
                                    value={[voiceSettings.volume]}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    onValueChange={([value]) => setVolume(value)}
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setVolume(Math.min(1, voiceSettings.volume + 0.1))}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
  
                              {/* Advanced Test Button */}
                              <Button 
                                onClick={() => {
                                  const utterance = new SpeechSynthesisUtterance("Hello! This is a test of your selected voice settings.");
                                  const selectedVoice = availableVoices.find(v => v.voiceURI === voiceSettings.voice);
                                  if (selectedVoice) utterance.voice = selectedVoice;
                                  utterance.pitch = voiceSettings.pitch;
                                  utterance.rate = voiceSettings.rate;
                                  utterance.volume = voiceSettings.volume;
                                  window.speechSynthesis.speak(utterance);
                                }}
                                className="w-full gap-2"
                              >
                                <Play className="h-4 w-4" />
                                Test Advanced Settings
                              </Button>
                            </div>
  
                            <DrawerFooter>
                              <DrawerClose asChild>
                                <Button variant="outline">Close Advanced Settings</Button>
                              </DrawerClose>
                            </DrawerFooter>
                          </DrawerContent>
                        </Drawer>
                      </div>
                    </div>
                  </TabsContent>
  
                    <TabsContent value="data controls" className="space-y-6">
                    {Object.entries(settingsData.data_controls).map(([key, setting]) => (
                      <div
                        key={key}
                        className="border-b border-borderColorPrimary last:border-none"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-small">{setting.title}</h4>
                          <Button
                            variant={key === "google_drive" ? "outline" : setting.action === "Delete" ? "destructive" : "outline"}
                            className={`h-8 rounded-md p-2 text-xs border-borderColorPrimary transition-all`}
                            size="sm"
                            onClick={() => {
                              // toast.info('This feature will be available soon!')
                              if (setting.action === "Delete") {
                                setDeleteAccountModalOpen(true);
                              } else if (setting.action === "Export") {
                                setExportModalOpen(true);
                              } else if (setting.action === "Manage") {
                                // setManageSharedLinksOpen(true);
                                toast.info('This feature will be available soon!')
                              } else if (setting.action === "View") {
                                setIsTransactionHistoryOpen(true);
                              }
                            }}
                          >
                            {setting.action}
                          </Button>
                        </div>
                        <p className="text-[0.75rem] text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                    ))}
                  </TabsContent>
  
                    <TabsContent value="linked apps" className="space-y-6">
                    {Object.entries(settingsData.linked_apps).map(([key, setting]) => (
                      <div
                        key={key}
                        className="border-b border-borderColorPrimary last:border-none"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-small flex items-center gap-2">{setting.icon}{setting.title}</h4>
                          <Button
                            variant={setting.action === 'Unlink' ? 'destructive' : 'outline'}
                            className={`h-8 rounded-md p-2 text-xs border-borderColorPrimary transition-all`}
                            size="sm"
                            onClick={() => {
                              if (key === "google_drive") {
                                toast.info('This feature will be available soon!')
                                // handleGoogleDriveAction();
                              } else if (key === "one_drive"){
                                toast.info('This feature will be available soon!')
                                // console.log('One Drive')
                              } else if (key === "dropbox"){
                                toast.info('This feature will be available soon!')
                                // console.log('Dropbox')
                              }
                            }}
                          >
                            {setting.action}
                          </Button>
                        </div>
                        <p className="text-[0.75rem] text-muted-foreground mb-2">
                          {setting.description}
                        </p>
                      </div>
                    ))}
                  </TabsContent>
  
                    <TabsContent value="analytics" className="mt-0 space-y-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-2 border-b border-borderColorPrimary">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-primary" />
                            Coming Soon !!
                          </h4>
                          <p className="text-[0.75rem] text-muted-foreground">
                            Gain insights and track your usage with personalized analytics
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
  
                    <TabsContent value="security" className="mt-0 space-y-6">
                    <div className="space-y-6">
                      {/* Existing logout all devices section */}
                      <div className="">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-small">
                            {settingsData.security.logoutAll.title}
                          </h4>
                          <Button
                            variant="destructive"
                            className="h-8 rounded-md p-2 text-xs border-borderColorPrimary"
                            size="sm"
                            onClick={() => setLogoutAllModalOpen(true)}
                          >
                            {settingsData.security.logoutAll.action}
                          </Button>
                        </div>
                        <p className="text-[0.75rem] text-muted-foreground">
                          {settingsData.security.logoutAll.description}
                        </p>
                      </div>
  
                      {/* Advanced Section */}
                      {/* <Collapsible 
                        open={isDevicesOpen}
                        onOpenChange={setIsDevicesOpen}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">Manage Devices</h4>
                            <Badge variant="secondary" className="text-xs">
                              {settingsData.security.devices.activeDevices.length}
                            </Badge>
                          </div>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-9 p-0 hover:bg-secondary/20">
                              {isDevicesOpen ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">
                                {isDevicesOpen ? 'Close devices' : 'Show devices'}
                              </span>
                            </Button>
                          </CollapsibleTrigger>
                        </div>
  
                        <CollapsibleContent className="space-y-4">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="rounded-md border border-borderColorPrimary"
                          >
                            {settingsData.security.devices.activeDevices.map((device, index) => (
                              <div
                                key={device.id}
                                className={cn(
                                  "flex items-center justify-between p-4",
                                  index !== settingsData.security.devices.activeDevices.length - 1 && 
                                  "border-b border-borderColorPrimary"
                                )}
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="p-2 rounded-full bg-secondary/10">
                                    {device.device === 'desktop' && <Monitor className="h-4 w-4" />}
                                    {device.device === 'mobile' && <Smartphone className="h-4 w-4" />}
                                    {device.device === 'tablet' && <Tablet className="h-4 w-4" />}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                      {device.name}
                                      {device.current && (
                                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                                          Current
                                        </span>
                                      )}
                                    </p>
                                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                                      <Globe className="h-3 w-3" />
                                      <span>{device.location}</span>
                                      <span>•</span>
                                      <Chrome className="h-3 w-3" />
                                      <span>{device.browser}</span>
                                      <span>•</span>
                                      <Clock className="h-3 w-3" />
                                      <span>{device.lastActive}</span>
                                    </div>
                                  </div>
                                </div>
                                {!device.current && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setLogoutDeviceId(device.id)}
                                  >
                                    <LogOut className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        </CollapsibleContent>
                      </Collapsible> */}
                    </div>
                  </TabsContent>
                  </div>
                </div>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
  
        <DataExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
        />
        <DeleteAccountModal
          isOpen={deleteAccountModalOpen}
          onClose={() => setDeleteAccountModalOpen(false)}
        />
        <LogoutAllDevicesModal
          isOpen={logoutAllModalOpen}
          onClose={() => setLogoutAllModalOpen(false)}
        />
        {/* Add the Google Drive Modal */}
        <GoogleDriveModal
          isOpen={showDriveModal}
          onClose={() => setShowDriveModal(false)}
          onFileSelect={() => {}} // Empty function since we're just using it for authentication
        />
        <SharedLinksModal
          isOpen={manageSharedLinksOpen}
          onClose={() => setManageSharedLinksOpen(false)}
        />
        <TransactionHistoryModal 
          isOpen={isTransactionHistoryOpen} 
          onClose={() => setIsTransactionHistoryOpen(false)} 
        />
        {promptConfig && (
          <PromptModal
            isOpen={showPromptModal}
            onClose={() => setShowPromptModal(false)}
            {...promptConfig}
          />
        )}
        <PlansModal
          isOpen={plansModalOpen}
          onClose={() => setPlansModalOpen(false)}
        />
        {/* Single device logout modal */}
        {logoutDeviceId && (
          <LogoutModal 
            isOpen={true}
            onClose={() => setLogoutDeviceId(null)}
            mode="device"
            deviceInfo={settingsData.security.devices.activeDevices.find(d => d.id === logoutDeviceId)}
          />
        )}
        <PromptModal
          isOpen={showSummaryPrompt}
          onClose={() => setShowSummaryPrompt(false)}
          title="NOTICE"
          message={<>At least <span className="font-bold">2 active models</span> are required to enable the Alle-AI Summary.</>}
          actions={[
            {
              label: "Ok",
              onClick: () => setShowSummaryPrompt(false),
              variant: "default"
            }
          ]}
        />
      </>
    );
  }