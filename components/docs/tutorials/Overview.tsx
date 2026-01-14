"use client";
import React from "react";
import { Sparkles, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import NavigationContainer from "@/components/NavigationContainer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
//  components
const NewChat = () => (
  <div>
    <h2 className="text-2xl font-bold mb-2">Start a Fresh Conversation</h2>
    <p className="text-muted-foreground mb-4">
      The <strong>"New Chat"</strong> button (labeled <strong>1</strong>) lets
      you start a new conversation with multiple AI models, whether for text,
      images, audio, or videos.
    </p>
    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
      <li>
        <strong>How It Works:</strong> Click <strong>"New Chat"</strong> to
        begin. The button adapts to your active tab e.g., it becomes{" "}
        <strong>"New Image"</strong> in the Image Generation tab or{" "}
        <strong>"New Audio"</strong> in the Audio tab.
      </li>
      <li>
        <strong>Stay Organized:</strong> All sessions are saved in the{" "}
        <strong>Chat History</strong>Access past chats anytime using the search
        bar at history tab.
      </li>
    </ul>
  </div>
);

const ModeSwitcher = () => (
  <div>
    <h2 className="text-2xl font-bold mb-2">Create with the Right Tools</h2>
    <p className="text-muted-foreground mb-4">
      The <strong>Mode Selector</strong> (labeled <strong>2</strong>) lets you
      choose your creative mode—Chat, Image Generation, Audio Generation, or
      Video Generation. Each mode uses specialized AI models to deliver the best
      results for your task, whether you’re chatting, designing visuals,
      composing audio, or producing videos.
    </p>
    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
      <li>
        <strong>How It Works:</strong> Select a mode to switch between Chat,
        Image, Audio, or Video Generation. We have included the best multiple AI
        models AI models suited for that mode.
      </li>
      <li>
        <strong>Tailored History:</strong> The history tab (labeled{" "}
        <strong>3</strong>) updates to match your active mode—e.g., see{" "}
        <strong>Image History</strong> in Image Generation mode or{" "}
        <strong>Video History</strong> in Video Generation mode.
      </li>
    </ul>
  </div>
);
const ModelSwitcher = () => (
  <div>
    <h2 className="text-2xl font-bold mb-2">Pick Your AI Models</h2>
    <p className="text-muted-foreground mb-4">
      The <strong>Model Switcher</strong> (labeled <strong>3</strong>) opens a
      modal where you can select AI models tailored to your active mode—whether
      it’s Chat, Image Generation, Audio Generation, or Video Generation. Our
      platform combines multiple AI models, so you can choose the best ones for
      your task.
    </p>
    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
      <li>
        <strong>How It Works:</strong> Click the Model Switcher to open the
        modal. You’ll see a list of AI models available for your current mode
        (e.g., image-focused models in Image Generation mode).
      </li>
      <li>
        <strong>Select Multiple Models:</strong> Pick as many AI models as you’d
        like to interact with, giving you flexibility to experiment and create.
      </li>
      <li>
        <strong>Customized Experience:</strong> Use the right AI models for the
        job, ensuring top-notch results for chatting, generating images, audio,
        or videos.
      </li>
    </ul>
  </div>
);
const MoreContent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-2"> Explore Extra Tools</h2>
    <p className="text-muted-foreground mb-4">
      The <strong>More</strong> tab (labeled <strong>4</strong>) provides access
      to resources to help you understand and stay updated with our platform’s
      features and AI models.
    </p>
    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
      <li>
        <strong>Model Glossary:</strong> Learn about the AI models available for
        each mode with detailed explanations.
      </li>
      <li>
        <strong>Model Analytics:</strong> Check insights into your usage, like
        which models you’ve used or how many creations you’ve made.
      </li>
      <li>
        <strong>Changelog:</strong> Stay in the up to date with updates, new
        features, and platform improvements.
      </li>
    </ul>
  </div>
);
const InfoCards = () => {
  return (
    <div className="space-y-4">
      {/* Heads Up Card */}
      <Card className="border-green-500 bg-background shadow-lg  dark:border-green-400 ">
        <CardContent className="p-4 flex items-start space-x-3 text-gray-900 dark:text-gray-100">
          <Info className="text-green-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-black dark:text-green-300">
              Heads up:
            </p>
            <p className="">
              Some features require a paid plan. Check out our  
              <a
                href="#"
                className="text-blue-500 underline hover:text-blue-400 transition-colors duration-200 dark:text-blue-400 dark:hover:text-blue-300"
              >
                feature limitations
              </a>
                or consider  
              <a
                href="#"
                className="text-blue-500 underline hover:text-blue-400 transition-colors duration-200 dark:text-blue-400 dark:hover:text-blue-300"
              >
                upgrading your plan
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tip Card */}
      <Card className="border-blue-500 bg-background shadow-lg  dark:border-blue-400 ">
        <CardContent className="p-4 flex items-start space-x-3 text-gray-900 dark:text-gray-100">
          <Sparkles className="text-blue-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-black dark:text-blue-300">Tip:</p>
            <p className="">
              To access our Help Center and resources, click  
              <a
                href="#"
                className="text-blue-500 underline hover:text-blue-400 transition-colors duration-200 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Help Center
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
const Overview = () => {
  const [activeTab, setActiveTab] = React.useState("new-chat");
  const renderContent = () => {
    switch (activeTab) {
      case "new-chat":
        return <NewChat />;
      case "mode-selector":
        return <ModeSwitcher />;
      case "model-switcher":
        return <ModelSwitcher />;
      case "feature-hub":
        return <MoreContent />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Popular */}
      <div className="max-w-6xl mx-auto ">
        <div className="flex items-center gap-2 mb-6"></div>
      </div>

      {/*  Overview */}
      <div className="max-w-6xl mx-auto p-2">
        <div className="space-y-8">
          <div className="mt-5 mb-10 ">
            <InfoCards />
          </div>
        </div>

        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold mb-4">Sidebar</h2>
          <hr className="border-t-1 dark:border-zinc-700 border-gray-200 " />
          <p className="mt-5 text-muted-foreground">
            {`From the sidebar, you can switch between different modes, including
            Chat, Image Generation, Audio Generation, and Video Generation.
            You'll also find tools like Chat History, the Model Glossary, the
            Changelog, and Model Analysis to keep track of updates and access
            key information easily.`}
          </p>
        </div>
        {/* sidebar image placeholder */}
        <div className="mb-5">
          <Image
            src="/svgs/sidebarSvg.svg"
            alt="sidebar"
            width={585}
            height={393}
          />
        </div>
        <div className="mt-5">
          <div>
            <Tabs
              defaultValue="new-chat"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="flex justify-start space-x-4 border-b dark:border-zinc-700 border-gray-200 bg-transparent">
                <TabsTrigger
                  value="new-chat"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-black dark:text-muted-foreground dark:data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-gray-700 dark:data-[state=active]:border-gray-400"
                >
                  1. New Chat
                </TabsTrigger>
                <TabsTrigger
                  value="mode-selector"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-black dark:text-muted-foreground dark:data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-gray-700 dark:data-[state=active]:border-gray-400"
                >
                  2. Mode Selector
                </TabsTrigger>
                <TabsTrigger
                  value="model-switcher"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-black dark:text-muted-foreground dark:data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-gray-700 dark:data-[state=active]:border-gray-400"
                >
                  3. Model Switcher
                </TabsTrigger>
                <TabsTrigger
                  value="feature-hub"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-black dark:text-muted-foreground dark:data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-gray-700 dark:data-[state=active]:border-gray-400"
                >
                  4. More
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Render the content based on the active tab */}
            <div className="mt-4">{renderContent()}</div>
          </div>
        </div>
      </div>
      {/* continuation */}
      <div>
        <NavigationContainer
          previousTitle="Get started"
          preUrl=""
          nextUrl=""
          nextTitle="Text Generation"
          // nextDesciption="Explore tutorial for Text Generation"
          // previousDescription=""
        />
      </div>
    </div>
  );
};

export default Overview;
