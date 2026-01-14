import { useAuthStore } from "@/stores";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Pencil, X, Camera, Info, Save, Loader, Gem } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { profileApi } from "@/lib/api/profile";
import { PlansModal } from "../modals";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
  }

export function UserProfileModal({ isOpen, onClose }: ModalProps) {
    const { user, token, plan, setAuth } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [plansModalOpen, setPlansModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingBillingPortal, setIsLoadingBillingPortal] = useState(false);
    const router = useRouter();
  
  
    function formatPlanName(planString: string) {
      // Split the string by underscores
      const parts = planString.split('_');
    
      if (parts.length < 3) {
        return planString; // Return as-is if the format is unexpected
      }
    
      const prefix = parts[0]; // e.g., "custom" or "pro"
      const suffix = parts[parts.length - 1]; // e.g., "monthly" or "yearly"
      const features = parts.slice(1, -1); // Everything between
    
      // Join features with '+' and wrap in parentheses
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
      const cycle = last === 'monthly' ? 'Monthly' : last === 'yearly' ? 'Yearly' : undefined;
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
  
    
    // Form state
    const [formData, setFormData] = useState({
      firstname: user?.first_name || '',
      lastname: user?.last_name || '',
      profilePhoto: null as File | null
    });
  
    // Update form data when user data changes
    useEffect(() => {
      if (user) {
        setFormData(prev => ({
          ...prev,
          firstname: user.first_name || '',
          lastname: user.last_name || ''
        }));
      }
    }, [user]);
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/webp', 'image/jpg', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
  
          toast.error('Invalid file type. Supported files(JPEG, PNG, JPG, WEBP, or GIF)');
          return;
        }
  
        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
          toast.error('File too large, less than 2MB required');
          return;
        }
  
        setFormData(prev => ({ ...prev, profilePhoto: file }));
      }
    };
  
    // Add this function to handle billing portal redirection
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
      typeof plan === 'string' && 
      (plan === 'standard' || plan === 'plus' || plan.includes('standard') || plan.includes('plus') || plan.includes('pro') || plan.includes('custom'));
  
  
    const handleEditToggle = async () => {
      if (isEditing) {
        setIsSubmitting(true);
        try {
          const response = await profileApi.updateProfile({
            firstname: formData.firstname,
            lastname: formData.lastname,
            ...(formData.profilePhoto && { profile_photo: formData.profilePhoto })
          });
  
          // console.log('Profile update response:', response);
          
          // Update the auth store with new user data
          if (response.status && response.user) {
            setAuth(
              {
                ...user!,  // Spread existing user data
                first_name: response.user.first_name,
                last_name: response.user.last_name,
                photo_url: response.user.photo_url
              },
              token!,
              plan
            );
          }
  
          toast.success('Profile updated')
          
          setIsEditing(false);
        } catch (error) {
          // console.error('Profile update error:', error);
          // toast.error('Faild to update profile');
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setIsEditing(true);
      }
    };
  
    return (
      <>
        <Dialog open={isOpen} onOpenChange={() => {onClose(); setIsEditing(false);}}>
          <DialogContent className="max-w-sm sm:max-w-xl rounded-lg sm:rounded-xl shadow-lg">
            <DialogHeader className="flex flex-row items-center justify-between relative">
              <div className="flex flex-col items-center w-full gap-2">
                <AnimatePresence mode="wait">
                  <motion.div 
                    className="relative group"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar className="h-20 w-20 border-2 border-primary/20">
                      <AvatarImage
                        src={formData.profilePhoto 
                          ? URL.createObjectURL(formData.profilePhoto)
                          : user?.photo_url || "/user.jpg"}
                        alt="Profile"
                      />
                      <AvatarFallback>
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {!isEditing && (
                    <div className="absolute -bottom-1 -right-2 text-white rounded-full">
                      {typeof plan === 'string' ? (
                        (() => {
                          const { tier } = parsePlanDetails(plan);
                          return (
                            <Badge
                              variant="default"
                              title={formatPlanName(plan)}
                              className=""
                            >
                              <span className="truncate">{tier}</span>
                            </Badge>
                          );
                        })()
                      ) : (
                        <Badge 
                          variant="default" 
                          className="overflow-hidden"
                        >
                          <span className="relative z-10">Free</span>
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                                style={{ backgroundSize: '200% 100%' }}
                          />
                        </Badge>
                      )}
                    </div>
                    )}
                    
                    {isEditing && (
                      <label 
                        htmlFor="profile-photo" 
                        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Camera className="h-6 w-6 text-white" />
                        <input
                          id="profile-photo"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept="image/jpeg,image/webp,image/jpg,image/webp,image/gif"
                        />
                      </label>
                    )}
                    {isEditing && formData.profilePhoto && (
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, profilePhoto: null }))}
                        className="absolute -top-1 -right-1 p-1 bg-destructive rounded-full hover:bg-destructive/90 transition-colors"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="text-center max-w-[16rem] sm:max-w-[22rem]">
                  <DialogTitle className="text-md sm:text-xl truncate" title={isEditing ? undefined : `${user?.first_name} ${user?.last_name}`}>
                    {isEditing ? "Edit Profile" : `${user?.first_name} ${user?.last_name}`}
                  </DialogTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate" title={user?.email}>{user?.email}</p>
                </div>
              </div>
              {!isEditing && (
                <div className="absolute right-4 top-4 flex gap-2">
                  <Button 
                    variant={isEditing ? "default" : "outline"}
                    className={`px-2 sm:px-3 transition-all duration-200 ${
                      isEditing 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'border-2 border-borderColorPrimary hover:bg-accent'
                    }`}
                    size="sm"
                    onClick={handleEditToggle}
                    disabled={isSubmitting}
                  >
                      <div className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        <span className='hidden sm:inline'>Edit Profile</span>
                      </div>
                  </Button>
                </div>
                )}
            </DialogHeader>
  
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 pt-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        First name
                      </label>
                      <Input
                        value={formData.firstname}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          firstname: e.target.value 
                        }))}
                        placeholder="Enter your first name"
                        className="bg-muted/50 border-primary/20 focus:border-primary transition-colors"
                        maxLength={255}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Last name
                      </label>
                      <Input
                        value={formData.lastname}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          lastname: e.target.value 
                        }))}
                        placeholder="Enter your last name"
                        className="bg-muted/50 border-primary/20 focus:border-primary transition-colors"
                        maxLength={255}
                        required
                      />
                    </div>
                  </div>
  
                  <div className="rounded-lg border border-primary/20 p-4 bg-muted/30">
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
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="pt-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-primary/20 bg-muted/30 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-primary" />
                        Account
                      </div>
                      <div className="text-sm text-muted-foreground truncate" title={`${user?.first_name} ${user?.last_name}`}>{user?.first_name} {user?.last_name}</div>
                      <div className="text-sm text-muted-foreground truncate" title={user?.email}>{user?.email}</div>
                    </div>
  
                    <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-muted/30 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Gem className="h-4 w-4 text-primary" />
                            Plan
                          </div>
                          <div className="mt-1 space-y-1 min-w-0">
                            {typeof plan === 'string' ? (
                              (() => {
                                const { tier, cycle, features } = parsePlanDetails(plan);
                                return (
                                  <>
                                    <div className="text-[0.85rem] font-semibold truncate" title={formatPlanName(plan)}>
                                      {tier}{cycle ? ` · ${cycle}` : ''}
                                    </div>
                                    {features.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 max-w-full">
                                        {features.slice(0, 3).map((f, idx) => (
                                          <Badge
                                            key={idx}
                                            variant="default"
                                            className="h-5 px-2 py-0 text-[0.65rem] leading-none rounded-full truncate max-w-[7rem]"
                                            title={f}
                                          >
                                            <span className="truncate">{f}</span>
                                          </Badge>
                                        ))}
                                        {features.length > 3 && (
                                          <Badge
                                            variant="default"
                                            className="h-5 px-1.5 py-0 text-[0.65rem] leading-none rounded-full"
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
                              <div className="text-sm font-semibold">Free</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
  
            <div className="flex justify-between gap-2 pt-4 border-t">
              {isEditing ? 
              (
                <Button 
                  variant={isEditing ? "default" : "outline"}
                  className={`px-2 sm:px-3 transition-all duration-200 ${
                    isEditing 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'border-2 border-borderColorPrimary hover:bg-accent'
                  }`}
                  size="sm"
                  onClick={handleEditToggle}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span className='hidden sm:inline'>Saving...</span>
                    </div>
                  ) : isEditing ? (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      <span className='hidden sm:inline'>Save Changes</span>
                    </div>
                  ) : ''}
                </Button>
              ) : (
                <Button 
                  className='p-2 sm:p-3 text-xs sm:text-sm group border-none dark:bg-white dark:text-black bg-black text-white' 
                  variant="outline" 
                  onClick={() => {
                    if (isPaidPlan) {
                      // handleManageSubscription();
                      router.push('/manage-subscription');
                    } else {
                      setPlansModalOpen(true);
                      onClose();
                    }
                  }}
                  disabled={isLoadingBillingPortal}
                >
                  {isLoadingBillingPortal ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Gem className='w-4 h-4 mr-2'/>
                    </>
                  )}
                  {isPaidPlan ? "MANAGE SUBSCRIPTION" : "UPGRADE"}
                </Button>
              )}
              <div className='flex gap-4'>
                <Button 
                  className='p-2 sm:p-3 text-xs sm:text-sm' 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false)
                    onClose(); 
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <PlansModal
          isOpen={plansModalOpen}
          onClose={() => setPlansModalOpen(false)}
        />
      </>
    );
  }