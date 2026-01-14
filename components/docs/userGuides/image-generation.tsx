"use client";
import React, { useRef } from "react";
import ImageGenerationShowcase from "@/components/ImageGenerationShowcase";
import Link from "next/link";
import { useTheme } from "next-themes";
import CollapsibleItems from "../CollapsibleItem";
import ArticleFeedback from "../articleFeedback";
import DocsFooter from "../simpleFooterDocs";
export default function ImageGeneration() {
  const showcaseRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  // FAQ data with an additional question
const faqData = [
  {
    id: "1",
    question: "Why are my generated images blurry?",
    answer:
      "Blurry images are often due to vague or short prompts. Try providing more detailed prompts, such as specifying 'high resolution' or 'sharp details'. You can also check your model settings to ensure you're generating images in a higher resolution.",
  },
  {
    id: "2",
    question: "Why aren't my images generated after I submitted a prompt?",
    answer:
      "If your images aren't being generated, it could be due to an issue with the server or the AI model processing the request. Try submitting again after a few minutes. If the issue persists, check your internet connection or contact support.",
  },
  {
    id: "3",
    question: "Can I download the images in different formats?",
    answer:
      "Currently, you can download images in JPEG and PNG formats. If you need other formats, keep an eye out for upcoming updates or use external tools for conversion.",
  },
  {
    id: "4",
    question: "Why is there a delay in receiving my generated images?",
    answer:
      "Delays can happen due to high demand on the models or heavy server traffic. Premium users typically experience faster generation times. You can try again later or consider upgrading for quicker results.",
  },
  {
    id: "5",
    question: "Why are some of my model results drastically different?",
    answer:
      "Different AI models have unique strengths and interpretations. If you're getting widely varying results, try refining your prompt to be more specific or experiment with different model selections for better consistency.",
  },
  {
    id: "6",
    question: "How do I fix an error with selecting multiple models?",
    answer:
      "If you're unable to select multiple models or receiving errors, try refreshing your page or clearing your browser cache. Ensure you're using a compatible browser, and contact support if the issue continues.",
  },
  {
    id: "7",
    question: "Can I cancel or undo an image generation?",
    answer:
      "Once an image generation is in progress, it cannot be canceled. However, you can submit a new prompt with any modifications you'd like. We recommend refining the prompt before submitting to avoid unnecessary generations.",
  },
  {
    id: "8",
    question: "What if my image doesn't match my prompt?",
    answer:
      "If the result doesn't match your expectations, review your prompt and make sure it's clear and specific. Adjusting terms related to style, composition, and mood can significantly improve results. If issues persist, try switching models for better alignment.",
  },
  {
    id: "9",
    question:
      "Why am I getting a '404 Error' when trying to generate an image?",
    answer:
      "A '404 Error' typically occurs when there's a broken link or incorrect URL request. Refresh the page or check if the platform is experiencing downtime. If it persists, reach out to support for assistance.",
  },
  {
    id: "10",
    question: "Why are my images not high resolution?",
    answer:
      "If your images appear low resolution, make sure you've specified 'high resolution' or 'detailed' in your prompt. Some models default to lower quality images to save processing time. Try selecting a higher-quality model or upgrading to a premium plan.",
  },
  {
    id: "11",
    question: "Can I adjust the output size of my generated image?",
    answer:
      "Currently, image size is set by the model defaults. You can request larger sizes through higher resolution settings or by using an external tool to resize the output image.",
  },
  {
    id: "12",
    question: "Why do some models take longer than others?",
    answer:
      "Each model has different processing power and complexity. More advanced models may take longer to generate images, especially during high traffic periods. Premium users typically experience faster processing times.",
  },
  {
    id: "13",
    question: "Why can't I download images after generation?",
    answer:
      "If you're unable to download images, check your internet connection and ensure your browser supports downloads. Try clearing your cache or using a different browser. If the issue persists, contact support for further troubleshooting.",
  },
  {
    id: "14",
    question: "How do I change my model selection after submitting a prompt?",
    answer:
      "Unfortunately, once a prompt is submitted, the model selection cannot be changed. However, you can cancel the current generation and submit a new prompt with your preferred model selection.",
  },
  {
    id: "15",
    question: "How do I report a bug or issue with the platform?",
    answer:
      "If you encounter a bug or technical issue, please contact support through our help section or send a message detailing the problem. We'll investigate and get back to you as quickly as possible.",
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
      <section id="image-generation-intro" className="my-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Create Stunning Images with ALLE-AI
        </h2>
        <p className="text-muted-foreground">
          Alle-AI lets you generate images using multiple image generation
          models, all specialized in visual creation. Pick your models,
          fine-tune the settings, and bring your ideas to life with a single
          prompt from photorealistic scenes to abstract art.
          <span className="font-semibold">
            &nbsp; Check out the example below to see how different models
            interpret the same prompt
          </span>
        </p>

        {/* Showcase Container */}
        <div className="mt-6">
          <ImageGenerationShowcase />
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="my-8">
        <h2 className="text-2xl font-semibold mb-4">
          Getting Started with Image Generation on Alle-AI
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
      </section>

      {/* Providing Input */}
      <section id="prompt-crafting" className="my-8">
        {/* Effective Prompts */}
        <div className="my-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
            Crafting Effective Text Prompts
          </h1>
          <p className="text-muted-foreground mb-6">
            Descriptive prompts are key to high-quality images. Include these
            elements to guide the AI:
          </p>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Key Elements to Include
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-5">
              <li>
                <strong>Subject</strong>: Main focus (e.g., "a majestic lion,"
                "a futuristic city").
              </li>
              <li>
                <strong>Style</strong>: Artistic style (e.g., "photorealistic,"
                "anime," "abstract").
              </li>
              <li>
                <strong>Composition</strong>: Layout (e.g., "close-up," "wide
                shot").
              </li>
              <li>
                <strong>Lighting</strong>: Light type (e.g., "soft," "neon,"
                "dramatic").
              </li>
              <li>
                <strong>Mood/Emotion</strong>: Feeling (e.g., "tranquil,"
                "epic").
              </li>
              <li>
                <strong>Color Palette</strong>: Colors (e.g., "pastel,"
                "vibrant").
              </li>
              <li>
                <strong>Details</strong>: Extras (e.g., "with a waterfall,"
                "wearing a crown").
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Example Prompts</h2>
            <div className="space-y-6">
              <div>
                <p className="text-muted-foreground">
                  "A photorealistic portrait of a lion with a golden mane on a
                  cliff at sunset, backlit by warm light, in an epic mood with
                  orange and gold colors."
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>Why it works</strong>: Defines subject, style,
                  lighting, mood, and colors.
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  "A cyberpunk cityscape with neon skyscrapers, flying cars, and
                  a rainy street, in a mysterious mood with neon blue and purple
                  tones."
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>Why it works</strong>: Specifies style, mood, and
                  details.
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  "A serene lake at dawn, impressionist style, wide shot with
                  soft lighting, tranquil mood, and pastel blues, greens, and
                  pinks."
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>Why it works</strong>: Combines composition, style,
                  and mood.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Tips for Success</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-5">
              <li>
                <strong>Be Specific</strong>: Add relevant details.
              </li>
              <li>
                <strong>Experiment</strong>: Try different styles and moods.
              </li>
              <li>
                <strong>Iterate</strong>: Refine prompts based on outputs.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Viewing and Managing Generated Images */}

      {/* Troubleshooting & Support */}
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

      {/* <NavigationContainer
        previousTitle="Text Generation"
        preUrl="/docs/tutorials/image-ai"
        nextTitle="Audio Generation"
        nextUrl="/docs/tutorials/audio-ai"
      /> */}
      {/* article feedback */}
      <div className="mb-5">
        <ArticleFeedback />
      </div>

      <div>
        <DocsFooter nonDev={true} />
      </div>
    </div>
  );
}
