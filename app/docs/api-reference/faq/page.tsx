"use client";
import { useState } from "react";
import { OnThisPage } from "@/components/docs/OnThisPage";
import { ChevronDown, ChevronUp } from "lucide-react";
import ArticleFeedback from "@/components/docs/articleFeedback";
import DocsFooter from "@/components/docs/simpleFooterDocs";
type FAQItem = {
  id: string;
  question: string;
  answer: {
    description: string;
    points?: string[];
    note?: string;
  };
};

const FAQ_DATA: FAQItem[] = [
  {
    id: "1",
    question: "How do I choose which models to use in my API request?",
    answer: {
      description:
        "You can specify the AI models (e.g., ChatGPT, Claude, Gemini) you want in a single API request by including them in the request body.",
      points: [
        "Pass a single model for a simple request or multiple models for broader results.",
        "The number of models you can include depends on your subscription tier—check the docs for details.",
        "Available models span chat, audio, video, and image types.",
      ],
      note: "See our documentation at alle-ai.com/docs for examples and model lists.",
    },
  },
  {
    id: "2",
    question: "Why am I seeing errors for certain models or features?",
    answer: {
      description:
        "Errors may pop up if you're requesting models or features (e.g., advanced chat, audio, or video models) limited to higher subscription tiers.",
      points: [
        "API v1 now includes clearer error messages to avoid confusion.",
        "Tier 1 offers basic models; Tier 3+ unlocks more advanced options.",
        "Check your plan in the dashboard to confirm what's available.",
        "You might get similar results with creative prompting on accessible models.",
      ],
      note: "Email support@alle-ai.com for help with alternatives.",
    },
  },
  {
    id: "3",
    question: "How do I report a bug with the API?",
    answer: {
      description:
        "If you hit issues like model timeouts or weird outputs, file a bug report via our GitHub repository and send the link to contact@alle-ai.com.",
      points: [
        "Include your request body and model details for quicker fixes.",
        "We prioritize based on impact and volume of reports.",
        "You'll get a tracking ID to follow progress.",
      ],
    },
  },
  {
    id: "4",
    question: "How can I track usage across multiple models?",
    answer: {
      description:
        "Monitor your API key's usage for chat, audio, video, and image model requests through the dashboard.",
      points: [
        "Real-time stats break down usage by model type.",
        "Set custom alerts to keep costs in check.",
        "Export reports to analyze your multi-model usage.",
      ],
    },
  },
  {
    id: "5",
    question: "How do I stay updated on new models or API changes?",
    answer: {
      description:
        "Stay in the loop on Alle-AI's growing model lineup and updates:",
      points: [
        "Subscribe to our changelog for API and model news.",
        "Join our Discord for dev chats and tips.",
        "Follow our GitHub for code and feature updates.",
        "Visit status.alle-ai.com for service status.",
      ],
    },
  },
  {
    id: "6",
    question: "Is my data used to train models?",
    answer: {
      description: "We prioritize your privacy at Alle-AI:",
      points: [
        "API request data isn't used for training by default.",
        "Enterprise tiers can opt for full data isolation.",
        "All data is encrypted in transit and at rest.",
      ],
      note: "Check alle-ai.com/privacy for the full policy.",
    },
  },
  {
    id: "7",
    question: "Are there limits on API requests or model usage?",
    answer: {
      description:
        "Yes, Alle-AI has limits to ensure fair usage, tailored to your subscription tier.",
      points: [
        "Basic tiers have caps on requests and model counts per call.",
        "Higher tiers unlock more models and higher limits—details in the docs.",
        "Monitor usage in the dashboard to stay within bounds.",
      ],
      note: "Contact us if you need a custom plan.",
    },
  },
  {
    id: "8",
    question: "Can I compare or combine outputs from different models?",
    answer: {
      description:
        "For chat models, Alle-AI lets you compare, combine, or summarize outputs in a single request.",
      points: [
        "Pass multiple chat models (e.g., ChatGPT, Claude) to see side-by-side results.",
        "Use combination mode to blend responses into one output.",
        "Summary option condenses multi-model answers into a quick read.",
        "Audio, video, and image model comparisons are in development.",
      ],
      note: "Available in Tier 2 and above—see docs for setup.",
    },
  },
];
export default function Page() {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <main className="flex gap-2  max-w-5xl px-20">
      <div className=" w-full">
        <section className="min-h-[100vh] space-y-6">
          {/* tesst data */}
          <div className="max-w-3xl pl-5 ">
            <div className=" mb-10">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Frequently Asked Questions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Find answers to common questions about our API
              </p>
            </div>

            <div id="api-usage-faq" className="space-y-4">
              {FAQ_DATA.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full p-5 text-left flex justify-between items-center bg-gray-50 dark:bg-accent hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={expandedItems[item.id]}
                    aria-controls={`faq-${item.id}`}
                  >
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {item.question}
                    </h2>
                    {expandedItems[item.id] ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                    )}
                  </button>

                  <div
                    id={`faq-${item.id}`}
                    className={`px-5 pb-5 pt-3 bg-background ${
                      expandedItems[item.id] ? "block" : "hidden"
                    }`}
                  >
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {item.answer.description}
                    </p>

                    {item.answer.points && (
                      <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                        {item.answer.points.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    )}

                    {item.answer.note && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 italic">
                          {item.answer.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div id="security-limits-faq" className="space-y-4 mt-8">
              {FAQ_DATA.slice(5).map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full p-5 text-left flex justify-between items-center bg-gray-50 dark:bg-accent hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={expandedItems[item.id]}
                    aria-controls={`faq-${item.id}`}
                  >
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {item.question}
                    </h2>
                    {expandedItems[item.id] ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                    )}
                  </button>

                  <div
                    id={`faq-${item.id}`}
                    className={`px-5 pb-5 pt-3 bg-background ${
                      expandedItems[item.id] ? "block" : "hidden"
                    }`}
                  >
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {item.answer.description}
                    </p>

                    {item.answer.points && (
                      <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                        {item.answer.points.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    )}

                    {item.answer.note && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 italic">
                          {item.answer.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* break lines  */}
            <div>
              <ArticleFeedback />
            </div>
          </div>
          {/* break line */}
          <div>
            <DocsFooter />
          </div>
        </section>
      </div>
      {/* table of contents */}
      {/* <aside className="hidden lg:block w-1/4 sticky">
       
      </aside> */}
    </main>
  );
}
