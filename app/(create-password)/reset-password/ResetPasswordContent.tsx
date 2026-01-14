"use client";

import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm';
import Image from "next/image";
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface VerificationResponse {
  status: boolean;
  expired?: boolean;
  invalid?: boolean;
  data?: {
    user: {
      email: string;
      first_name: string;
      last_name: string;
      photo_url: string | null;
    }
  };
  message?: string;
}

export function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationResponse | null>(null);
  const { theme, resolvedTheme } = useTheme();
  
  const email = searchParams.get('fiankobea');
  const token = searchParams.get('kofi');

  useEffect(() => {
    setMounted(true);

    const verifyToken = async () => {
      if (email && token) {
        try {
          setIsVerifying(true);
          // console.log(email, '&&', token)
          const response = await authApi.verifyResetToken({ email, token });
          // console.log('Token verification response:', response);
          setVerificationStatus(response);
        } catch (error: any) {
          // toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to verify token');
          // console.error('Token verification error:', error);
          setVerificationStatus({ status: false, invalid: true });
        } finally {
          setIsVerifying(false);
        }
      }
    };

    if (mounted && email && token) {
      verifyToken();
    }
  }, [email, token, mounted]);

  if (!mounted) return null;

  const logoSrc = resolvedTheme === 'dark' ? '/svgs/logo-desktop-full.webp' : '/svgs/logo-desktop-dark-full.webp';

  const renderErrorContent = () => {
    if (!email || !token) {
      return {
        title: "Invalid Reset Link",
        message: "This password reset link is missing required information.",
        showRetry: true
      };
    }

    if (verificationStatus?.expired) {
      return {
        title: "Link Expired",
        message: "This password reset link has expired. Please request a new one.",
        showRetry: true
      };
    }

    if (verificationStatus?.invalid) {
      return {
        title: "Invalid Reset Link",
        message: "This password reset link is invalid. Please request a new one.",
        showRetry: true
      };
    }

    return {
      title: "Invalid Reset Link",
      message: "Something went wrong. Please try again.",
      showRetry: true
    };
  };

  if (!email || !token || (verificationStatus && !verificationStatus.status)) {
    const { title, message, showRetry } = renderErrorContent();
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="flex justify-center mb-6">
            <Image
              src={logoSrc}
              alt="alle-ai"
              width={100}
              height={100}
            />
          </div>
          <div className="bg-backgroundColorSecondary p-8 rounded-lg border border-borderColorPrimary shadow-lg">
            <h1 className="text-2xl font-semibold mb-3">{title}</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            {showRetry && (
              <div className="space-y-4">
                <Button 
                  variant="outline"
                  onClick={() => router.replace('/')}
                  className="w-full"
                >
                  Return to Homepage
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="flex justify-center mb-6">
            <Image
              src={logoSrc}
              alt="alle-ai"
              width={100}
              height={100}
            />
          </div>
          <div className="bg-backgroundColorSecondary p-8 rounded-lg border border-borderColorPrimary shadow-lg">
            <h1 className="text-xl font-semibold mb-3">Verifying Reset Link</h1>
            <p className="text-muted-foreground">Please wait while we verify your reset link...</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Logo */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center"
        >
          <Image
            src={logoSrc}
            alt="alle-ai"
            width={120}
            height={120}
          />
        </motion.div>

        {/* User Profile Section */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col items-center space-y-4"
        >
          <Avatar className="h-24 w-24 ring-2 ring-offset-2 ring-offset-background ring-border">
            <AvatarImage src={ verificationStatus?.data?.user.photo_url || ''} alt="Profile" />
            <AvatarFallback className="text-2xl bg-primary/10">
              {verificationStatus?.data?.user.first_name.charAt(0)}
              {verificationStatus?.data?.user.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <motion.h2 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-semibold"
            >
              {verificationStatus?.data?.user.first_name} {verificationStatus?.data?.user.last_name}
            </motion.h2>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-muted-foreground"
            >
              {verificationStatus?.data?.user.email}
            </motion.p>
          </div>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-backgroundColorSecondary rounded-lg p-6 shadow-lg border border-borderColorPrimary"
        >
          <ResetPasswordForm email={email} token={token} />
        </motion.div>

        {/* Security Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="text-center text-sm text-muted-foreground"
        >
          For your security, this password reset link will expire in 15 minutes.
        </motion.p>
      </div>
    </div>
  );
}