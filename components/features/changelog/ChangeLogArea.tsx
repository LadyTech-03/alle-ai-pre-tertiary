"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Circle, Clock } from 'lucide-react'
import RenderPageContent from "@/components/RenderPageContent"

interface ChangelogEntry {
  id: string
  date: string
  title: string
  description?: string
  type: "security" | "solve" | "error" | "testing"| "feature" | "fix" | "bug" | "improvement"
}

const changelogData: ChangelogEntry[] = [
  {
    id: "1",
    date: "2024-12-01",
    title: "Launch New User Authentication System",
    description: "Introduced a secure, modern authentication system with multi-factor authentication and social media login integration.",
    type: "feature",
  },
  {
    id: "2",
    date: "2024-12-05",
    title: "Bug Fix: Mobile Navigation Issues",
    description: "Fixed navigation bugs on mobile devices, ensuring smooth transitions and responsive design across all screen sizes.",
    type: "fix",
  },
  {
    id: "3",
    date: "2024-12-07",
    title: "Server Optimization for Faster Load Times",
    description: "Implemented server-side optimizations to reduce page load times by 30%, improving overall platform speed and user experience.",
    type: "improvement",
  },
  {
    id: "4",
    date: "2024-12-08",
    title: "Introduce Dark Mode",
    description: "Launched a dark mode feature for improved user accessibility and preferences, allowing users to toggle between light and dark themes.",
    type: "feature",
  },
  {
    id: "5",
    date: "2024-12-09",
    title: "Fix: Form Submission Error on Safari",
    description: "Resolved an issue where form submissions were not being processed correctly on Safari browsers.",
    type: "fix",
  },
  {
    id: "6",
    date: "2024-12-10",
    title: "New API Integration for External Data Sync",
    description: "Integrated a new API for syncing external data with our platform, allowing seamless third-party integrations and data import/export capabilities.",
    type: "feature",
  },
  {
    id: "7",
    date: "2024-12-11",
    title: "Security Update: Patch Vulnerability in Payment Gateway",
    description: "Patched a security vulnerability in the payment gateway to prevent potential data breaches and enhance user data protection.",
    type: "security",
  },
  {
    id: "8",
    date: "2024-12-12",
    title: "Performance Enhancements for Image Handling",
    description: "Optimized image loading and rendering to improve page performance, reducing image load times by 40%.",
    type: "improvement",
  },
  {
    id: "9",
    date: "2024-12-13",
    title: "UI Update: Refined Dashboard Design",
    description: "Updated the user interface of the dashboard with a cleaner, more intuitive design and added new user customization options.",
    type: "feature",
  },
  {
    id: "10",
    date: "2024-12-14",
    title: "Fixed: Cross-Browser Compatibility Issue",
    description: "Fixed an issue where certain features were not displaying correctly across all major browsers, ensuring consistent behavior.",
    type: "fix",
  },
];


const getTypeColor = (type: ChangelogEntry["type"]) => {
  switch (type) {
    case "security":
      return "bg-blue-500"
    case "fix":
      return "bg-green-500"
    case "error":
      return "bg-red-500"
    case "feature":
      return "bg-blue-500"
    default:
      return "bg-gray-500"
  }
}

export default function Changelog() {
  return (
    <RenderPageContent>
        <div className="min-h-screen p-8">
        <Card className="mx-auto max-w-4xl border-0 bg-transparent shadow-none">
            <h1 className="text-center font-medium text-3xl mb-16">Changelog</h1>
            <CardContent className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-bodyColor" />

            {/* Timeline entries */}
            <div className="space-y-8">
                {changelogData.map((entry, index) => (
                <div
                    key={entry.id}
                    className={cn(
                    "relative flex gap-8 cursor-pointer hover:opacity-80 transition-opacity",
                    index % 2 === 0 ? "flex-row-reverse" : "flex-row"
                    )}
                    onClick={() => {
                        window.open(`/release-notes#${entry.id}`, '_blank')
                    }}
                >
                    {/* Content */}
                    <div className="flex-1">
                    <div
                        className={cn(
                        "flex items-center gap-2",
                        index % 2 === 0 ? "justify-start" : "justify-end"
                        )}
                    >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm text-muted-foreground">{entry.date}</span>
                    </div>
                    <div
                        className={cn(
                        "mt-2 text-foreground",
                        index % 2 === 0 ? "text-left" : "text-right"
                        )}
                    >
                        <h3 className="text-sm sm:text-base sm:font-medium">{entry.title}</h3>
                        {entry.description && (
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                            {entry.description}
                        </p>
                        )}
                    </div>
                    </div>

                    {/* Timeline dot */}
                    <div className="absolute left-1/2 -translate-x-1/2">
                    <Circle
                        className={cn(
                        "h-4 w-4 rounded-full",
                        getTypeColor(entry.type)
                        )}
                    />
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />
                </div>
                ))}
            </div>
            </CardContent>
        </Card>
        </div>
    </RenderPageContent>
  )
}

