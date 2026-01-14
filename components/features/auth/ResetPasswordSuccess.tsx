import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { formVariants } from "@/lib/utils";
import { toast } from "sonner";


interface ResetPasswordSuccessProps {
    onBackToLogin: () => void;
    email?: string;
  }
  
  export function ResetPasswordSuccess({ onBackToLogin, email }: ResetPasswordSuccessProps) {
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    ;

    // Handle countdown timer
    useEffect(() => {
      if (countdown > 0) {
        const timer = setInterval(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
      }
    }, [countdown]);

    const handleResend = useCallback(async () => {
      if (countdown > 0 || isResending) return;

      setIsResending(true);
      try {
        // Simulate API call - replace with your actual resend logic
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        setCountdown(30); // Start 30s countdown
        toast.success('Reset link sent')
      } catch (error) {
        toast.error('Faild to send reset link');
      } finally {
        setIsResending(false);
      }
    }, [countdown, isResending, toast]);

    const renderResendButton = () => {
      if (countdown > 0) {
        return (
          <span className="text-muted-foreground">
            Resend again in {countdown}s
          </span>
        );
      }

      return (
        <Button
          variant="link"
          onClick={handleResend}
          disabled={isResending}
          className="text-sm text-muted-foreground hover:text-foreground p-1 italic"
        >
          {isResending ? "Sending..." : "Click to resend"}
        </Button>
      );
    };

    return (
      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-8 py-4"
      >
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping" />
            <CheckCircle2 
              className="h-20 w-20 text-green-500 animate-bounce" 
              strokeWidth={1.5}
            />
          </div>
        </div>

        <div className="text-center space-y-4">
          {/* <h2 className="text-2xl font-semibold text-foreground">Check Your Email</h2> */}
          <div className="space-y-2">
            <p className="text-muted-foreground">
              We have sent a password reset link to
            </p>
            <p className="font-medium text-foreground">
              {email || 'pascal@alle-ai.com'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            variant="secondary"
            onClick={onBackToLogin}
            className="w-full bg-black text-white transition-colors"
          >
            Back to Login
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the email?{" "}
            {renderResendButton()}
          </div>
        </div>
        

        <div className="text-center text-sm text-muted-foreground">
          <p>Need help? Contact our support team at</p>
          <a 
            href="mailto:support@alle-ai.com" 
            className="text-muted-foreground hover:underline font-medium italic"
          >
            support@alle-ai.com
          </a>
        </div>
      </motion.div>
    );
  }