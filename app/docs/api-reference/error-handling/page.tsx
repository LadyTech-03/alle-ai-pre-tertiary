"use client";
import React from "react";
import RenderCode from "@/components/RenderCode";
import NavigationContainer from "@/components/NavigationContainer";

// Status code reference object for easy modification
const statusCodeReference = [
  {
    code: 400,
    errorType: "InvalidRequestError",
    description: "The request was malformed or contained invalid parameters.",
    possibleCauses:
      "Missing required fields, invalid parameter values, or unsupported model names.",
    suggestedAction:
      "Check your request parameters against the API documentation and validate inputs before sending.",
  },
  {
    code: 401,
    errorType: "AuthenticationError",
    description: "Authentication failed due to invalid credentials.",
    possibleCauses:
      "Invalid API key, expired token, or unauthorized access attempt.",
    suggestedAction:
      "Verify your API key is correct and properly formatted in the request headers.",
  },
  {
    code: 403,
    errorType: "APIError",
    description: "The request is forbidden due to permission issues.",
    possibleCauses:
      "Insufficient permissions, attempting to access a resource you don't have rights to.",
    suggestedAction:
      "Check your account permissions or contact support to request access to the resource.",
  },
  {
    code: 404,
    errorType: "APIError",
    description: "The requested resource was not found.",
    possibleCauses:
      "Incorrect endpoint URL, referencing a non-existent resource ID.",
    suggestedAction:
      "Verify the endpoint URL and resource identifiers in your request.",
  },
  {
    code: 429,
    errorType: "APIError",
    description: "Too many requests - rate limit exceeded.",
    possibleCauses:
      "Sending requests faster than the allowed rate for your tier.",
    suggestedAction:
      "Implement exponential backoff retry logic and consider upgrading your plan if you need higher limits.",
  },
  {
    code: 500,
    errorType: "APIError",
    description: "Internal server error occurred.",
    possibleCauses:
      "Unexpected error on the server side, not related to your request.",
    suggestedAction:
      "Retry with exponential backoff. If the issue persists, contact support with the request details.",
  },
  {
    code: 503,
    errorType: "APIError",
    description: "Service temporarily unavailable.",
    possibleCauses: "Server overload, maintenance, or temporary outage.",
    suggestedAction:
      "Implement retry logic with increasing delays and monitor service status.",
  },
];

const errorHandlingPython = `from alleai.core import AlleAIClient, APIError, AuthenticationError, InvalidRequestError
import time

# Initialize client
client = AlleAIClient(api_key="your_api_key")

def handle_api_request(max_retries=3):
    for attempt in range(max_retries):
        try:
            # Your API request here
            response = client.chat.completions({
                "models": ["gpt-4o"],
                "messages": [{"user": [{"type": "text", "text": "Hello!"}]}],
                "response_format": {"type": "text"}
            })
            return response
            
        except InvalidRequestError as e:
            print(f"Invalid request: {str(e)}")
            print("Check your input parameters and try again.")
            raise
            
        except AuthenticationError as e:
            print(f"Authentication failed: {str(e)}")
            print("Check your API key and try again.")
            raise
            
        except APIError as e:
            if attempt == max_retries - 1:
                print(f"API error persisted after {max_retries} attempts")
                raise
            
            wait_time = (attempt + 1) * 2  # Exponential backoff
            print(f"API error occurred, waiting {wait_time} seconds before retrying...")
            time.sleep(wait_time)
            continue
            
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            raise`;

const errorHandlingJS = `const { AlleAIClient, APIError, AuthenticationError, InvalidRequestError } = require("alle-ai-sdk");

// Initialize client
const client = new AlleAIClient({ apiKey: "your_api_key" });

async function handleApiRequest(maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Your API request here
            const response = await client.chat.completions({
                models: ["gpt-4o"],
                messages: [{ user: [{ type: "text", text: "Hello!" }] }],
                response_format: { type: "text" }
            });
            return response;
            
        } catch (error) {
            if (error instanceof InvalidRequestError) {
                console.error(\`Invalid request: \${error.message}\`);
                console.error("Check your input parameters and try again.");
                throw error;
            }
            
            if (error instanceof AuthenticationError) {
                console.error(\`Authentication failed: \${error.message}\`);
                console.error("Check your API key and try again.");
                throw error;
            }
            
            if (error instanceof APIError) {
                if (attempt === maxRetries - 1) {
                    console.error(\`API error persisted after \${maxRetries} attempts\`);
                    throw error;
                }
                
                const waitTime = (attempt + 1) * 2000; // Exponential backoff in ms
                console.log(\`API error occurred, waiting \${waitTime/1000} seconds before retrying...\`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            
            console.error(\`Unexpected error: \${error.message}\`);
            throw error;
        }
    }
}`;

// Debugging tips content
const debuggingTips = [
  {
    title: "Enable Verbose Logging",
    description:
      "Set up detailed logging to capture request/response details for troubleshooting.",
  },
  {
    title: "Check Request Parameters",
    description:
      "Validate all parameters before sending requests, especially required fields and format requirements.",
  },
  {
    title: "Inspect Response Headers",
    description:
      "Response headers often contain valuable information about rate limits, request IDs, and other metadata.",
  },
  {
    title: "Use Try/Except Blocks",
    description:
      "Wrap API calls in appropriate try/except blocks to gracefully handle different error scenarios.",
  },
];

export default function ErrorHandling() {
  return (
    <div
      data-search-sections="error-handling"
      data-search-title="Error Handling"
      className="flex gap-2  max-w-5xl px-20"
    >
      <div className="documentation-container">
        <div
          data-search
          data-title="Error Handling with our SDK"
          id="error-handling"
        >
          <h1 className="text-3xl font-bold mb-6">Error Handling</h1>

          <div className="mb-8">
            <p className="text-muted-foreground mb-6">
              The AlleAI SDK provides comprehensive error handling capabilities
              to help you build robust applications. This guide covers common
              error scenarios and best practices for handling them effectively.
            </p>

            <div
              id="error-types"
              className="bg-background border border-borderColorPrimary max-w-3xl rounded-lg p-6 mb-8"
            >
              <h2 className="text-xl font-semibold mb-4">Error Types</h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-medium min-w-[120px]">
                    AlleAIError:
                  </span>
                  <span>
                    Base exception class for all AlleAI SDK errors. All other
                    error types extend from this class.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium min-w-[120px]">APIError:</span>
                  <span>
                    Raised when the API returns an unexpected error. Includes
                    details about the error response.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium min-w-[120px]">
                    AuthenticationError:
                  </span>
                  <span>
                    Raised when authentication fails, such as when using an
                    invalid API key.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium min-w-[120px]">
                    InvalidRequestError:
                  </span>
                  <span>
                    Raised when the request is malformed or contains invalid
                    parameters.
                  </span>
                </li>
              </ul>
            </div>

            {/* Status Code Reference Table */}
            <div id="status-code-reference" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Status Code Reference</h2>
              <p className="text-muted-foreground mb-4">
                The following table provides information about common HTTP
                status codes, their corresponding error types, and recommended
                actions:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse mb-4">
                  <thead>
                    <tr className="bg-background border-b border-borderColorPrimary">
                      <th className="px-4 py-2 text-left">Status Code</th>
                      <th className="px-4 py-2 text-left">Error Type</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-left">Possible Causes</th>
                      <th className="px-4 py-2 text-left">Suggested Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    {statusCodeReference.map((item, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? "bg-background" : "bg-muted"
                        }
                      >
                        <td className="px-4 py-2 border-b border-borderColorPrimary">
                          {item.code}
                        </td>
                        <td className="px-4 py-2 border-b border-borderColorPrimary">
                          {item.errorType}
                        </td>
                        <td className="px-4 py-2 border-b border-borderColorPrimary">
                          {item.description}
                        </td>
                        <td className="px-4 py-2 border-b border-borderColorPrimary">
                          {item.possibleCauses}
                        </td>
                        <td className="px-4 py-2 border-b border-borderColorPrimary">
                          {item.suggestedAction}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Implementation Examples
              </h2>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Python</h3>
                <p className="text-muted-foreground mb-4">
                  Example showing comprehensive error handling in Python with
                  retry logic:
                </p>
                <div className="max-w-3xl">
                  <RenderCode
                    code={errorHandlingPython}
                    language="python"
                    showLanguage={true}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Node.js</h3>
                <p className="text-muted-foreground mb-4">
                  Equivalent implementation in Node.js:
                </p>
                <div className="max-w-3xl">
                  <RenderCode
                    code={errorHandlingJS}
                    language="javascript"
                    showLanguage={true}
                  />
                </div>
              </div>
            </div>

            {/* Debugging Tips Section */}
            <div className="bg-background border border-borderColorPrimary rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Debugging Tips</h2>
              <ul className="space-y-4 text-muted-foreground">
                {debuggingTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="font-medium">{tip.title}:</span>
                    <span>{tip.description}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background border border-borderColorPrimary rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-medium">Implement Retry Logic:</span>
                  <span>
                    Use exponential backoff for transient API errors. Start with
                    a small delay and increase it with each retry attempt.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Handle Specific Errors:</span>
                  <span>
                    Catch and handle different error types appropriately. For
                    example, retry on general API errors but fail fast on
                    validation or authentication errors.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Log Errors Properly:</span>
                  <span>
                    Include relevant context in error logs (error message,
                    request details, etc). Use appropriate logging levels for
                    different error types.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Graceful Degradation:</span>
                  <span>
                    Implement fallback strategies for when services are
                    unavailable. Consider using simpler models or cached
                    responses as alternatives.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <NavigationContainer
            preUrl="/docs/api-reference/chat-endpoints"
            nextUrl="/docs/api-reference/changelogs"
            nextTitle="View Changelogs"
            previousTitle="Endpoints"
          />
        </div>
      </div>
    </div>
  );
}
