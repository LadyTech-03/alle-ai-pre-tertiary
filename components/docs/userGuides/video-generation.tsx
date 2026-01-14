"use client";
import React, { useRef } from "react";
import VideoPlayer from "@/components/features/video/videoPlayer";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import NavigationContainer from "@/components/NavigationContainer";
import CollapsibleItems from "../CollapsibleItem";
import ArticleFeedback from "../articleFeedback";
import DocsFooter from "../simpleFooterDocs";

export default function VideoGeneration() {
  const { resolvedTheme } = useTheme();
  const showcaseRef = useRef<HTMLDivElement>(null);

  // Sample video data
  const demoVideos = [
    {
      id: "sora",
      videoUrl: "/videos/video3.mp4",
      modelName: "Sora AI",
      modelImage: "/models/sora.webp",
    },
    {
      id: "runway",
      videoUrl: "/videos/video3.mp4",
      modelName: "Runway ML",
      modelImage: "/models/runway.webp",
    },
    {
      id: "luma",
      videoUrl: "/videos/video3.mp4",
      modelName: "Luma AI",
      modelImage: "/models/luma.webp",
    },
  ];

  // FAQ data
const faqData = [
  {
    id: "1",
    question: "What types of videos can I generate with ALLE-AI?",
    answer:
      "You can create various video types including animations, realistic scenes, product demos, and abstract visuals. The platform supports multiple AI models for different styles and use cases.",
  },
  {
    id: "2",
    question: "How long can generated videos be?",
    answer:
      "Video length can range from 3 seconds to 5 minutes depending on your subscription plan. Higher tiers support longer durations and higher resolutions.",
  },
  {
    id: "3",
    question: "Can I edit videos after generation?",
    answer:
      "Yes, our platform provides basic editing tools for trimming, adding text overlays, and adjusting playback speed. For advanced editing, you can export to professional tools.",
  },
  {
    id: "4",
    question: "What resolutions are supported?",
    answer:
      "We support up to 4K resolution for premium users. Standard plans include 1080p output, while free tier supports 720p.",
  },
  {
    id: "5",
    question: "Why did my video take so long to generate?",
    answer:
      "Video generation can take longer during peak hours or when using complex models. Shorter prompts and lower resolutions typically generate faster. For quicker rendering, consider upgrading your plan.",
  },
  {
    id: "6",
    question: "Why is my generated video laggy or choppy?",
    answer:
      "Laggy or choppy playback may result from high compression, low resolution, or browser performance. Try re-generating the video with higher quality settings or downloading the file to play it locally.",
  },
  {
    id: "7",
    question: "Can I add custom audio or subtitles to my videos?",
    answer:
      "Yes, you can add background audio and subtitles using our basic editor. For advanced customization, export your video and use third-party editing software.",
  },
  {
    id: "8",
    question: "Why is my video missing some elements from the prompt?",
    answer:
      "This might happen if the prompt is too vague or includes conflicting descriptions. Be clear and concise, and specify important elements like characters, setting, actions, and style.",
  },
  {
    id: "9",
    question: "What file formats are supported for download?",
    answer:
      "Generated videos are available in MP4 format by default. We're working on supporting additional formats in the near future.",
  },
  {
    id: "10",
    question: "Can I generate videos using my own images or content?",
    answer:
      "Yes, our platform supports input customization where you can upload images, sketches, or reference content to guide video generation based on your style.",
  },
  {
    id: "11",
    question: "Why can't I preview the video on my browser?",
    answer:
      "If the video preview doesn't load, check your browser compatibility or refresh the page. Try using Chrome or Firefox for optimal performance.",
  },
  {
    id: "12",
    question: "Is video generation available on mobile devices?",
    answer:
      "Yes, video generation is accessible via mobile browsers, but for the best experience and faster rendering, we recommend using a desktop device.",
  },
  {
    id: "13",
    question: "Can I use generated videos for commercial projects?",
    answer:
      "Yes, premium users can use generated content for commercial purposes. Be sure to check the licensing details for each AI model used in your project.",
  },
  {
    id: "14",
    question: "How do I fix flickering or unwanted visual artifacts?",
    answer:
      "Flickering may occur with rapid scene changes or unclear prompts. Try simplifying your prompt, reduce camera movement instructions, or choose a different generation model.",
  },
  {
    id: "15",
    question:
      "What should I do if the platform crashes during video generation?",
    answer:
      "If the platform crashes, ensure your browser is updated and that you're not running too many background processes. If the issue persists, contact support with your prompt details and any screenshots.",
  },
];

  const handleContactSupport = () => {
    const email = "support@alle-ai.com";
    const subject = "Support Request";
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* Hero Section */}
      <section id="video-generation-intro" className="my-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Create Captivating Videos with ALLE-AI
        </h2>
        <p className="text-muted-foreground">
          Transform your ideas into dynamic video content using state-of-the-art
          AI models. Generate animations, realistic scenes, or abstract visuals.
          Choose from multiple models, adjust parameters like duration and
          aspect ratio, and bring your vision to life.
          <span className="font-semibold">
            {" "}
            Check out the example below to see how different models interpret
            the same prompt.
          </span>
        </p>
      </section>

      {/* Live Demo Section */}
      <section id="video-examples" className="my-8">
        <div className="mt-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Prompt:</h3>
          <p className="text-muted-foreground italic">
            A tranquil forest scene with morning mist and sunlight filtering
            through trees
          </p>
        </div>
        <div
          ref={showcaseRef}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {demoVideos.map((video) => (
            <div key={video.id} className="border rounded-lg overflow-hidden">
              <VideoPlayer
                videoUrl={video.videoUrl}
                modelName={video.modelName}
                modelId={video.id}
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
      </section>

      {/* Getting Started Section */}
      <section id="getting-started" className="my-8">
        <h2 className="text-2xl font-semibold mb-4">
          Getting Started with Video Generation
        </h2>
        {/* Video Walkthrough Placeholder */}
        <aside id="walkthrough" className="mb-8 flex justify-center w-full">
          <div className="w-full">
            <div className="relative w-full pb-[56.25%]">
              <iframe
                src="https://www.youtube.com/embed/8g7kHVMFxlE"
                className="absolute top-0 left-0 w-full h-full rounded"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </aside>

        {/* Step 2 */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            Crafting Effective Video Prompts
          </h3>
          <p className="text-muted-foreground mb-3">
            To generate high-quality videos, your prompts should be descriptive
            and specific. Include these elements to guide the AI:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-5">
            <li>
              <strong>Scene Composition</strong>: Describe subjects,
              backgrounds, and camera angles.{" "}
              <em>
                Example: "Close-up of a dew-covered spiderweb in morning light"
              </em>
            </li>
            <li>
              <strong>Motion Description</strong>: Specify movement types and
              speeds.{" "}
              <em>
                Example: "Slow pan across mountain range with drifting clouds"
              </em>
            </li>
            <li>
              <strong>Style Guidance</strong>: Indicate artistic style or
              realism level.{" "}
              <em>Example: "Cinematic color grading with dramatic lighting"</em>
            </li>
          </ul>
        </div>

        {/* Step 3 */}
        <div className="mb-6">
          {/* <h3 className="text-xl font-semibold mb-2">
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
          /> */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold mb-2">Key Parameters</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Aspect Ratio (16:9, 1:1, 9:16)</li>
                <li>• Frame Rate (24fps, 30fps, 60fps)</li>
                <li>• Output Resolution (720p to 4K)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">Advanced Controls</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Camera Motion Paths</li>
                <li>• Dynamic Lighting Effects</li>
                <li>• Style Interpolation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices Section */}
      <section id="best-practices" className="my-8">
        <h2 className="text-2xl font-semibold mb-4">
          Video Creation Best Practices
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">✓ Effective Techniques</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-5">
              <li>Use sequential prompts for multi-scene videos</li>
              <li>Leverage reference images/videos for consistency</li>
              <li>Experiment with different model combinations</li>
            </ul>
          </div>
          <div className="p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">✗ Common Pitfalls</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-5">
              <li>Overloading single prompts with too many elements</li>
              <li>Neglecting to specify camera movements</li>
              <li>Using conflicting style descriptors</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="my-8">
        <h2 className="text-2xl font-semibold mb-4">Common Issues & Fixes</h2>
        <CollapsibleItems items={faqData} />
      </section>

      {/* Contact Support */}
      <section className="my-8">
        <h3 className="text-xl font-semibold mb-2">Contact Support</h3>
        <p className="text-muted-foreground">
          Need help? Visit our{" "}
          <span className="underline text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold">
            <Link href={"/faq"}>Help Center</Link>
          </span>{" "}
          or contact{" "}
          <button
            onClick={handleContactSupport}
            className="underline text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold"
          >
            support@alle-ai.com
          </button>
          .
        </p>
      </section>

      {/* Article Feedback */}
      <div className="mb-5">
        <ArticleFeedback />
      </div>

      {/* Footer */}
      <div>
        <DocsFooter nonDev={true} />
      </div>
    </div>
  );
}
