"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { authApi } from "@/lib/api/auth";

import { sendGAEvent } from '@next/third-parties/google'


export function GoogleButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await authApi.handleGoogleCallback();

      if (!response.url) {
        throw new Error("Failed to get redirect URL");
      }

      sendGAEvent('formSubmission', 'submit', { authType: 'continueWithGoogle', status: 'success'});
      
      window.location.href = response.url;
    } catch (error) {
      // console.error("Google sign-in failed:", error);
      sendGAEvent('formSubmission', 'submit', { authType: 'continueWithGoogle', status: 'failed'});
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Button 
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 border rounded-md py-2 px-4 transition-colors relative"
    >
      {isLoading ? (
        <>
          <Loader className="h-5 w-5 animate-spin" />
        </>
      ) : (
        <>
          <Image src="/icons/google.webp" alt="Google Logo" width={20} height={20} />
          <span>Continue with Google</span>
        </>
      )}
    </Button>
  );
}