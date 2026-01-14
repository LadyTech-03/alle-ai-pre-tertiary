// landing page introductions snipppets

const BaseUrl = "https://api.alle-ai.com/api/v1";
export const apiDocsEndpoints = {
  chat: {
    completion: `${BaseUrl}/chat/completions`,
    search: `${BaseUrl}/ai/web-search`,
    summary: `${BaseUrl}/chat/summary`,
    combinations: `${BaseUrl}/chat/combinations`,
    comparison:`${BaseUrl}/chat/comparison`
  },
  image: {
    generate: `${BaseUrl}/image/generate`,
    edit: `${BaseUrl}/image/edit`,
  },
  audio: {
    tts: `${BaseUrl}/audio/tts`,
    stt: `${BaseUrl}/audio/stt`,
    generate: `${BaseUrl}/audio/generate`,
  },
  video: {
    generate: `${BaseUrl}/video/generate`,
    edit: `${BaseUrl}/video/edit`,
    status: `${BaseUrl}/video/status`,
  },
  BaseUrl: `${BaseUrl}`,
};
export const introCodes = {
  curl: `curl -X POST "[ENDPOINT_URL_HERE]" \
  -H "Authorization: Bearer [YOUR_API_KEY_HERE]" \
  -H "Content-Type: application/json" \
  -d '{
    "models": ["gpt-4o", "claude-3.5-sonnet"],
    "messages": [{"user": [{"type": "text", "text": "Hello!"}]}],
    "response_format": {"type": "text"}
  }'`,
  loadenvPython: `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
api_key = os.getenv("ALLEAI_API_KEY")
`,
  loadEnvCurl: `# Load API key from .env file (requires dotenv-cli or manual export)
source <(cat .env | sed 's/^/export /')

# Use the API key in cURL
curl -H "Authorization: Bearer $ALLEAI_API_KEY" ...`,
  python: `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)
`,
  javascript: `const client = require("alleai-sdk");
require("dotenv").config();

async function chat() {
    // Get API key from .env
    const apiKey = process.env.ALLEAI_API_KEY;

    // Initialize client with API key
    const alleai = new client.AlleAI({ apiKey });
`,
  streamPython: `# Example 1: Stream Individual Model Responses (combination: false)
print("Streaming Individual Model Responses:")
response = client.chat.completions({
    "models": ["gpt-4o", "claude-3.5-sonnet"],
    "messages": [{"user": [{"type": "text", "text": "Tell me a story!"}]}],
    "response_format": {"type": "text"},
    "stream": True,  # Enable streaming
    "combination": False  # No combined output
})
for chunk in response:
    if hasattr(chunk, "model") and hasattr(chunk, "text") and chunk.text:
        print(f"[{chunk.model}]: {chunk.text}", end="", flush=True)
print("\n")  # Newline after stream

# Example 2: Stream Combined Response (combination: true)
# Also includes individual responses, but we stream the combined output
print("Streaming Combined Response:")
response = client.chat.completions({
    "models": ["gpt-4o", "claude-3.5-sonnet"],
    "messages": [{"user": [{"type": "text", "text": "Tell me a story!"}]}],
    "response_format": {"type": "text"},
    "stream": True,  # Enable streaming
    "combination": True  # Include combined output
})
for chunk in response:
    # Assuming 'combined' is a special model value for the merged output
    if hasattr(chunk, "model") and chunk.model == "combined" and hasattr(chunk, "text") and chunk.text:
        print(chunk.text, end="", flush=True)
    # Uncomment to see individual responses too:
    # elif hasattr(chunk, "model") and hasattr(chunk, "text") and chunk.text:
    #     print(f"[{chunk.model}]: {chunk.text}", end="", flush=True)
print("\n")  # Newline after stream`,
  streamJavascript: `
    // Example 1: Stream Individual Model Responses (combination: false)
    console.log("Streaming Individual Model Responses:");
    const response1 = await alleai.chat.completions({
        models: ["gpt-4o", "claude-3.5-sonnet"],
        messages: [{ user: [{ type: "text", text: "Tell me a story!" }] }],
        response_format: { type: "text" },
        stream: true,  // Enable streaming
        combination: false  // No combined output
    });

    for await (const chunk of response1) {
        if (chunk.model && chunk.text) {
            process.stdout.write(\`[\${chunk.model}]: \${chunk.text}\`);
        }
    }
    console.log("");  // Newline after stream

    // Example 2: Stream Combined Response (combination: true)
    console.log("Streaming Combined Response:");
    const response2 = await alleai.chat.completions({
        models: ["gpt-4o", "claude-3.5-sonnet"],
        messages: [{ user: [{ type: "text", text: "Tell me a story!" }] }],
        response_format: { type: "text" },
        stream: true,  // Enable streaming
        combination: true  // Include combined output
    });

    for await (const chunk of response2) {
        if (chunk.model === "combined" && chunk.text) {
            process.stdout.write(chunk.text);
        }
        // Uncomment to see individual responses too:
        // else if (chunk.model && chunk.text) {
        //     process.stdout.write(\`[\${chunk.model}]: \${chunk.text}\`);
        // }
    }
    console.log("");  // Newline after stream
`,
  handleStreamError: `import time

# Example: Streaming with Error Handling
# Handles errors during streaming, including retries for transient issues
print("Streaming with Error Handling:")
max_retries = 3  # Max retry attempts for transient errors
for attempt in range(max_retries):
    try:
        # Make streaming chat completion request with combination
        response = client.chat.completions({
            "models": ["gpt-4o", "claude-3.5-sonnet"],
            "messages": [{"user": [{"type": "text", "text": "Tell me a story!"}]}],
            "response_format": {"type": "text"},
            "stream": True,  # Enable streaming
            "combination": True  # Include combined output
        })

        # Process the stream, handling chunk-level issues
        print("Combined Stream:")
        for chunk in response:
            # Check if chunk is valid before processing
            if not (hasattr(chunk, "model") and hasattr(chunk, "text") and chunk.text):
                print(f"[Warning] Invalid chunk received on attempt {attempt + 1}", flush=True)
                continue  # Skip invalid chunks
            
            # Stream combined output (assuming 'combined' model value)
            if chunk.model == "combined":
                print(chunk.text, end="", flush=True)
            # Optional: Log individual model responses (uncomment if needed)
            # else:
            #     print(f"[{chunk.model}]: {chunk.text}", end="", flush=True)
        
        print("\n")  # Newline after successful stream
        break  # Exit retry loop on success

    except client.APIConnectionError as e:
        # Handle connection failures (e.g., network issues)
        print(f"[Error] Connection failed on attempt {attempt + 1}: {e}", flush=True)
        if attempt < max_retries - 1:
            time.sleep(2)  # Wait 2 seconds before retry
            continue
        else:
            print("[Fatal] Max retries reached for connection error.", flush=True)
            raise  # Give up after max retries

    except client.RateLimitError as e:
        # Handle rate limit exceeded (HTTP 429)
        print(f"[Error] Rate limit hit on attempt {attempt + 1}: {e}", flush=True)
        if attempt < max_retries - 1:
            time.sleep(2 ** attempt)  # Exponential backoff: 2s, 4s, 8s
            continue
        else:
            print("`,
};
export const installSdks = {
  python: `pip install alle-ai-sdk`,
  javascript: `npm install alle-ai-sdk`,
};

// chat completions,summary and others snippets

export const chatCodes = {
  webPython: `from alleai.core import AlleAIClient

# Get API key from .env
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

# Make chat web search request
response = client.chat.search({
    "models": ["gpt-4o", "claude-3.5-sonnet"],
    "messages": [{"user": [{"type": "text", "text": "Hello!"}]}],
    "response_format": {"type": "text"},
    "web_search":true
})

# Print the response
print(response.text)`,
  webJavascript: `const client = require("alleai-sdk");


async function chat() {
    // Get API key from .env
    const apiKey = process.env.ALLEAI_API_KEY;

    // Initialize client with API key
    const alleai = new client.AlleAI({ apiKey });

    // Make chat web search request
    const response = await alleai.chat.search({
        models: ["gpt-4o", "claude-3.5-sonnet"],
        messages: [{ user: [{ type: "text", text: "Hello!" }] }],
        response_format: { type: "text" }
        web_search: true
    });

    // Log the response
    console.log(response.text);
}

chat();`,
  SummaryPython: `from alleai.core import AlleAIClient

# Get API key from .env
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

# Make dedicated summary request
response = client.chat.summary({
    "models": ["gpt-4o", "claude-3.5-sonnet"],
    "messages": [{"user": [{"type": "text", "text": "Hello!"}]}],
    "response_format": {"type": "text"},
    "summary":true
})

# Print the response
print(response.text)`,
  SummaryJavascript: `const client = require("alleai-sdk");
async function chat() {
    // Get API key from .env
    const apiKey = process.env.ALLEAI_API_KEY;

    // Initialize client with API key
    const alleai = new client.AlleAI({ apiKey });

    // Make dedicated summary request
    const response = await alleai.chat.summary({
        models: ["gpt-4o", "claude-3.5-sonnet"],
        messages: [{ user: [{ type: "text", text: "Hello!" }] }],
        response_format: { type: "text" }
        summary: true
    });

    // Log the response
    console.log(response.text);
}

chat();`,
  combinations: `// You can set "combination": true to merge all model responses automatically
// Or pass an array to specify which models to combine for each output type
"combination": [
    {
        "type": "text",
        "models": ["gpt-4o+deepseek-r1+claude-3.5-sonnet"]
    },
    {
        "type": "audio_url",
        "models": ["gpt-4o+claude-3.5-sonnet"]
    }
]`,
  combinationPython: `from alleai.core import AlleAIClient

# Get API key from .env
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

# Make dedicated summary request
response = client.chat.combinations({
    "models": ["gpt-4o", "claude-3.5-sonnet"],
    "messages": [{"user": [{"type": "text", "text": "Hello!"}]}],
    "response_format": {"type": "text"},
    
})

# Print the response
print(response.text)`,
  combinationJavascript: `const client = require("alleai-sdk");
async function chat() {
    // Get API key from .env
    const apiKey = process.env.ALLEAI_API_KEY;

    // Initialize client with API key
    const alleai = new client.AlleAI({ apiKey });

    // Make dedicated summary request
    const response = await alleai.chat.combinations({
        models: ["gpt-4o", "claude-3.5-sonnet"],
        messages: [{ user: [{ type: "text", text: "Hello!" }] }],
        response_format: { type: "text" }
      
    });

    // Log the response
    console.log(response.text);
}

chat();`,
  summary: `// You can set "summary": true to include a summary with all model responses
// Or pass an array to specify which models to summarize for each output type
"summary": [
    {
        "type": "text",
        "models": ["gpt-4o", "deepseek-r1", "claude-3.5-sonnet"]
    },
    {
        "type": "audio_url",
        "models": ["gpt-4o", "claude-3.5-sonnet"]
    }
]`,
};

// image generation snippets

export const imageGenCodes = {
  exampleBody: `{
  "models": ["Stable-Diffusion", "DALL-E"],
  "prompt": "A serene mountain landscape at sunset",
  "width": 1024,
  "height": 768,
  "quality": "hd"
}`,
  python: `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

# Make image generation request
response = client.image.generate({
    "models": ["Stable-Diffusion", "DALL-E"],
    "prompt": "A serene mountain landscape at sunset",
    "width": 1024,
    "height": 768,
    "quality": "hd"
})

# Print the response 
print(response)`,
  javascript: `const client = require("alleai-sdk");
require("dotenv").config();

async function generateImage() {
    // Get API key from .env
    const apiKey = process.env.ALLEAI_API_KEY;

    // Initialize client with API key
    const alleai = new client.AlleAI({ apiKey });

    // Make image generation request
    const response = await alleai.image.generate({
        models: ["Stable-Diffusion", "DALL-E"],
        prompt: "A serene mountain landscape at sunset",
        width: 1024,
        height: 768,
        quality: "hd"
    });

    // Log the response 
    console.log(response);
}

generateImage();`,
  curl: `curl -X POST "<ENDPOINT_URL>" \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "models": ["Stable-Diffusion", "DALL-E"],
    "prompt": "A serene mountain landscape at sunset",
    "width": 1024,
    "height": 768,
    "quality": "hd"
  }'`,
  editcurl: `curl -X POST "<ENDPOINT_URL>" \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "imageUrl",
    "file_path": "https://example.com/images/mountain.png",
    "models": ["Stable-Diffusion", "DALL-E"],
    "prompt": "Add a bright blue sky and fluffy clouds",
    "quality": "hd"
  }'`,
  editPython: `from alleai.core import AlleAIClient
from dotenv import load_dotenv

client = AlleAIClient(api_key=api_key)

# Make image edit request
response = client.image.edit({
    "type": "imageUrl",
    "file_path": "https://example.com/images/mountain.png",
    "models": ["Stable-Diffusion", "DALL-E"],
    "prompt": "Add a bright blue sky and fluffy clouds",
    "quality": "hd"
})


print(response)`,
  editJavascript: `const client = require("alleai-sdk");
require("dotenv").config();

async function editImage() {
    // Get API key from .env
    const apiKey = process.env.ALLEAI_API_KEY;

    // Initialize client with API key
    const alleai = new client.AlleAI({ apiKey });

    // Make image edit request
    const response = await alleai.image.edit({
        type: "imageUrl",
        file_path: "https://example.com/images/mountain.png",
        models: ["Stable-Diffusion", "DALL-E"],
        prompt: "Add a bright blue sky and fluffy clouds",
        quality: "hd"
    });

    console.log(response);
}

editImage();`,
  editBody: `{
    "type": "imageUrl",
    "file_path": "https://example.com/images/mountain.png",
    "models": ["Stable-Diffusion", "DALL-E"],
    "prompt": "Add a bright blue sky and fluffy clouds",
    "quality": "hd"
}`,
};

// audio generation snippets
export const audioGenCodes = {
  curl: `curl -X POST "<ENDPOINT_URL>" \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "models": ["ElevenLabs", "Google-TTS"],
    "text": "Welcome to the world of audio generation!",
    "voice_id": "alloy",
    "speed": 1.2,
    "format": "mp3"
  }'`,
  examplBody: `{
  "models": ["ElevenLabs", "Google-TTS"],
  "text": "Welcome to the world of audio generation!",
  "voice_id": "alloy",
  "speed": 1.2,
  "format": "mp3"
}`,
  python: `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

# Make TTS request
response = client.audio.tts({
    "models": ["ElevenLabs", "Google-TTS"],
    "text": "Welcome to the world of audio generation!",
    "voice_id": "alloy",
    "speed": 1.2,
    "format": "mp3"
})

# Print the response (adjust based on actual response structure)
print(response)`,
  javascritp: `const client = require("alleai-sdk");
require("dotenv").config();

async function generateTTS() {
    // Get API key from .env
    const apiKey = process.env.ALLEAI_API_KEY;

    // Initialize client with API key
    const alleai = new client.AlleAI({ apiKey });

    // Make TTS request
    const response = await alleai.audio.tts({
        models: ["ElevenLabs", "Google-TTS"],
        text: "Welcome to the world of audio generation!",
        voice_id: "alloy",
        speed: 1.2,
        format: "mp3"
    });

    // Log the response (adjust based on actual response structure)
    console.log(response);
}

generateTTS();`,
  transcribeCurl: `curl -X POST "<ENDPOINT_URL>" \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "models": ["Whisper", "DeepSpeech"],
    "audioUrl": "https://example.com/audio/sample.mp3",
    "language": "en-US",
    "output_format": "text"
  }'`,
  transcribebody: `{
  "models": ["Whisper", "DeepSpeech"],
  "audioUrl": "https://example.com/audio/sample.mp3",
  "language": "en-US",
  "output_format": "text"
}`,
  transcribePython: `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

# Make STT request
response = client.audio.stt({
    "models": ["Whisper", "DeepSpeech"],
    "audioUrl": "https://example.com/audio/sample.mp3",
    "language": "en-US",
    "output_format": "text"
})

print(response)`,
  transcribeJavascript: `const client = require("alleai-sdk");
require("dotenv").config();

async function transcribeAudio() {
    // Get API key from .env
    const apiKey = process.env.ALLEAI_API_KEY;

    // Initialize client with API key
    const alleai = new client.AlleAI({ apiKey });

    // Make STT request
    const response = await alleai.audio.stt({
        models: ["Whisper", "DeepSpeech"],
        audioUrl: "https://example.com/audio/sample.mp3",
        language: "en-US",
        output_format: "text"
    });

    console.log(response);
}

transcribeAudio();`,
  generatebody: `{
  "models": ["Suno", "MusicGen"],
  "prompt": "A cheerful jazz tune with a fast tempo",
  "duration": 30,
  "genre": "jazz",
  "format": "mp3"
}`,
  generatePython: `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

# Make audio generation request
response = client.audio.generate({
    "models": ["Suno", "MusicGen"],
    "prompt": "A cheerful jazz tune with a fast tempo",
    "duration": 30,
    "genre": "jazz",
    "format": "mp3"
})

print(response)`,
  generateJavascript: `const client = require("alleai-sdk");
require("dotenv").config();

async function generateAudio() {
    // Get API key from .env
    const apiKey = process.env.ALLEAI_API_KEY;

    // Initialize client with API key
    const alleai = new client.AlleAI({ apiKey });

    // Make audio generation request
    const response = await alleai.audio.generate({
        models: ["Suno", "MusicGen"],
        prompt: "A cheerful jazz tune with a fast tempo",
        duration: 30,
        genre: "jazz",
        format: "mp3"
    });

    console.log(response);
}

generateAudio();`,
  generateCurl: `curl -X POST "<ENDPOINT_URL>" \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "models": ["Suno", "MusicGen"],
    "prompt": "A cheerful jazz tune with a fast tempo",
    "duration": 30,
    "genre": "jazz",
    "format": "mp3"
  }'`,
};
// video generation snippets

export const videoGenCodes = {
  body: `{
  "models": ["RunwayML", "Sora"],
  "prompt": "A futuristic cityscape at sunset with flying cars",
  "output_format": "mp4",
  "duration": 15,
  "aspect_ratio": "16:9"
}`,
  curl: `curl -X POST "<ENDPOINT_URL>" \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "models": ["RunwayML", "Sora"],
    "prompt": "A futuristic cityscape at sunset with flying cars",
    "output_format": "mp4",
    "duration": 15,
    "aspect_ratio": "16:9"
  }'`,
  python: `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

# Make video generation request
response = client.video.generate({
    "models": ["RunwayML", "Sora"],
    "prompt": "A futuristic cityscape at sunset with flying cars",
    "output_format": "mp4",
    "duration": 15,
    "aspect_ratio": "16:9"
})

print(response)`,
  javascript: `const client = require("alleai-sdk");
require("dotenv").config();

async function generateVideo() {
    // Get API key from .env
    const apiKey = process.env.ALLEAI_API_KEY;

    // Initialize client with API key
    const alleai = new client.AlleAI({ apiKey });

    // Make video generation request
    const response = await alleai.video.generate({
        models: ["RunwayML", "Sora"],
        prompt: "A futuristic cityscape at sunset with flying cars",
        output_format: "mp4",
        duration: 15,
        aspect_ratio: "16:9"
    });

    console.log(response);
}

generateVideo();`,
  editBody: `{
  "models": ["RunwayML", "Kaiber"],
  "prompt": "Enhance the colors and add a slow-motion effect",
  "videoUrl": "https://example.com/videos/sample.mp4"
}`,
  editPython: `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

# Make video edit request
response = client.video.edit({
    "models": ["RunwayML", "Kaiber"],
    "prompt": "Enhance the colors and add a slow-motion effect",
    "videoUrl": "https://example.com/videos/sample.mp4"
})

print(response)`,
  editJavascript: `const client = require("alleai-sdk");
require("dotenv").config();

async function editVideo() {
    // Get API key from .env
    const apiKey = process.env.ALLEAI_API_KEY;

    // Initialize client with API key
    const alleai = new client.AlleAI({ apiKey });

    // Make video edit request
    const response = await alleai.video.edit({
        models: ["RunwayML", "Kaiber"],
        prompt: "Enhance the colors and add a slow-motion effect",
        videoUrl: "https://example.com/videos/sample.mp4"
    });

    console.log(response);
}

editVideo();`,
  editCurl: `curl -X POST "<ENDPOINT_URL>" \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "models": ["RunwayML", "Kaiber"],
    "prompt": "Enhance the colors and add a slow-motion effect",
    "videoUrl": "https://example.com/videos/sample.mp4"
  }'`,
};
