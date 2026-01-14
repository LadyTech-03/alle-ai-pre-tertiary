"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Loader, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner"
import { motion } from "framer-motion";

import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

interface ResetPasswordFormProps {
  email: string;
  token: string;
}

// Zod schema for reset password validation
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    passwordConfirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Helper function to calculate password validation details
const getPasswordValidation = (password: string) => {
  return {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-2 text-sm"
  >
    {isValid ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    )}
    <span className={isValid ? "text-green-500" : "text-red-500"}>{text}</span>
  </motion.div>
);

export function ResetPasswordForm({ email, token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const password = form.watch("password");
  const passwordConfirmation = form.watch("passwordConfirmation");

  const passwordValidation = useMemo(
    () => getPasswordValidation(password || ""),
    [password]
  );

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await authApi.resetPassword({
        token,
        email,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
      });

      toast.success("Password Reset Successful");
      router.push('/auth');
    } catch (error: any) {
      // toast.error(error.response?.data?.error || error.response?.data?.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    className="border-borderColorPrimary focus-visible:outline-none pr-10"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid gap-2 p-2 bg-background/50 rounded-lg"
                >
                  <ValidationItem
                    isValid={passwordValidation.hasMinLength}
                    text="At least 8 characters"
                  />
                  <ValidationItem
                    isValid={passwordValidation.hasUpperCase}
                    text="At least one uppercase letter"
                  />
                  <ValidationItem
                    isValid={passwordValidation.hasLowerCase}
                    text="At least one lowercase letter"
                  />
                  <ValidationItem
                    isValid={passwordValidation.hasNumber}
                    text="At least one number"
                  />
                  <ValidationItem
                    isValid={passwordValidation.hasSpecialChar}
                    text="At least one special character"
                  />
                </motion.div>
              )} */}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  className="border-borderColorPrimary focus-visible:outline-none"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              {passwordConfirmation &&
                password === passwordConfirmation &&
                passwordConfirmation !== "" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">Passwords match</span>
                  </motion.div>
                )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          variant="secondary"
          type="submit"
          className="w-full bg-black text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center"
            >
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Resetting Password...
            </motion.div>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </Form>
  );
}