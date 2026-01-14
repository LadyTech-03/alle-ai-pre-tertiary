"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react"; // Import Lucide icons
import NavigationContainer from "@/components/NavigationContainer";
const faqData = [
  {
    question: "AI response delay",
    answer: "Check internet connection and retry.",
  },
  {
    question: "File upload failure",
    answer: "Ensure file format is supported and re-upload.",
  },
  {
    question: "Voice input not working",
    answer: "Check microphone permissions and retry.",
  },
  {
    question: "Error message while processing",
    answer: "Clear the cache and try again.",
  },
  {
    question: "Slow application performance",
    answer: "Close unnecessary applications running in the background.",
  },
];

const readNextData = [
  {
    title: "Image Generation",
    href: "/docs/user-guides/image",
    description: "Learn how to create stunning images using our AI tools.",
  },
  {
    title: "Video Generation",
    href: "/docs/user-guides/video",
    description: "Explore the process of generating videos with AI assistance.",
  },
  {
    title: "Understanding AI models",
    href: "/docs/user-guides/models",
    description:
      "Gain a deeper understanding of the AI models powering our platform.",
  },
];
const handleContactSupport = () => {
  const email = "support@alle.com";
  const subject = "Support Request"; // Optional: You can customize the subject
  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  window.location.href = mailtoLink;
};

const TextGenerationPlatform = () => {
  const { resolvedTheme } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleAnswer = (index: number) => {
    setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="min-h-screen">
      <div></div>
      <h1 className="text-3xl mb-4 font-semibold">
        A Quick Tour of the Text Generation Interface
      </h1>
      <p className="text-muted-foreground mb-3">
        {`Experience the next level of text generation! This video tutorial
        introduces you to the Text Generation interface, highlighting its unique
        multi-model capabilities. We'll walk you through the process of
        selecting and interacting with ChatGPT, Claude, Gemini, and other
        leading AI models, demonstrating how to generate text and explore the
        distinct strengths of each model.`}
      </p>
      {/* Video Walkthrough Placeholder */}
      <aside id="walkthrough" className="mb-8 flex justify-center">
        <div className="w-full max-w-4xl">
          <iframe
            src="https://scribehow.com/embed/Accessing_GPT-4o_Chat_and_Saving_Summary__NQZpM_PXQ6mfOV17aHIq2A?as=video"
            width="100%"
            height="400"
          ></iframe>
        </div>
      </aside>

      {/* Using the Text Generation Page */}
      <section className="mb-8">
        <h2 id="text-generation" className="text-3xl font-bold mb-2">
          Using the Text Generation Page
        </h2>
        <p className="text-muted-foreground mb-4">
          This section provides a step-by-step guide on how to generate text
          using our platform.
        </p>

        {/* Inputting a Query */}
        <div className="mb-6">
          <h3 className="text-1xl font-semibold mb-2">
            1. Selecting Your AI Models:
          </h3>
          <div className="text-muted-foreground mb-2">
            <p>
              Before you can generate text, you need to choose the AI model(s)
              you want to use. Our platform supports a variety of powerful
              models, including ChatGPT, Claude, Gemini, and more. You can
              select one or more models to interact with 😊.
            </p>
          </div>
          <div className="p-3">
            <ul className="list-disc ml-6 space-y-4">
              <li>
                <strong id="select_models">How to Select Models:</strong>
                <p className="mt-1 text-muted-foreground">
                  {`To select a model, simply click on the checkbox next to its
                  name in the 'AI Models' panel as illustrated in the short
                  video above. You can select multiple models to generate text
                  using all of them simultaneously. For now we support choosing more than one and a max of five`}
                </p>
              </li>

              <li>
                <strong>Choosing the Right Model(s):</strong>
                <p className="mt-1 text-muted-foreground">
                  Each AI model has its own strengths and characteristics.
                  ChatGPT is known for its conversational abilities, while
                  Claude excels at creative writing. Gemini is particularly
                  adept at code generation. Experiment with different models to
                  find the ones that best suit your project. For a deeper dive
                  into each available model, including their strengths,
                  weaknesses, and more,&nbsp;
                  <span className="text-blue-600 font-semibold">
                    <Link target="_blank" href={"/modal-gloassary"}>
                      check out this dedicated documentation page.
                    </Link>
                  </span>
                </p>
              </li>

              <li>
                <strong>Selecting Multiple Models:</strong>
                <p className="mt-1">
                  Selecting multiple models will generate text from each model,
                  allowing you to compare the results and choose the best
                  option. The output from each model will be clearly labeled.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Selecting AI Models */}
        <div className="mb-6">
          <h3 id="providing-inputs" className="text-xl font-semibold mb-2">
            2. Providing inputs
          </h3>
          <p className="text-muted-foreground">
            {`Once you've selected your AI models, you have several options for
            providing input to guide the text generation:`}
          </p>
          <div className="p-3">
            <ul className="list-disc space-y-6 ml-6">
              <li>
                <strong>Text Prompt:</strong>
                <p className="mt-1 text-muted-foreground">
                  This is the most common way to provide input. Simply type your
                  instructions or ideas into the text prompt field. Be as
                  specific as possible to get the best results.
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li>
                    <strong>Good Prompt:</strong>
                    <p className="mt-1 text-muted-foreground">
                      "Write a short story about a cat who travels to space."
                    </p>
                  </li>
                  <li>
                    <strong>Less Effective Prompt:</strong>
                    <p className="mt-1 text-muted-foreground">
                      "Write something interesting."
                    </p>
                  </li>
                </ul>
              </li>

              <li>
                <strong>Voice Input:</strong>
                <p className="mt-1 text-muted-foreground">
                  For hands-free input, you can use our voice input feature.
                  Click the microphone icon and start speaking. The platform
                  will automatically transcribe your speech into text.
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li>
                    <strong>Enabling Voice Input:</strong>
                    <p className="mt-1 text-muted-foreground">
                      Explain how to enable microphone access in the browser.
                    </p>
                  </li>
                  <li>
                    <strong>Supported Languages:</strong>
                    <p className="mt-1 text-muted-foreground">
                      List the supported languages, if any.
                    </p>
                  </li>
                  <li>
                    <strong>Editing Transcribed Text:</strong>
                    <p className="mt-1 text-muted-foreground">
                      Explain how to edit the transcribed text if there are
                      errors.
                    </p>
                  </li>
                </ul>
              </li>

              <li>
                <strong>Attaching Files:</strong>
                <p className="mt-1 text-muted-foreground">
                  You can provide additional context by attaching files. This
                  can be useful for summarizing documents, analyzing data, or
                  generating text based on existing content.
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li>
                    <strong>Supported File Types:</strong>
                    <p className="mt-1 text-muted-foreground">
                      List the supported file types, e.g., .txt, .pdf, .docx.
                    </p>
                  </li>
                  <li>
                    <strong>How to Attach Files:</strong>
                    <div className="mt-2 mb-3">
                      <Image
                        className="mb-2"
                        height={120}
                        width={800}
                        src={
                          resolvedTheme === "dark"
                            ? "/screenshots/input-dark.png"
                            : "/screenshots/input-light.png"
                        }
                        alt=""
                      ></Image>
                      <span className="text-muted-foreground">
                        Click the file icon to open a window, select a file, and
                        it will be uploaded automatically
                      </span>
                    </div>
                  </li>
                  <li>
                    <strong>File Size Limits:</strong>
                    <p className="mt-1 text-muted-foreground">
                      We support uploading files up to 20mb in size. Files
                      larger than this limit cannot be processed
                    </p>
                  </li>
                </ul>
              </li>

              <li>
                <strong>Enabling Web Search:</strong>
                <Image
                  className="mb-2"
                  height={120}
                  width={800}
                  src={
                    resolvedTheme === "dark"
                      ? "/screenshots/web-dark.png"
                      : "/screenshots/web-light.png"
                  }
                  alt=""
                ></Image>
                <p className="mt-1 text-muted-foreground">
                  To incorporate current events or factual information into your
                  generated text, you can enable the web search feature.
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li>
                    <strong>How Web Search Works:</strong>
                    <p className="mt-1 text-muted-foreground">
                      When web search is enabled, the model queries the internet
                      in real time by accessing search engines, retrieves
                      relevant and up-to-date information, and then processes
                      the results to generate a helpful and accurate response.
                    </p>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        {/* Generating Responses */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            3. Generating Responses
          </h3>
          <p className="text-muted-foreground">
            {`Once you've provided your input, click the "Generate" button. The
            platform will then process your request and generate the text based
            on your chosen models and input. The time it takes to generate the
            text will vary depending on the complexity of your request and the
            selected models.`}
          </p>
        </div>

        {/* Summarization Feature */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            4. Summarization Feature
          </h3>
          {/* Video Walkthrough Placeholder */}
          <aside className="mb-5 flex justify-center">
            <div className="w-full max-w-4xl">
              <iframe
                src="https://scribehow.com/embed/Accessing_GPT-4o_Chat_and_Saving_Summary__NQZpM_PXQ6mfOV17aHIq2A?as=video"
                width="100%"
                height="400"
              ></iframe>
            </div>
          </aside>
        </div>
        <div className="p-3">
          <p className="mb-4 text-muted-foreground">
            Once the text generation process is complete, you'll be presented
            with the generated output. This section explains how to review,
            edit, and refine the generated text.
          </p>

          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-bold">
                1. Viewing the Generated Output:
              </h2>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>
                  <strong>Single Model Output:</strong>
                  <p className="mt-1">
                    You can select a single model to view its response at
                    response area
                  </p>
                </li>
                <li>
                  <strong>Multiple Model Output:</strong>
                  <p className="mt-1 text-muted-foreground">
                    The output from each model will be displayed separately,
                    often with clear labels indicating which model generated
                    which text. This allows you to easily compare the different
                    outputs and choose the one you prefer. You can switch to
                    view model output but clicking on the model as illustrated
                    in the video above
                  </p>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold">
                2. Editing the Generated Text:
              </h2>
              <p className="mt-2 text-muted-foreground">
                The generated text is fully editable. You can make any changes
                you like, just as you would with any other text document.
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>
                  <strong className="mb-3">Comparing Model Outputs :</strong>
                  <Image
                    className="mb-2"
                    height={120}
                    width={800}
                    src={
                      resolvedTheme === "dark"
                        ? "/screenshots/summary-dark.png"
                        : "/screenshots/summary-light.png"
                    }
                    alt=""
                  ></Image>
                </li>
                <p className="text-muted-foreground">
                  We provide a model that offers summarization, combination, and
                  more. To get a summary, simply click on the 'Summary' button
                  as shown in the image above. You can also use the toggle to
                  select between summarization, combination, and other features.
                </p>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold">
                3. Refining the Generated Text:
              </h2>
              <p className="mt-2">
                Sometimes, the generated text might require some refinement to
                perfectly match your requirements. Here are some tips:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>
                  <strong>Prompt Refinement:</strong>
                  <p className="mt-1">
                    If the generated text isn't quite what you were looking for,
                    try refining your original prompt. Be more specific or try a
                    different phrasing. You can also experiment with different
                    AI models.
                  </p>
                </li>
                <li>
                  <strong>Manual Editing:</strong>
                  <p className="mt-1">
                    Don't hesitate to manually edit the generated text. This is
                    often the quickest way to make small adjustments.
                  </p>
                </li>
                <li>
                  <strong>Regenerating Text:</strong>
                  <p className="mt-1">
                    In some cases, you might want to completely regenerate the
                    text. This will create a new output based on your original
                    prompt and selected models.
                  </p>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </section>

      {/* Troubleshooting & Support */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Troubleshooting & Support</h2>

        {/* Common Issues & Solutions */}
        <div className="mb-6">
          <h3 className=" font-semibold mb-4">Common Issues & Solutions</h3>
          <ul className="space-y-3">
            {faqData.map((faq, index) => (
              <li
                key={index}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  className="w-full text-left border dark:bg-zinc-800 p-4 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => toggleAnswer(index)}
                  aria-expanded={expandedIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <div className="flex items-center">
                    {expandedIndex === index ? (
                      <ChevronDown className="w-5 h-5 mr-3 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 mr-3 text-muted-foreground" />
                    )}
                    <span className="font-medium ">{faq.question}</span>
                  </div>
                </button>
                {expandedIndex === index && (
                  <div
                    id={`faq-answer-${index}`}
                    className="p-4 pt-2 border-t bg-gray-50 dark:bg-zinc-800  text-muted-foreground transition-all duration-300 ease-in-out"
                    aria-hidden={expandedIndex !== index}
                  >
                    <strong className="font-semibold text-muted-foreground">
                      Solution:
                    </strong>{" "}
                    {faq.answer}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact Support */}
      <div>
        <h3 className="text-xl font-semibold mb-2"> Contact Support</h3>
        <p className="text-muted-foreground">
          For further assistance, visit our &nbsp;
          <span className="text-blue-600">
            <Link target="_blank" href={"/faq"}>
              Help Center
            </Link>
          </span>{" "}
          or contact customer support at{" "}
          <span>
            <button
              onClick={handleContactSupport}
              className="  text-blue-600 rounded-lg hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              support@alle-ai.com
            </button>
          </span>
        </p>
      </div>
      <NavigationContainer
        previousTitle="Overview"
        // previousDescription="An introduction to the platform, its features, and how to navigate through its functionalities."
        preUrl="/docs/tutorials/using-platform"
        // nextDesciption="Generate high-quality images using AI, from artistic illustrations to realistic visuals."
        nextTitle="Image Generation"
        nextUrl="/docs/tutorials/image-ai"
      />
    </div>
  );
};

export default TextGenerationPlatform;
