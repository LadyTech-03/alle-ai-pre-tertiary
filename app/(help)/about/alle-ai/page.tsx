import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ArrowRight, FileQuestion, CheckCircle2, AlertTriangle, Fingerprint, Scale, BrainCircuit, Layers, Zap, Shield, Sparkles, Users, Layers3, Lightbulb } from "lucide-react";
import CustomHead from "@/components/faq/CustomHead";
import Link from "next/link";
const features = [
  {
    title: "Chat Section",
    description:
      "Engage with multiple AI models in one space. Compare their responses side-by-side and dive deeper into your inquiries to unlock diverse insights and creative ideas.",
  },
  {
    title: "Image Generation",
    description:
      "Turn your imagination into reality with powerful image-generation tools. Explore creative prompts and see how different AI models interpret your vision. Perfect for artists, designers, and dreamers.",
  },
  {
    title: "Audio Generation",
    description:
      "Need a podcast intro, background music, or voice synthesis? Alle-AI's audio generation feature creates high-quality audio content tailored to your needs.",
  },
  {
    title: "Video Generation",
    description:
      "From explainer videos to animated concepts, Alle-AI allows you to generate videos by leveraging advanced AI tools. Customize scripts, scenes, and more—then let the platform do the magic.",
  },
  {
    title: "Smart Summarization",
    description:
      "When multiple responses feel overwhelming, Alle-AI's unique summarization model condenses outputs into actionable insights. Whether for research, decision-making, or creative projects, you'll get the most relevant answers fast.",
  },
  {
    title: "AI Collaboration",
    description:
      "Use Spaces to organize, collaborate, and share your projects. Keep your Threads private, or make them public to collaborate with others in real-time.",
  },
];
const benefits = [
  {
    icon: <Zap className="h-10 w-10 text-blue-500" />,
    title: "Unified AI Power",
    description:
      "Access the combined expertise of industry-leading AI models in one seamless platform.",
    gradient: "from-blue-50/80 to-white",
    darkGradient: "dark:from-blue-950/20 dark:to-zinc-900/80"
  },
  {
    icon: <Layers3 className="h-10 w-10 text-purple-500" />,
    title: "Diverse Applications",
    description:
      "From text and image generation to audio and video, Alle-AI is designed for creators, researchers, and professionals alike.",
    gradient: "from-purple-50/80 to-white",
    darkGradient: "dark:from-purple-950/20 dark:to-zinc-900/80"
  },
  {
    icon: <Sparkles className="h-10 w-10 text-green-500" />,
    title: "Enhanced Productivity",
    description:
      "Smart summarization, deep customization, and collaborative tools ensure that Alle-AI adapts to your workflow.",
    gradient: "from-green-50/80 to-white",
    darkGradient: "dark:from-green-950/20 dark:to-zinc-900/80"
  },
];

const tips = [
  {
    title: "Leverage All Features",
    description:
      "Experiment with chat, image, audio, and video generation for multifaceted creativity. File Upload for in-depth context or keep it simple with 2 or 3 keywords. Dial in, get answers",
  },
  {
    title: "Compare and Contrast",
    description:
      "Use Alle-AI to see how different models handle the same prompt and gain diverse insights.",
  },
  {
    title: "Collaborate Effectively",
    description:
      "Use Spaces to organize projects, invite team members, and share your work effortlessly.",
  },
  {
    title: "Optimize Your Prompts",
    description:
      "Fine-tune your queries to get the best responses for each AI model.",
  },
];

const multiModelBenefits = [
  {
    icon: <AlertTriangle className="h-10 w-10 text-amber-500" />,
    title: "Reduce Hallucinations",
    description: "AI models can sometimes generate false or misleading information. Using multiple models helps identify inconsistencies and reduces the risk of hallucinations."
  },
  {
    icon: <Scale className="h-10 w-10 text-blue-500" />,
    title: "Balanced Perspectives",
    description: "Different AI models have different training data and approaches. Multiple models provide diverse viewpoints and more balanced insights on complex topics."
  },
  {
    icon: <CheckCircle2 className="h-10 w-10 text-green-500" />,
    title: "Verify Accuracy",
    description: "When multiple models agree on an answer, you can have higher confidence in its accuracy. Cross-verification is a powerful tool for quality assurance."
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-purple-500" />,
    title: "Complementary Strengths",
    description: "Each AI model has unique strengths and specializations. One model might excel at creative writing while another provides more factual, concise responses."
  },
  {
    icon: <Fingerprint className="h-10 w-10 text-rose-500" />,
    title: "Identify Model Bias",
    description: "All AI models contain some degree of bias from their training data. Using multiple models helps highlight and mitigate these biases for more objective results."
  },
  {
    icon: <Layers className="h-10 w-10 text-indigo-500" />,
    title: "Deeper Insights",
    description: "Multiple perspectives lead to deeper understanding. When models approach a problem differently, you gain richer insights and more comprehensive solutions."
  }
];

export default function Page() {
  return (
    <>
      <CustomHead
        title="
Getting Started | Alle-AI"
      />
      <div className="space-y-16 pb-16">
        <section className="w-full text-center pt-8">
          {/* title */}
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Getting Started
          </h1>
          {/* Short Description */}
          <p className="text-lg mt-6 mb-8 max-w-2xl mx-auto">
            Learn how Alle-AI works with this quick video overview
          </p>

          {/* Youtube video */}
          <div className="relative overflow-hidden rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 max-w-3xl mx-auto group">
            <iframe
              className="w-full h-64 sm:h-80 md:h-96 rounded-lg transform transition-transform group-hover:scale-[1.01]"
              width="948"
              height="388"
              src="https://www.youtube.com/embed/HkYy47ZLSK0?autoplay=1"
              title="Alle-AI"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* What is Alle-AI section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-transparet border-none transition-all duration-300 shadow-none">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-semibold mb-4 text-center">What is Alle-AI?</h2>
              <p className="text-lg leading-relaxed">
                {`Alle-AI is the ultimate hub for cutting-edge AI capabilities. By
              integrating top models like ChatGPT, Claude, Gemini, and many
              others, Alle-AI provides a unified platform for generating text,
              images, audio, and videos. Whether you're brainstorming, creating,
              or researching, Alle-AI empowers you to explore and innovate with
              the best tools AI has to offer.`}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* NEW SECTION: Why At Least 2 Models */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-transparent border-none transition-all duration-300 overflow-hidden shadow-none">
            <CardContent className="pt-8 pb-8 relative">
              {/* Background pattern */}
              
              <div className="relative z-10">
              <h2 className="text-3xl font-semibold mb-12 text-center">Why Use At Least 2 Models?</h2>
                
                <p className="text-lg leading-relaxed mb-8">
                  In the world of AI, no single model has all the answers. Each has unique strengths, weaknesses, and biases. 
                  By comparing responses from multiple models, you get more reliable information, diverse perspectives, and 
                  protection against AI hallucinations: those convincing but incorrect answers that can lead you astray.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {multiModelBenefits.map((benefit, index) => (
                    <div 
                      key={index} 
                      className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                    >
                      <div className="mb-4">
                        {benefit.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {benefit.description}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300">Did you know?</h4>
                    <p className="text-amber-700 dark:text-amber-400">
                      Studies show that AI models can hallucinate facts up to 27% of the time when answering complex questions. 
                      Using multiple models can reduce this error rate by identifying inconsistencies between responses.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Alle-ai features section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-center mb-12">
            What Can You Do with Alle-AI?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="transition-all duration-300 bg-white dark:bg-zinc-800 hover:shadow-md"
              >
                <CardHeader>
                  <h3 className="text-2xl font-semibold">{feature.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* why choose us */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold">Why Choose Alle-AI?</h2>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className={`bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 hover:shadow-lg hover:scale-[1.01] transition-all duration-300`}
              >
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="mb-4 p-3 rounded-full bg-white dark:bg-zinc-800 shadow-sm">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tips Section */}
          <Card className="bg-transparent shadow-none border-none transition-all duration-300">
            <CardHeader>
              <h3 className="text-2xl font-semibold text-center">
                Tips for Getting the Most Out of Alle-AI
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tips.map((tip, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-zinc-700/50"
                  >
                    <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      {tip.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {tip.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
        {/* Learn more section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-20">
          <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-900/50 dark:to-zinc-800/50 border border-gray-100 dark:border-zinc-800/30 overflow-hidden relative shadow-md hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-purple-100/30 dark:from-blue-900/10 dark:to-purple-900/10 rounded-full -mr-32 -mt-32 z-0"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-green-100/30 to-yellow-100/30 dark:from-green-900/10 dark:to-yellow-900/10 rounded-full -ml-32 -mb-32 z-0"></div>
            
            <CardContent className="pt-12 pb-12 relative z-10">
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                  There&apos;s Always More to Learn
                </h2>
                <p className="text-lg max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
                  Explore our comprehensive FAQ section for detailed guides and
                  answers to common questions, or jump right in and experience
                  Alle-AI for yourself.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
                  <Link
                    href="/faq"
                    className="flex items-center gap-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white px-6 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all duration-300 shadow-sm"
                  >
                    <FileQuestion className="w-5 h-5 text-blue-500" />
                    <span>Visit FAQ Page</span>
                  </Link>

                  <Link
                    href="/"
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-300 shadow-sm font-medium"
                  >
                    <span>Try Alle-AI Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
