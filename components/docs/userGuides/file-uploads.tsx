import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import RenderCode from "@/components/RenderCode";
import NavigationContainer from "@/components/NavigationContainer";
import Link from "next/link";

// Extended suggestions
const suggestions = [
  { title: "Text Generation", href: "/text-generation" },
  { title: "Image Generation", href: "/image-generation" },
  { title: "Audio Generation", href: "/audio-generation" },
  { title: "Error Handling", href: "/batch-processing" },
];

// Extended FAQs
const faqs = [
  {
    title: "What file formats are supported?",
    description:
      "We support a wide range of file formats, including images (JPEG, PNG, WebP, HEIC), audio (MP3, WAV, M4A, FLAC), and documents (PDF, DOCX, TXT, RTF). Check the API documentation for a full list of supported formats.",
  },
  {
    title: "Is there a file size limit?",
    description:
      "Yes, the maximum file size for uploads is 100MB. For larger files, consider using our chunked upload API or splitting them before uploading. Enterprise users can request increased limits.",
  },
  {
    title: "How do I handle file processing errors?",
    description:
      "Common errors include unsupported file formats or exceeding file size limits. Implement retry logic with exponential backoff for transient failures, and validate files before upload.",
  },
  {
    title: "What's the maximum concurrent upload limit?",
    description:
      "Free tier users can upload 5 files concurrently. Premium users can upload up to 20 files concurrently. Use our batch processing API for larger volumes.",
  },
];

// Code examples for Python, Node.js, and Browser
const getCodeExamples = () => [
  {
    language: "python",
    code: `
import base64
from alleai.core import AlleAIClient

# Load and encode image file to base64
with open("example.jpg", "rb") as image_file:
    image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

# Initialize client
client = AlleAIClient(api_key="[YOUR API KEY HERE]")

# Chat completion with attached image
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
    "max_tokens": 200,     # Limit response length
    "temperature": 0.7     # Control creativity
})

# Print the response
print(response.text)
    `.trim(),
  },
  {
    language: "javascript",
    code: `
const client = require("alleai-sdk");
const fs = require("fs").promises;

async function chatWithImage() {
    // Load and encode image file to base64
    const imageBuffer = await fs.readFile("example.jpg");
    const imageBase64 = imageBuffer.toString("base64");

    // Initialize client
    const alleai = new client.AlleAI({
        apiKey: "[YOUR API KEY HERE]"
    });

    // Chat completion with attached image
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
        max_tokens: 200,       // Limit response length
        temperature: 0.7       // Control creativity
    });

    // Log the response
    console.log(response.text);
}

chatWithImage();
    `.trim(),
  },
  {
    language: "javascript",
    code: `
const client = require("alleai-sdk");

async function chatWithImage(file) {
    // Convert file to base64
    const reader = new FileReader();
    const imageBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(file);
    });

    // Initialize client
    const alleai = new client.AlleAI({
        apiKey: "[YOUR API KEY HERE]"
    });

    // Chat completion with attached image
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
        max_tokens: 200,
        temperature: 0.7
    });

    // Log the response
    console.log(response.text);
}

// Example usage with a file input
// <input type="file" onChange={(e) => chatWithImage(e.target.files[0])} />
    `.trim(),
  },
];

export default function WorkingWithFilesDocs() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="pb-16 w-full max-w-[100%] pr-4">
      <div className="space-y-8">
        {/* Title Section */}
        <div>
          <div className="prose prose-blue max-w-none">
            <p className="text-muted-foreground text-lg">
              Our API provides comprehensive file handling capabilities with
              support for uploads, processing, and batch operations. Learn how
              to integrate file processing into your applications efficiently
              and reliably.
            </p>
          </div>
        </div>

        {/* Prerequisites Section */}
        <div className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-500 dark:text-gray-300 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Prerequisites
              </h3>
              <p className="text-gray-800 dark:text-gray-200">
                Before you begin, ensure you have:
              </p>
              <ul className="list-none mt-2 space-y-1">
                {[
                  "An API key with appropriate permissions",
                  "Basic understanding of REST APIs",
                  "Familiarity with async/await patterns",
                  "File handling knowledge in your preferred language",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center text-gray-800 dark:text-gray-200"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Installation Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Installation</h2>
          <Tabs defaultValue="python">
            <TabsList>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            </TabsList>
            <TabsContent value="python">
              <div className="bg-zinc-800 text-white p-4 rounded-md">
                <RenderCode language="bash" code={`pip install alleai`} />
              </div>
            </TabsContent>
            <TabsContent value="javascript">
              <div className="bg-zinc-800 text-white p-4 rounded-md">
                <RenderCode language="bash" code={`npm install alleai`} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Code Examples Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Code Examples</h2>
          <div className="space-y-6">
            <Tabs defaultValue="python" className="w-full">
              <TabsList>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                <TabsTrigger value="browser">Browser</TabsTrigger>
              </TabsList>
              <TabsContent value="python">
                <RenderCode
                  code={getCodeExamples()[0].code}
                  language="python"
                  showLanguage={true}
                />
              </TabsContent>
              <TabsContent value="nodejs">
                <RenderCode
                  code={getCodeExamples()[1].code}
                  language="javascript"
                  showLanguage={true}
                />
              </TabsContent>
              <TabsContent value="browser">
                <RenderCode
                  code={getCodeExamples()[2].code}
                  language="javascript"
                  showLanguage={true}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Understanding File Attachments Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Understanding File Attachments
          </h2>
          <div className="prose prose-blue max-w-none">
            <p className="text-muted-foreground">
              Attaching files to chat completions allows you to enrich your
              interactions with multimedia content, such as images, audio, or
              videos. The examples above demonstrate how to process an image
              file and include it in a request. Here’s a deeper look at key
              aspects to help you get started:
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-2">Preparing Files</h3>
            <p className="text-muted-foreground">
              Files must be converted to base64 format before being sent to the
              API. In Python, the <code>base64</code> library handles this by
              reading the file in binary mode and encoding it. In Node.js,{" "}
              <code>fs.promises</code> provides an async approach, while the
              browser uses <code>FileReader</code> to process files from user
              inputs (e.g., a file picker). Ensure your file is in a supported
              format (e.g., JPEG, PNG) and under the size limit (100MB by
              default).
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-2">
              Structuring the Request
            </h3>
            <p className="text-muted-foreground">
              The <code>messages</code> array in the request body supports
              multiple content types. Use <code>type: &quot;image_url&quot;</code> with a{" "}
              <code>data</code> field containing a data URI (e.g.,{" "}
              <code>data:image/jpeg;base64,...</code>) to attach an image.
              Combine it with a <code>type: &quot;text&quot;</code> entry to provide
              context or ask a question about the file. The <code>models</code>{" "}
              array should include vision-capable models like GPT-4o for image
              processing.
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-2">
              Handling Responses
            </h3>
            <p className="text-muted-foreground">
              The API returns a text response via <code>response.text</code>,
              which you can print or log. This might describe the image content
              or answer your question. Metadata, like{" "}
              <code>generation_time</code>, is available in{" "}
              <code>response.metadata</code> (Python) or{" "}
              <code>response.metadata.generationTime</code> (JavaScript), though
              it’s not shown here for brevity. Check the API docs for additional
              response fields.
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-2">
              Tips for Success
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="dark:text-white">File Size:</strong> Large
                base64 strings increase request size. Compress images or use
                smaller files when possible to stay within limits.
              </li>
              <li>
                <strong className="dark:text-white">Browser Usage:</strong> In
                the Browser example, integrate with a file input as shown in the
                comment. This works well in React or other front-end frameworks.
              </li>
              <li>
                <strong className="dark:text-white">Error Handling:</strong>{" "}
                Wrap file operations and API calls in try-catch blocks (not
                shown here for simplicity) to handle issues like file not found
                or API errors.
              </li>
            </ul>
          </div>
        </div>

        {/* FAQs Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-3">
                <div
                  className="cursor-pointer flex items-center justify-between text-lg font-medium"
                  onClick={() => setExpanded(expanded === index ? null : index)}
                >
                  <span>{faq.title}</span>
                  <span>
                    {expanded === index ? (
                      <ChevronUp className="text-muted-foreground" />
                    ) : (
                      <ChevronDown className="text-muted-foreground" />
                    )}
                  </span>
                </div>
                {expanded === index && (
                  <div className="mt-2 text-muted-foreground">
                    {faq.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Section */}
        <NavigationContainer
          previousTitle="Video Generation"
          // previousDescription="Interacting with video models"
          preUrl="/docs/user-guides/video-generation"
          nextTitle="Libraries"
          // nextDesciption="Learn how to use libraries with the API"
          nextUrl="/docs/user-guides/libraries"
        />
      </div>
    </div>
  );
}
