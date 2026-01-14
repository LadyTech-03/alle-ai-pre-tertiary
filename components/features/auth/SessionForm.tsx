"use client";

import { useState } from "react";
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
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { formVariants } from "@/lib/utils";
import { Loader, User, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Zod schema for session validation
const sessionSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must not exceed 50 characters"),
    class: z
        .string()
        .min(1, "Please select a class"),
});

type SessionFormData = z.infer<typeof sessionSchema>;

// Class options from Class 1 to Class 8
const CLASS_OPTIONS = Array.from({ length: 8 }, (_, i) => ({
    value: `class-${i + 1}`,
    label: `Class ${i + 1}`,
}));

export function SessionForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<SessionFormData>({
        resolver: zodResolver(sessionSchema),
        mode: "onBlur",
        defaultValues: {
            name: "",
            class: "",
        },
    });

    const onSubmit = async (data: SessionFormData) => {
        setIsLoading(true);

        try {
            // Log session data (you can store this or send to backend if needed)
            console.log("Session created:", data);

            // Small delay for better UX
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Redirect to project page
            router.push("/project");
        } catch (error) {
            console.error("Session creation error:", error);
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
            {/* Welcome Message */}
            <div className="text-center space-y-2 mb-6">
                <div className="flex items-center justify-center gap-2 text-4xl mb-3">
                    <Image src="/svgs/college_logo.png" alt="Logo" width={200} height={200} />
                </div>
            </div>

            {/* Session Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Your Name</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Enter your full name"
                                            className="pl-10 border-borderColorPrimary focus-visible:outline-none"
                                            autoComplete="name"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="class"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Your Class</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="border-borderColorPrimary focus-visible:outline-none">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                <SelectValue placeholder="Select your class" />
                                            </div>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {CLASS_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Starting Session
                            </>
                        ) : (
                            "Start Session"
                        )}
                    </Button>
                </form>
            </Form>

            {/* Footer Note */}
            <div className="text-center text-xs text-muted-foreground pt-4">
                <p>Your session will be active during this computer use</p>
            </div>
        </motion.div>
    );
}
