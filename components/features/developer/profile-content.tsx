"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Mail, User, Loader, Award } from "lucide-react";
import { toast } from "sonner"
import { profileApi } from "@/lib/api/profile";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores";
import { cn } from "@/lib/utils";

export function DeveloperProfile() {
  const { user, token, plan, setAuth } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.first_name);
  const [lastName, setLastName] = useState(user?.last_name);
  const [editedFirstName, setEditedFirstName] = useState(firstName);
  const [editedLastName, setEditedLastName] = useState(lastName);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  // Check if name has been modified
  useEffect(() => {
    setIsEditing(editedFirstName !== firstName || editedLastName !== lastName);
  }, [editedFirstName, firstName, editedLastName, lastName]);

  const handleSave = async () => {
    if (!editedFirstName?.trim() || !editedLastName?.trim()) return;
    
    setIsSaving(true);
    try {
      const response = await profileApi.updateProfile({
        firstname: editedFirstName.trim(),
        lastname: editedLastName.trim(),
      });

      if (response.status && response.user) {
        // Update the auth store with new user data
        setAuth(
          {
            ...user!,
            first_name: response.user.first_name,
            last_name: response.user.last_name,
            photo_url: response.user.photo_url
          },
          token!,
          plan
        );
        
        setFirstName(editedFirstName);
        setLastName(editedLastName);
        setIsEditing(false);
        toast.success('Profile updated');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error: any) {
      // console.error('Error updating profile:', error);
      // toast.error(error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedFirstName(firstName);
    setEditedLastName(lastName);
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-[1200px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and preferences.
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-borderColorPrimary bg-transparent p-8">
        <div className="space-y-8">
          {/* Name Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Name</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm text-muted-foreground">
                  First Name
                </label>
                <Input
                  id="firstName"
                  value={editedFirstName}
                  onChange={(e) => setEditedFirstName(e.target.value)}
                  className="bg-transparent border-borderColorPrimary focus:border-primary transition-all"
                  placeholder="Enter first name"
                />
              </div>
              
              {/* Last Name */}
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm text-muted-foreground">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  value={editedLastName}
                  onChange={(e) => setEditedLastName(e.target.value)}
                  className="bg-transparent border-borderColorPrimary focus:border-primary transition-all"
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2 pt-2"
                >
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    className="w-20"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="w-20"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Email Section */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <Input
              value={`${user?.email}`}
              readOnly
              className="max-w-md bg-transparent border-borderColorPrimary cursor-not-allowed"
            />
          </div>

          {/* Plan Section */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Current Tier
            </label>
            <Badge 
              variant={plan?.toLowerCase() as "bronze" | "silver" | "gold"} 
              className={cn(
                "border-0",
              )}
            >
              TIER 1
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}