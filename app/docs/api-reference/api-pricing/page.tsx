"use client";
import { useState, useEffect } from "react";
import {
  activeChatAIModels,
  actualIMagePricing,
  activeAudioModels,
  AudioModelType,
  activeVideoModels,
} from "@/lib/modelPricing";
import {
  ChevronDown,
  ChevronUp,
  EuroIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";
import NavigationContainer from "@/components/NavigationContainer";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";


// Define the Model interfaces based on our pricing types
type BaseModel = {
  id: string;
  name: string;
  type: "chat" | "image" | "audio" | "video" | "multimodal";
};

type ImageModel = BaseModel & {
  type: "image";
  capabilities: ("image-gen" | "image-edit")[];
  perImage: string;
  perThousandRequest: string;
};

type AudioModel = BaseModel & {
  type: "audio";
  capabilities: ("stt" | "tts" | "audio-gen")[];
  perMinInput: string;
  perSecGenerated: string;
  perTenThousandRequests: string;
};

type VideoModel = BaseModel & {
  type: "video";
  capabilities: ("text-video" | "video-edit")[];
  perSecGenerated: string;
  perThousandRequests: string;
};

type Model = BaseModel | ImageModel | AudioModel | VideoModel;

// Define the ChatModel interface based on actual data
type ChatModel = {
  uid: string;
  active: boolean;
  inputTokenPer1M_Actual: number | null;
  outputTokenPer1M_Actual: number | null;
  per1000Request: string;
};

// Add type definition after the ChatModel type
type ImagePricingModel = {
  Uids: string;
  Id?: number;
  "DB Pricing Per 1000 Images": string | number;
  "Actual Model Pricing"?: string;
};

// Update the AudioPricingModel type to match the actual data structure
type AudioPricingModel = {
  Uids: string;
  Input?: number | string;
  Output?: number | string;
  "Estimated cost"?: string;
  "Estimated cost per minute"?: string;
  "Estimated cost per minute of video"?: string;
  price?: string;
};

// Add type definition after AudioModelType
type VideoModelType = {
  Uids: string;
  "price per second of video"?: string;
  "price per second of video 720,24fps"?: string;
  "price per second of video 540,24fps"?: string;
};

interface ExchangeRateResponse {
  amount: number;
  base: string;
  date: string;
  rates: {
    USD: number;
  };
}
function formatLocalDate(dateString: string): string {
  const parts = dateString.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]) ; 
  const day = Number(parts[2]);

  const localDate = new Date(year, month, day);

  return localDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const PricingPage = () => {
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>(
    {}
  );
  const [showEuro, setShowEuro] = useState(false);
  const [gbpToUsd, setGbpToUsd] = useState<number>(1.27); // GBP to USD rate
  const [rateDate, setRateDate] = useState<string>("");
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Base platform fee in GBP
  const BASE_PLATFORM_FEE_GBP = 5.0;

  // Calculate fees using live GBP to USD rate
  const getPlatformFees = () => {
    const usdFee = (BASE_PLATFORM_FEE_GBP * gbpToUsd).toFixed(2);
    return {
      gbp: BASE_PLATFORM_FEE_GBP.toFixed(2),
      usd: usdFee,
    };
  };

  // Fetch GBP to USD exchange rate
  const fetchExchangeRate = async () => {
    setIsLoadingRate(true);
    try {
      // Fetch GBP to USD rate
      const key = process.env.NEXT_PUBLIC_PRICING_CONFIG;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pricing-config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "X-Pricing-Config-Token": key,
          }),
        }
      );
      const data: ExchangeRateResponse = await response.json();
   
      setGbpToUsd(data.rates.USD);
      // Foremat the date nicely
      
      const formattedDate = formatLocalDate(data.date)

      setRateDate(formattedDate);
      
    } catch (error) {
      // console.error("Failed to fetch exchange rate:", error);
      // Fallback to default rate
      
      setGbpToUsd(1.27);
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchExchangeRate();
  }, []);

  // Handle manual refresh with animation
  const handleRefresh = async () => {
    if (isRefreshing) return; // Prevent multiple clicks while refreshing
    setIsRefreshing(true);
    await fetchExchangeRate();
    // Add a small delay to make the animation visible
    setTimeout(() => setIsRefreshing(false), 750);
  };

  const handleExpand = (type: string): void => {
    setExpandedTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const formatPrice = (price: number | null): string => {
    if (price === null) return "-";
    return `$${price.toFixed(2)}`;
  };

  // Helper function to extract numeric value from price string
  const extractNumericPrice = (price: string | number): number | null => {
    if (typeof price === "number") return price;
    if (!price || price === "") return null;
    const numericValue = parseFloat(price.replace(/[^0-9.]/g, ""));
    return isNaN(numericValue) ? null : numericValue;
  };

  // USD to EUR conversion for model prices (using fixed rate since we're focusing on GBP/USD)
  const USD_TO_EUR_RATE = 0.92;

  const convertToEur = (price: number | null): string => {
    if (price === null) return "-";
    return `€${(price * USD_TO_EUR_RATE).toFixed(2)}`;
  };

  const convertToEurAudio = (price: string | undefined): string => {
    if (!price) return "-";
    const numericValue = extractNumericPrice(price);
    return numericValue === null
      ? "-"
      : `€${(numericValue * USD_TO_EUR_RATE).toFixed(4)}`;
  };

  const convertToEurVideo = (price: string | undefined): string => {
    if (!price) return "-";
    const numericValue = extractNumericPrice(price);
    return numericValue === null
      ? "-"
      : `€${(numericValue * USD_TO_EUR_RATE).toFixed(2)}`;
  };

  const PricingNotice = () => {
    const fees = getPlatformFees();

    return (
      <div className="relative overflow-hidden bg-background border border-border rounded-xl p-8 mb-8">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-start gap-2 mb-4">
            <h3 className="text-xl font-semibold">
              Transparent Pricing Structure
            </h3>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <span className="font-medium text-primary">
                AlleAI processes all payments in GBP
              </span>
              , while displaying the original USD pricing from individual model
              providers for transparency.
            </p>
            <p className="text-sm">
              These rates reflect direct pricing from providers like OpenAI,
              Anthropic, and others. We've integrated them into one unified
              platform while maintaining complete pricing transparency.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => setShowEuro(!showEuro)}
              className="bg-background border border-border rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-accent transition-all"
            >
              <EuroIcon className="w-4 h-4" />
              <span>
                {showEuro
                  ? "Show Provider Pricing (USD)"
                  : "Show Platform Pricing (USD)"}
              </span>
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isLoadingRate ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading rates...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>£1 ≈ ${gbpToUsd.toFixed(4)}</span>
                  {rateDate && (
                    <span className="text-xs text-muted-foreground/60">
                      (as of {rateDate})
                    </span>
                  )}
                  <button
                    onClick={handleRefresh}
                    className="p-1 hover:bg-accent rounded-md transition-all duration-200 relative group"
                    disabled={isRefreshing}
                    aria-label="Refresh exchange rate"
                  >
                    <RefreshCw
                      className={`h-4 w-4 text-muted-foreground/60 hover:text-muted-foreground transition-all duration-200
                      ${
                        isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                      }`}
                    />
                    <span
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-background/80 
                    backdrop-blur-sm border border-border text-xs rounded opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 whitespace-nowrap"
                    >
                      Refresh exchange rate
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Platform Fee Notice */}
          <div className="mt-4 p-4 bg-accent/30 border border-border/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">
                Platform Service Fee:
              </span>{" "}
              To help maintain our platform’s performance and reliability, a
              small service charge of{" "}
              <span className="font-medium text-primary">0.05</span> is added on
              top of the provider’s base rate per request. This ensures we can
              continue delivering a smooth and dependable experience.
              {isLoadingRate && (
                <span className="ml-2 inline-flex items-center text-xs text-muted-foreground/60">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Updating rates...
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-accent to-transparent" />
      </div>
    );
  };

  const renderChatModelTable = () => {
    const isExpanded: boolean = expandedTypes["chat"] || false;
    const displayedModels = isExpanded
      ? activeChatAIModels
      : activeChatAIModels.slice(0, 5);

    const tableVariants = {
      hidden: { opacity: 0, height: 0 },
      visible: {
        opacity: 1,
        height: "auto",
        transition: {
          duration: 0.4,
          staggerChildren: 0.1,
        },
      },
      exit: {
        opacity: 0,
        height: 0,
        transition: {
          duration: 0.3,
          staggerChildren: 0.05,
          staggerDirection: -1,
        },
      },
    };

    const rowVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
      },
      exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.2 },
      },
    };

    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-3 capitalize">Chat Models</h2>
        <p className="text-muted-foreground mb-6">
          Pricing for chat-based language models
        </p>
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 text-left text-xs font-bold uppercase">
                Model
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Input Tokens (Per Million)
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Output Tokens (Per Million)
              </th>
            </tr>
          </thead>
          <AnimatePresence mode="wait">
            <motion.tbody
              key={isExpanded ? "expanded" : "collapsed"}
              variants={tableVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {displayedModels.map((model, index) => (
                <motion.tr
                  key={model.uid}
                  variants={rowVariants}
                  custom={index}
                  className="border-b border-border hover:bg-accent/50"
                >
                  <td className="p-2 text-left text-xs text-muted-foreground">
                    {model.uid}
                  </td>
                  <td className="p-2 text-center text-muted-foreground text-xs">
                    {showEuro
                      ? convertToEur(model.inputTokenPer1M_Actual)
                      : formatPrice(model.inputTokenPer1M_Actual)}
                  </td>
                  <td className="p-2 text-center text-muted-foreground text-xs">
                    {showEuro
                      ? convertToEur(model.outputTokenPer1M_Actual)
                      : formatPrice(model.outputTokenPer1M_Actual)}
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </AnimatePresence>
        </table>
        {activeChatAIModels.length > 5 && (
          <motion.button
            onClick={() => handleExpand("chat")}
            className="mt-4 mb-8 flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-medium">
              {isExpanded ? "Show Less" : "Show More"}
            </span>
            <motion.div
              animate={{
                rotate: isExpanded ? 180 : 0,
                translateY: isExpanded ? -1 : 1,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="ml-1"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        )}
      </div>
    );
  };

  const renderImageModelTable = () => {
    const isExpanded: boolean = expandedTypes["image"] || false;
    const displayedModels = isExpanded
      ? actualIMagePricing
      : actualIMagePricing.slice(0, 5);

    const formatPrice = (price: string | number): string => {
      if (!price || price === "") return "-";
      return typeof price === "string" && price.includes("$")
        ? price
        : `$${price}`;
    };

    const tableVariants = {
      hidden: { opacity: 0, height: 0 },
      visible: {
        opacity: 1,
        height: "auto",
        transition: {
          duration: 0.4,
          staggerChildren: 0.1,
        },
      },
      exit: {
        opacity: 0,
        height: 0,
        transition: {
          duration: 0.3,
          staggerChildren: 0.05,
          staggerDirection: -1,
        },
      },
    };

    const rowVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
      },
      exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.2 },
      },
    };

    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-3 capitalize">Image Models</h2>
        <p className="text-muted-foreground mb-6">
          Pricing for image generation and editing models
        </p>
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 text-left text-xs font-bold uppercase">
                Model
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Price (Per 1000 Images)
              </th>
            </tr>
          </thead>
          <AnimatePresence mode="wait">
            <motion.tbody
              key={isExpanded ? "expanded" : "collapsed"}
              variants={tableVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {displayedModels.map(
                (model: ImagePricingModel, index: number) => (
                  <motion.tr
                    key={model.Uids}
                    variants={rowVariants}
                    custom={index}
                    className="border-b border-border hover:bg-accent/50"
                  >
                    <td className="p-2 text-left text-xs text-muted-foreground">
                      {model.Uids}
                    </td>
                    <td className="p-2 text-center text-muted-foreground text-xs">
                      {showEuro
                        ? convertToEur(
                            extractNumericPrice(
                              model["DB Pricing Per 1000 Images"]
                            )
                          )
                        : formatPrice(model["DB Pricing Per 1000 Images"])}
                    </td>
                  </motion.tr>
                )
              )}
            </motion.tbody>
          </AnimatePresence>
        </table>
        {actualIMagePricing.length > 5 && (
          <motion.button
            onClick={() => handleExpand("image")}
            className="mt-4 mb-8 flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-medium">
              {isExpanded ? "Show Less" : "Show More"}
            </span>
            <motion.div
              animate={{
                rotate: isExpanded ? 180 : 0,
                translateY: isExpanded ? -1 : 1,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="ml-1"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        )}
      </div>
    );
  };

  const renderAudioModelTable = () => {
    const formatPrice = (model: AudioModelType): string => {
      const price =
        model["Estimated cost"] ||
        model["Estimated cost per minute"] ||
        model["Estimated cost per minute of video"] ||
        model.price ||
        "-";
      // Clean up and normalize the price string
      const cleanPrice = price.toString().trim();
      return cleanPrice.includes("$") ? cleanPrice : `$${cleanPrice}`;
    };

    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-3 capitalize">Audio Models</h2>
        <p className="text-muted-foreground mb-6">
          Pricing for audio transcription and generation models
        </p>
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 text-left text-xs font-bold uppercase">
                Model
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Price Per Minute of Audio
              </th>
            </tr>
          </thead>
          <tbody>
            {activeAudioModels.map((model: AudioModelType) => (
              <tr
                key={model.Uids}
                className="border-b border-border hover:bg-accent/50"
              >
                <td className="p-2 text-left text-xs text-muted-foreground">
                  {model.Uids}
                </td>
                <td className="p-2 text-center text-muted-foreground text-xs">
                  {showEuro
                    ? convertToEurAudio(formatPrice(model))
                    : formatPrice(model)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderVideoModelTable = () => {
    const formatPrice = (price: string | undefined): string => {
      if (!price) return "-";
      // Clean up and normalize the price string
      const cleanPrice = price.toString().trim();
      return cleanPrice.includes("$") ? cleanPrice : `$${cleanPrice}`;
    };

    // Transform the data to handle multiple resolutions
    const transformedData = activeVideoModels.flatMap(
      (model: VideoModelType) => {
        if (model.Uids === "ray-2") {
          return [
            {
              name: model.Uids,
              resolution: "720p 24fps",
              price: model["price per second of video 720,24fps"] || "-",
            },
            {
              name: model.Uids,
              resolution: "540p 24fps",
              price: model["price per second of video 540,24fps"] || "-",
            },
          ];
        }
        return [
          {
            name: model.Uids,
            resolution: "Standard",
            price: model["price per second of video"] || "-",
          },
        ];
      }
    );

    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-3 capitalize">Video Models</h2>
        <p className="text-muted-foreground mb-6">
          Pricing for video generation and editing models
        </p>
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 text-left text-xs font-bold uppercase">
                Model
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Resolution
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Price Per Second of Video Generated
              </th>
            </tr>
          </thead>
          <tbody>
            {transformedData.map((item, index) => (
              <tr
                key={`${item.name}-${item.resolution}`}
                className="border-b border-border hover:bg-accent/50"
              >
                <td className="p-2 text-left text-xs text-muted-foreground">
                  {item.name}
                </td>
                <td className="p-2 text-center text-xs text-muted-foreground">
                  {item.resolution}
                </td>
                <td className="p-2 text-center text-muted-foreground text-xs">
                  {showEuro
                    ? convertToEurVideo(formatPrice(item.price))
                    : formatPrice(item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const ChatModelsSection = () => (
    <section id="chat-models-pricing" className="mb-16">
      <PricingNotice />
      {renderChatModelTable()}
      {/* Pricing Documentation */}
      <div className="mt-8">
        <div className="bg-background border border-borderColorPrimary rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">
            Web Search-Enabled Requests
          </h3>
          <p className="text-muted-foreground mb-3">
            When{" "}
            <code className="text-muted-foreground dark:bg-accent font-bold bg-gray-100 px-1 rounded">
              web_search: true
            </code>{" "}
            is set, requests include real-time web search results, incurring an
            additional fee:
          </p>
          <ul className="list-disc pl-5 text-muted-foreground mb-4">
            <li className="mb-2">
              <span className="font-medium">
                Basic Web Search (1-25 results):
              </span>{" "}
              <code className="text-muted-foreground font-bold bg-gray-100 dark:bg-accent px-1 rounded">
                $X + $0.008
              </code>{" "}
              per request
              <ul className="list-circle pl-5 mt-1">
                <li>Delivers up to 25 curated web results with full text.</li>
                <li>Ideal for quick, focused queries.</li>
              </ul>
            </li>
            <li className="mb-2">
              <span className="font-medium">
                Extended Web Search (26-100 results):
              </span>{" "}
              <code className="text-muted-foreground dark:bg-accent font-bold bg-gray-100 px-1 rounded">
                $X + $0.034
              </code>{" "}
              per request
              <ul className="list-circle pl-5 mt-1">
                <li>Delivers up to 100 web results with full text.</li>
                <li>Best for comprehensive research.</li>
              </ul>
            </li>
            <li>
              <span className="font-medium">Optional Add-Ons (per page):</span>
              <ul className="list-circle pl-5 mt-1">
                <li>
                  Highlights:{" "}
                  <code className="text-muted-foreground dark:bg-accent font-bold bg-gray-100 px-1 rounded">
                    +$0.0013
                  </code>
                </li>
                <li>
                  Summaries:{" "}
                  <code className="text-muted-foreground dark:bg-accent font-bold bg-gray-100 px-1 rounded">
                    +$0.0013
                  </code>
                </li>
              </ul>
            </li>
          </ul>
          <p className="text-muted-foreground  italic">
            <strong className="font-bold">Note:</strong> Web search is disabled
            by default (
            <code className="text-muted-foreground dark:bg-accent font-bold bg-gray-100 px-1 rounded">
              web_search: false
            </code>
            ) and only incurs additional costs when enabled. Result counts and
            add-ons may be limited based on query complexity.
          </p>
        </div>
      </div>
    </section>
  );

  const ImageModelsSection = () => (
    <section id="image-models-pricing" className="mb-16">
      {renderImageModelTable()}
    </section>
  );

  const AudioModelsSection = () => (
    <section id="audio-models-pricing" className="mb-16">
      {renderAudioModelTable()}
    </section>
  );

  const VideoModelsSection = () => (
    <section id="video-models-pricing" className="mb-16">
      {renderVideoModelTable()}
    </section>
  );

  return (
    <div className="max-w-5xl px-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4">API Pricing</h1>
      </div>
      <div className="text-muted-foreground max-w-3xl mb-12">
        <p>
          AlleAI provides a unified API that lets you access a wide range of AI
          capabilities across chat, image, audio, and video models from leading
          providers. We offer transparent, per-request pricing based on the
          individual rates of each model, allowing you to seamlessly integrate
          multiple AI services in a single call. Simply go to{" "}
          <span className=" font-bold capitalize text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 ">
            <Link href={"/developer/settings/profile"}>API settings</Link>
          </span>
          &nbsp; to purchase or load your prepaid credits, and each API request
          will be billed against your balance. As you make requests, your
          credits will be consumed accordingly, offering flexibility and control
          over your usage
        </p>
      </div>

      {/* Model Sections */}
      <div className="mb-12">
        <ChatModelsSection />
        <ImageModelsSection />
        <AudioModelsSection />
        <VideoModelsSection />
      </div>

      {/* Footer */}
      <NavigationContainer
        nextUrl="/docs/api-reference/limits-tiers"
        nextTitle="Usage Tiers"
        preUrl="/docs/api-reference/introduction"
        previousTitle="Introduction"
      />
    </div>
  );
};

export default PricingPage;
