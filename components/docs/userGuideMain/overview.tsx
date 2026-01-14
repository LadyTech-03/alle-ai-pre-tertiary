"use client";
import Link from "next/link";
import {
  MessageSquare,
  Images,
  Headphones,
  Video,
  ArrowRight,
  List,
  BookOpen,
  Code,
  ChevronRight,
  Gauge,
  Layers,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const resourceCards = [
  {
    title: "Process Text with AI",
    description: "Summarize or chat using combined model outputs.",
    href: "/docs/api-reference/chat-endpoints",
    icon: <MessageSquare className="w-6 h-6 text-black dark:text-white" />,
  },
  {
    title: "Generate Custom Images",
    description: "Create AI-driven visuals with flexible inputs.",
    href: "/docs/api-reference/image-generation",
    icon: <Images className="w-6 h-6 text-black dark:text-white" />,
  },
  {
    title: "Set Up Your API Access",
    description: "Get your api keys and start using our APIs.",
    href: "/developer/settings/api-keys",
    icon: <Code className="w-6 h-6 text-black dark:text-white" />,
  },
  {
    title: "Handle Audio Workflows",
    description: "Generate, transcribe, or synthesize audio via API.",
    href: "/docs/api-reference/audio-text-to-speech",
    icon: <Headphones className="w-6 h-6 text-black dark:text-white" />,
  },
  {
    title: "Manipulate Video Content",
    description: "Generate videos programmatically with multiple video models.",
    href: "/docs/api-reference/video-generation",
    icon: <Video className="w-6 h-6 text-black dark:text-white" />,
  },
  {
    title: "API Pricing",
    description: "Explore plans for text, image, audio, and video APIs.",
    href: "/docs/user-guides/pricing",
    icon: <DollarSign className="w-6 h-6 text-black dark:text-white" />,
  },
  {
    title: "API Rate Limits",
    description: "Check usage limits for all AI endpoints.",
    href: "/docs/user-guides/usage-tiers",
    icon: <Gauge className="w-6 h-6 text-black dark:text-white" />,
  },
];

const tasks = [
  {
    id: "chat-text",
    title: "Chat & Text",
    href: "/chat",
    models: ["DeepSeek", "Gemini", "Claude"],
    icon: <MessageSquare className="w-6 h-6 text-black dark:text-white" />,
    description: "Write, summarize, or translate with top models.",
    featured: true,
  },
  {
    id: "image-generation",
    title: "Image Generation",
    href: "/image",
    models: ["Stable Diffusion", "DALL·E"],
    icon: <Images className="w-6 h-6 text-black dark:text-white" />,
    description: "Create art, logos, or photos effortlessly.",
  },
  {
    id: "audio-voice",
    title: "Audio & Voice",
    href: "/audio",
    models: ["ElevenLabs", "Whisper"],
    icon: <Headphones className="w-6 h-6 text-black dark:text-white" />,
    description: "Synthesize speech, transcribe, or make music.",
  },
  {
    id: "video-animation",
    title: "Video & Animation",
    href: "/video",
    models: ["Runway", "Pika"],
    icon: <Video className="w-6 h-6 text-black dark:text-white" />,
    description: "Generate clips or animate avatars easily.",
  },
];

export default function PlatformOverview() {
  return (
    <main className="w-full max-w-full px-3 sm:px-3 lg:px-3">
      {/* Hero Section */}
      <div className="relative rounded-xl p-8 mb-12 border border-borderColorPrimary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r   pointer-events-none" />

        <p className="text-lg text-muted-foreground  max-w-3xl mb-6">
          Generate text, images, audio, and video all in one place. Select from
          multiple top-tier AI models for each task, or enhance your results
          with AlleAI’s proprietary models built for quality and flexibility
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center text-white justify-center px-6 py-3 bg-black  dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all duration-300 font-medium"
          >
            Start Creating
            <ArrowRight className="w-4 h-4 ml-2 text-white dark:text-black" />
          </Link>
          <Link
            href="/docs/api-reference/introduction"
            target="_blank"
            className="inline-flex items-center justify-center px-6 py-3  border-black border-2 dark:border-gray-500 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-300 font-medium"
          >
            <BookOpen className="w-4 h-4 mr-2 text-black dark:text-white" />{" "}
            Developer Quickstart
          </Link>
        </div>
      </div>

      {/* Choose Your Task Section */}
      <section id="platform-tasks" className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Explore
          </h2>
          <Link
            href="/model-glossary"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-transform transform hover:scale-105"
          >
            All Models{" "}
            <ChevronRight className="w-4 h-4 ml-1 text-gray-500 dark:text-gray-400" />
          </Link>
        </div>
        <p className="text-muted-foreground mb-8 text-base sm:text-lg">
          Pick a task to unlock Alle-AI’s powerful capabilities.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {tasks.map((task) => (
            <Link key={task.id} href={task.href}>
              <Card
                className={`relative max-w-md mx-auto bg-background border border-borderColorPrimary rounded-lg hover:shadow-lg transition-all duration-200 group ${
                  task.featured ? "border-2" : ""
                }`}
              >
                {task.featured && (
                  <span className="absolute top-3 right-3 text-xs font-semibold bg-gray-900 dark:bg-gray-200 text-white dark:text-gray-900 px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
                <CardHeader className="flex flex-row items-start space-y-0 pb-4">
                  <div className="mr-4 p-3 border-black border-2 dark:border-gray-500 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-zinc-800 transition-colors">
                    {task.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2  group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {task.title}
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      {task.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-6 px-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 border-t border-borderColorPrimary pt-4">
                    Models:{" "}
                    <span className="font-medium">
                      {task.models.join(", ")} and more
                    </span>
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Developer Resources Section */}
      <section id="developer-resources" className="mb-16">
        <div className="rounded-xl p-8 border border-borderColorPrimary">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 ">
            Build with Alle-AI
          </h2>
          <p className="text-muted-foreground mb-8 text-base sm:text-lg">
            Integrate our APIs and SDKs to bring AI to your apps.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resourceCards.map((card, index) => (
              <Link key={index} href={card.href} className="block group">
                <Card className="h-full border bg-background border-borderColorPrimary rounded-lg hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center mb-2">
                      <div className="p-3 border-black border-2 dark:border-gray-500  rounded-lg mr-3 group-hover:bg-gray-100 dark:group-hover:bg-zinc-800 transition-colors">
                        {card.icon}
                      </div>
                      <CardTitle className="text-lg  group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        {card.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <CardDescription className="text-muted-foreground">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-black dark:text-white" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/docs/api-reference"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-transform transform hover:scale-105"
            >
              Explore All APIs{" "}
              <ChevronRight className="w-4 h-4 inline text-gray-500 dark:text-gray-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="mb-16">
        <div className="rounded-xl p-6 border border-borderColorPrimary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Need Help?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Dive into our guides or reach out for support.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/docs/api-reference/introduction"
              target="_blank"
              className="inline-flex items-center px-4 py-2  border-black border-2 dark:border-gray-500 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-300 font-medium"
            >
              <BookOpen className="w-4 h-4 mr-2 text-black dark:text-white" />{" "}
              Quickstart
            </Link>
            <Link
              href="/support"
              target="_blank"
              className="inline-flex items-center px-4 py-2 border-black border-2 dark:border-gray-500 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-300 font-medium"
            >
              <List className="w-4 h-4 mr-2 text-black dark:text-white" />{" "}
              Support
            </Link>
          </div>
        </div>
      </section>

      {/* Uncomment if needed */}
      {/* <div className="mb-5">
        <ArticleFeedback />
      </div>
      <DocsFooter /> */}
    </main>
  );
}
