"use client";
import { OnThisPage } from "@/components/docs/OnThisPage";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ArticleFeedback from "@/components/docs/articleFeedback";
import DocsFooter from "@/components/docs/simpleFooterDocs";
type ChangelogItem = {
  id: string;
  title: string;
  date: string;
  content: {
    description?: string;
    highlights?: string[];
    upcoming?: string[];
    notes?: string[];
  };
};

const CHANGELOG_DATA: ChangelogItem[] = [
  {
    id: "1",
    title: "Documentation Enhancements",
    date: "March 2025",
    content: {
      description:
        "Completely revamped our documentation to improve developer experience and accelerate integration.",
      highlights: [
        "Interactive API playground for testing requests",
        "Comprehensive guides for each model type",
        "Expanded code examples in multiple languages",
        "Performance optimization recommendations",
      ],
      upcoming: ["Tutorial videos", "Community contribution section"],
    },
  },
  {
    id: "2",
    title: "Multimodal Model Support",
    date: "February 2025",
    content: {
      description:
        "Expanded allea-ai capabilities beyond text to include image, audio, and video AI models.",
      highlights: [
        "Image generation and analysis through multiple providers",
        "Audio transcription and analysis model integration",
        "Video analysis model support",
        "Unified request format across all modalities",
      ],
      notes: [
        "Some models may require additional authentication steps",
        "Check provider-specific documentation for response format details",
      ],
    },
  },
  {
    id: "3",
    title: "SDK Releases",
    date: "Late January 2025",
    content: {
      description:
        "Released official client libraries to simplify integration with our API.",
      highlights: [
        "Python SDK for data science and backend applications",
        "Node.js library for web and server applications",
        "Streamlined authentication and error handling",
        "Example code and quick-start guides",
      ],
      notes: [
        "SDKs are available via npm and pip",
        "Minimum Python version: 3.8",
        "Minimum Node.js version: 14.0.0",
      ],
    },
  },
  {
    id: "4",
    title: "Initial API Launch",
    date: "January 2025",
    content: {
      description:
        "Launched the first version of allea-ai API, enabling users to make single requests to multiple chat AI models simultaneously.",
      highlights: [
        "Support for major chat models including ChatGPT, Claude, and Gemini",
        "Simple HTTP request interface",
        "Response aggregation and normalization across different AI providers",
        "Basic authentication and request management",
      ],
      upcoming: [
        "Additional AI model support",
        "Client libraries for popular programming languages",
      ],
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
      <div className="w-full">
        <section id="api-change-logs" className="min-h-[80vh] space-y-6">
          {/* test data  */}
          <div className="max-w-3xl pl-5 ">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              Changelog
            </h1>

            <div className="space-y-4">
              {CHANGELOG_DATA.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full p-5 text-left flex justify-between items-center bg-gray-50 dark:bg-accent hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={expandedItems[item.id]}
                    aria-controls={`content-${item.id}`}
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {item.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.date}
                      </p>
                    </div>
                    {expandedItems[item.id] ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>

                  <div
                    id={`content-${item.id}`}
                    className={`px-5 pb-5 pt-3 bg-background ${
                      expandedItems[item.id] ? "block" : "hidden"
                    }`}
                  >
                    {item.content.description && (
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {item.content.description}
                      </p>
                    )}

                    {item.content.highlights && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Highlights
                        </h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-gray-700 dark:text-gray-300">
                          {item.content.highlights.map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.content.upcoming && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Coming soon
                        </h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-gray-700 dark:text-gray-300">
                          {item.content.upcoming.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.content.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Notes
                        </h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-gray-700 dark:text-gray-300">
                          {item.content.notes.map((note, index) => (
                            <li key={index}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* break line  */}
          <div>
            <ArticleFeedback />
          </div>
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
