import { useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, AlertTriangle, Shield, Trash2, ExternalLink } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTabValue?: string;
  }

export function DeleteAccountModal({ isOpen, onClose }: ModalProps) {
    const [password, setPassword] = useState("");
    const [deleting, setDeleting] = useState(false);
    const { deleteAccount } = useAuth();
  
    const handleDeleteAccount = async () => {
      try {
        setDeleting(true);
        await deleteAccount(password);
        onClose();
      } catch (error: any) {
        // toast.error(error.response?.data?.error || error.response?.data?.message || 'Delete account failed, please try again');
        // console.error('Delete account failed:', error);
      } finally {
        setDeleting(false);
      }
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
          {/* Header with danger indicator */}
          <div className="bg-red-50 dark:bg-red-950/20 px-6 py-2 border-b border-red-200 dark:border-red-800/30">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-red-900 dark:text-red-100">
                    Delete Account
                  </DialogTitle>
                </div>
              </div>
          </DialogHeader>
          </div>

          {/* Content */}
          <div className="px-6 py-2 space-y-6">
            {/* Warning message */}
            <div className="rounded-lg border border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-950/10 p-4">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-red-900 dark:text-red-100">
                    What happens when you delete your account
                  </h4>
                  <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400 mt-2 flex-shrink-0" />
                      <span>Your account will be scheduled for deletion</span>
              </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400 mt-2 flex-shrink-0" />
                      <span>You cannot create a new account using the same email address</span>
              </li>
                     <li className="flex items-start gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400 mt-2 flex-shrink-0" />
                       <span>All your data will be permanently deleted after 30 days. Before that you can contact{" "}
                         <a 
                           href="mailto:support@alle-ai.com" 
                           className="text-red-600 dark:text-red-400 hover:underline font-medium"
                         >
                           support@alle-ai.com
                         </a>
                         {" "}for account recovery</span>
               </li>
             </ul>
                 </div>
               </div>
             </div>

            {/* Legal notice */}
            <div className="rounded-lg border border-borderColorPrimary bg-backgroundSecondary p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Legal Information</h4>
                  <p className="text-sm text-muted-foreground">
                    For complete details about data deletion and retention policies, please read our{" "}
                    <a 
                      href="/terms-of-service" 
                      target="_blank" 
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Terms of Service
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Password confirmation */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Confirm your current password to continue
                </Label>
              <Input
                  id="password"
                type="password"
                  placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                  className="focus-visible:outline-none focus:border-red-400 dark:focus:border-red-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && password.trim() && !deleting) {
                      handleDeleteAccount();
                    }
                  }}
                />
              </div>
            </div>
            </div>
  
          {/* Footer */}
          <DialogFooter className="px-6 pb-6 flex-col sm:flex-row gap-3">
              <Button
              variant="outline"
              onClick={onClose}
                disabled={deleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
                variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting || !password.trim()}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }