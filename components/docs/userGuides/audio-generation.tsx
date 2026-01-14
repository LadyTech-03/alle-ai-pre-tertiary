"use client";
import { AudioPlayer } from "@/components/features/audio/audioPlayer";
import Link from "next/link";
import NavigationContainer from "@/components/NavigationContainer";
import { useTheme } from "next-themes";
import CollapsibleItems from "../CollapsibleItem"; // Assuming this is the same component
import DocsFooter from "../simpleFooterDocs";
import ArticleFeedback from "../articleFeedback";

export default function AudioGeneration() {
  const { resolvedTheme } = useTheme();

  // FAQ data
const faqData = [
  {
    id: "1",
    question: "What types of audio can I generate with ALLE-AI?",
    answer:
      "You can generate a wide variety of audio, including voiceovers, music, sound effects, and speech synthesis. The platform supports multiple AI models to cater to different creative needs.",
  },
  {
    id: "2",
    question: "How do I ensure the best results from audio generation?",
    answer:
      "To get the best results, provide detailed and specific prompts. Include elements like tone, duration, style, and mood. Experiment with different combinations and refine your prompts based on the results.",
  },
  {
    id: "3",
    question: "Can I download the generated audio files?",
    answer:
      "Yes, you can download the generated audio files in various formats such as MP3 and WAV. Simply click the download icon on the audio player.",
  },
  {
    id: "4",
    question: "Is there a limit to the number of audio files I can generate?",
    answer:
      "The number of audio files you can generate may depend on your subscription plan. Free users may have certain limitations, while premium users enjoy higher limits and additional features.",
  },
  {
    id: "5",
    question: "Why is my generated audio distorted or unclear?",
    answer:
      "Distorted or unclear audio may result from an overly complex or vague prompt. Try simplifying the prompt or adjusting parameters like tone or style. Also, check your model settings for higher quality output.",
  },
  {
    id: "6",
    question: "Why are the audio files taking longer to generate?",
    answer:
      "Longer generation times may occur during high demand or when using more complex models. You can try again later, or consider upgrading your subscription plan for faster processing.",
  },
  {
    id: "7",
    question: "Can I modify the generated audio after it's been created?",
    answer:
      "Currently, editing the generated audio directly on the platform is not supported. However, you can download the file and use third-party software for further editing if needed.",
  },
  {
    id: "8",
    question: "Why can't I hear the audio after generating it?",
    answer:
      "If you're unable to hear the generated audio, check your device's volume and audio settings. You may also want to try refreshing the page or using a different browser. If the issue persists, contact support.",
  },
  {
    id: "9",
    question: "What audio formats are supported for download?",
    answer:
      "We currently support MP3 and WAV formats for downloading audio. We are working on adding more formats in the future.",
  },
  {
    id: "10",
    question: "Can I generate long-duration audio or just short clips?",
    answer:
      "You can generate both short clips and long-duration audio, depending on the complexity of your prompt. For longer files, consider breaking them into smaller segments for better processing.",
  },
  {
    id: "11",
    question: "Why do some generated audio files sound robotic?",
    answer:
      "Robotic-sounding audio may happen with speech synthesis models that aren't trained for a natural-sounding voice. Try adjusting the tone or selecting a different voice model to improve the quality of speech generation.",
  },
  {
    id: "12",
    question: "Can I use generated audio for commercial purposes?",
    answer:
      "Yes, generated audio can be used for commercial purposes depending on your subscription plan. Make sure to review the licensing terms for each AI model you use.",
  },
  {
    id: "13",
    question: "Why does my audio file sound muffled?",
    answer:
      "Muffled sound could be due to low-quality model settings or unclear prompts. Ensure your prompt specifies the desired audio quality and style. If issues persist, try a different model for better clarity.",
  },
  {
    id: "14",
    question:
      "How do I fix an issue with selecting multiple models for audio generation?",
    answer:
      "If you're experiencing issues when selecting multiple models, try refreshing your page or clearing your browser cache. Ensure you're using a compatible browser and try again. Contact support if the problem continues.",
  },
  {
    id: "15",
    question: "How do I report a bug or issue with audio generation?",
    answer:
      "If you're encountering a bug or technical issue with audio generation, please contact our support team with a detailed description of the problem. We'll investigate and get back to you as soon as possible.",
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
      <section id="audio-generation-intro" className="my-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Create Immersive Audio with ALLE-AI
        </h2>
        <p className="text-muted-foreground">
          Generate high-quality audio content using cutting-edge AI models.
          Whether you need voiceovers, music, sound effects, or speech
          synthesis, our platform supports multiple audio models simultaneously.
          Customize parameters like tone, duration, and style to create
          professional-grade audio effortlessly.
          <span className="font-semibold">
            {" "}
            Check out the example below to see how different models interpret
            the same prompt.
          </span>
        </p>
        <div className="mt-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Prompt:</h3>
          <p className="text-muted-foreground italic">
            Generate a relaxing meditation track with soft piano and nature
            sounds.
          </p>
        </div>
        <div
          id="audio_results"
          className="mt-6 flex gap-3 items-center justify-center flex-wrap"
        >
          <AudioPlayer
            audioUrl="/audio/relaxing_meditation.mp3"
            modelIcon="/models/dream.webp"
            modelName="MusicGen"
            modelId="3000"
          />
          <AudioPlayer
            audioUrl="/audio/relaxing_meditation.mp3"
            modelIcon="/models/dall-e.webp"
            modelName="Whisper"
            modelId="3001"
          />
          <AudioPlayer
            audioUrl="/audio/relaxing_meditation.mp3"
            modelIcon="/models/dall-e.webp"
            modelName="Jukebox"
            modelId="3002"
          />
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="getting-started" className="my-8">
        <h2 className="text-2xl font-semibold mb-4">
          Getting Started With Audio Generation
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

        {/* Step 3: Crafting Effective Prompts */}
        <div id="prompt-crafting" className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            3. Crafting Effective Prompts
          </h3>
          <p className="text-muted-foreground mb-3">
            To generate high-quality audio, your text prompts should be
            descriptive and specific. Include the following elements to guide
            the AI effectively:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-5">
            <li>
              <strong>Genre</strong>: The type of audio you want.{" "}
              <em>Example: "meditation music," "rock song," "podcast intro"</em>
            </li>
            <li>
              <strong>Mood</strong>: The emotional tone of the audio.{" "}
              <em>Example: "relaxing," "energetic," "mysterious"</em>
            </li>
            <li>
              <strong>Instruments</strong>: Specific instruments or sounds.{" "}
              <em>Example: "piano," "guitar," "nature sounds"</em>
            </li>
            <li>
              <strong>Duration</strong>: The length of the audio.{" "}
              <em>Example: "2 minutes," "30 seconds"</em>
            </li>
            <li>
              <strong>Style</strong>: The artistic style.{" "}
              <em>Example: "classical," "electronic," "lo-fi"</em>
            </li>
          </ul>
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
