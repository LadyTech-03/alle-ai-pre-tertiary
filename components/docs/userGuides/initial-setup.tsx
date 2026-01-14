// @ts-nocheck
import React, { useState } from "react";
import Link from "next/link";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  MessageCircle,
  Image,
  FileAudio,
  Mic,
  Clock,
  TvMinimalPlay,
} from "lucide-react";
import RenderCode from "@/components/RenderCode";
import { makeYourFirstRequest } from "@/lib/constants/code-snippets-docs/userGuides";
export default function Quickstart() {
  const [selectedLanguage, setSelectedLanguage] = useState("python");

  const installCommands = {
    python: "pip install alle-ai",
    javascript: "npm install alle-ai",
  };

  const nextSteps = [
    {
      name: "Chat Completions",
      description:
        "Learn more about generating text responses to natural language prompts",
      icon: <MessageCircle className="w-6 h-6" />,
      link: "#",
    },
    {
      name: "Image Generation",
      description: "Generate images using our DALL·E model",
      icon: <Image className="w-6 h-6" />,
      link: "#",
    },
    {
      name: "Speech-to-text",
      description:
        "Create transcriptions of voice recordings with our Whisper model",
      icon: <Mic className="w-6 h-6" />,
      link: "#",
    },
    {
      name: "Audio generation",
      description:
        "Analyze and filter user-created content with our moderation model",
      icon: <FileAudio className="w-6 h-6" />,
      link: "#",
    },
    {
      name: "Video generation",
      description: "Interact with multiple video models",
      icon: <TvMinimalPlay className="w-6 h-6" />,
      link: "#",
    },
    {
      name: "Batch",
      description: "Batch requests for async jobs",
      icon: <Clock className="w-6 h-6" />,
      link: "#",
    },
  ];

  return (
    <div className="text-base">
      <section className="mb-6">
        <p className="text-muted-foreground text-lg">
          The Alle-AI API brings together the best AI models, including ChatGPT,
          Claude, Gemini and more into one powerful platform. Whether you want
          to chat, generate images, create audio, or produce videos, Alle-AI
          makes it easy and seamless. This guide will show you how to use the
          API to generate natural conversations, create smart search embeddings,
          and turn text into stunning visuals, sound, and video.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-3xl mb-3">
          Create and export an API key
        </h2>
        <p className="leading-8">
          <span className="text-blue-600 font-semibold">
            <Link href="/developer" target="_blank">
              Create an API key in the dashboard here.{" "}
            </Link>
          </span>
          Once you generate your API key, store it securely in a safe location,
          such as a{" "}
          <span className="bg-black p-1 rounded-md text-blue-600">.env</span>{" "}
          file. Then, import it into your code when needed.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-3xl font-bold mb-3">Install the SDK</h2>
        <div className="mb-5">
          <ToggleGroup
            type="single"
            value={selectedLanguage}
            onValueChange={(value) => {
              if (value) setSelectedLanguage(value);
            }}
            className="bg-black p-1 rounded-md w-1/4"
          >
            <ToggleGroupItem
              value="python"
              className="data-[state=on]:bg-accent w-1/2 data-[state=on]:dark:text-white text-white hover:bg-accent/10 px-4 py-2 transition-colors"
            >
              Python
            </ToggleGroupItem>
            <ToggleGroupItem
              value="javascript"
              className="data-[state=on]:bg-accent w-1/2 data-[state=on]:dark:text-white text-white hover:bg-accent/10 px-4 py-2 transition-colors"
            >
              Javascript
            </ToggleGroupItem>
          </ToggleGroup>
          <RenderCode
            code={installCommands[selectedLanguage]}
            language={selectedLanguage}
          />
        </div>
      </section>

      <section className="mb-6">
        <h2 id="make_a_request" className="text-3xl font-bold mb-3">
          Make your first API request
        </h2>
        <p className="mb-6">
          With your Alle-AI API key set as an environment variable, you&apos;re ready
          to start using our platform. For now, we only support access through{" "}
          <span className="text-blue-600 font-semibold">Our official SDK</span>,
          as shown below.
        </p>
        <div className="mb-5">
          <ToggleGroup
            type="single"
            value={selectedLanguage}
            onValueChange={(value) => {
              if (value) setSelectedLanguage(value); // Only update if a value is provided
            }}
            className="bg-black p-1 rounded-md w-1/4"
          >
            <ToggleGroupItem
              value="python"
              className="data-[state=on]:bg-accent w-1/2 data-[state=on]:dark:text-white text-white hover:bg-accent/10 px-4 py-2 transition-colors"
            >
              Python
            </ToggleGroupItem>
            <ToggleGroupItem
              value="javascript"
              className="data-[state=on]:bg-accent w-1/2 data-[state=on]:dark:text-white text-white hover:bg-accent/10 px-4 py-2 transition-colors"
            >
              Javascript
            </ToggleGroupItem>
          </ToggleGroup>
          <RenderCode
            code={makeYourFirstRequest[selectedLanguage]}
            language={selectedLanguage}
          />
        </div>
      </section>

      <section className="mb-6">
        <h2 id="next_steps" className="text-3xl font-bold mb-3">
          Next Steps
        </h2>
        <p className="text-muted-foreground text-lg mb-6">
          Now that you&apos;ve made your first Alle-AI API request, you can explore
          the following resources:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nextSteps.map((step, index) => (
            <Link
              key={index}
              href={step.link}
              className="p-4 border rounded-lg hover:border-blue-600 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                {step.icon}
                <h3 className="font-semibold">{step.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
