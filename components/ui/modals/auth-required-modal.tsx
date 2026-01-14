"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePendingChatStateStore } from "@/stores";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthRequiredModal({ isOpen, onClose }: AuthRequiredModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setPending } = usePendingChatStateStore();

  const handleLogin = () => {
    onClose();
    router.push("/auth?mode=login");
  };

  const handleSignup = () => {
    onClose();
    router.push("/auth?mode=register");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login required</DialogTitle>
          <DialogDescription>
            Please login or create an account to continue this conversation.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleLogin}>
            Login
          </Button>
          <Button onClick={handleSignup}>Sign up</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


