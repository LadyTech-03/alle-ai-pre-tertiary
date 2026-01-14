import { AudioPlayer } from "@/components/features/audio/audioPlayer";
import Link from "next/link";
import NavigationContainer from "@/components/NavigationContainer";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function AudioGeneration() {
  const { resolvedTheme } = useTheme();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // FAQ data
  const faqData = [
    {
      question: "What types of audio can I generate with ALLE-AI?",
      answer:
        "You can generate a wide variety of audio, including voiceovers, music, sound effects, and speech synthesis. The platform supports multiple AI models to cater to different creative needs.",
    },
    {
      question: "How do I ensure the best results from audio generation?",
      answer:
        "To get the best results, provide detailed and specific prompts. Include elements like tone, duration, style, and mood. Experiment with different combinations and refine your prompts based on the results.",
    },
    {
      question: "Can I download the generated audio files?",
      answer:
        "Yes, you can download the generated audio files in various formats such as MP3 and WAV. Simply click the download icon on the audio player.",
    },
    {
      question: "Is there a limit to the number of audio files I can generate?",
      answer:
        "The number of audio files you can generate may depend on your subscription plan. Free users may have certain limitations, while premium users enjoy higher limits and additional features.",
    },
  ];

  // What to Read Next data
  const readNextData = [
    {
      title: "Image Generation Guide",
      href: "/docs/user-guides/image",
      description:
        "A comprehensive guide to generating images using our AI tools.",
    },
    {
      title: "Video Generation Guide",
      href: "/docs/user-guides/video",
      description:
        "Learn how to create and edit videos with our platform's AI assistance.",
    },
    {
      title: "Manage Your History",
      href: "/docs/user-guides/history",
      description:
        "Instructions on viewing, organizing, and deleting your past creations and activity.",
    },
  ];
  const toggleQuestion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="mb-10">
        <h2 className="text-3xl font-bold mb-3">
          Create Immersive Audio with ALLE-AI
        </h2>
        <p className="text-muted-foreground mb-3">
          Generate high-quality audio content using cutting-edge AI models.
          Whether you need voiceovers, music, sound effects, or speech
          synthesis, our platform supports multiple audio models simultaneously.
          Customize parameters like tone, duration, and style to create
          professional-grade audio effortlessly.
        </p>
        <h2 className="font-semibold text-muted-foreground mb-6">
          These samples demonstrate the distinct capabilities of different AI
          models available on ALLE-AI. Listen to how each model interprets the
          same prompt, showcasing their unique strengths and styles.
        </h2>
        <div className="mb-5 text-center">
          <h3 className="text-2xl font-bold mb-2">Prompt:</h3>
          <p className="text-lg italic">
            Generate a relaxing meditation track with soft piano and nature
            sounds.
          </p>
        </div>
        <div
          id="audio_results"
          className="flex gap-3 items-center justify-center flex-wrap"
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
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3">
          Getting Started With Audio Generation
        </h2>
        <p className="text-muted-foreground mb-4">
          This section explains how to generate audio using our platform. Many
          of the interface elements are shared with the Text Generation feature,
          so we'll focus here on the aspects unique to audio creation. If you're
          unfamiliar with the basic interface, such as model selection, file
          attachments, or voice input, please refer to the &nbsp;
          <span className="text-blue-600 font-bold">
            <Link href={"/docs/user-guides/chat#walkthrough"}>
              Platform Interface
            </Link>
          </span>{" "}
          before continuing.
        </p>

        {/* Step 1: Ensuring Audio Generation is Active */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            1. Ensuring Audio Generation is Active
          </h3>

          <p className="text-muted-foreground mb-2">
            Before you begin, make sure you're in the Audio Generation section.
            Verify that "Audio Generation" is highlighted in the sidebar and not
            "Chat" or any other mode as shown in the image above.
          </p>
          <p className="text-muted-foreground">
            Get started in seconds!&nbsp;
            <span className="text-blue-600 font-bold">
              <Link href={"/audio"}>Click here</Link>
            </span>{" "}
            to go directly to the Audio Generation page, pre-selected and ready
            for your creative inputs.
          </p>
        </div>

        {/* Step 2: Providing Input */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">2. Providing Input</h3>
          <p className="text-muted-foreground mb-3">
            Just like with Text Generation, you have several options for
            providing input to guide the audio creation process. The core
            methods text prompts, file attachments, and voice input are the
            same, ensuring a consistent user experience across our platform.
            However, the way these inputs are used and their impact on the
            output are tailored specifically for audio generation.
          </p>
        </div>

        {/* Step 3: Crafting Effective Prompts */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            3. Crafting Effective Prompts
          </h3>
          <p className="text-muted-foreground mb-3">
            To generate high-quality audio, your text prompts should be
            descriptive and specific. Include the following elements to guide
            the AI effectively:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-5">
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
                <h3 className="font-semibold">{faq.question}</h3>
                <span>{expandedQuestion === index ? "-" : "+"}</span>
              </button>
              {expandedQuestion === index && (
                <p className="mt-4 text-muted-foreground">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <NavigationContainer
        previousTitle="Image Generation"
        // previousDescription="Generate high-quality images using AI, from artistic illustrations to realistic visuals."
        preUrl="/docs/tutorials/image-ai"
        // nextDesciption="Utilize AI for video creation, editing, and automated scene generation."
        nextTitle="Video Generation"
        nextUrl="/docs/tutorials/video-ai"
      />
    </div>
  );
}
