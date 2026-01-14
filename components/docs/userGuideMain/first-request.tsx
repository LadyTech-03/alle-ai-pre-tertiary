"use client";
import Link from "next/link";
import RenderCode from "@/components/RenderCode";
import ArticleFeedback from "../articleFeedback";
import DocsFooter from "../simpleFooterDocs";
import React, { ReactNode } from "react";
import { Card } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { introCodes } from "@/lib/constants/code-snippets-docs/apiDocs";
const components = [
  {
    name: "models",
    description: "Array of AI models you want to query simultaneously",
    example: "Compare responses from [gpt-4o] and [claude-3.5-sonnet]",
    hasExample: true,
    subComponents: [],
  },
  {
    name: "messages",
    description: "Conversation structure",
    hasExample: false,
    subComponents: [
      {
        name: "system",
        description: "Sets AI behavior",
        note: "(optional but recommended)",
      },
      {
        name: "user",
        description: "Your input",
        note: '(supports multimodal with type: "text")',
      },
    ],
  },
];
export default function FirstRequest() {
  const Highlight = ({ children }: { children: ReactNode }) => (
    <span className="font-semibold text-muted-foreground bg-gray-100 px-1.5 py-0.5 dark:bg-gray-700 rounded text-sm">
      {children}
    </span>
  );

  return (
    <main>
      {/* intro */}
      <section id="chat-completion-intro" className="mb-10 max-w-3xl">
        <h2 className="font-bold text-2xl text-muted-foreground mb-4">
          Making Your First Chat Completion Request
        </h2>
        <p className="text-muted-foreground mb-6 ">
          Now that your environment is set up, let's interact with our chat
          completion endpoint. This is where we will be sending our first
          prompts and receive AI-generated responses from multiple AI models
          through our SDK.
        </p>
        <hr className="border-t-1 dark:border-zinc-700 border-gray-200 " />
      </section>
      {/* required parameters */}
      <section id="required-parameters" className="max-w-2xl mt-7 mb-7">
        <h2 className="font-semibold mb-4">Required Parameters</h2>
        <p className="text-muted-foreground">
          Every chat request must include these core elements:
        </p>
        {/* codes snippets */}
        <div className="mt-4 mb-6">
          <RenderCode
            language="json"
            title="core request parameters"
            code={`{
  "models": ["gpt-4o", "deepseek-r1", "claude-3.5-sonnet"],
  "messages": [
    { "system": "You are a helpful assistant." },
    { 
      "user": [
        { 
          "type": "text", 
          "text": "What is photosynthesis?" 
        }
      ]
    }
  ]
}`}
          />
        </div>
        {/* parameters meanings  */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Key Components Explained:</h3>

          {components.map((component, index) => (
            <div key={index} className="ml-4 space-y-1">
              <p className="flex items-center flex-wrap gap-1">
                <Highlight>{component.name}</Highlight>
                <span className="text-sm">{component.description}</span>
              </p>

              {component.hasExample && (
                <div className="ml-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Example:{" "}
                  {component.example!.split("[").map((part, i, arr) => {
                    if (i === 0) return <span key={i}>{part}</span>;
                    const [highlight, rest] = part.split("]");
                    return (
                      <React.Fragment key={i}>
                        <Highlight>{highlight}</Highlight>
                        {rest}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {component.subComponents.length > 0 && (
                <div className="ml-4 space-y-1 mt-2">
                  {component.subComponents.map((subComponent, subIndex) => (
                    <div
                      key={subIndex}
                      className="flex flex-wrap items-center gap-1 text-sm"
                    >
                      <Highlight>{subComponent.name}</Highlight>
                      <span>{subComponent.description}</span>
                      {subComponent.note && (
                        <span className="text-xs">
                          <Highlight>{subComponent.note}</Highlight>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      {/* example request to chat completions */}
      <hr className="border-t-1 dark:border-zinc-700 border-gray-200 " />
      <section id="sdk-workflow" className="mb-7 mt-7">
        <div className="max-w-2xl space-y-4 mb-8">
          <h3 className="text-xl font-semibold">SDK Workflow</h3>
          <p className="text-muted-foreground">
            We'll use the{" "}
            <span className="font-semibold bg-gray-100 px-2 py-0.5 dark:bg-gray-700 rounded">
              AlleAI SDK
            </span>{" "}
            to:
          </p>

          <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
            <li>
              <span className="font-semibold">Initialize the client</span> with
              your{" "}
              <span className="font-semibold bg-gray-100 px-2 py-0.5 dark:bg-gray-700 rounded">
                API key
              </span>
            </li>
            <li>
              <span className="font-semibold">Send a properly formatted</span>{" "}
              <span className="font-semibold bg-gray-100 px-2 py-0.5 dark:bg-gray-700 rounded">
                chat request
              </span>
            </li>
            <li>
              <span className="font-semibold">Handle the response</span>{" "}
              (contains outputs from all{" "}
              <span className="font-semibold bg-gray-100 px-2 py-0.5 dark:bg-gray-700 rounded">
                requested models
              </span>
              )
            </li>
          </ol>

          {/* Reserved space for your actual code examples */}
          <div className="mt-8">
            {/* Your Python/Node.js code blocks will go here */}
            <h2 className="text-muted-foreground  font-semibold mb-4">
              Use the snippet below to send your first request to our chat
              endpoints using our SDKs.
            </h2>
            <div>
              <Card className="p-6 bg-background">
                <div className="space-y-6">
                  <Tabs defaultValue="python" className="w-full">
                    <TabsList>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="node">Node.js</TabsTrigger>
                    </TabsList>

                    <TabsContent value="python">
                      <RenderCode code={introCodes.python} language="python" />
                    </TabsContent>
                    <TabsContent value="node">
                      <RenderCode
                        code={introCodes.javascript}
                        language="javascript"
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            </div>
          </div>
        </div>
        {/* response output formats */}
        <hr className="border-t-1 dark:border-zinc-700 border-gray-200 " />

        <section id="response-handling" className="mt-7 mb-7">
          <div className="max-w-2xl space-y-4 mt-6">
            <h3 className="text-xl font-semibold">
              What to Expect in Responses
            </h3>

            <div className="space-y-3 text-muted-foreground">
              <p>Each model's reply will include:</p>

              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-semibold bg-gray-100 px-2 py-0.5 dark:bg-gray-700 rounded">
                    Generated content
                  </span>
                </li>
                <li>
                  <span className="font-semibold bg-gray-100 px-2 py-0.5 dark:bg-gray-700 rounded">
                    Metadata
                  </span>{" "}
                  (token usage, finish reason)
                </li>
              </ul>

              <p>Errors will surface if:</p>

              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-semibold bg-gray-100 px-2 py-0.5 dark:bg-gray-700 rounded">
                    API key
                  </span>{" "}
                  is invalid (
                  <span className="font-semibold bg-gray-100 px-2 py-0.5 dark:bg-gray-700 rounded">
                    401
                  </span>
                  )
                </li>
                <li>
                  <span className="font-semibold bg-gray-100 px-2 py-0.5 dark:bg-gray-700 rounded">
                    Model
                  </span>{" "}
                  is unavailable (
                  <span className="font-semibold bg-gray-100 px-2 py-0.5 dark:bg-gray-700 rounded">
                    404
                  </span>
                  )
                </li>
                <li>
                  <span className="font-semibold bg-gray-100 px-2 py-0.5 dark:bg-gray-700 rounded">
                    Rate limits
                  </span>{" "}
                  are hit (
                  <span className="font-semibold bg-gray-100 px-2 py-0.5 dark:bg-gray-700 rounded">
                    429
                  </span>
                  )
                </li>
              </ul>
            </div>
          </div>
        </section>
        {/* deeper topics */}
        <div className="mt-6 mb-6">
          <h2 className="font-bold text-muted-foreground">
            Dive deeper:&nbsp;
            <span>
              <Link
                href={"/docs/api-reference/introduction"}
                className=" inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-transform transform hover:scale-105"
              >
                &nbsp; API Reference → &nbsp;
              </Link>
            </span>
            &nbsp; (streaming, advanced parameters)...
          </h2>
        </div>
      </section>
      {/* end */}
      <section>
        <div className="mb-5">
          <ArticleFeedback />
        </div>
        <div>
          <DocsFooter />
        </div>
      </section>
    </main>
  );
}
