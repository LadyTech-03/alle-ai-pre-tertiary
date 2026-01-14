"use client";
import RenderCode from "@/components/RenderCode";
import Link from "next/link";
import ApiDocLayout from "@/components/TwoLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiDocsEndpoints } from "@/lib/constants/code-snippets-docs/apiDocs";

import {
  imageGenerationCurlStatic,
  imageGenerationPythonStatic,
  imageGenerationNodeStatic,
  imageEditCurlStatic,
  imageEditPythonStatic,
  imageEditNodeStatic,
} from "@/lib/constants/codeSnippets/static/apiDocCodes";
const response = `
{
  "created": 1589478378,
  "data": [
    { "model": "dall-e-3"
      "url": "https://..."
    },
    { "model":"midjourney"
      "url": "https://..."
    }
  ]
}

`;
const requestBodyFields = [
  {
    name: "models",
    type: "string[]",
    required: true,
    description: "An array of selected image models for the API call.",
    value: ["grok-2-image", "stable-image-core"],
  },
  {
    name: "prompt",
    type: "string",
    required: true,
    description: "A text description of the desired image(s).",
    value: "",
  },
  {
    name: "n",
    type: "number",
    required: false,
    description: "The number of images to generate. Optional.",
    value: 1,
  },
  {
    name: "height",
    type: "number",
    required: false,
    description: "The height of the generated image in pixels. Optional.",
    value: 1024,
  },
  {
    name: "width",
    type: "number",
    required: false,
    description: "The width of the generated image in pixels. Optional.",
    value: 1024,
  },
  {
    name: "seed",
    type: "number",
    required: false,
    description: "A seed value for reproducible image generation. Optional.",
    value: null,
  },
  {
    name: "style_preset",
    type: "string",
    required: false,
    description: "The style of the generated image. Optional.",
    value: null,
  },
];
const requestEdit = `
{
type:"image-edit"
models:['dall-e-3','midjourney'],
prompt:"modify the cap",
options:[
]      // other options
}
`;
const EditRequestBody = [
  {
    name: "models",
    type: "string[]",
    required: true,
    description: "An array of models to use for image editing.",
  },

  {
    name: "image_file",
    type: "string",
    required: true,
    description:
      "base64-encoded string or a web URL pointing to the image to edit.",
  },
  {
    name: "prompt",
    type: "string",
    required: true,
    description:
      "A text description of the desired edit. Maximum length is 1000 characters.",
  },
];

export default function ApiImageGenerationDocs() {
  return (
    <div className=" ml-10">
      <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 mt-5" />

      {/* intro */}
      <div
        data-search-sections="image-generation"
        data-search-title="Image Generation"
        className="mb-10"
      >
        <div
          data-search
          data-title="Image Generation API"
          id="image-generation-api"
        >
          <div className="mb-4">
            <h2 className="font-bold text-3xl">Image Generation API</h2>
          </div>
          <ApiDocLayout
            leftContent={
              <Card className="bg-background p-4">
                <h2
                  data-section="image-generation"
                  className="text-3xl font-bold mb-4"
                >
                  Multi-Model Image Generation API
                </h2>
                <div className="text-muted-foreground">
                  <p className="text-muted-foreground">
                    Our Multi-Model Image Generation API allows developers to
                    leverage multiple AI models simultaneously for image
                    generation and editing tasks. This unique approach enables
                    you to compare outputs across different models, provide
                    users with diverse creative options, and select the best
                    result for your specific use case.
                  </p>
                  <h3>The API supports two primary operations:</h3>
                  <ul>
                    <li className="text-muted-foreground">
                      <strong className="text-black dark:text-white">
                        Text-to-Image Generation : &nbsp;
                      </strong>
                      Create images from text prompts across multiple models.
                    </li>
                    <li>
                      <strong className="text-black dark:text-white">
                        Image Editing :&nbsp;
                      </strong>
                      Modify existing images using text instructions across
                      multiple models.
                    </li>
                  </ul>
                  <p>
                    This documentation provides detailed information about
                    endpoints, request formats, response structures, and code
                    examples to help you integrate these capabilities into your
                    applications.
                  </p>
                </div>
              </Card>
            }
            rightContent={
              <Card className="bg-background p-4 mt-5">
                <h2 className="text-3xl font-bold mb-4">Authentication</h2>
                <p className="text-muted-foreground mb-4">
                  All API requests require authentication using an API key.
                </p>
                {/* Base URL and Endpoint */}
                <div className="bg-muted/50 mb-4 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Base URL</h4>
                  <RenderCode
                    code={`${apiDocsEndpoints.BaseUrl}/image`}
                    language="bash"
                    className="text-sm block mb-2"
                    showLanguage={false}
                    isLink={true}
                  />
                </div>
                {/* <p className="text-muted-foreground mb-4">
                  You can obtain an API key by &nbsp;{" "}
                  <Link href={"/"} target="_blank" className="text-blue-600">
                    registering for an account
                  </Link>{" "}
                  &nbsp; and navigating to the API Keys section in your
                  dashboard.
                </p> */}
              </Card>
            }
          />
        </div>
      </div>
      <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 mt-5" />
      {/* text to image */}
      <div
        data-search-sections="image-generation"
        data-search-title="Text-to-Image API"
        className="mt-5 mb-10"
      >
        <ApiDocLayout
          leftContent={
            <div
              data-search
              data-title="Generate Images from Text"
              id="text-to-image-api"
            >
              <Card className="bg-background p-4">
                <h2 className="text-3xl font-bold mb-4">Text-to-Image API</h2>
                <div className="mb-4 text-muted-foreground">
                  <p>
                    The Text-to-Image API transforms text descriptions into
                    visual imagery using multiple AI models simultaneously. This
                    parallel approach allows you to:
                  </p>
                  <ul>
                    <li>Compare stylistic differences between models</li>
                    <li>Offer diverse creative options to your users</li>
                    <li>
                      Experiment with prompt engineering across different model
                      architectures
                    </li>
                    <li>
                      Select the most suitable output for your specific needs
                    </li>
                  </ul>
                </div>
                <section className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">Request Body</h3>
                  <div className="space-y-6">
                    {requestBodyFields.map((field, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{field.name}</span>
                          <span className="text-muted-foreground font-mono">
                            {field.type}
                          </span>
                          <span
                            className={
                              field.required
                                ? "text-red-500"
                                : "text-muted-foreground"
                            }
                          >
                            {field.required ? "Required" : "Optional"}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {field.description}
                        </p>
                        <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 mt-5" />
                      </div>
                    ))}
                  </div>
                </section>
              </Card>
            </div>
          }
          rightContent={
            <Card className="bg-background p-4">
              <div className="mb-4 mt-4">
                <h4 className="font-semibold p-3">image generation endpoint</h4>
                <RenderCode
                  code={apiDocsEndpoints.image.generate}
                  language="bash"
                  className="text-sm"
                  showLanguage={false}
                  isLink={true}
                />
              </div>
              <div className="mb-7">
                {/* <RenderCode
                  showLanguage={false}
                  title="Example request body"
                  code={imageRequestBody}
                  language="json"
                /> */}
              </div>
              <div className="mb-6">
                <Tabs defaultValue="python">
                  <TabsList>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="node">Node.js</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>
                  <TabsContent value="python">
                    <RenderCode
                      showLanguage={false}
                      title="Example request "
                      code={imageGenerationPythonStatic}
                      language="python"
                    />
                  </TabsContent>
                  <TabsContent value="node">
                    <RenderCode
                      showLanguage={false}
                      title="Example request "
                      code={imageGenerationNodeStatic}
                      language="javascript"
                    />
                  </TabsContent>
                  <TabsContent value="curl">
                    <RenderCode
                      showLanguage={false}
                      title="Example request "
                      code={imageGenerationCurlStatic}
                      language="bash"
                    />
                  </TabsContent>
                </Tabs>
              </div>
              <div className="">
                {/* <RenderCode
                  showLanguage={false}
                  title="Sample API Output"
                  language="json"
                  code={exampleResponseBody}
                /> */}
              </div>
            </Card>
          }
        />
        <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 mt-5" />
      </div>
      {/* Create image edit */}
      <div
        data-search-sections="image-generation-edits"
        data-search-title="Edit Images via API"
        className=""
      >
        <div data-search data-title="Create image edits" id="image-edits-api">
          <ApiDocLayout
            leftContent={
              <Card className="bg-background p-4">
                <h2
                  data-section="image-generation-edits"
                  className="text-3xl font-bold mb-3"
                >
                  Create image edits
                </h2>
                <p className="text-muted-foreground mb-5">
                  Creates, edits or extended image given an original image and a
                  prompt.
                </p>

                <h2 className="text-xl font-semibold mb-4">Request body</h2>
                {EditRequestBody.map((field, index) => (
                  <div key={index} className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{field.name}</span>
                      <span className="text-muted-foreground font-mono">
                        {field.type}
                      </span>
                      <span
                        className={
                          field.required
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }
                      >
                        {field.required ? "Required" : "Optional"}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{field.description}</p>
                    <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 mt-5" />
                  </div>
                ))}

                <div></div>
              </Card>
            }
            rightContent={
              <Card className="bg-background p-4 mb-10">
                <div className="mb-4 mt-4">
                  <h4 className="font-semibold p-3">image edit endpoint</h4>
                  <RenderCode
                    code={apiDocsEndpoints.image.edit}
                    language="bash"
                    className="text-sm"
                    showLanguage={false}
                    isLink={true}
                  />
                </div>
                <div className="mb-8">
                  {/* <RenderCode
                    showLanguage={false}
                    title="Example request body"
                    code={imageGenCodes.editBody}
                    language="json"
                  /> */}
                </div>
                <div className="mb-5">
                  <Tabs defaultValue="javascript">
                    <TabsList>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                    </TabsList>
                    <TabsContent value="javascript">
                      <RenderCode
                        showLanguage={false}
                        title="Example request"
                        language="javascript"
                        code={imageEditNodeStatic}
                      />
                    </TabsContent>
                    <TabsContent value="curl">
                      <RenderCode
                        showLanguage={false}
                        title="Example request"
                        language="bash"
                        code={imageEditCurlStatic}
                      />
                    </TabsContent>
                    <TabsContent value="python">
                      <RenderCode
                        showLanguage={false}
                        title="Example request"
                        language="python"
                        code={imageEditPythonStatic}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
                {/* response */}
                {/* <div className="mt-5">
                  <RenderCode
                    code={response}
                    showLanguage={false}
                    title="Response"
                  />
                </div> */}
              </Card>
            }
          />
        </div>
      </div>
    </div>
  );
}
