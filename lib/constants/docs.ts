// user guides
interface GuideSection {
  id: string;
  title: string;
  href: string;
  description?: string;
  keywords?: keywordsProps[];
}

interface Guide {
  id?: string;
  title: string;
  href?: string;
  description?: string;
  sections: GuideSection[];
}

const BaseUrl = "/docs/api-reference";

// main api reference
interface endPointProps {
  id: string;
  keywords: keywordsProps[];
  title: string;
  href: string;
}
interface sectionProps {
  id: string;
  title: string;
  href: string;
  sections?: endPointProps[];
  description?: string;
}
interface searchtermsprops {
  hash: string;
  words: string[];
  description?: string;
}
interface keywordsProps {
  BaseUrl: string;
  searchTerms: searchtermsprops[];
}
interface apiREfprops {
  title: string;
  sections: sectionProps[];
  id: string;
}

export const apiReference: apiREfprops[] = [
  {
    title: "API Reference",
    id: "reference",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        href: "introduction",
      },
      {
        id: "authentication",
        title: "Authentication",
        href: "authentication",
      },
      // {
      //   id: "streaming",
      //   title: "Streaming",
      //   href: "streaming",
      // },
      {
        id: "sdk",
        title: "SDK & Libraries",
        href: "sdk",
      },
    ],
  },
  {
    title: "Endpoints",
    id: "endpoints",
    sections: [
      {
        id: "chat",
        title: "Chat",
        href: "endpoints-chat",
        description:
          "Endpoints for multi-model AI chat interactions, enabling users to send messages and receive responses from multiple AI models within a single request.",
        sections: [
          {
            id: "chat",
            title: "Completion",
            keywords: [],
            href: "chat-endpoints",
          },
          {
            id: "web-search",
            title: "Search",
            keywords: [],
            href: "chat-search",
          },
          {
            id: "comparison",
            title: "Comparison",
            keywords: [],
            href: "chat-comparison",
          },
          // {
          //   id: "summary",
          //   title: "Summary",
          //   keywords: [],
          //   href: "chat-summary",
          // },
          {
            id: "compare",
            title: "Combination",
            keywords: [],
            href: "chat-combination",
          },
        ],
      },
      {
        id: "image-generation",
        title: "Image Generation",
        href: "/docs/api-reference/image",
        sections: [
          {
            id: "image-generation",
            title: "Text-to-Image",
            keywords: [],
            href: "image-generation",
          },
          {
            id: "image-generation-edits",
            title: "Image Editing",
            keywords: [],
            href: "image-generation-edits",
          },
        ],
      },

      {
        id: "audio-generation",
        title: "Audio Generation",
        href: "/docs/api-reference/audio",
        sections: [
          {
            id: "text-to-speech",
            title: "Text-to-Speech",
            keywords: [],
            href: "audio-text-to-speech",
          },
          {
            id: "speech-to-text",
            title: "Speech-to-text ",
            keywords: [],
            href: "audio-speech-to-text",
          },
          {
            id: "create-sounds",
            title: "create audio ",
            keywords: [],
            href: "audio-generate",
          },
        ],
      },
      {
        id: "video-generation",
        title: "Video Generation",
        href: "/docs/api-reference/video",
        sections: [
          {
            id: "text-video",
            title: "Text-to-Video",
            keywords: [],
            href: "video-generation",
          },
          // {
          //   id: "video-edit",
          //   title: "video-edits",
          //   keywords: [],
          //   href: "video-generation-edits",
          // },
        ],
      },
    ],
  },
  {
    id: "api-usage",
    title: "API Usage",
    sections: [
      {
        id: "api-pricing",
        title: "API Pricing",
        href: "",
      },
      {
        id: "limits-tiers",
        title: "Limits & Tiers",
        href: "",
      },
      {
        id: "error-handling",
        title: "Error Handling",
        href: "",
      },
      {
        id: "changelogs",
        title: "Changelog",
        href: "/docs/api-reference/analytics/performance-monitoring",
      },
      {
        id: "faq",
        title: "FAQ",
        href: "/docs/api-reference/analytics/logs",
      },
    ],
  },
];

export const apiEndPoints = [
  "chat",
  "search",
  "comparison",
  "summary",
  "combination",
];

// chat completion endpoints
export const basicRequest = `
{
    "models": ["gpt-4o", "claude-3.5-sonnet"],
    "messages": [
      {
        "system": {
          "type": "text",
          "text": "You are a helpful assistant."
        },
        "user": {
          "type": "text",
          "text": "Hello, how are you?"
        }
      }
    ],
    "response_format": {
      "type": "text",
      "model_specific": {
        "gpt-4o": "text",
        "claude-3.5-sonnet": "text"
      }
    },
    "temperature": 0.7,
    "max_tokens": 1000,
    "stream": false
}

`;

export const basicResponse = `
{
  "success": true,
  "responses": {
    "id": "alleai-12345",
    "object": "ai.completions",
    "created": {
      "date": "2025-05-22 09:24:23",
      "timezone": "UTC"
    },
    "source_models": [
      "gpt-4o",
      "gemini-2-5-pro"
    ],
    "responses": {
      "gpt-4o": {
        "model": "gpt-4o",
        "message": {
          "role": "assistant",
          "content": "Hi there! How can I assist you today?"
        },
        "finish_reason": "stop",
        "tokens_used": {
          "prompt_tokens": 22,
          "completion_tokens": 255,
          "total_tokens": 277
        }
      },
      "gemini-2-5-pro": {
        "model": "gemini-2-5-pro",
        "message": {
          "role": "assistant",
          "content": "Hello! What can I help you with today?"
        },
        "finish_reason": "STOP",
        "tokens_used": {
          "prompt_tokens": 15,
          "completion_tokens": 347,
          "total_tokens": 362
        }
      }
    },
    "usage": {
      "total_requests": 2,
      "total_cost": "0.0000000000"
    }
  },
  "usage": {
    "total_input_cost": "0.0000000000",
    "total_output_cost": "0.0000000000",
    "total_cost": "0.0000000000"
  }
}

`;

export const requestBody = `
{
    "models": ["gpt-4o", "deepseek-r1", "claude-3.5-sonnet"],  
    "messages": [
      {
        "system": [
          {
            "type": "text",
            "text": "You are a helpful assistant.",
            "model_specific": {
              "gpt-4o": "This is the system prompt specifically for GPT-4o at this point in the conversation. It will override the default system prompt",
              "deepseek-r1": "This is the system prompt specifically for Deepseek-r1 at this point in the conversation. It will override the default system prompt",
              "claude-3.5-sonnet": "This is the system prompt specifically for Claude at this point in the conversation. It will override the default system prompt"
            }
          },
          {
            "type": "audio_url",
            "audio_url": {
              "url": "data:audio/wav;base64,..."
            },
            "model_specific": {
              "gpt-4o": {
                "url": "data:audio/wav;base64,..."
              },
              "deepseek-r1": {
                "url": "data:audio/wav;base64,..."
              },
              "claude-3.5-sonnet": {
                "url": "data:audio/wav;base64,..."
              }
            }
          }
        ]
      },
      {
        "user": [
          {
            "type": "text",
            "text": "What is photosynthesis?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "data:image/png;base64,..."
            }
          },
          {
            "type": "audio_url",
            "audio_url": {
              "url": "data:audio/wav;base64,..."
            }
          },
          {
            "type": "video_url",
            "video_url": {
              "url": "data:video/mp4;base64,..."
            }
          }
        ]
      },
      {
        "assistants":{
          "gpt-4o": [
              {
                  "type": "text",
                  "text": "Photosynthesis is the process by which green plants and some other organisms use..."
              },
              {
                  "type": "image_url",
                  "image_url": {
                      "url": "data:image/png;base64,..."
                  }
              },
              {
                  "type": "audio_url",
                  "audio_url": {
                      "url": "data:audio/wav;base64,..."
                  }
              },
              {
                  "type": "video_url",
                  "video_url": {
                      "url": "data:video/mp4;base64,..."
                  }
              }
          ],
          "deepseek-r1": [
              {
                  "type": "text",
                  "text": "Photosynthesis is a process used by plants and other organisms to convert..."
              },
              {
                  "type": "audio_url",
                  "audio_url": {
                      "url": "data:audio/wav;base64,..."
                  }
              }
          ],
          "claude-3.5-sonnet": [
              {
                  "type": "text",
                  "text": "Photosynthesis is the process by which green plants produce energy from light..."
              }
          ]
        }
      }
    ],
    "web_search": true,
    "summary":[
        {
            "type":"text",
            "models":["gpt-4o+deepseek-r1+claude-3.5-sonnet"]
        },
        {
            "type":"audio_url",
            "models":["gpt-4o+claude-3.5-sonnet"]
        },
        {
            "type":"text",
            "models":["gpt-4o"]
        }
    ],
    "combination":[
        {
            "type":"text",
            "models":["gpt-4o+deepseek-r1+claude-3.5-sonnet"] 
        },
        {
            "type":"audio_url",
            "models":["gpt-4o+claude-3.5-sonnet"]  
        }
    ],
    "response_format": {
      "type": "text",
      "model_specific": {
        "gpt-4o": "text",
        "deepseek-r1": "audio_url",
        "claude-3.5-sonnet": "text"
      }
    },
    "temperature": 0.7, 
    "max_tokens": 2000,
    "top_p": 1,
    "frequency_penalty": 0.2,
    "presence_penalty": 0.3,
    "stream": false,
    "metadata": {
      "request_id": "12345",
      "user_id": "67890",
      "timestamp": "2025-02-06T12:00:00Z"
    },
    "model_specific_params": {
      "gpt-4o": {
        "temperature": 0.7,
        "max_tokens": 2000,
        "top_p": 1,
        "frequency_penalty": 0.2,
        "presence_penalty": 0.3,
        "stream": false
      },
      "deepseek-r1": {
        "temperature": 0.5,
        "max_tokens": 2000,
        "top_p": 1,
        "frequency_penalty": 0.2,
        "presence_penalty": 0.3,
        "stream": false
      },
      "claude-3.5-sonet": {
        "temperature": 0.4,
        "max_tokens": 2000,
        "top_p": 1,
        "frequency_penalty": 0.2,
        "presence_penalty": 0.3,
        "stream": false
      }
    }
  }
  
`;

export const responseBody = `{
    "id": "alleai-12345",
    "object": "ai.comparison",
    "created": 1738935425,
    "models": ["gpt-4o", "deepseek-r1", "claude-3.5-sonnet"],
    "responses": [
      {
        "model": "gpt-4o",
        "message": {
          "role": "assistant",
          "content": "Hi there! How can I assist you today?"
        },
        "finish_reason": "stop",
        "tokens_used": {
          "prompt_tokens": 8,
          "completion_tokens": 10,
          "total_tokens": 18
        }
      },
      {
        "model": "deepseek-r1",
        "message": {
          "role": "assistant",
          "content": "Hello! What can I do for you today?"
        },
        "finish_reason": "stop",
        "tokens_used": {
          "prompt_tokens": 7,
          "completion_tokens": 12,
          "total_tokens": 19
        }
      },
      {
        "model": "claude-3.5-sonnet",
        "message": {
          "role": "assistant",
          "content": "Hey! How can I help you?"
        },
        "finish_reason": "stop",
        "tokens_used": {
          "prompt_tokens": 9,
          "completion_tokens": 11,
          "total_tokens": 20
        }
      }
    ],
    "web_search_results": [
      {
        "query": "photosynthesis",
        "results": [
          {
            "title": "Photosynthesis - Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Photosynthesis",
            "description": "Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that can later be released to fuel the organisms' activities."
          },
          {
            "title": "Photosynthesis | National Geographic Society",
            "url": "https://www.nationalgeographic.org/encyclopedia/photosynthesis/",
            "description": "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll."
          }
        ]
      }
    ],
    "combination": {
        "gpt-4o+deepseek-r1+claude-3.5-sonnet": [
            {
                "type": "text",
                "text": "Photosynthesis is the process by which green plants and some other organisms use..."
            },
            {
                "type": "audio_url",
                "audio_url": {
                    "url": "data:audio/wav;base64,..."
                }
            }
        ],
        "gpt-4o+deepseek-r1": [
            {
                "type": "text",
                "text": "Photosynthesis is the process by which green plants and some other organisms use..."
            }
        ],
        "deepseek-r1+claude-3.5-sonnet": [
            {
                "type": "text",
                "text": "Photosynthesis is a process used by plants and other organisms to convert..."
            }
        ]
    },
    "summary": {
        "gpt-4o+claude-3.5-sonnet": [
            {
                "type": "text",
                "text": "Photosynthesis is the process by which green plants and some other organisms use..."
            },
            {
                "type": "audio_url",
                "audio_url": {
                    "url": "data:audio/wav;base64,..."
                }
            }
        ],
        "gpt4o+deepseek-r1+claude-3.5-sonnet": [
            {
                "type": "text",
                "text": "Photosynthesis is a process used by plants and other organisms to convert..."
            }
        ]
    },
    "usage": {
      "total_requests": 1,
      "api_credits_used": 5 ,
        "total_cost": 0.05

    }
  }
  
`;

//  parameters

export const basicParameter = [
  {
    name: "models",
    type: "array",
    required: true,
    description:
      "List of models to use (gpt-4, deepseek-1, claude-3.5-sonnet). Relates to 'models' in the simplified JSON, specifying the model(s) to process the request.",
  },
  {
    name: "messages",
    type: "array",
    required: true,
    description:
      "User messages, system prompts, and multimedia inputs. Maps to 'messages' in the simplified JSON, where user and system messages are structured.",
  },
  {
    name: "response_format",
    type: "object",
    required: true,
    description:
      "Specifies output format (text, audio, etc.) with model-specific configurations. This corresponds to 'response_format' in the simplified JSON, defining the format and specifics for each model.",
  },
  {
    name: "temperature",
    type: "number",
    required: false,
    description:
      "Controls randomness in model outputs (0.1 = deterministic, 1.0 = creative). Maps to 'temperature' in the simplified JSON for controlling output behavior.",
  },
  {
    name: "max_tokens",
    type: "integer",
    required: false,
    description:
      "Maximum length of response in tokens (default: 2000). Relates to 'max_tokens' in the simplified JSON, controlling the length of the model's response.",
  },
  {
    name: "stream",
    type: "boolean",
    required: false,
    description:
      "Enables streaming of partial responses as they're generated. Corresponds to 'stream' in the simplified JSON, enabling or disabling the streaming feature.",
  },
];
export const parameters = [
  {
    name: "models",
    type: "array",
    required: true,
    description:
      "A list of AI model names that will process your request. You can include options like 'gpt-4', 'deepseek-1', or 'claude-3.5-sonnet' to decide which models generate responses or handle tasks, based on what each one is good at.",
    keywords: ["model names", "gpt-4", "deepseek-1", "claude-3.5-sonnet"],
  },
  {
    name: "messages",
    type: "array",
    required: true,
    description:
      "The full set of inputs and context for the models to work with. This includes optional system instructions to guide the models' behavior (like setting their role or tone), user inputs such as text questions, audio recordings, images, or videos for the models to respond to, and prior assistant responses organized by model name to keep the conversation flowing. Each message can contain content in formats like text, audio URLs, image URLs, or video URLs, giving you flexibility in how you communicate with the models.",
    keywords: [
      "system instructions",
      "user inputs",
      "assistant responses",
      "text",
      "audio URLs",
      "image URLs",
      "video URLs",
    ],
  },
  {
    name: "response_format",
    type: "object",
    required: true,
    description:
      "Controls how the models deliver their output to you. You specify the main format—whether you want text, an audio URL, an image URL, or a video URL—and can optionally set different formats for specific models if you're using more than one. This ensures the response matches what you need, tailored to each model's contribution.",
    keywords: [
      "main format",
      "text",
      "audio URL",
      "image URL",
      "video URL",
      "specific models",
    ],
  },
  {
    name: "web_search",
    type: "boolean",
    required: false,
    description:
      "Lets you decide if the models can search the web to include up-to-date or outside information in their responses. Turn it on with true to broaden their knowledge, or keep it off with false to rely only on what the models already know.",
    keywords: ["web search", "true", "false"],
  },
  {
    name: "comparison",
    type: "array",
    required: false,
    description:
      "Configures how to compare responses from multiple models, perfect for quick insights into differences or similarities. You can choose the format—like text, audio URL, image URL, or video URL—and pick which models (from your 'models' list) should be used, letting you customize how outputs are contrasted and presented.",
    keywords: [
      "shorter version",
      "format",
      "text",
      "audio URL",
      "image URL",
      "video URL",
      "models",
    ],
  },
  {
    name: "combination",
    type: "array",
    required: false,
    description:
      "Sets up how to merge responses from multiple models into one cohesive output. You define the format—text, audio URL, image URL, or video URL—and select which models' answers to blend, combining their strengths into a single result that suits your needs.",
    keywords: [
      "merge responses",
      "format",
      "text",
      "audio URL",
      "image URL",
      "video URL",
      "models",
    ],
  },
  {
    name: "temperature",
    type: "number",
    required: false,
    description:
      "Adjusts how creative or predictable the models' responses are. Use a lower value (like 0.1) for straightforward, focused answers, or a higher value (up to 1.0) for more imaginative or varied replies, depending on the tone you're aiming for.",
    keywords: ["creative", "predictable", "lower value", "higher value"],
  },
  {
    name: "max_tokens",
    type: "integer",
    required: false,
    description:
      "Caps the length of the response, measured in small units like words or characters. Set a number to keep answers brief or allow them to run longer, giving you control over how much detail you get back.",
    keywords: ["length", "small units", "brief", "longer"],
  },
  {
    name: "top_p",
    type: "number",
    required: false,
    description:
      "Shapes how varied the models' responses can be. A lower value (like 0.5) keeps answers focused on the most likely ideas, while a higher value (up to 1.0) lets the models explore a wider range of possibilities, balancing focus with diversity.",
    keywords: ["varied", "lower value", "higher value", "focus", "diversity"],
  },
  {
    name: "frequency_penalty",
    type: "number",
    required: false,
    description:
      "Controls how much the models repeat themselves. A higher value (up to 2.0) pushes them to avoid reusing phrases or ideas, keeping things fresh, while a lower or negative value (down to -2.0) lets them repeat more if that's what you want.",
    keywords: ["repeat", "higher value", "lower value", "fresh"],
  },
  {
    name: "presence_penalty",
    type: "number",
    required: false,
    description:
      "Influences whether the models stick to what's already been said or bring up new topics. A higher value (up to 2.0) encourages fresh ideas, while a lower or negative value (down to -2.0) keeps them focused on the current discussion.",
    keywords: [
      "new topics",
      "higher value",
      "lower value",
      "current discussion",
    ],
  },
  {
    name: "stream",
    type: "boolean",
    required: false,
    description:
      "Determines if you get the response bit by bit as it's being created (with true) or all at once when it's finished (with false). Streaming is handy for real-time updates, while waiting gives you the complete answer in one go.",
    keywords: ["bit by bit", "true", "all at once", "false", "real-time"],
  },

  {
    name: "model_specific_params",
    type: "object",
    required: false,
    description:
      "Fine-tunes settings for individual models, overriding the general options. You can adjust things like system instructions, creativity level, response length, or repetition controls for specific models (like 'gpt-4' or 'deepseek-1'), giving you precise control over each one's behavior.",
    keywords: [
      "fine-tunes",
      "system instructions",
      "creativity level",
      "response length",
      "repetition controls",
      "specific models",
    ],
  },
];
export const apiReferenceFields = [
  {
    name: "success",
    type: "boolean",
    description: "Indicates if the API request was successful.",
  },
  {
    name: "responses",
    type: "object",
    description: "Container for the main response data.",
    fields: [
      {
        name: "id",
        type: "string",
        description: "Unique identifier for the response.",
      },
      {
        name: "object",
        type: "string",
        description: "Type of object returned (e.g., 'ai.completions').",
      },
      {
        name: "created",
        type: "object",
        description: "Information about when the response was created.",
        fields: [
          {
            name: "date",
            type: "string",
            description: "Date and time when the response was created.",
          },
          {
            name: "timezone",
            type: "string",
            description: "Timezone for the creation timestamp.",
          },
        ],
      },
      {
        name: "source_models",
        type: "array",
        description: "List of models used in the API call.",
      },
      {
        name: "responses",
        type: "object",
        description:
          "Response content from each model, organized by model name.",
        fields: [
          {
            name: "[model_name]",
            type: "object",
            description: "Response data for a specific model.",
            fields: [
              {
                name: "model",
                type: "string",
                description:
                  "Name of the model (e.g., 'gpt-4o', 'gemini-2-5-pro').",
              },
              {
                name: "message",
                type: "object",
                description: "The response content from the model.",
                fields: [
                  {
                    name: "role",
                    type: "string",
                    description: "Role of the message (e.g., 'assistant').",
                  },
                  {
                    name: "content",
                    type: "string",
                    description: "The actual response text from the model.",
                  },
                ],
              },
              {
                name: "finish_reason",
                type: "string",
                description:
                  "Reason for stopping the response (e.g., 'stop', 'STOP').",
              },
              {
                name: "tokens_used",
                type: "object",
                description: "Token usage details for the response.",
                fields: [
                  {
                    name: "prompt_tokens",
                    type: "number",
                    description: "Number of tokens used in the prompt.",
                  },
                  {
                    name: "completion_tokens",
                    type: "number",
                    description: "Number of tokens used in the completion.",
                  },
                  {
                    name: "total_tokens",
                    type: "number",
                    description: "Total tokens used (prompt + completion).",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "usage",
        type: "object",
        description: "Model-specific API usage details.",
        fields: [
          {
            name: "total_requests",
            type: "number",
            description: "Total number of requests made.",
          },
          {
            name: "total_cost",
            type: "string",
            description: "Total cost for model usage.",
          },
        ],
      },
    ],
  },
  {
    name: "usage",
    type: "object",
    description: "Overall API usage and cost details.",
    fields: [
      {
        name: "total_input_cost",
        type: "string",
        description: "Cost associated with input tokens.",
      },
      {
        name: "total_output_cost",
        type: "string",
        description: "Cost associated with output tokens.",
      },
      {
        name: "total_cost",
        type: "string",
        description: "Total cost of the API usage.",
      },
    ],
  },
];

//  image generation api

export const imageHeaders = [];

// main user guides
// user guides 2
interface subsections {
  id: string;
  title: string;
  href?: string;
}
interface guideSections {
  id: string;
  href?: string;
  title: string;
  sections?: subsections[];
}
export interface mainGuides {
  id: string;
  title: string;
  sections: guideSections[];
}

export const mainUserGuides: mainGuides[] = [
  {
    id: "get-started",
    title: "Get Started",
    sections: [
      {
        id: "platform-overview",
        title: "Overview",
      },

      {
        id: "user-interface",
        title: "Quickstart",
      },
    ],
  },
  {
    id: "platform-usage",
    title: "Platform Capabilities",
    sections: [
      {
        id: "text-generation",
        title: "Chat",
      },
      {
        id: "image-generation",
        title: "Image Generation",
      },
      {
        id: "audio-generation",
        title: "Audio Generation",
      },
      {
        id: "video-generation",
        title: "Video Generation",
      },
    ],
  },
  {
    id: "developer-quickstart",
    title: "For developers",
    sections: [
      {
        id: "start-developing",
        title: "Start developing",
        sections: [
          {
            id: "setup-environment",
            title: "Setup Environment",
          },
          {
            id: "first-request",
            title: "Send your first request",
          },
        ],
      },
      {
        id: "about-api",
        title: "About APIs",
        sections: [
          {
            id: "pricing",
            title: "Pricing",
          },
          {
            id: "usage-tiers",
            title: "Limits & Tiers",
          },
        ],
      },
    ],
  },
  {
    id: "support",
    title: "Help & Support",
    sections: [
      {
        id: "faq",
        title: "FAQ",
        href: "/faq",
      },
      {
        id: "contact-us",
        title: "Contact Us",
        href: "/contact-us",
      },
      {
        id: "model_glossary",
        title: "Model Glossary",
        href: "/model-glossary",
      },
      {
        id: "changelog",
        title: "changelog",
        href: "/changelog",
      },
    ],
  },
];
