"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { GoogleButton } from "./GoogleButton";
import { motion } from "framer-motion";
import { formVariants } from "@/lib/utils";
import { Loader } from "lucide-react";
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from "sonner"

import { sendGAEvent } from '@next/third-parties/google'

import Link from "next/link";
import { useRouter } from "next/navigation";

// Zod schema for login validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    // .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await login(data.email, data.password);
      sendGAEvent('formSubmission', 'submit', { authType: 'loginForm', status: 'success'});
      
      // Login function will handle other redirects
      // The loading state will be maintained until the page actually changes
    } catch (error: any) {
      form.setValue("password", "");
      // console.log(error, 'login error')
      sendGAEvent('formSubmission', 'submit', { authType: 'loginForm', status: 'failed'});
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>

      {/* Google Sign In */}
      <GoogleButton />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground">OR</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className="border-borderColorPrimary focus-visible:outline-none transition-colors h-10"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="border-borderColorPrimary focus-visible:outline-none transition-colors h-10"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-password"
                checked={showPassword}
                onCheckedChange={(checked) => setShowPassword(checked as boolean)}
                className="border-borderColorPrimary focus-visible:outline-none"
              />
              <label
                htmlFor="show-password"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Show password
              </label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-8"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>

      {/* Terms */}
      <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
        By continuing, you agree to Alle-AI&apos;s{" "}
        <Link href="/terms-of-service" target="_blank" className="underline hover:no-underline transition-colors">
          Terms of Service 
        </Link>{" "}
        &
        {" "}<Link href="/privacy-policy" target="_blank" className="underline hover:no-underline transition-colors">
           Privacy Policy
        </Link>
      </div>
    </motion.div>
  );
}