"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Loader, Check, X } from "lucide-react";
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from "sonner"
import { sendGAEvent } from '@next/third-parties/google'
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";

interface RegisterFormProps {
  onSwitchMode: () => void;
  onRegister: (email: string) => void;
}

// Zod schema for registration validation
const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be at most 50 characters")
      .regex(/^[\p{L}\p{M}\p{Zs}'’.\-]+$/u, "Please enter a valid name"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be at most 50 characters")
      .regex(/^[\p{L}\p{M}\p{Zs}'’.\-]+$/u, "Please enter a valid name"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
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
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      const pwd = data.password.toLowerCase();
      const email = data.email.toLowerCase();
      return pwd !== email;
    },
    {
      message: "Password cannot be the same as your email",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      const pwd = data.password.toLowerCase();
      const firstName = data.firstName.toLowerCase();
      const lastName = data.lastName.toLowerCase();
      return pwd !== firstName && pwd !== lastName;
    },
    {
      message: "Password cannot be your name",
      path: ["password"],
    }
  );

type RegisterFormData = z.infer<typeof registerSchema>;

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

// Muted style for password popover (avoid alarming red as user types)
const PasswordValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
  <div className="flex items-center gap-2 text-sm">
    {isValid ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground" />
    )}
    <span className={isValid ? "text-green-500" : "text-muted-foreground"}>{text}</span>
  </div>
);

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

export const RegisterForm = ({ onSwitchMode, onRegister }: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");
  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");
  const email = form.watch("email");
  const confirmPassword = form.watch("confirmPassword");

  const passwordValidation = useMemo(
    () => getPasswordValidation(password || ""),
    [password]
  );

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordValidation.hasMinLength) score += 1;
    if (passwordValidation.hasUpperCase) score += 1;
    if (passwordValidation.hasLowerCase) score += 1;
    if (passwordValidation.hasNumber) score += 1;
    if (passwordValidation.hasSpecialChar) score += 1;
    return score;
  }, [passwordValidation]);

  const passwordStrength = useMemo(
    () => Math.round((passwordScore / 5) * 100),
    [passwordScore]
  );

  const passwordBarColor = useMemo(() => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 80) return "bg-orange-500";
    return "bg-green-500";
  }, [passwordStrength]);

  useEffect(() => {
    if (!password) {
      setShowPasswordHelp(false);
    }
  }, [password]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const result = await registerUser({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });

      sendGAEvent("formSubmission", "submit", {
        formType: "registerForm",
        status: "success",
      });

      if (result && result.to === "verify-email") {
        onRegister(data.email);
        setIsLoading(false);
      }
    } catch (error: any) {
      // toast.error(error.message || error.response?.data?.message || "Please check your information and try again");
      setIsLoading(false);
      sendGAEvent("formSubmission", "submit", {
        formType: "registerForm",
        status: "failed",
      });
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
      {/* Google Sign Up */}
      <GoogleButton />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-gray-500">OR</span>
        </div>
      </div>

      {/* Registration Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="First name"
                      className="border-borderColorPrimary focus-visible:outline-none"
                      autoComplete="given-name"
                      {...field}
                    />
                  </FormControl>
                  {/* {firstName && firstName.length >= 2 && (
                    <ValidationItem isValid={true} text="At least 2 characters" />
                  )} */}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Last Name"
                      className="border-borderColorPrimary focus-visible:outline-none"
                      autoComplete="family-name"
                      {...field}
                    />
                  </FormControl>
                  {/* {lastName && lastName.length >= 2 && (
                    <ValidationItem isValid={true} text="At least 2 characters" />
                  )} */}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className="border-borderColorPrimary focus-visible:outline-none"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                {/* {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                  <ValidationItem isValid={true} text="Valid email address" />
                )} */}
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
                  <Popover open={showPasswordHelp} onOpenChange={setShowPasswordHelp}>
                    <PopoverTrigger asChild>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        className="border-borderColorPrimary focus-visible:outline-none"
                        autoComplete="new-password"
                        onFocus={() => setShowPasswordHelp(true)}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!showPasswordHelp && e.target.value)
                            setShowPasswordHelp(true);
                        }}
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="start"
                      className="w-[340px] p-4 bg-backgroundSecondary"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      <div className="space-y-3">
                        <div className="text-sm font-medium">
                          Strength: {passwordStrength}%
                        </div>
                        <Progress
                          value={passwordStrength}
                          className="h-2"
                          indicatorClassName={passwordBarColor}
                        />
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            Password Requirements:
                          </div>
                          <PasswordValidationItem
                            isValid={passwordValidation.hasMinLength}
                            text="at least 8 characters"
                          />
                          <PasswordValidationItem
                            isValid={passwordValidation.hasNumber}
                            text="at least 1 number"
                          />
                          <PasswordValidationItem
                            isValid={passwordValidation.hasUpperCase}
                            text="at least 1 uppercase letter"
                          />
                          <PasswordValidationItem
                            isValid={passwordValidation.hasLowerCase}
                            text="at least 1 lowercase letter"
                          />
                          <PasswordValidationItem
                            isValid={passwordValidation.hasSpecialChar}
                            text="at least 1 special character"
                          />
                        </div>
                        <p className="text-xs text-foreground">
                          Avoid passwords you use on other sites or that are easy
                          to guess.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="border-borderColorPrimary focus-visible:outline-none"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                {/* {confirmPassword &&
                  password === confirmPassword &&
                  confirmPassword !== "" && (
                    <ValidationItem isValid={true} text="Passwords match" />
                  )} */}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-password-register"
                checked={showPassword}
                onCheckedChange={(checked) => setShowPassword(checked as boolean)}
                className="border-borderColorPrimary focus-visible:outline-none"
              />
              <label
                htmlFor="show-password-register"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Show password
              </label>
            </div>
          </div>

          <Button
            variant="secondary"
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>
      </Form>

      {/* Login Link */}
      <div className="text-center items-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Button
          variant="link"
          onClick={onSwitchMode}
          className="text-foreground text-sm underline font-medium p-0"
        >
          Log in
        </Button>
      </div>

      {/* Terms */}
      <div className="text-center text-xs text-muted-foreground">
        By continuing, you agree to Alle-AI&apos;s{" "}
        <Link href="/terms-of-service" target="_blank" className="underline">
          Terms of Service
        </Link>{" "}
        &{" "}
        <Link href="/privacy-policy" target="_blank" className="underline">
          Privacy Policy
        </Link>
      </div>
    </motion.div>
  );
};