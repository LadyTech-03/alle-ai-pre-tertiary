interface Subsection {
  title: string;
  id: string;
  contents: string[];
}

export interface ApiReferenceSearchObject {
  title: string;
  id: string;
  mainUrl: string;
  sections: Subsection[];
}

 const ApiReferenceSearchData: ApiReferenceSearchObject[] = [
   {
     title: "API Reference",
     id: "introduction",
     mainUrl: "/docs/api-reference/introduction",
     sections: [
       {
         title: "API Interaction",
         id: "api-interaction",
         contents: [
           "You can interact with the API through HTTP or WebSocket requests from any programming language.",
           "Official Python bindings are available for easy integration.",
           "Official Node.js libraries are provided for JavaScript and TypeScript applications.",
         ],
       },
       {
         title: "Python SDK",
         id: "python-sdk-install",
         contents: [
           "Install the official Python bindings using pip.",
           "The Python SDK provides a simple interface for API integration.",
         ],
       },
       {
         title: "Node.js SDK",
         id: "nodejs-sdk-install",
         contents: [
           "Install the official Node.js library in your project directory.",
           "The Node.js SDK supports both JavaScript and TypeScript applications.",
         ],
       },
     ],
   },
   {
     title: "Authentication",
     id: "authentication",
     mainUrl: "/docs/api-reference/authentication",
     sections: [
       {
         title: "API Keys",
         id: "api-keys",
         contents: [
           "The API uses API key authentication to secure access to all endpoints.",
           "You must include a valid API key in every request to authenticate your identity.",
           "API keys ensure authorized access to the platform.",
         ],
       },
       {
         title: "Obtain API Key",
         id: "obtain-api-key",
         contents: [
           "Register for an account to obtain an API key.",
           "Navigate to the API Keys section in your dashboard.",
           "Generate and manage your API keys from the dashboard.",
         ],
       },
       {
         title: "Authenticated Requests",
         id: "authenticated-requests",
         contents: [
           "Include your API key in the X-API-Key header for all requests.",
           "The X-API-Key header format ensures proper authentication.",
         ],
       },
       {
         title: "Python SDK Authentication",
         id: "auth-python-sdk",
         contents: [
           "Initialize the Alle-AI Python client with your API key.",
           "The Python SDK handles authentication automatically once configured.",
         ],
       },
       {
         title: "Node.js SDK Authentication",
         id: "auth-nodejs",
         contents: [
           "Initialize the Alle-AI Node.js client with your API key.",
           "The Node.js SDK manages authentication seamlessly after setup.",
         ],
       },
     ],
   },
   {
     title: "SDK Best Practices",
     id: "sdk",
     mainUrl: "/docs/api-reference/sdk",
     sections: [
       {
         title: "Python SDK",
         id: "python-sdk-api",
         contents: [
           "The official Alleai Python SDK provides a simple and intuitive interface.",
           "Use the Python SDK for easy API integration in Python applications.",
         ],
       },
       {
         title: "Node.js SDK",
         id: "nodejs-sdk-api",
         contents: [
           "The official Alleai Node.js SDK is built for modern JavaScript and TypeScript applications.",
           "Supports both CommonJS and ES modules for flexible integration.",
         ],
       },
       {
         title: "Best Practices",
         id: "best-practice-sdk",
         contents: [
           "Store your API key in environment variables to keep it secure.",
           "Avoid hardcoding API keys in your application code.",
           "Always wrap API calls in try-catch blocks to handle errors gracefully.",
           "Use TypeScript for better type safety and autocompletion when using Node.js.",
           "Regularly update the SDKs to benefit from the latest features and bug fixes.",
           "Implement proper error handling for production applications.",
         ],
       },
     ],
   },
   {
     title: "Chat Completion",
     id: "chat-endpoints",
     mainUrl: "/docs/api-reference/chat-endpoints",
     sections: [
       {
         title: "Chat Completion Overview",
         id: "chat-completion",
         contents: [
           "The Chat Completion endpoint is a unified gateway to multiple AI models.",
           "Access ChatGPT, Claude, Gemini, and more through a single endpoint.",
           "Generate human-like text responses using state-of-the-art language models.",
           "Choose from OpenAI's ChatGPT (GPT-3.5, GPT-4), Anthropic's Claude, and Google's Gemini.",
         ],
       },
       {
         title: "Endpoint URL",
         id: "chat-completion-endpoint",
         contents: [
           "All chat completion API requests should be made using HTTPS.",
           "Use the designated completion endpoint URL for all requests.",
         ],
       },
       {
         title: "Request Parameters",
         id: "completion-params",
         contents: [
           "Specify AI model names like gpt-4, deepseek-1, or claude-3.5-sonnet in your request.",
           "Include system instructions to guide the model's behavior and set its role or tone.",
           "Provide user inputs such as text questions, audio recordings, images, or videos.",
           "Include prior assistant responses organized by model name to maintain conversation flow.",
           "Messages can contain text, audio URLs, image URLs, or video URLs for flexible communication.",
           "Control output format by specifying text, audio URL, image URL, or video URL responses.",
           "Set different response formats for specific models when using multiple models.",
           "Enable web search with true to include up-to-date information in responses.",
           "Disable web search with false to rely only on the model's existing knowledge.",
           "Configure summary format as text, audio URL, image URL, or video URL.",
           "Select which models should create the summary for customized insights.",
           "Set up response merging from multiple models into one cohesive output.",
           "Define merge format and select which models' answers to blend together.",
           "Adjust temperature for creativity - use lower values (0.1) for focused answers.",
           "Use higher temperature values (up to 1.0) for more imaginative responses.",
           "Set max_tokens to cap response length measured in words or characters.",
           "Control response variety with top_p - lower values (0.5) keep answers focused.",
           "Higher top_p values (up to 1.0) allow models to explore wider possibilities.",
           "Use repetition_penalty (up to 2.0) to reduce repetition and keep content fresh.",
           "Lower or negative repetition_penalty values allow more repetition if desired.",
           "Adjust presence_penalty to influence new topics vs. current discussion focus.",
           "Higher presence_penalty (up to 2.0) encourages fresh ideas and topics.",
           "Enable streaming with true to get responses as they're being created.",
           "Disable streaming with false to receive complete responses all at once.",
           "Use model_params to fine-tune settings for individual models.",
           "Override general options with model-specific system instructions and creativity levels.",
         ],
       },
       {
         title: "Request Headers",
         id: "request-headers-chat",
         contents: [
           "Include proper request headers for API authentication and content type.",
           "Set Content-Type to application/json for JSON request bodies.",
         ],
       },
       {
         title: "Response Format",
         id: "response-format-chat",
         contents: [
           "API responses include a success indicator for request status.",
           "Response data contains a unique identifier for each response.",
           "Object type is returned as ai.completions for chat responses.",
           "Creation timestamp includes date, time, and timezone information.",
           "Model list shows all models used in the API call.",
           "Response content is organized by model name for easy access.",
           "Each model response includes the model name and generated content.",
           "Stop reason indicates why the response ended (e.g., stop, STOP).",
           "Token usage details are provided for each model response.",
           "API usage information includes total requests made and associated costs.",
           "Cost breakdown shows input token costs, output token costs, and total usage cost.",
         ],
       },
     ],
   },
   {
     title: "Web Search",
     id: "chat-search",
     mainUrl: "/docs/api-reference/chat-search",
     sections: [
       {
         title: "Web Search in Completions",
         id: "web-search-completions",
         contents: [
           "Enable web search in completion endpoints by setting web_search parameter to true.",
           "Models can access current information from the web to enhance responses.",
         ],
       },
       {
         title: "Web Search Response",
         id: "web-search-response",
         contents: [
           "Responses include web_search_results field when web search is enabled.",
           "Web search results contain information gathered by models during response generation.",
           "Search results enhance model responses with up-to-date information.",
         ],
       },
       {
         title: "Dedicated Web Search Endpoints",
         id: "web-search-endpoint",
         contents: [
           "Dedicated web search endpoints are available for specialized search operations.",
           "Use dedicated endpoints for focused web search functionality.",
         ],
       },
     ],
   },
  //  {
  //    title: "Model Comparison",
  //    id: "chat-comparison",
  //    mainUrl: "/docs/api-reference/chat-comparison",
  //    sections: [
  //      {
  //        title: "Compare Model Responses",
  //        id: "compare-models",
  //        contents: [
  //          "Compare outputs across different AI models using the comparison parameter.",
  //          "Model comparison helps evaluate different approaches to the same query.",
  //        ],
  //      },
  //      {
  //        title: "Comparison Configuration",
  //        id: "model-output-compare",
  //        contents: [
  //          "The comparison field is optional and enables cross-model comparisons.",
  //          "Omitting the comparison field returns only standard model outputs.",
  //          "Include comparison field with an array of comparison objects.",
  //          "Each comparison object defines a specific comparison type and models.",
  //          "Supported comparison types include text and audio_url comparisons.",
  //          "Text type compares text outputs from specified models.",
  //          "Audio_url type compares audio content from provided URLs.",
  //          "Models field accepts arrays of model combination strings.",
  //          "Combine models using plus signs (+) for ensemble comparisons.",
  //          "Example: gpt-4o+deepseek-r1+claude-3.5-sonnet for multi-model comparison.",
  //          "Each string represents a distinct set of models used together.",
  //          "Multiple model combination strings enable different comparison scenarios.",
  //        ],
  //      },
  //    ],
  //  },
   {
     title: "Compare model responses",
     id: "chat-comparison",
     mainUrl: "/docs/api-reference/chat-comparison",
     sections: [
       {
         title: "model comparison in Completions",
         id: "compare-completion",
         contents: [
           "Include comparison configuration in completion endpoint requests.",
           "Comparison analyzes and contrasts multiple model responses to surface key differences and similarities.",
         ],
       },
       {
         title: "Dedicated Comparison Endpoints",
         id: "comparison-endpoints",
         contents: [
           "Use dedicated comparison endpoints at baseUrl/comparison for structured comparisons.",
           "Comparison endpoints focus on highlighting differences and similarities across model outputs.",
           "Configure comparison requests using messages for input and response_format to control output style.",
         ],
       },
     ],
   },
   {
     title: "Response Combination",
     id: "chat-combination",
     mainUrl: "/docs/api-reference/chat-combination",
     sections: [
       {
         title: "Combinations in Completions",
         id: "combination-completion",
         contents: [
           "Configure response combinations in completion endpoint requests.",
           "Combine multiple model responses into a single cohesive output.",
         ],
       },
       {
         title: "Dedicated Combination Endpoints",
         id: "combination-endpoints",
         contents: [
           "Use dedicated combination endpoints at baseUrl/combinations for focused results.",
           "Combination endpoints skip individual model outputs and deliver only combined results.",
           "Configure requests with messages for queries and response_format for output style.",
           "Use temperature and other parameters for fine-tuning combined responses.",
           "Specify model combinations using the + notation in the combination array.",
           "Example: type: text, models: gpt-4o+deepseek-r1+claude-3.5-sonnet.",
           "Get synthesized outputs without raw model-by-model breakdowns.",
         ],
       },
     ],
   },
   {
     title: "Image Generation",
     id: "image-generation",
     mainUrl: "/docs/api-reference/image-generation",
     sections: [
       {
         title: "Image Generation Overview",
         id: "image-generation-api",
         contents: [
           "Multi-Model Image Generation API leverages multiple AI models simultaneously.",
           "Compare outputs across different models for diverse creative options.",
           "Select the best result for your specific use case from multiple generations.",
           "Supports text-to-image generation from text prompts across multiple models.",
           "Supports image editing to modify existing images using text instructions.",
           "Authentication required using API key for all image generation requests.",
           "Obtain API key by registering for an account and accessing the API Keys dashboard section.",
         ],
       },
       {
         title: "Text-to-Image API",
         id: "text-to-image-api",
         contents: [
           "Transform text descriptions into visual imagery using multiple AI models simultaneously.",
           "Compare stylistic differences between different image generation models.",
           "Offer diverse creative options to users with multiple model outputs.",
           "Experiment with prompt engineering across different model architectures.",
           "Select the most suitable image output for specific needs and requirements.",
           "Specify an array of selected image models for the API call.",
           "Provide a text description of the desired image or images.",
           "Set the number of images to generate (optional parameter).",
           "Define image height in pixels (optional parameter).",
           "Define image width in pixels (optional parameter).",
           "Use seed value for reproducible image generation (optional parameter).",
           "Specify the style of the generated image (optional parameter).",
         ],
       },
     ],
   },

   {
     title: "Image Editing",
     id: "image-generation-edits",
     mainUrl: "/docs/api-reference/image-generation-edits",
     sections: [
       {
         title: "Image Editing API",
         id: "image-edits-api",
         contents: [
           "Create, edit, or extend images given an original image and a prompt.",
           "Specify an array of models to use for image editing operations.",
           "Provide image as base64-encoded string or web URL pointing to the image.",
           "Include a text description of the desired edit with maximum length of 1000 characters.",
         ],
       },
     ],
   },
   {
     title: "Audio Generation",
     id: "audio-text-to-speech",
     mainUrl: "/docs/api-reference/audio-text-to-speech",
     sections: [
       {
         title: "Audio API Overview",
         id: "audio-generation-api",
         contents: [
           "Turn audio into text or text into audio by combining multiple audio models.",
           "Create speech by generating audio from input text.",
           "Create transcription by transcribing audio into the input language.",
           "Generate sounds, music, and other audio formats from text descriptions.",
           "Combine the power of multiple audio models for enhanced results.",
           "Authentication required using API key for all audio generation requests.",
           "Obtain API key by registering for an account and accessing the API Keys dashboard section.",
         ],
       },
       {
         title: "Text-to-Speech API",
         id: "text-to-speech-api",
         contents: [
           "Generate audio from input text using multiple audio models.",
           "Specify an array of selected audio models for text-to-speech conversion.",
           "Provide the text content to generate audio for.",
           "Select the voice to use for audio generation (optional parameter).",
           "Configure model-specific parameters for customized audio generation.",
         ],
       },
     ],
   },

   {
     title: "Speech-to-Text",
     id: "audio-speech-to-text",
     mainUrl: "/docs/api-reference/audio-speech-to-text",
     sections: [
       {
         title: "Speech-to-Text API",
         id: "speech-to-text-api",
         contents: [
           "Create transcription by transcribing audio into the input language.",
           "Specify an array of selected models for audio transcription.",
           "Provide file path or web URL pointing to the audio file to transcribe.",
           "Supported audio formats include flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, and webm.",
           "Configure model-specific parameters for customized audio transcription.",
         ],
       },
     ],
   },
   {
     title: "Audio Generation",
     id: "audio-generate",
     mainUrl: "/docs/api-reference/audio-generate",
     sections: [
       {
         title: "Audio Generation API",
         id: "audio-generate-api",
         contents: [
           "Generate all kinds of sound from supported AI models.",
           "Specify an array of selected audio models for generating audio from text.",
           "Provide text description to generate audio from with maximum length of 4096 characters.",
           "Set the duration of generated audio in seconds (optional parameter).",
           "Configure tempo of generated audio in beats per minute (BPM) (optional parameter).",
           "Specify musical genre for generated audio such as jazz or rock (optional parameter).",
           "Include array of instruments like piano or drums (optional parameter).",
           "Set audio quality as standard or hd with standard as default (optional parameter).",
           "Choose audio output format from mp3, wav, or ogg (optional parameter).",
           "Enable loopable audio generation (optional parameter).",
           "Set the mood of generated audio such as happy or calm (optional parameter).",
           "Configure volume level of generated audio (optional parameter).",
         ],
       },
     ],
   },
   {
     title: "Text-to-Video",
     id: "video-generation",
     mainUrl: "/docs/api-reference/video-generation",
     sections: [
       {
         title: "Text-to-Video API",
         id: "text-to-video-api",
         contents: [
           "Generate videos from input text using multiple video models.",
           "Specify an array of selected models for generating video from text.",
           "Provide text description to generate video from with maximum length of 4096 characters.",
           "Set the duration of generated video in seconds (optional parameter).",
           "Configure whether the video should loop playback (optional parameter).",
           "Set the aspect ratio of video such as 16:9 or 4:3 (optional parameter).",
           "Configure frame rate of video in frames per second (optional parameter).",
           "Set pixel dimensions of video such as 1280x720 (optional parameter).",
           "Configure resolution quality of video such as 720p (optional parameter).",
           "Use seed value for reproducible video generation (optional parameter).",
           "Include additional parameters specific to selected models (optional parameter).",
           "Video generation is an asynchronous process that may take time to complete.",
           "API responds immediately with job_id or request_id when request is submitted.",
           "Use request_id to poll the status of video generation with GET requests.",
           "Status endpoint returns current job state such as InProgress or Completed.",
           "Completed jobs include generated video URL and related metadata in response.",
           "Asynchronous approach allows efficient management of long-running video generation tasks.",
         ],
       },
     ],
   },
   {
     title: "Error Handling",
     id: "error-handling",
     mainUrl: "/docs/api-reference/error-handling",
     sections: [
       {
         title: "Error Types",
         id: "error-types",
         contents: [
           "Base exception class AlleAIError for all SDK errors",
           "APIError for unexpected API errors with response details",
           "AuthenticationError for invalid API key or authentication failures",
           "InvalidRequestError for malformed requests or invalid parameters",
         ],
       },
       {
         title: "Status Code Reference",
         id: "status-code-reference",
         contents: [
           "Common HTTP status codes and their corresponding error types",
           "Detailed descriptions of error causes and recommended actions",
           "Status codes 400, 401, 403, 404, 429, 500, 503 with handling guidance",
           "Best practices for implementing retry logic and error handling",
         ],
       },
     ],
   },
   {
     title: "FAQ",
     id: "faq",
     mainUrl: "/docs/api-reference/faq",
     sections: [
       {
         title: "API Usage FAQ",
         id: "api-usage-faq",
         contents: [
           "How to choose and use multiple models in API requests",
           "Troubleshooting model errors and feature limitations",
           "Bug reporting and issue tracking process",
           "Usage tracking across different model types",
           "Staying updated with API changes and new models",
         ],
       },
       {
         title: "Security & Limits FAQ",
         id: "security-limits-faq",
         contents: [
           "Data privacy and model training policies",
           "API request limits and tier-based restrictions",
           "Model comparison and output combination features",
           "Enterprise data isolation options",
         ],
       },
     ],
   },
   {
     title: "Changelogs",
     id: "changelogs",
     mainUrl: "/docs/api-reference/changelogs",
     sections: [
       {
         title: "API changelogs",
         id: "api-change-logs",
         contents: [
           "A detailed log of updates, new features, fixes, and deprecations for our API",
         ],
       },
     ],
   },
   {
     title: "Usage Tiers",
     id: "usage-tiers",
     mainUrl: "/docs/api-reference/limits-tiers",
     sections: [
       {
         title: "Tier System Overview",
         id: "tier-system-overview",
         contents: [
           "Credit-based tier system from Tier 0 (Free) to Tier 4 (Enterprise)",
           "Each tier unlocks higher rate limits and additional features",
           "Tier level determined by total credit purchases over time",
           "Automatic tier benefits applied based on total spending",
         ],
       },
       {
         title: "Rate Limits & Features",
         id: "rate-limits-features",
         contents: [
           "Model-specific rate limits (RPM) increase with higher tiers",
           "Chat models: 10-200 RPM across tiers",
           "Image models: 2-100 RPM across tiers",
           "Audio models: 2-80 RPM across tiers",
           "Video models: 1-60 RPM across tiers",
           "Advanced features like batch input, priority routing, and early access in higher tiers",
         ],
       },
     ],
   },
   {
     title: "Pricing",
     id: "pricing",
     mainUrl: "/docs/api-reference/api-pricing",
     sections: [
       {
         title: "Chat Models Pricing",
         id: "chat-models-pricing",
         contents: [
           "Pricing for chat-based language models with input and output token rates",
           "Per million token pricing for input and output",
           "Price per 1,000 requests for each model",
           "Additional costs for web search-enabled requests with result limits",
         ],
       },
       {
         title: "Image Models Pricing",
         id: "image-models-pricing",
         contents: [
           "Pricing for image generation and editing models",
           "Per image generation costs for standard quality",
           "Capabilities include image-gen and image-edit features",
           "Price per 1,000 requests for each image model",
         ],
       },
       {
         title: "Audio Models Pricing",
         id: "audio-models-pricing",
         contents: [
           "Pricing for audio processing and generation models",
           "Per minute rates for audio input processing",
           "Per second costs for generated audio output",
           "Capabilities include speech-to-text, text-to-speech, and audio generation",
         ],
       },
       {
         title: "Video Models Pricing",
         id: "video-models-pricing",
         contents: [
           "Pricing for video generation and editing models",
           "Per second costs for generated video content",
           "Capabilities include text-to-video and video editing",
           "Price per 1,000 requests for video processing",
         ],
       },
     ],
   },
 ];

const userGuides:ApiReferenceSearchObject[] = [
  {
    title: "Send your first Request",
    id: "first-request",
    mainUrl: "/docs/user-guides/first-request",
    sections: [
      {
        title: "Chat Completion Introduction",
        id: "chat-completion-intro",
        contents: [
          "Making your first chat completion request to interact with multiple AI models through our SDK",
          "Send prompts and receive AI-generated responses from multiple AI models simultaneously"
        ]
      },
      {
        title: "Required Parameters",
        id: "required-parameters",
        contents: [
          "Core request parameters including models array and messages structure",
          "Models parameter allows querying multiple AI models simultaneously like gpt-4o, deepseek-r1, claude-3.5-sonnet",
          "Messages structure includes system behavior settings and user inputs with multimodal support"
        ]
      },
      {
        title: "SDK Implementation",
        id: "sdk-workflow",
        contents: [
          "Initialize the client with your API key",
          "Send properly formatted chat requests",
          "Handle responses containing outputs from all requested models",
          "Available in both Python and Node.js SDKs"
        ]
      },
      {
        title: "Response and Error Handling",
        id: "response-handling",
        contents: [
          "Response includes generated content and metadata (token usage, finish reason)",
          "Error handling for invalid API keys (401), unavailable models (404), and rate limits (429)",
          "Each model reply contains generated content and usage metadata"
        ]
      }
    ]
  },
  {
    title: "Setup Environment",
    id: "setup-environment",
    mainUrl: "/docs/user-guides/setup-environment",
    sections: [
      {
        title: "SDK Introduction",
        id: "sdk-introduction",
        contents: [
          "AlleAI's REST API lets you access multiple AI models like ChatGPT, Claude AI, Grok through a single request",
          "Use Node.js SDK for web apps and real-time use cases",
          "Use Python SDK for scripting, prototyping, and data tasks"
        ]
      },
      {
        title: "API Key Setup",
        id: "api-key-setup",
        contents: [
          "Get access to the API dashboard to create your API key",
          "Create and copy your API key for request authentication",
          "Secure storage and usage of API keys"
        ]
      },
      {
        title: "Package Installation",
        id: "package-installation",
        contents: [
          "Install alle-ai-sdk for Python 3.8+ or Node.js v16+",
          "Python installation: pip install alle-ai-sdk",
          "Node.js installation: npm install alle-ai-sdk",
          "Optional virtual environment setup for Python"
        ]
      },
      {
        title: "Environment Setup",
        id: "environment-setup",
        contents: [
          "Setting up environment variables for API key storage",
          "Create and configure .env file for secure key management",
          "Load API key in Node.js and Python applications",
          "Best practices for API key security and .gitignore configuration"
        ]
      }
    ]
  },
  {
    title: "User Interface Guide",
    id: "user-interface",
    mainUrl: "/docs/user-guides/user-interface",
    sections: [
      {
        title: "Sidebar Overview",
        id: "sidebar-overview",
        contents: [
          "Switch between different modes: Chat, Image Generation, Audio Generation, and Video Generation",
          "Access tools like Chat History, Model Glossary, Changelog, and Model Analysis",
          "Navigate between different creative modes and tools from a central location"
        ]
      },
      {
        title: "Interface Features",
        id: "interface-features",
        contents: [
          "New Chat button to start fresh conversations with multiple AI models",
          "Mode Selector for switching between Chat, Image, Audio, or Video Generation",
          "Model Switcher for selecting and combining multiple AI models for your task",
          "Additional tools for model analytics, glossary, and platform updates"
        ]
      }
    ]
  },
  {
    title: "Platform Overview",
    id: "platform-overview",
    mainUrl: "/docs/user-guides/platform-overview",
    sections: [
      {
        title: "Platform Tasks",
        id: "platform-tasks",
        contents: [
          "Chat & Text: Write, summarize, or translate with DeepSeek, Gemini, Claude",
          "Image Generation: Create art, logos, or photos with Stable Diffusion, DALL·E",
          "Audio & Voice: Synthesize speech, transcribe with ElevenLabs, Whisper",
          "Video & Animation: Generate clips or animate with Runway, Pika"
        ]
      },
      {
        title: "Developer Resources",
        id: "developer-resources",
        contents: [
          "Process Text with AI: Summarize or chat using combined model outputs",
          "Generate Custom Images: Create AI-driven visuals with flexible inputs",
          "Handle Audio & Video: Generate, transcribe, or manipulate media via API",
          "Combine Multi-Model Outputs: Use multiple AI models in one API call"
        ]
      }
    ]
  },
  {
    title: "Audio Generation Guide",
    id: "audio-generation",
    mainUrl: "/docs/user-guides/audio-generation",
    sections: [
      {
        title: "Audio Generation Introduction",
        id: "audio-generation-intro",
        contents: [
          "Generate high-quality audio content using cutting-edge AI models",
          "Create voiceovers, music, sound effects, and speech synthesis",
          "Use multiple audio models simultaneously for diverse outputs",
          "Customize parameters like tone, duration, and style for professional-grade audio"
        ]
      },
      {
        title: "Getting Started",
        id: "getting-started",
        contents: [
          "Step-by-step guide to start generating audio with ALLE-AI",
          "Video walkthrough for audio generation process",
          "Learn to use multiple models for audio generation"
        ]
      },
      {
        title: "Prompt Crafting",
        id: "prompt-crafting",
        contents: [
          "Create effective prompts with genre, mood, instruments specifications",
          "Include duration and style parameters in your prompts",
          "Tips for generating high-quality audio with descriptive prompts",
          "Examples of effective audio generation prompts"
        ]
      }
    ]
  },
  {
    title: "Text Generation Guide",
    id: "text-generation",
    mainUrl: "/docs/user-guides/text-generation",
    sections: [
      {
        title: "Text Generation Introduction",
        id: "text-generation-intro",
        contents: [
          "Unified chat experience with leading models like ChatGPT, Claude, Grok",
          "Explore ideas, build products, and solve complex problems with multiple AI models",
          "Access world's leading generative language models in one platform"
        ]
      },
      {
        title: "Using Text Generation",
        id: "text-generation",
        contents: [
          "Step-by-step guide for generating text using the platform",
          "Select and combine multiple AI models for better results",
          "Compare outputs from different models in one interface"
        ]
      },
      {
        title: "Input Methods",
        id: "providing-inputs",
        contents: [
          "Text prompts with examples of effective and less effective prompts",
          "Voice input capabilities for hands-free operation",
          "File attachment support for additional context",
          "Web search integration for current information"
        ]
      },
      {
        title: "Generation and Features",
        id: "chat-features",
        contents: [
          "Generate responses using multiple AI models simultaneously",
          "Text summarization and combination features",
          "Compare and analyze outputs from different models",
          "Edit and refine generated text with built-in tools"
        ]
      }
    ]
  },
  {
    title: "Image Generation Guide",
    id: "image-generation",
    mainUrl: "/docs/user-guides/image-generation",
    sections: [
      {
        title: "Image Generation Introduction",
        id: "image-generation-intro",
        contents: [
          "Generate images using multiple specialized image generation models",
          "Create everything from photorealistic scenes to abstract art",
          "Fine-tune settings and use single prompts for multiple model outputs"
        ]
      },
      {
        title: "Getting Started",
        id: "getting-started",
        contents: [
          "Step-by-step guide to start generating images with ALLE-AI",
          "Video walkthrough for image generation process",
          "Learn to use multiple models for diverse image outputs"
        ]
      },
      {
        title: "Prompt Crafting",
        id: "prompt-crafting",
        contents: [
          "Create effective prompts with subject, style, and composition specifications",
          "Include lighting, mood/emotion, and color palette in prompts",
          "Example prompts with explanations of why they work",
          "Tips for success: being specific, experimenting, and iterating"
        ]
      }
    ]
  },
  {
    title: "Video Generation Guide",
    id: "video-generation",
    mainUrl: "/docs/user-guides/video-generation",
    sections: [
      {
        title: "Video Generation Introduction",
        id: "video-generation-intro",
        contents: [
          "Transform ideas into dynamic video content using state-of-the-art AI models",
          "Generate animations, realistic scenes, and abstract visuals",
          "Choose from multiple models and adjust parameters like duration and aspect ratio"
        ]
      },
      {
        title: "Video Examples",
        id: "video-examples",
        contents: [
          "See how different models interpret the same video prompt",
          "Compare outputs from Sora AI, Runway ML, and Luma AI",
          "View sample videos with different resolutions and durations"
        ]
      },
      {
        title: "Getting Started",
        id: "getting-started",
        contents: [
          "Step-by-step guide to video generation",
          "Craft effective video prompts with scene composition and motion descriptions",
          "Configure advanced settings like aspect ratio, frame rate, and resolution",
          "Learn about camera motion paths and dynamic lighting effects"
        ]
      },
      {
        title: "Best Practices",
        id: "best-practices",
        contents: [
          "Use sequential prompts for multi-scene videos",
          "Leverage reference images/videos for consistency",
          "Avoid common pitfalls like overloaded prompts",
          "Tips for specifying camera movements and style descriptors"
        ]
      }
    ]
  },
  {
    title: "Usage Tiers",
    id: "usage-tiers",
    mainUrl: "/docs/user-guides/usage-tiers",
    sections: [
      {
        title: "Tier System Overview",
        id: "tier-system-overview",
        contents: [
          "Credit-based tier system from Tier 0 (Free) to Tier 4 (Enterprise)",
          "Each tier unlocks higher rate limits and additional features",
          "Tier level determined by total credit purchases over time",
          "Automatic tier benefits applied based on total spending"
        ]
      },
      {
        title: "Rate Limits & Features",
        id: "rate-limits-features",
        contents: [
          "Model-specific rate limits (RPM) increase with higher tiers",
          "Chat models: 10-200 RPM across tiers",
          "Image models: 2-100 RPM across tiers",
          "Audio models: 2-80 RPM across tiers",
          "Video models: 1-60 RPM across tiers",
          "Advanced features like batch input, priority routing, and early access in higher tiers"
        ]
      }
    ]
  },
  {
    title: "Pricing",
    id: "pricing",
    mainUrl: "/docs/user-guides/pricing",
    sections: [
      {
        title: "Chat Models Pricing",
        id: "chat-models-pricing",
        contents: [
          "Pricing for chat-based language models with input and output token rates",
          "Per million token pricing for input and output",
          "Price per 1,000 requests for each model",
          "Additional costs for web search-enabled requests with result limits"
        ]
      },
      {
        title: "Image Models Pricing",
        id: "image-models-pricing",
        contents: [
          "Pricing for image generation and editing models",
          "Per image generation costs for standard quality",
          "Capabilities include image-gen and image-edit features",
          "Price per 1,000 requests for each image model"
        ]
      },
      {
        title: "Audio Models Pricing",
        id: "audio-models-pricing",
        contents: [
          "Pricing for audio processing and generation models",
          "Per minute rates for audio input processing",
          "Per second costs for generated audio output",
          "Capabilities include speech-to-text, text-to-speech, and audio generation"
        ]
      },
      {
        title: "Video Models Pricing",
        id: "video-models-pricing",
        contents: [
          "Pricing for video generation and editing models",
          "Per second costs for generated video content",
          "Capabilities include text-to-video and video editing",
          "Price per 1,000 requests for video processing"
        ]
      }
    ]
  },
];


export {ApiReferenceSearchData, userGuides};