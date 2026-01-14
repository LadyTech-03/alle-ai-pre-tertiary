"use client";
import React, { useEffect, useRef, useState } from "react";
import ImageGenerationShowcase from "@/components/ImageGenerationShowcase";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import NavigationContainer from "@/components/NavigationContainer";
export default function ImageGeneration() {
  const showcaseRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // FAQ data
  const faqData = [
    {
      question: "What types of images can I generate with ALLE-AI?",
      answer:
        "You can generate a wide variety of images, including realistic scenes, artistic visuals, and abstract designs. The platform supports multiple AI models to cater to different creative needs.",
    },
    {
      question: "How do I ensure the best results from image generation?",
      answer:
        "To get the best results, provide detailed and specific prompts. Include elements like subject, style, composition, lighting, mood, and color palette. Experiment with different combinations and refine your prompts based on the results.",
    },
    {
      question: "Can I download the generated images?",
      answer:
        "Yes, you can download the generated images in various formats such as JPEG and PNG. Simply hover over the image and click the download icon.",
    },
    {
      question: "Is there a limit to the number of images I can generate?",
      answer:
        "The number of images you can generate may depend on your subscription plan. Free users may have certain limitations, while premium users enjoy higher limits and additional features.",
    },
  ];

  // What to Read Next data
  const readNextData = [
    {
      title: "Audio Generation Guide",
      href: "/docs/user-guides/audio",
      description:
        "Learn how to create and manipulate audio using our platform.",
    },
    {
      title: "Video Generation Guide",
      href: "/docs/user-guides/video",
      description:
        "Step-by-step instructions for generating videos with our AI.",
    },
    {
      title: "Manage Your History",
      href: "/docs/user-guides/history",
      description:
        "Learn how to access, organize, and manage your past creations and activity.",
    },
  ];
  const toggleQuestion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  return (
    <div>
      <section className="">
        <h2 className="text-3xl font-bold mb-3">
          Create Stunning Images with ALLE-AI
        </h2>
        <p className="text-muted-foreground">
          Our image generation feature allows you to create high-quality images
          using advanced AI models. Whether you need realistic scenes, artistic
          visuals, or abstract designs, our platform has you covered. Select
          multiple models, customize parameters, and bring your ideas to life!.
          With a single prompt, you can receive responses from selected models
          seamlessly, as shown below.
        </p>

        {/* Showcase Container */}
        <div className="">{<ImageGenerationShowcase />}</div>
      </section>

      {/* article  */}
      <section className="mb-5">
        <h2 className="text-2xl font-bold mb-3">
          Getting Started With Image Generation
        </h2>
        <p className="text-muted-foreground mb-4">
          This section explains how to generate images using our platform. Many
          of the interface elements are shared with the Text Generation feature,
          so we'll focus here on the aspects unique to image creation. If you're
          unfamiliar with the basic interface, such as model selection, file
          attachments, or voice input, please refer to the &nbsp;
          <span className="text-blue-600 font-bold">
            <Link href={"/docs/user-guides/chat#walkthrough"}>
              Platform Interface
            </Link>
          </span>{" "}
          before continuing.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          1. Ensuring Image Generation is Active:
        </h2>

        <p className="text-muted-foreground">
          {`Before you begin, make sure you're in the Image Generation section.
          Verify that "Image Generation" is highlighted in the sidebar and not
          "Chat" or any other mode as shown in the image above.`}
        </p>
        <p className="text-muted-foreground">
          Get started in seconds!&nbsp;
          <span className="text-blue-600 font-bold">
            <Link href={"/image"}>Click here</Link>
          </span>{" "}
          to go directly to the Image Generation page, pre-selected and ready
          for your creative inputs.
        </p>
      </section>

      {/* ar */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">2. Providing Input</h2>
        <p className="text-muted-foreground mb-3">
          Just like with Text Generation, you have several options for providing
          input to guide the image creation process. The core methods text
          prompts, file attachments, and voice input are the same, ensuring a
          consistent user experience across our platform. However, the way these
          inputs are used and their impact on the output are tailored
          specifically for image generation.
        </p>
        <h2 className="text-2xl font-semibold mb-3">
          Image Specific Consideration
        </h2>
        <p className="text-muted-foreground mb-6">
          {`While the input methods are the same, here's how to think about them
          specifically for image creation:`}
        </p>
        {/* Effective prompts */}
        <div className="">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Crafting Effective Text Prompts for Image Generation
          </h1>
          <p className="mb-6 text-muted-foreground">
            To generate high-quality images, your text prompts should be
            descriptive and specific. Include the following elements to guide
            the AI effectively:
          </p>

          <div className="mb-8 text-muted-foreground">
            <h2 className="text-2xl font-semibold mb-4">
              Key Elements to Include:
            </h2>
            <ul className="list-disc list-inside space-y-2 pl-5">
              <li>
                <strong>Subject</strong>: The main focus of the image.{" "}
                <em>
                  Example: "a majestic lion," "a futuristic cityscape," "a
                  serene mountain lake"
                </em>
              </li>
              <li>
                <strong>Style</strong>: The artistic style you want.{" "}
                <em>
                  Example: "photorealistic," "impressionist," "abstract," "pop
                  art," "anime," "cyberpunk"
                </em>
              </li>
              <li>
                <strong>Composition</strong>: How elements are arranged.{" "}
                <em>
                  Example: "close-up," "wide shot," "portrait," "landscape,"
                  "symmetrical"
                </em>
              </li>
              <li>
                <strong>Lighting</strong>: The type of lighting.{" "}
                <em>
                  Example: "soft," "dramatic," "neon," "backlit," "ambient"
                </em>
              </li>
              <li>
                <strong>Mood/Emotion</strong>: The feeling the image should
                evoke.{" "}
                <em>
                  Example: "happy," "sad," "mysterious," "epic," "tranquil"
                </em>
              </li>
              <li>
                <strong>Color Palette</strong>: Dominant colors or overall
                scheme.
                <em>
                  Example: "vibrant," "pastel," "monochromatic," "earth tones"
                </em>
              </li>
              <li>
                <strong>Details</strong>: Specific elements to include.{" "}
                <em>
                  Example: "wearing a crown," "in a spaceship," "with a
                  waterfall"
                </em>
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Examples of Effective Prompts:
            </h2>
            <div className="">
              <div className="">
                <p className="text-muted-foreground">
                  "A photorealistic portrait of a majestic lion with a golden
                  mane, standing on a rocky cliff at sunset, backlit by warm,
                  dramatic lighting. The mood should feel epic and powerful,
                  with a vibrant orange and gold color palette."
                </p>
                <p className="  mt-2">
                  <strong>Why it works</strong>: Specifies subject, style,
                  composition, lighting, mood, and color palette.
                </p>
              </div>
              <div className="">
                <p className="text-muted-foreground">
                  "A futuristic cityscape in the style of cyberpunk, with
                  towering neon skyscrapers, flying cars, and a rainy,
                  reflective street. The mood should be mysterious and
                  futuristic, with a dominant neon blue and purple color
                  scheme."
                </p>
                <p className="  mt-2">
                  <strong>Why it works</strong>: Clearly defines subject, style,
                  mood, and details.
                </p>
              </div>
              <div className="">
                <p className="text-muted-foreground">
                  "A serene mountain lake at dawn, painted in the style of
                  impressionism. The composition should be a wide shot with
                  soft, ambient lighting, evoking a tranquil and peaceful mood.
                  Use a pastel color palette with shades of blue, green, and
                  pink."
                </p>
                <p className=" mt-2">
                  <strong>Why it works</strong>: Combines style, composition,
                  lighting, mood, and color palette.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Tips for Success:</h2>
            <ul className="list-disc list-inside space-y-2 pl-5">
              <li>
                <strong>Be Specific</strong>: Include as many relevant details
                as possible.
              </li>
              <li>
                <strong>Experiment</strong>: Test different combinations of
                styles, moods, and compositions.
              </li>
              <li>
                <strong>Iterate</strong>: Refine your prompts based on the
                results.
              </li>
            </ul>
          </div>
        </div>
        <section className="">
          <h2 className="text-2xl font-semibold mb-3 mt-3">
            3. Viewing and Managing Generated Images
          </h2>
          <p className="text-muted-foreground mb-4">
            Once the image generation process is complete, the generated images
            will be displayed in the output area. This section explains how to
            view, manage, and interact with your generated images. The generated
            images will be presented in the output area, where you can interact
            with them in various ways. This section explains how to view,
            manage, and interact with your generated images.
          </p>

          <div className="">
            <h1 className="text-3xl font-bold mb-5 text-center">
              Viewing and Managing Generated Images
            </h1>
            <Image
              src={
                resolvedTheme === "dark"
                  ? "/screenshots/image-gen-dark.png"
                  : "/screenshots/image-gen-light.png"
              }
              alt=""
              width={800}
              height={800}
              className="mb-4"
            />
            <p className="mb-6 text-lg text-muted-foreground">
              The output will display images generated by multiple models,
              allowing you to compare, interact with, and manage your results.
              As shown in the image above. Here’s how it works:
            </p>

            {/* Section 3.1: Displaying the Results */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Displaying the Results
              </h2>

              {/* Multi-Model Output */}
              <div className="mb-6">
                <h3 className=" font-sembold mb-2">Multi-Model Output</h3>
                <p className="mb-4 text-muted-foreground">
                  Images generated by each selected model are displayed
                  together, making it easy to compare results. Outputs from
                  different models are distinguished by labels or separate
                  sections.
                </p>
              </div>
            </div>

            {/* Section 3.2: Interacting with the Images */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Interacting with the Images
              </h2>
              <p className="mb-4 text-muted-foreground">
                When you hover over an image, a set of actions will appear,
                allowing you to interact with it.
              </p>

              {/* Downloading */}
              <div className="mb-4">
                <h3 className="text-2xl font-semibold mb-2">Downloading</h3>
                <p className="text-muted-foreground">
                  Click on icon to either download,share or add to favourite to
                  save the image to your computer. You can typically choose the
                  file format (e.g., JPEG, PNG).
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>

      {/* FAQ Section */}
      <section className="my-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="border rounded-lg p-4">
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full text-left flex justify-between items-center"
              >
                <h3 className=" font-semibold">{faq.question}</h3>
                <span className="">
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

      <NavigationContainer
        previousTitle="Text Generation"
        // previousDescription="Explore AI-powered text generation, including creative writing, summarization, and automated content creation."
        preUrl="/docs/tutorials/image-ai"
        // nextDesciption="Create AI-generated audio, including speech synthesis, music, and sound effects."
        nextTitle="Audio Generation"
        nextUrl="/docs/tutorials/audio-ai"
      />
    </div>
  );
}
