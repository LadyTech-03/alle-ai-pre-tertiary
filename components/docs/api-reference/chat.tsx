"use client";
import { apiDocsEndpoints } from "@/lib/constants/code-snippets-docs/apiDocs";
import { useRouter, usePathname } from "next/navigation";
import RenderCode from "@/components/RenderCode";
import ApiDocLayout from "@/components/TwoLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  apiReferenceFields,
  basicRequest,
  basicResponse,
  parameters,
} from "@/lib/constants/docs";
import { chatCodes } from "@/lib/constants/code-snippets-docs/apiDocs";
import {
  completionsCurlStatic,
  completionsPythonStatic,
  completionsNodeStatic,
  combinationCurlStatic,
  combinationPythonStatic,
  combinationNodeStatic,
  searchCurlStatic,
  searchPythonStatic,
  searchNodeStatic,
  compareCurlStatic,
  comparePythonStatic,
  compareNodeStatic,
} from "@/lib/constants/codeSnippets/static/apiDocCodes";
const highlightText = (text: string, keywords: string[]): string => {
  let result = text;
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    result = result.replace(
      regex,
      `<span class="bg-accent font-bold text-muted-foreground rounded-md px-2 py-1 font-mono mr-2">${keyword}</span>`
    );
  });
  return result;
};
export default function ApiTextGenerationDocs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-[80vh] py-4">
      <div className=" space-y-16">
        {/* ............................................................... Chat Completion Section starts ...............................................................  */}
        <div
          data-search-sections="chat-endpoints"
          data-search-title="Chat-Endpoints"
        >
          <section className="min-h-[80vh]">
            <h2
              data-section="chat-endpoints"
              className="text-4xl font-bold mb-6"
            >
              Chat Completion
            </h2>

            <Card className="p-8 bg-background">
              <div className="space-y-12">
                {/* Main Content */}
                <ApiDocLayout
                  leftContent={
                    <div
                      data-search
                      data-title="Chat Completion"
                      id="chat-chat-completion"
                      className="space-y-8"
                    >
                      {/* chat completions endpoint */}
                      <div>
                        <div className="text-muted-foreground space-y-4">
                          <p>
                            The Chat Completion endpoint is our unified gateway
                            to multiple AI models including ChatGPT, Claude,
                            Gemini, and more. This endpoint allows you to
                            generate human-like text responses using
                            state-of-the-art language models.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-semibold">Overview</h3>
                        <div className="text-muted-foreground space-y-4">
                          <p>
                            Access multiple AI models through a single endpoint.
                            Choose from:
                          </p>
                          <ul className="list-disc pl-6 space-y-2">
                            <li>OpenAI's ChatGPT (GPT-3.5, GPT-4)</li>
                            <li>Anthropic's Claude</li>
                            <li>Google's Gemini</li>
                            <li>And more leading AI models</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  }
                  rightContent={
                    <div
                      data-search
                      data-title="Completion Endpoints"
                      id="chat-completion-ends"
                      className="space-y-8"
                    >
                      {/* Base URL and Endpoint */}
                      <div className="bg-muted/50 p-6 rounded-lg border space-y-4">
                        <h4 className="font-semibold">completion Endpoint</h4>
                        <RenderCode
                          code={apiDocsEndpoints.chat.completion}
                          language="bash"
                          className="text-sm"
                          showLanguage={false}
                          isLink={true}
                        />
                        <p className="text-sm text-muted-foreground">
                          All completions API requests should be made to this
                          URL using HTTPS.
                        </p>
                      </div>
                    </div>
                  }
                />
              </div>
            </Card>
          </section>

          {/* Request Parameters Section */}
          <div className="">
            <ApiDocLayout
              leftContent={
                <div>
                  <h3 className="text-3xl font-bold  mb-3">
                    Request Parameters
                  </h3>
                  <Card className="p-8 bg-background">
                    <div
                      data-search
                      data-title="Request Parameters"
                      id="completion-params"
                      className="space-y-6"
                    >
                      {parameters.map((param) => {
                        // Function to highlight keywords in the description
                        const highlightKeywords = (
                          description: string,
                          keywords: string[]
                        ) => {
                          let highlightedText = description;
                          keywords.forEach((keyword) => {
                            // Case-insensitive regex to match whole keyword and escape special chars
                            const regex = new RegExp(
                              `\\b${keyword.replace(
                                /[-/\\^$*+?.()|[\]{}]/g,
                                "\\$&"
                              )}\\b`,
                              "gi"
                            );
                            highlightedText = highlightedText.replace(
                              regex,
                              `<span class="highlight">${keyword}</span>`
                            );
                          });
                          // Return as HTML to be rendered with dangerouslySetInnerHTML
                          return highlightedText;
                        };

                        return (
                          <div key={param.name} className="mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="bg-gray-800 px-2 py-1 rounded text-sm">
                                {param.name}
                              </code>
                              <code className="text-muted-foreground px-2 py-1 rounded text-sm">
                                {param.type}
                              </code>
                              {param.required && (
                                <span className="text-red-500 text-sm">
                                  required
                                </span>
                              )}
                            </div>
                            <p
                              className="text-muted-foreground text-sm"
                              dangerouslySetInnerHTML={{
                                __html: highlightKeywords(
                                  param.description,
                                  param.keywords || []
                                ),
                              }}
                            />
                            <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10" />
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              }
              rightContent={
                <div
                  data-search
                  data-title="API Request Example: Simplified JSON Format"
                  id="api-request-body-json"
                >
                  <Card className="p-6 bg-background">
                    <RenderCode
                      language="json"
                      maxHeight="400px"
                      maxWidth
                      code={basicRequest}
                      showLanguage={false}
                      title="API Request Example: Simplified JSON Format"
                    />
                  </Card>
                </div>
              }
            />
          </div>

          <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 " />

          <section>
            <ApiDocLayout
              leftContent={
                <div
                  data-search
                  data-title="Request Headers"
                  id="request-headers-chat"
                >
                  <section className="mb-5">
                    <hr className="border-t-1  dark:border-zinc-700 border-gray-200 my-10 mt-5" />
                    <h3 className="mb-4 text-sm">Request Headers</h3>

                    <Card className="p-8 bg-background">
                      <div className="w-full">
                        <div className="overflow-x-auto text-muted-foreground">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Header</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Required</TableHead>
                                <TableHead>Description</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell>X-API-KEY</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>✅</TableCell>
                                <TableCell>
                                  API key for authentication.
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Content-Type</TableCell>
                                <TableCell>string</TableCell>
                                <TableCell>✅</TableCell>
                                <TableCell>application/json</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </Card>
                  </section>
                </div>
              }
              rightContent={
                <div>
                  <Card className="p-6 bg-background">
                    <div className="space-y-6">
                      <Tabs defaultValue="curl" className="w-full">
                        <TabsList>
                          <TabsTrigger value="curl">cURL</TabsTrigger>
                          <TabsTrigger value="python">Python</TabsTrigger>
                          <TabsTrigger value="node">Node.js</TabsTrigger>
                        </TabsList>
                        <TabsContent value="curl">
                          <div
                            data-search
                            data-title="Example Chat Completion Request (Curl)"
                            id="completion-curl"
                          >
                            <RenderCode
                              code={completionsCurlStatic}
                              language="bash"
                              showLanguage={false}
                              title="Example Request"
                            />
                          </div>
                        </TabsContent>
                        <TabsContent value="python">
                          <div
                            data-search
                            data-title="Example Chat Completion Request (Python)"
                            id="completion-pythonSDK"
                          >
                            <RenderCode
                              code={completionsPythonStatic}
                              language="python"
                            />
                          </div>
                        </TabsContent>
                        <TabsContent value="node">
                          <div
                            data-search
                            data-title="Example Chat Completion Request (Node.js)"
                            id="completion-nodejsSDK"
                          >
                            <RenderCode
                              code={completionsNodeStatic}
                              language="javascript"
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </Card>
                </div>
              }
            />
          </section>

          <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 " />

          {/* Response section */}
          <ApiDocLayout
            leftContent={
              <div className="mb-5">
                <h3 className="font-semibold mb-4">Response Fields</h3>

                <Card className="p-8 bg-background">
                  <div
                    data-search
                    data-title="API Response Format"
                    id="response-format-chat"
                    className="space-y-6"
                  >
                    {apiReferenceFields.map((field) => (
                      <div key={field.name}>
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="bg-gray-800 px-2 py-1 rounded text-sm">
                              {field.name}
                            </code>
                            <code className="text-muted-foreground px-2 py-1 rounded text-sm">
                              {field.type}
                            </code>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {field.description}
                          </p>
                        </div>

                        {field.fields && (
                          <div className="pl-6 space-y-4 border-l dark:border-zinc-700 border-gray-200">
                            {field.fields.map((subField, subIndex) => (
                              <div
                                key={`${field.name}-${subField.name}-${subIndex}`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <code className="bg-gray-800 px-2 py-1 rounded text-sm">
                                    {subField.name}
                                  </code>
                                  <code className="text-muted-foreground px-2 py-1 rounded text-sm">
                                    {subField.type}
                                  </code>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                  {subField.description}
                                </p>

                                {/* Render third level fields if they exist */}
                                {subField.fields && (
                                  <div className="pl-6 mt-2 space-y-4 border-l dark:border-zinc-700 border-gray-200">
                                    {subField.fields.map(
                                      (thirdLevelField, thirdIndex) => (
                                        <div
                                          key={`${field.name}-${subField.name}-${thirdLevelField.name}-${thirdIndex}`}
                                        >
                                          <div className="flex items-center gap-2 mb-1">
                                            <code className="bg-gray-800 px-2 py-1 rounded text-sm">
                                              {thirdLevelField.name}
                                            </code>
                                            <code className="text-muted-foreground px-2 py-1 rounded text-sm">
                                              {thirdLevelField.type}
                                            </code>
                                          </div>
                                          <p className="text-muted-foreground text-sm">
                                            {thirdLevelField.description}
                                          </p>

                                          {/* Render fourth level fields if they exist */}
                                          {thirdLevelField.fields && (
                                            <div className="pl-6 mt-2 space-y-4 border-l dark:border-zinc-700 border-gray-200">
                                              {thirdLevelField.fields.map(
                                                (
                                                  fourthLevelField,
                                                  fourthIndex
                                                ) => (
                                                  <div
                                                    key={`${field.name}-${subField.name}-${thirdLevelField.name}-${fourthLevelField.name}-${fourthIndex}`}
                                                  >
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <code className="bg-gray-800 px-2 py-1 rounded text-sm">
                                                        {fourthLevelField.name}
                                                      </code>
                                                      <code className="text-muted-foreground px-2 py-1 rounded text-sm">
                                                        {fourthLevelField.type}
                                                      </code>
                                                    </div>
                                                    <p className="text-muted-foreground text-sm">
                                                      {
                                                        fourthLevelField.description
                                                      }
                                                    </p>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-6" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            }
            rightContent={
              <div
                data-search
                data-title="Response Format:JSON"
                id="response-format-json"
              >
                <Card className="p-6 bg-background">
                  <RenderCode
                    maxHeight="400px"
                    maxWidth="700px"
                    language="json"
                    code={basicResponse}
                    showLanguage={false}
                    title="Respons format"
                  />
                </Card>
              </div>
            }
          />
        </div>

        {/* .............................................................. chat completion endpoints ends here ......................................................................... */}
        <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 " />

        {/*.................................... Api search : enabling web search starts  ........................   */}
        <div data-search-sections="chat-search" data-search-title="Web-Search">
          <div className="mt-10 ">
            <div
              data-search
              data-title="Using Web-search in chat completions"
              id="web-search-completions"
            >
              <h2 className="text-3xl mb-4 font-semibold text-gray-800 dark:text-gray-200">
                Using &nbsp;
                <span
                  data-section="chat-search"
                  className="bg-accent text-muted-foreground rounded-md px-2 py-1 font-mono  mr-2"
                >
                  web_search
                </span>
                in Completion Endpoint
              </h2>
            </div>
            <div>
              <ApiDocLayout
                leftContent={
                  <div>
                    <Card className="p-4 bg-background">
                      <p className="text-muted-foreground mb-4">
                        You can enhance the model's capabilities by enabling web
                        search. To do this, include the <code>web_search</code>{" "}
                        field in your request body. This field accepts a boolean
                        value:
                      </p>
                      <ul className="list-disc ml-4 mt-2 mb-4 text-muted-foreground">
                        <li>
                          <span className="text-red-500 dark:text-red-400 font-bold">
                            false
                          </span>{" "}
                          (default): Web search is disabled. The model will rely
                          solely on its internal knowledge.
                        </li>
                        <li>
                          <span className="text-green-500 dark:text-green-400 font-bold">
                            true
                          </span>
                          : Web search is enabled. The model will consult
                          external web resources to enhance its responses.
                        </li>
                      </ul>
                      <div className="mt-5">
                        <h3 className="text-2xl  mt-4">
                          Structure of <code>web_search_results</code>
                        </h3>

                        <p className="mt-2 text-muted-foreground">
                          The <code>web_search_results</code> field is an array
                          of objects. Each object represents the search results
                          for a specific query.
                        </p>

                        <ul className="list-disc ml-6 mt-2 text-muted-foreground">
                          <li>
                            <code>query</code>: The search query that was used
                            to retrieve these results.
                          </li>
                          <li>
                            <code>results</code>: An array of search result
                            objects. Each object represents a single search
                            result.
                          </li>
                        </ul>

                        <h3 className="text-xl font-semibold  mt-4">
                          Structure of Search Result Objects
                        </h3>

                        <p className="mt-2 text-muted-foreground">
                          Each search result object within the{" "}
                          <code>results</code> array has the following
                          structure:
                        </p>

                        <ul className="list-disc ml-6 mt-2 text-muted-foreground">
                          <li>
                            <code>title</code>: The title of the search result.
                          </li>
                          <li>
                            <code>url</code>: The URL of the search result.
                          </li>
                          <li>
                            <code>description</code>: A short description or
                            snippet of the search result.
                          </li>
                        </ul>

                        <p className="mt-4 text-muted-foreground">
                          If the <code>websearch</code> parameter was not set to{" "}
                          <code>true</code> in the API request, the{" "}
                          <code>web_search_results</code> field will not be
                          present in the response.
                        </p>
                      </div>
                    </Card>
                  </div>
                }
                rightContent={
                  <Card className="bg-background p-4">
                    <div
                      data-search
                      data-title="Web-Search in request body"
                      id="web-search-request-body"
                    >
                      <RenderCode
                        language="json"
                        showLanguage={false}
                        title="Example request with web-search"
                        code={`{
    "web_search": true,
    "other_field": "some_value"  // Other fields in your request
  }`}
                      />
                    </div>

                    <div
                      data-search
                      data-title="Web-search response body"
                      id="web-search-response"
                      className="mt-10"
                    >
                      <h3 className="text-2xl font-bold  mt-4">
                        Web Search Results
                      </h3>

                      <p className="mt-2 text-muted-foreground mb-5">
                        If the <code>websearch</code> parameter was set to
                        <code>true</code> in the API request, the response will
                        include a <code>web_search_results</code> field. This
                        field contains the results of web searches performed by
                        the model to enhance its response.
                      </p>
                      <RenderCode
                        language="json"
                        code={`{
    // ... other fields in the response ...
    "web_search_results": [
      {
        "query": "The search query used",
        "results": [
          {
            "title": "Title of the search result",
            "url": "URL of the search result",
            "description": "Short description of the search result"
          },
          // ... more search results for this query ...
        ]
      },
      // ... more sets of search results for different queries ...
    ]
  }`}
                      />
                    </div>
                  </Card>
                }
              />
            </div>
          </div>

          {/* web search as dedicated endpoint unique route  */}

          <div className="mt-10 ">
            <div
              data-search
              data-title="Web Search Endpoints"
              id="web-search-endpoint"
            >
              <h2 className="text-3xl mb-4 font-semibold text-gray-800 dark:text-gray-200">
                Dedicated Web Search Endpoints
              </h2>
            </div>

            <ApiDocLayout
              leftContent={
                <div>
                  <div className="">
                    <p
                      className="text-muted-foreground text-sm leading-relaxed mb-4"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          "The web search endpoints take the same familiar parameters you're used to, like messages for your query, response_format to dictate the output type (text, audio URL, etc.), and even max_tokens to cap the length, but with a key difference: the response contains only web search results, not the individual outputs from models specified in models.",
                          [
                            "messages",
                            "response_format",
                            "max_tokens",
                            "web search results",
                            "models",
                          ]
                        ),
                      }}
                    />
                    <p
                      className="text-muted-foreground text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          "To use these endpoints, simply send your request to the web search-specific route (e.g., /ai/web-search instead of /completions), keeping the parameter structure intact.Define your query in messages, and set response_format to get results in your preferred style. The output skips model responses entirely, focusing solely on what's pulled from the web. This keeps the process lightweight and targeted.",
                          [
                            "web_search",
                            "messages",
                            "response_format",
                            "model responses",
                            "temperature",
                            "frequency_penalty",
                          ]
                        ),
                      }}
                    />
                  </div>
                </div>
              }
              rightContent={
                <div className="">
                  {/* web search endpoing */}
                  {/* Base URL and Endpoint */}
                  <div className="bg-muted/50 p-6 rounded-lg border space-y-4">
                    <h4 className="font-semibold">Web search endpoint</h4>
                    <RenderCode
                      code={apiDocsEndpoints.chat.search}
                      language="bash"
                      className="text-sm"
                      showLanguage={false}
                      isLink={true}
                    />
                    {/* Example codes */}
                    <div>
                      <Card className="p-6 bg-background">
                        <div className="space-y-6">
                          <Tabs defaultValue="curl" className="w-full">
                            <TabsList>
                              <TabsTrigger value="curl">cURL</TabsTrigger>
                              <TabsTrigger value="python">Python</TabsTrigger>
                              <TabsTrigger value="node">Node.js</TabsTrigger>
                            </TabsList>
                            <TabsContent value="curl">
                              <div>
                                <RenderCode
                                  code={searchCurlStatic}
                                  language="bash"
                                  showLanguage={false}
                                  title="Example Request"
                                />
                              </div>
                            </TabsContent>
                            <TabsContent value="python">
                              <div
                                data-search
                                data-title="Web search with python SDK"
                                id="web-search-python"
                              >
                                <RenderCode
                                  code={searchPythonStatic}
                                  language="python"
                                  title="Example Request python sdk"
                                  showLanguage={false}
                                />
                              </div>
                            </TabsContent>
                            <TabsContent value="node">
                              <div
                                data-search
                                data-tile="Web search with node sdk"
                              >
                                <RenderCode
                                  code={searchNodeStatic}
                                  language="javascript"
                                  title="Example Request node sdk"
                                  showLanguage={false}
                                />
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>
        {/* ......................... web search ends docs page content ends  here ............................... */}
        <hr className="border-t-1 dark:border-zinc-700 border-gray-200  " />
        {/* ................. comparison docs removed .........................*/}

        {/* ...............comparison docs page ends here  */}
        {/* ............................... model comparison..................*/}
        <hr className="border-t-1 dark:border-zinc-700 border-gray-200  " />

        <div
          data-search-sections="chat-comparison"
          data-search-title="compare responses from multiple chat models"
          className="mt-10"
        >
          <div
            data-search
            data-title="comparison in Completion Endpoint"
            id="compare-completion"
          >
            <h2 data-section="chat-comparison" className="text-3xl font-bold ">
              <span className="bg-accent text-muted-foreground rounded-md px-2 py-1 font-mono  mr-2">
                Comparison
              </span>
              in Completion Endpoint
            </h2>
          </div>
          <ApiDocLayout
            leftContent={
              <section>
                <div className="mb-6">
                  <p
                    className="text-muted-foreground text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        "The completion endpoint supports model comparison through the optional comparison parameter. Set it to true, and your response will include both the full outputs from each model in your models array, such as gpt-4 or claude-3.5-sonnet and the comparison of models included in your request . This approach delivers detailed model answers alongside comparison, all within the same request. Your existing parameters, like messages for input, response_format for output type, and max_tokens for length control, remain fully functional, making it a seamless addition to your workflow when you need both depth and brevity.",
                        [
                          "comparison",
                          "true",
                          "models",
                          "messages",
                          "response_format",
                          "max_tokens",
                        ]
                      ),
                    }}
                  />
                </div>
                <div
                  data-search
                  data-title=" Dedicated Comparison Endpoints"
                  id="comparison-endpoints"
                  className="mb-6"
                >
                  <h2 className="text-xl font-semibold text-muted-foreground mb-2">
                    Dedicated Comparison Endpoints
                  </h2>
                  <p
                    className="text-muted-foreground text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        "For a streamlined comparison without individual model outputs, use the dedicated comparison endpoints at [baseUrl]/comparison. These endpoints mirror the completion request structure using messages for your query, response_format to define the output (text, audio URL, etc.), and settings like temperature for fine-tuning but focus solely on delivering comparison results from the models. Unlike the completion endpoint, you won't get per-model responses here; it's just the distilled comparison, ideal for scenarios where you want a lightweight, essential take without the extra detail.",
                        [
                          "comparison",
                          "messages",
                          "response_format",
                          "temperature",
                          "[baseUrl]/comparison",
                        ]
                      ),
                    }}
                  />
                </div>
              </section>
            }
            rightContent={
              <section>
                <div className="bg-muted/50 p-6 rounded-lg border space-y-4">
                  <h4 className="font-semibold">comparison endpoint</h4>
                  <RenderCode
                    code={apiDocsEndpoints.chat.comparison}
                    language="bash"
                    className="text-sm"
                    showLanguage={false}
                    isLink={true}
                  />
                  {/* <div className="mt-5 mb-5">
                    <RenderCode
                      code={chatCodes.summary}
                      language="json"
                      showLanguage={false}
                      title="request body with summary"
                    />
                  </div> */}
                  {/* Example codes */}
                  <div>
                    <Card className="p-6 bg-background">
                      <div className="space-y-6">
                        <Tabs defaultValue="curl" className="w-full">
                          <TabsList>
                            <TabsTrigger value="curl">cURL</TabsTrigger>
                            <TabsTrigger value="python">Python</TabsTrigger>
                            <TabsTrigger value="node">Node.js</TabsTrigger>
                          </TabsList>
                          <TabsContent value="curl">
                            <RenderCode
                              code={compareCurlStatic}
                              language="bash"
                              showLanguage={false}
                              title="Example Request"
                            />
                          </TabsContent>
                          <TabsContent value="python">
                            <RenderCode
                              code={comparePythonStatic}
                              language="python"
                              title="Example Request python sdk"
                              showLanguage={false}
                            />
                          </TabsContent>
                          <TabsContent value="node">
                            <RenderCode
                              code={compareNodeStatic}
                              language="javascript"
                              title="Example Request node sdk"
                              showLanguage={false}
                            />
                          </TabsContent>
                        </Tabs>
                      </div>
                    </Card>
                  </div>
                </div>
              </section>
            }
          />
        </div>
        {/* .............. summary docs page ends here ................... */}
        <hr className="border-t-1 dark:border-zinc-700 border-gray-200  " />
        {/* ...................................... Combinations docs page starts here ....................... */}
        <div
          data-search-sections="chat-combination"
          data-search-title="Combine responses from chat models"
          className="mt-10"
        >
          <div
            data-search
            data-title="Combinations in Completion Endpoint"
            id="combination-completion"
          >
            <h2
              data-section="chat-combination"
              className="text-3xl font-bold mt-4 "
            >
              <span className="bg-accent text-muted-foreground rounded-md px-2 py-1 font-mono  mr-2">
                Combinations
              </span>
              in Completion Endpoint
            </h2>
          </div>

          <ApiDocLayout
            leftContent={
              <section>
                <div className="mb-6">
                  <p
                    className="text-muted-foreground text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        `The completion endpoint lets you combine model responses by including the optional combination parameter. When set, it merges the outputs from the models you specify like gpt-4o, deepseek-r1, or claude-3.5-sonnet—into a single result, returned alongside the individual responses from each model in your models array. You can define this in an array, such as "combination": [{"type": "text", "models": ["gpt-4o<span class=" font-bold">+</span>deepseek-r1<span class=" font-bold">+</span>claude-3.5-sonnet"]}, {"type": "audio_url", "models": ["gpt-4o<span class=" font-bold">+</span>claude-3.5-sonnet"]}], where the + separates models to combine for each output type. This gives you both the full per-model details and a unified blend, all while using familiar parameters like messages, response_format, and max_tokens to shape the request.`,
                        [
                          "combination",
                          "models",
                          "messages",
                          "response_format",
                          "max_tokens",
                        ]
                      ),
                    }}
                  />
                </div>
                <div
                  data-search
                  data-title=" Dedicated Combination Endpoints"
                  id="combination-endpoints"
                  className="mb-6"
                >
                  <h2 className="text-xl font-semibold text-muted-foreground mb-2">
                    Dedicated Combination Endpoints
                  </h2>
                  <p
                    className="text-muted-foreground text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        `For a focused result that skips individual model outputs, use the dedicated combination endpoint at [baseUrl]/combinations. This endpoint mirrors the completion request body, messages for your query, response_format for output style, and temperature for adjustments, but this only delivers the combined results from the models you specify. Using the same combination array (e.g., "combination": [{"type": "text", "models": ["gpt-4o<span class=" font-bold">+</span>deepseek-r1<span class=" font-bold">+</span>claude-3.5-sonnet"]}, {"type": "audio_url", "models": ["gpt-4o<span class=" font-bold">+</span>claude-3.5-sonnet"]}), you pick which models to blend with the + notation, and that's all you get back no separate responses. It's a clean, efficient way to get a synthesized output when you don't need the raw model-by-model breakdown.`,
                        [
                          "combination",
                          "messages",
                          "response_format",
                          "temperature",
                          "[baseUrl]/combination",
                        ]
                      ),
                    }}
                  />
                </div>
              </section>
            }
            rightContent={
              <div className="bg-muted/50 p-6 rounded-lg border space-y-4">
                <h4 className="font-semibold">Combination endpoint</h4>
                <RenderCode
                  code={apiDocsEndpoints.chat.combinations}
                  language="bash"
                  className="text-sm"
                  showLanguage={false}
                  isLink={true}
                />
                <div className="mt-5 mb-5">
                  <RenderCode
                    code={chatCodes.combinations}
                    language="json"
                    showLanguage={false}
                    title="request body with combination"
                  />
                </div>
                {/* Example codes */}
                <div>
                  <Card className="p-6 bg-background">
                    <div className="space-y-6">
                      <Tabs defaultValue="curl" className="w-full">
                        <TabsList>
                          <TabsTrigger value="curl">cURL</TabsTrigger>
                          <TabsTrigger value="python">Python</TabsTrigger>
                          <TabsTrigger value="node">Node.js</TabsTrigger>
                        </TabsList>
                        <TabsContent value="curl">
                          <RenderCode
                            code={combinationCurlStatic}
                            language="bash"
                            showLanguage={false}
                            title="Example Request"
                          />
                        </TabsContent>
                        <TabsContent value="python">
                          <RenderCode
                            code={combinationPythonStatic}
                            language="python"
                            title="Example Request python sdk"
                            showLanguage={false}
                          />
                        </TabsContent>
                        <TabsContent value="node">
                          <RenderCode
                            code={combinationNodeStatic}
                            language="javascript"
                            title="Example Request node sdk"
                            showLanguage={false}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </Card>
                </div>
              </div>
            }
          />
        </div>
        <hr className="border-t-1 dark:border-zinc-700 border-gray-200  " />
      </div>
      {/* ...................... combinations end ................... */}
    </div>
  );
}
