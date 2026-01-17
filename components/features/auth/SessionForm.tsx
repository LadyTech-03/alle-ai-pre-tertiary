"use client";

import { useState, useEffect } from "react";
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
import { orgDeviceApi } from "@/lib/api/orgDevice";
import { toast } from "sonner";
import { useOrgSessionStore } from "@/stores";

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

interface Option {
    value: string;
    label: string;
}

const classOptionsMock: Option[] = [
    { value: "basic-1", label: "Basic 1" },
    { value: "basic-2", label: "Basic 2" },
    { value: "basic-3", label: "Basic 3" },
    { value: "basic-4", label: "Basic 4" },
    { value: "basic-5", label: "Basic 5" },
    { value: "basic-6", label: "Basic 6" },
    { value: "basic-7", label: "Basic 7 (JHS 1)" },
    { value: "basic-8", label: "Basic 8 (JHS 2)" },
    { value: "basic-9", label: "Basic 9 (JHS 3)" },
];

export function SessionForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isClassesLoading, setIsClassesLoading] = useState(true);
    const [classOptions, setClassOptions] = useState<Option[]>([]);
    const router = useRouter();
    const orgId = useOrgSessionStore((state) => state.orgId);

    const form = useForm<SessionFormData>({
        resolver: zodResolver(sessionSchema),
        mode: "onBlur",
        defaultValues: {
            name: "",
            class: "",
        },
    });

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // Use Mockd data for class options
                setClassOptions(classOptionsMock);
                // Fetch class groups from API
                // const response = await orgDeviceApi.getClassGroups(orgId!);
                // if (response.status && response.data) {
                //     const options = response.data.map((group) => ({
                //         value: group.slug,
                //         label: group.name,
                //     }));
                //     setClassOptions(options);
                // }
            } catch (error) {
                console.error("Failed to fetch class groups:", error);
                // toast.error("Failed to load class options");
            } finally {
                setIsClassesLoading(false);
            }
        };

        fetchClasses();
    }, [orgId]);

    const onSubmit = async (data: SessionFormData) => {
        setIsLoading(true);

        try {
            // Call the start device session API
            // const response = await orgDeviceApi.startSession(orgId!, {
            //     name: data.name,
            //     class: data.class
            // });

                router.push("/project")

            // if (response.success && response.to === "edu_device_chat") {
            //     // Store session details
            //     useOrgSessionStore.getState().setDeviceSessionId(response.device_session);
            //     useOrgSessionStore.getState().setSessionUser(response.session_user);

            //     // Redirect to project page on success
            //     router.push("/project");
            // } else {
            //     setIsLoading(false);
            // }
        } catch (error: any) {
            // console.error("Session creation error:", error);
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
                <h1 className="text-3xl font-bold tracking-tight">Start Your Session</h1>
                <p className="text-muted-foreground">Enter your details to begin your learning experience</p>
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
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            type="text"
                                            placeholder="Enter your full name"
                                            className="pl-10 border-borderColorPrimary focus-visible:outline-none transition-colors"
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
                                <Select onValueChange={field.onChange} value={field.value} disabled={isClassesLoading}>
                                    <FormControl>
                                        <SelectTrigger className="border-borderColorPrimary focus-visible:outline-none transition-colors">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                <SelectValue placeholder={isClassesLoading ? "Loading Classes..." : "Select your class"} />
                                            </div>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-background border-borderColorPrimary">
                                        {classOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value} className="cursor-pointer">
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
                        className="w-full mt-8"
                        disabled={isLoading}
                        size="lg"
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
            <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
                <p>Your session will be active during this computer use</p>
            </div>
        </motion.div>
    );
}
