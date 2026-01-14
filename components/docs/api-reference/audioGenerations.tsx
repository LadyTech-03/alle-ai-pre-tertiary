"use client";
import RenderCode from "@/components/RenderCode";
import Link from "next/link";
import ApiDocLayout from "@/components/TwoLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiDocsEndpoints } from "@/lib/constants/code-snippets-docs/apiDocs";

import {
  ttsCurlStatic,
  ttsPythonStatic,
  ttsNodeStatic,
  sttCurlStatic,
  sttPythonStatic,
  sttNodeStatic,
  audioGenCurlStatic,
  audioGenPythonStatic,
  audioGenNodeStatic,
} from "@/lib/constants/codeSnippets/static/apiDocCodes";
const response = `
{
  "created": 1589478378,
  "data": [
    { "model": "tts-1"
      "url": "https://..."
    },
    { "model":"gemini"
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
    description:
      "Array of selected audio models for the text-to-speech API call.",
  },
  {
    name: "prompt",
    type: "string",
    required: true,
    description: "The text to generate audio for.",
  },

  {
    name: "voice",
    type: "string",
    required: false,
    description: "The voice to use for audio generation. Optional.",
  },
  {
    name: "model_specific_params",
    type: "object",
    required: false,
    description: "Model-specific parameters for audio generation.",
  },
];
const musicRequest = [
  {
    name: "models",
    type: "string[]",
    required: true,
    description:
      "Array of selected audio models for generating audio from text.",
  },
  {
    name: "prompt",
    type: "string",
    required: true,
    description:
      "The text description to generate audio from. Maximum length is 4096 characters.",
  },
];

const EditRequestBody = [
  {
    name: "models",
    type: "string[]",
    required: true,
    description: "Array of selected models for audio transcription.",
  },
  {
    name: "audio_file",
    type: "string",
    required: true,
    description:
      "Path or a web URL pointing to the audio file to transcribe. Supported formats include flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, or webm.",
  },
  {
    name: "model_specific_params",
    type: "object",
    required: false,
    description: "Model-specific parameters for audio transcription.",
  },
];

export default function ApiAudioGenerationDocs() {
  return (
    <div className=" ml-10">
      <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 mt-5" />

      {/* intro */}
      <div
        data-search-sections="audio-text-to-speech"
        data-search-title="Audio Generation API"
        className="mb-10"
      >
        <div
          data-search
          data-title="Audio Generation API"
          id="audio-generation-api"
        >
          <h2
            data-section="audio-text-to-speech"
            className="text-3xl font-bold mb-4"
          >
            Audio Generation API
          </h2>
          <ApiDocLayout
            leftContent={
              <Card className="bg-background p-4">
                <div className="text-muted-foreground">
                  <p className="text-muted-foreground">
                    Learn how to turn audio into text or text into audio by
                    combining multiple audio models.
                  </p>
                  <h3>The API supports three primary operations:</h3>
                  <ul>
                    <li className="text-muted-foreground">
                      <strong className="text-black dark:text-white">
                        Create speech : &nbsp;
                      </strong>
                      Generates audio from the input text.
                    </li>
                    <li>
                      <strong className="text-black dark:text-white">
                        Create transcription :&nbsp;
                      </strong>
                      Transcribes audio into the input language.
                    </li>
                    <li>
                      <strong className="text-black dark:text-white">
                        Create audio :&nbsp;
                      </strong>
                      Generate sounds, music, and other audio formats from text
                      by combining power of multiple audio models
                    </li>
                  </ul>
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
                    code={`${apiDocsEndpoints.BaseUrl}/audio`}
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
      {/* text to speech */}
      <div
        data-search-sections="audio-text-to-speech"
        data-search-title="Text-to-Speech"
        className="mt-5 mb-8"
      >
        <h2 className="text-3xl font-bold mb-4">Text-to-Speech</h2>

        <div
          data-search
          data-title="Text-to-Speech API"
          id="text-to-speech-api"
        >
          <ApiDocLayout
            leftContent={
              <Card className="bg-background p-4">
                <div className="mb-4 text-muted-foreground">
                  <p>
                    Generates audio from the input text with multiple audio
                    models.
                  </p>
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
            }
            rightContent={
              <Card className="bg-background p-4">
                <div className="mb-4 mt-4">
                  <h4 className="font-semibold p-3">text-to-speech endpoint</h4>
                  <RenderCode
                    code={apiDocsEndpoints.audio.tts}
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
                    code={RequestBodyTTs}
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
                        code={ttsPythonStatic}
                        language="python"
                      />
                    </TabsContent>
                    <TabsContent value="node">
                      <RenderCode
                        showLanguage={false}
                        title="Example request "
                        code={ttsNodeStatic}
                        language="javascript"
                      />
                    </TabsContent>
                    <TabsContent value="curl">
                      <RenderCode
                        showLanguage={false}
                        title="Example request "
                        code={ttsCurlStatic}
                        language="bash"
                      />
                    </TabsContent>
                  </Tabs>
                </div>
                {/* <div className="">
                  <RenderCode
                    showLanguage={false}
                    title="Example response"
                    language="json"
                    code={response}
                  />
                </div> */}
              </Card>
            }
          />
        </div>
        <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 mt-5" />
      </div>
      {/* speech to text */}
      <div
        data-search-sections="audio-speech-to-text"
        data-search-title="Speech-to-Text"
        className=""
      >
        <div
          data-search
          data-title="Speech-to-Text API"
          id="speech-to-text-api"
        >
          <h2
            data-section="audio-speech-to-text"
            className="text-3xl font-bold mb-3"
          >
            Create transcription
          </h2>

          <ApiDocLayout
            leftContent={
              <Card className="bg-background p-4">
                <p className="text-muted-foreground mb-5">
                  Transcribes audio into the input language.
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
              </Card>
            }
            rightContent={
              <Card className="bg-background p-4 mb-10">
                <div className="mb-4 mt-4">
                  <h4 className="font-semibold p-3">transcription endpoint</h4>
                  <RenderCode
                    code={apiDocsEndpoints.audio.stt}
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
                    code={requestBodySTT}
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
                        code={sttNodeStatic}
                      />
                    </TabsContent>
                    <TabsContent value="curl">
                      <RenderCode
                        showLanguage={false}
                        title="Example request"
                        language="bash"
                        code={sttCurlStatic}
                      />
                    </TabsContent>
                    <TabsContent value="python">
                      <RenderCode
                        showLanguage={false}
                        title="Example request"
                        language="python"
                        code={sttPythonStatic}
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
      <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 mt-5" />

      {/* Generate audio */}
      <div
        data-search-sections="audio-generate"
        data-search-title="Create audio"
      >
        <div
          data-search
          data-title="Audio Generation API"
          id="audio-generate-api"
        >
          <h2 data-section="audio-generate" className="text-3xl font-bold mb-4">
            Create audio
          </h2>
          <ApiDocLayout
            leftContent={
              <div>
                <p className="text-muted-foreground mb-5">
                  Generate all kinds of sound from supported AI modes
                </p>
                <h3 className="text-xl font-semibold mb-5">Request body</h3>
                {musicRequest.map((field, index) => (
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
                    <p className="text-muted-foreground">{field.description}</p>
                    <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 mt-5" />
                  </div>
                ))}
                {/* <div className="mt-5">
                  <RenderCode
                    code={response}
                    showLanguage={false}
                    title="Response"
                  />
                </div> */}
              </div>
            }
            rightContent={
              <Card className="bg-background p-4 mb-10">
                <div className="mb-4 mt-4">
                  <h4 className="font-semibold p-3">
                    audio generation endpoint
                  </h4>
                  <RenderCode
                    code={apiDocsEndpoints.audio.generate}
                    language="bash"
                    className="text-sm"
                    showLanguage={false}
                    isLink={true}
                  />
                </div>
                {/* <div className="mb-8">
                  <RenderCode
                    showLanguage={false}
                    title="Example request body"
                    code={audioGenCodes.generatebody}
                    language="json"
                  />
                </div> */}
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
                        code={audioGenNodeStatic}
                      />
                    </TabsContent>
                    <TabsContent value="curl">
                      <RenderCode
                        showLanguage={false}
                        title="Example request"
                        language="bash"
                        code={audioGenCurlStatic}
                      />
                    </TabsContent>
                    <TabsContent value="python">
                      <RenderCode
                        showLanguage={false}
                        title="Example request"
                        language="python"
                        code={audioGenPythonStatic}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            }
          />
        </div>
      </div>
    </div>
  );
}
