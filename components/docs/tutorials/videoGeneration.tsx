"use client";
import React, { useState } from "react";
import VideoPlayer from "@/components/features/video/videoPlayer";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import NavigationContainer from "@/components/NavigationContainer";
export default function VideoGeneration() {
  const { resolvedTheme } = useTheme();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // Sample video data
  const demoVideos = [
    {
      modelId: "sora",
      videoUrl: "/videos/video3.mp4",
      modelName: "Sora AI",
      modelImage: "/models/sora.webp",
    },
    {
      modelId: "runway",
      videoUrl: "/videos/video3.mp4",
      modelName: "Runway ML",
      modelImage: "/models/runway.webp",
    },
    {
      modelId: "luma",
      videoUrl: "/videos/video3.mp4",
      modelName: "Luma AI",
      modelImage: "/models/luma.webp",
    },
  ];

  // FAQ data
  const faqData = [
    {
      question: "What types of videos can I generate with ALLE-AI?",
      answer:
        "You can create various video types including animations, realistic scenes, product demos, and abstract visuals. The platform supports multiple AI models for different styles and use cases.",
    },
    {
      question: "How long can generated videos be?",
      answer:
        "Video length can range from 3 seconds to 5 minutes depending on your subscription plan. Higher tiers support longer durations and higher resolutions.",
    },
    {
      question: "Can I edit videos after generation?",
      answer:
        "Yes, our platform provides basic editing tools for trimming, adding text overlays, and adjusting playback speed. For advanced editing, you can export to professional tools.",
    },
    {
      question: "What resolutions are supported?",
      answer:
        "We support up to 4K resolution for premium users. Standard plans include 1080p output, while free tier supports 720p.",
    },
  ];

  // What to Read Next data
  const readNextData = [
    { title: "Image Generation Guide", href: "/docs/user-guides/image" },
    { title: "Audio Generation Guide", href: "/docs/user-guides/audio" },
    { title: "Advanced Editing Tools", href: "/docs/user-guides/editing" },
  ];

  const toggleQuestion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section>
        <h1 className="text-4xl font-bold mb-4">
          Create Captivating Videos with ALLE-AI
        </h1>
        <p className="text-muted-foreground text-lg">
          Transform your ideas into dynamic video content using state-of-the-art
          AI models. Generate animations, realistic scenes, or abstract visuals.
          Choose from multiple models, adjust parameters like duration and
          aspect ratio, and bring your vision to life.
        </p>
      </section>

      {/* Live Demo Section */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Model Comparison Demo</h2>
          <p className="text-muted-foreground mb-6">
            Below demonstrates different AI models interpreting the same prompt:
            <em className="block mt-2">
              "A tranquil forest scene with morning mist and sunlight filtering
              through trees"
            </em>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoVideos.map((video) => (
              <div
                key={video.modelId}
                className="border rounded-lg overflow-hidden"
              >
                <VideoPlayer
                  videoUrl={video.videoUrl}
                  modelName={video.modelName}
                  modelId={video.modelId}
                  modelImage={video.modelImage}
                />
                <div className="p-4 bg-muted/50">
                  <h3 className="font-semibold">{video.modelName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Resolution: 1080p · Duration: 10s
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          Getting Started with Video Generation
        </h2>

        <div className="space-y-8">
          {/* Step 1 */}
          <div>
            <h3 className="text-xl font-semibold mb-2">
              1. Setting Up Video Generation
            </h3>
            <Image
              src={
                resolvedTheme === "dark"
                  ? "/screenshots/video-mode-dark.webp"
                  : "/screenshots/video-mode-light.webp"
              }
              width={800}
              height={200}
              alt="Video mode selection"
              className="rounded-lg border mb-4"
            />
            <p className="text-muted-foreground">
              Ensure you're in Video Generation mode from the sidebar. The
              video-specific toolbar will appear with timeline controls, aspect
              ratio options, and model selection.
            </p>
          </div>

          {/* Step 2 */}
          <div>
            <h3 className="text-xl font-semibold mb-2">
              2. Crafting Effective Video Prompts
            </h3>
            <div className="p-6 bg-muted/50 rounded-lg">
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Scene Composition:</strong> Describe subjects,
                  backgrounds, and camera angles
                  <br />
                  <em>
                    Example: "Close-up of a dew-covered spiderweb in morning
                    light"
                  </em>
                </li>
                <li>
                  <strong>Motion Description:</strong> Specify movement types
                  and speeds
                  <br />
                  <em>
                    Example: "Slow pan across mountain range with drifting
                    clouds"
                  </em>
                </li>
                <li>
                  <strong>Style Guidance:</strong> Indicate artistic style or
                  realism level
                  <br />
                  <em>
                    Example: "Cinematic color grading with dramatic lighting"
                  </em>
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <h3 className="text-xl font-semibold mb-2">
              3. Advanced Video Settings
            </h3>
            <Image
              src={
                resolvedTheme === "dark"
                  ? "/screenshots/video-settings-dark.webp"
                  : "/screenshots/video-settings-light.webp"
              }
              width={800}
              height={400}
              alt="Video settings"
              className="rounded-lg border mb-4"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Key Parameters</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Aspect Ratio (16:9, 1:1, 9:16)</li>
                  <li>• Frame Rate (24fps, 30fps, 60fps)</li>
                  <li>• Output Resolution (720p to 4K)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Advanced Controls</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Camera Motion Paths</li>
                  <li>• Dynamic Lighting Effects</li>
                  <li>• Style Interpolation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          Video Creation Best Practices
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">✓ Effective Techniques</h3>
            <ul className="space-y-2">
              <li>• Use sequential prompts for multi-scene videos</li>
              <li>• Leverage reference images/videos for consistency</li>
              <li>• Experiment with different model combinations</li>
            </ul>
          </div>
          <div className="p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">✗ Common Pitfalls</h3>
            <ul className="space-y-2">
              <li>• Overloading single prompts with too many elements</li>
              <li>• Neglecting to specify camera movements</li>
              <li>• Using conflicting style descriptors</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="border rounded-lg p-4">
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full flex justify-between items-center"
              >
                <h3 className="font-medium text-left">{faq.question}</h3>
                <span className="text-xl">
                  {expandedQuestion === index ? "-" : "+"}
                </span>
              </button>
              {expandedQuestion === index && (
                <p className="mt-4 text-muted-foreground">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Related Guides */}
      <NavigationContainer
        previousTitle="Audio Generation"
        // previousDescription="Create AI-generated audio, including speech synthesis, music, and sound effects."
        preUrl="/docs/tutorials/audio-ai"
        // nextDesciption="Learn how to craft effective prompts to get the best results from AI models."
        nextTitle="Prompt Engineering"
        nextUrl="/docs/tutorials/prompts"
      />
    </div>
  );
}
