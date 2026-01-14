"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import RenderCode from "@/components/RenderCode";
import NavigationContainer from "@/components/NavigationContainer";

const errorData = {
  apiErrors: {
    title: "API Errors",
    errors: [
      {
        code: "401",
        name: "Invalid Authentication",
        cause: "Invalid Authentication",
        solution:
          "Ensure the correct API key and requesting organization are being used.",
      },
      {
        code: "401",
        name: "Incorrect API key provided",
        cause: "The requesting API key is not correct.",
        solution:
          "Ensure the API key used is correct, clear your browser cache, or generate a new one.",
      },
      {
        code: "403",
        name: "Country, region, or territory not supported",
        cause:
          "You are accessing the API from an unsupported country, region, or territory.",
        solution: "Please see this page for more information.",
      },
      {
        code: "429",
        name: "Rate limit reached for requests",
        cause: "You are sending requests too quickly.",
        solution: "Pace your requests. Read the Rate limit guide.",
      },
      {
        code: "500",
        name: "The server had an error while processing your request",
        cause: "Issue on our servers.",
        solution:
          "Retry your request after a brief wait and contact us if the issue persists. Check the status page.",
      },
    ],
  },
  libraryErrors: {
    title: "Library Error Types",
    errors: [
      {
        type: "APIConnectionError",
        cause: "Issue connecting to our services.",
        solution:
          "Check your network settings, proxy configuration, SSL certificates, or firewall rules.",
      },
      {
        type: "APITimeoutError",
        cause: "Request timed out.",
        solution:
          "Retry your request after a brief wait and contact us if the issue persists.",
      },
      {
        type: "AuthenticationError",
        cause: "Your API key or token was invalid, expired, or revoked.",
        solution:
          "Check your API key or token and make sure it is correct and active. You may need to generate a new one from your account dashboard.",
      },
    ],
  },
  errorExamples: [
    {
      language: "python",
      code: `
import base64
import time
from alleai.core import AlleAIClient
from alleai.core import APIError, APIConnectionError, RateLimitError, AuthenticationError

# Initialize client
client = AlleAIClient(api_key="[YOUR API KEY HERE]")

# Load and encode image file to base64
try:
    with open("example.jpg", "rb") as image_file:
        image_base64 = base64.b64encode(image_file.read()).decode("utf-8")
except FileNotFoundError as e:
    print(f"Error loading file: {e}")
    raise

# Chat completion with retry logic
max_retries = 3
for attempt in range(max_retries):
    try:
        response = client.chat.completions({
            "models": ["gpt-4o", "claude-3.5-sonnet"],
            "messages": [
                {"system": "You are a helpful assistant."},
                {
                    "user": [
                        {"type": "text", "text": "What’s in this image?"},
                        {"type": "image_url", "data": f"data:image/jpeg;base64,{image_base64}"}
                    ]
                }
            ],
            "response_format": {"type": "text"},
            "max_tokens": 200
        })
        print(response.text)
        break  # Success, exit loop
    except AuthenticationError as e:
        print(f"Authentication failed: {e}")
        raise  # Fatal, no retry
    except APIConnectionError as e:
        print(f"Connection error on attempt {attempt + 1}: {e}")
        if attempt == max_retries - 1:
            raise  # Out of retries
        time.sleep(2)  # Wait before retry
    except RateLimitError as e:
        print(f"Rate limit hit on attempt {attempt + 1}: {e}")
        if attempt == max_retries - 1:
            raise  # Out of retries
        time.sleep(2 ** attempt)  # Exponential backoff
    except APIError as e:
        print(f"API error on attempt {attempt + 1}: {e}")
        if attempt == max_retries - 1:
            raise  # Out of retries
        time.sleep(1)  # Brief wait
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise  # Unknown error, no retry
      `.trim(),
    },
    {
      language: "javascript",
      code: `
const client = require("alleai-sdk");
const fs = require("fs").promises;

async function chatWithImage() {
    // Load and encode image file to base64
    let imageBase64;
    try {
        const imageBuffer = await fs.readFile("example.jpg");
        imageBase64 = imageBuffer.toString("base64");
    } catch (error) {
        console.error(\`Error loading file: \${error}\`);
        throw error;
    }

    // Initialize client
    const alleai = new client.AlleAI({ apiKey: "[YOUR API KEY HERE]" });

    // Chat completion with retry logic
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await alleai.chat.completions({
                models: ["gpt-4o", "claude-3.5-sonnet"],
                messages: [
                    { system: "You are a helpful assistant." },
                    {
                        user: [
                            { type: "text", text: "What’s in this image?" },
                            { type: "image_url", data: \`data:image/jpeg;base64,\${imageBase64}\` }
                        ]
                    }
                ],
                response_format: { type: "text" },
                max_tokens: 200
            });
            console.log(response.text);
            break;  // Success, exit loop
        } catch (error) {
            if (error instanceof alleai.AuthenticationError) {
                console.error(\`Authentication failed: \${error}\`);
                throw error;  // Fatal, no retry
            } else if (error instanceof alleai.APIConnectionError) {
                console.error(\`Connection error on attempt \${attempt + 1}: \${error}\`);
                if (attempt === maxRetries - 1) throw error;  // Out of retries
                await new Promise(resolve => setTimeout(resolve, 2000));  // Wait 2s
            } else if (error instanceof alleai.RateLimitError) {
                console.error(\`Rate limit hit on attempt \${attempt + 1}: \${error}\`);
                if (attempt === maxRetries - 1) throw error;  // Out of retries
                await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 1000));  // Exponential backoff
            } else if (error instanceof alleai.APIError) {
                console.error(\`API error on attempt \${attempt + 1}: \${error}\`);
                if (attempt === maxRetries - 1) throw error;  // Out of retries
                await new Promise(resolve => setTimeout(resolve, 1000));  // Wait 1s
            } else {
                console.error(\`Unexpected error: \${error}\`);
                throw error;  // Unknown error, no retry
            }
        }
    }
}

chatWithImage().catch(err => console.error(\`Failed: \${err}\`));
      `.trim(),
    },
  ],
};

interface ExpProps {
  title: string;
  children: React.ReactNode;
}

const ExpandableSection = ({ title, children }: ExpProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg mb-4">
      <button
        className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-medium">{title}</span>
        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>
      {isExpanded && <div className="px-4 py-2">{children}</div>}
    </div>
  );
};

const ErrorDocs = () => {
  return (
    <div className="pb-16 w-full max-w-[100%] pr-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Error Handling</h1>
          <p className="text-muted-foreground">
            Learn how to handle errors in your API requests and understand
            common error scenarios.
          </p>
        </div>

        {/* API Errors Section */}
        <section>
          <h2 className="text-2xl font-bold mb-2">
            {errorData.apiErrors.title}
          </h2>
          <p className="text-muted-foreground mb-4">
            Common API errors you might encounter and how to resolve them.
          </p>
          {errorData.apiErrors.errors.map((error, index) => (
            <ExpandableSection
              key={index}
              title={`${error.code}: ${error.name}`}
            >
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Cause:</strong>{" "}
                  {error.cause}
                </p>
                <p>
                  <strong className="text-foreground">Solution:</strong>{" "}
                  {error.solution}
                </p>
              </div>
            </ExpandableSection>
          ))}
        </section>

        {/* Library Errors Section */}
        <section>
          <h2 className="text-2xl font-bold mb-2">
            {errorData.libraryErrors.title}
          </h2>
          <p className="text-muted-foreground mb-4">
            Specific errors that can occur when using our client libraries.
          </p>
          {errorData.libraryErrors.errors.map((error, index) => (
            <ExpandableSection key={index} title={error.type}>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Cause:</strong>{" "}
                  {error.cause}
                </p>
                <p>
                  <strong className="text-foreground">Solution:</strong>{" "}
                  {error.solution}
                </p>
              </div>
            </ExpandableSection>
          ))}
        </section>

        {/* Error Handling Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-2">Error Handling Examples</h2>
          <p className="text-muted-foreground mb-4">
            Here are examples of how to properly handle errors in your code
            using our client libraries.
          </p>
          <div className="space-y-4">
            <RenderCode
              languages={errorData.errorExamples}
              toggle={true}
              maxHeight={400}
              className="w-full"
            />
          </div>
        </section>

        {/* Navigation */}
        <NavigationContainer
          previousTitle="Rate Limits"
          // previousDescription="Understanding API rate limits"
          preUrl="/docs/user-guides/limits"
          nextTitle="Updates"
          // nextDesciption="Learn about API updates"
          nextUrl="/docs/user-guides/updates"
        />
      </div>
    </div>
  );
};

export default ErrorDocs;
