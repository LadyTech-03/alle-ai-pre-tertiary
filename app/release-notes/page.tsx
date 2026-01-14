"use client"

import { IconComponent } from "@/components/IconComponent"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowLeft, Clock, GitCommit, Star, ChevronRight, GitBranch, FileText, Code, Home } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Search, Globe } from "lucide-react"
import { releaseNotesData, languages, getLocalizedContent } from "@/lib/constants"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function ReleaseNotesContent() {
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [activeSection, setActiveSection] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])

  useEffect(() => {
    const handleScroll = () => {
      const sections = Object.entries(scrollRefs.current)
      
      for (const [id, element] of sections) {
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(id)
            break
          }
        }
      }
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const hash = window.location.hash
    if (hash && scrollRefs.current[hash.substring(1)]) {
      scrollRefs.current[hash.substring(1)]?.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  const filteredReleaseNotes = releaseNotesData.filter(release => {
    const content = getLocalizedContent(release, selectedLanguage.code);
    return (
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-background relative">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto p-4">
          <Link 
            href="/faq" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collection
          </Link>

          <div className="flex items-start gap-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <GitCommit className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Release Notes</h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Detailed documentation of all changes, improvements, and fixes in our platform.
              </p>
            </div>
          </div>

          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-6">
              {/* Keep existing icon and title */}
            </div>
            
            {/* Add this new section */}
            <div className="flex items-center gap-1">
                <ThemeToggle />

              {/* Search Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors">
                  <Search className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px] bg-backgroundSecondary">
                  <Input
                    placeholder="Search releases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="focus-visible:outline-none focus:border-borderColorPrimary"
                  />
                  {searchQuery && (
                    <div className="max-h-[300px] overflow-y-auto">
                      {filteredReleaseNotes
                        .map(note => {
                          const content = getLocalizedContent(note, selectedLanguage.code);
                          return (
                            <DropdownMenuItem key={note.id} className="py-2">
                              <a href={`#${note.id}`} className="flex flex-col gap-1">
                                <span className="font-medium">{content.title}</span>
                                <span className="text-xs text-muted-foreground">{note.version}</span>
                              </a>
                            </DropdownMenuItem>
                          );
                        })
                      }
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Language Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">{selectedLanguage.code.toUpperCase()}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang)}
                      className="flex items-center gap-2"
                    >
                      <span className="text-sm font-medium">{lang.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({lang.code.toUpperCase()})
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href={'/'}
                className="p-2 rounded-lg hover:bg-primary/10"
            >
                <Home />
            </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 flex gap-8">
        {/* Table of Contents - Fixed Position */}
        <div className="w-64 hidden lg:block sticky top-40 h-[calc(100vh-10em)]">
          <div className="rounded-lg border bg-backgroundSecondary p-4 h-full">
            <h3 className="font-medium mb-4 text-sm">Contents</h3>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="space-y-3 pr-4">
                {filteredReleaseNotes.map((release) => {
                  const content = getLocalizedContent(release, selectedLanguage.code);
                  return (
                    <a
                      key={release.id}
                      href={`#${release.id}`}
                      className={cn(
                        "block text-sm transition-all",
                        "hover:text-primary",
                        activeSection === release.id
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          activeSection === release.id
                            ? "bg-primary"
                            : "bg-muted-foreground"
                        )} />
                        <span className="text-xs">{release.version}</span>
                      </div>
                      <p className="ml-3 mt-1 line-clamp-2">{content.title}</p>
                    </a>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-16">
          {filteredReleaseNotes.map((release) => {
            const content = getLocalizedContent(release, selectedLanguage.code);
            return (
              <div 
                key={release.id}
                ref={el => scrollRefs.current[release.id] = el}
                id={release.id}
                className="scroll-mt-32 group"
              >
                <Card className={cn(
                  "border-2 border-primary/10 bg-backgroundSecondary transition-all duration-300",
                  "hover:border-primary/20 hover:shadow-lg",
                  activeSection === release.id && "border-primary/30"
                )}>
                  <CardContent className="p-8">
                    {/* Version Badge - New Floating Style */}
                    <div className="relative -mt-12 mb-6">
                      <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                        <span>{release.version}</span>
                        <span className="w-px h-4 bg-primary-foreground/20" />
                        <span className="text-primary-foreground/80 text-xs">{release.date}</span>
                      </div>
                    </div>

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {content.title}
                        </h2>
                        <p className="text-muted-foreground">{content.description}</p>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        release.type === "feature" && "bg-blue-500/10 text-blue-500",
                        release.type === "fix" && "bg-green-500/10 text-green-500",
                        release.type === "security" && "bg-red-500/10 text-red-500",
                        release.type === "testing" && "bg-yellow-500/10 text-yellow-500"
                      )}>
                        {release.type}
                      </span>
                    </div>

                    {/* Details with new styling */}
                    <div className="space-y-8">
                      <div className="bg-background/50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Overview
                        </h3>
                        <p className="text-muted-foreground">{content.details.summary}</p>
                      </div>

                      <div className="bg-background/50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <GitBranch className="w-5 h-5 text-primary" />
                          Changes
                        </h3>
                        <ul className="space-y-3">
                          {content.details.changes.map((change, index) => (
                            <li key={index} className="flex items-start gap-3 group/item">
                              <Star className="h-5 w-5 mt-0.5 text-primary opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                                {change}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {content.details.impact && (
                        <div>
                          <h3 className="text-lg font-medium mb-3">Impact</h3>
                          <p className="text-muted-foreground">{content.details.impact}</p>
                        </div>
                      )}

                      {release.image && (
                        <Image 
                          src={release.image}
                          alt="desc"
                          width={100}
                          height={100}
                          className="w-full"
                        />
                      )}

                      {content.details.technicalNotes && (
                        <div>
                          <h3 className="text-lg font-medium mb-3">Technical Notes</h3>
                          <ul className="space-y-2">
                            {content.details.technicalNotes.map((note, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Code className="h-4 w-4 mt-1 text-primary" />

                                <span className="text-muted-foreground">{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}