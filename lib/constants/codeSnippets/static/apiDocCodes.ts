// completions
const completionsCurlStatic = `# Replace YOUR_API_KEY with your actual AlleAI API key
curl -X POST https://api.alle-ai.com/api/v1/chat/completions \\
  -H "X-API-KEY: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
  "models": [
    "gpt-4o",
    "yi-large"
  ],
  "messages": [
    {
      "user": [
        {
          "type": "text",
          "text": "tell me about lions"
        }
      ]
    }
  ],
  "web_search": false,
  "combination": false,
  "comparison": false,
  "temperature": 0.7,
  "max_tokens": 2000,
  "top_p": 1,
  "frequency_penalty": 0.2,
  "presence_penalty": 0.3,
  "stream": false
}'`;

const completionsPythonStatic = `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
# Ensure ALLEAI_API_KEY is set in your .env file
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)
chat = client.chat.completions({
  "models": [
    "gpt-4o",
    "yi-large"
  ],
  "messages": [
    {
      "user": [
        {
          "type": "text",
          "text": "tell me about lions"
        }
      ]
    }
  ],
  "web_search": false,
  "combination": false,
  "comparison": false,
  "temperature": 0.7,
  "max_tokens": 2000,
  "top_p": 1,
  "frequency_penalty": 0.2,
  "presence_penalty": 0.3,
  "stream": false
})
print(chat)`;

const completionsNodeStatic = `require("dotenv").config();
const client = require("alle-ai-sdk");
const alleai = new client.AlleAIClient({
  apiKey: process.env.ALLEAI_API_KEY
});

// chat completions
async function chatCompletions() {
  const chat = await alleai.chat.completions({
    "models": [
      "gpt-4o",
      "yi-large"
    ],
    "messages": [
      {
        "user": [
          {
            "type": "text",
            "text": "tell me about lions"
          }
        ]
      }
    ],
    "web_search": false,
    "combination": false,
    "comparison": false,
    "temperature": 0.7,
    "max_tokens": 2000,
    "top_p": 1,
    "frequency_penalty": 0.2,
    "presence_penalty": 0.3,
    "stream": false
  });
  console.log(chat);
}
chatCompletions()`;

// combination
const combinationCurlStatic = `# Replace YOUR_API_KEY with your actual AlleAI API key
curl -X POST https://api.alle-ai.com/api/v1/chat/combination \\
  -H "X-API-KEY: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
  "models": [
    "gpt-4o",
    "yi-large"
  ],
  "messages": [
    {
      "user": [
        {
          "type": "text",
          "text": "tell me about lions"
        }
      ]
    }
  ],
  "web_search": false,
  "combination": true,
  "comparison": false,
  "temperature": 0.7,
  "max_tokens": 2000,
  "top_p": 1,
  "frequency_penalty": 0.2,
  "presence_penalty": 0.3,
  "stream": false
}'`;

const combinationPythonStatic = `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
# Ensure ALLEAI_API_KEY is set in your .env file
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)
chat = client.chat.combination({
  "models": [
    "gpt-4o",
    "yi-large"
  ],
  "messages": [
    {
      "user": [
        {
          "type": "text",
          "text": "tell me about lions"
        }
      ]
    }
  ],
  "web_search": false,
  "combination": true,
  "comparison": false,
  "temperature": 0.7,
  "max_tokens": 2000,
  "top_p": 1,
  "frequency_penalty": 0.2,
  "presence_penalty": 0.3,
  "stream": false
})
print(chat)`;

const combinationNodeStatic = `require("dotenv").config();
const client = require("alle-ai-sdk");
const alleai = new client.AlleAIClient({
  apiKey: process.env.ALLEAI_API_KEY
});

// chat combination
async function chatCombination() {
  const chat = await alleai.chat.combination({
    "models": [
      "gpt-4o",
      "yi-large"
    ],
    "messages": [
      {
        "user": [
          {
            "type": "text",
            "text": "tell me about lions"
          }
        ]
      }
    ],
    "web_search": false,
    "combination": true,
    "comparison": false,
    "temperature": 0.7,
    "max_tokens": 2000,
    "top_p": 1,
    "frequency_penalty": 0.2,
    "presence_penalty": 0.3,
    "stream": false
  });
  console.log(chat);
}
chatCombination()`;

// search
const searchCurlStatic = `# Replace YOUR_API_KEY with your actual AlleAI API key
curl -X POST https://api.alle-ai.com/ai/web-search \\
  -H "X-API-KEY: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
  "models": [
    "gpt-4o",
    "yi-large"
  ],
  "messages": [
    {
      "user": [
        {
          "type": "text",
          "text": "tell me about lions"
        }
      ]
    }
  ],
  "web_search": true,
  "combination": false,
  "comparison": false,
  "temperature": 0.7,
  "max_tokens": 2000,
  "top_p": 1,
  "frequency_penalty": 0.2,
  "presence_penalty": 0.3,
  "stream": false
}'`;

const searchPythonStatic = `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
# Ensure ALLEAI_API_KEY is set in your .env file
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)
chat = client.chat.search({
  "models": [
    "gpt-4o",
    "yi-large"
  ],
  "messages": [
    {
      "user": [
        {
          "type": "text",
          "text": "tell me about lions"
        }
      ]
    }
  ],
  "web_search": true,
  "combination": false,
  "comparison": false,
  "temperature": 0.7,
  "max_tokens": 2000,
  "top_p": 1,
  "frequency_penalty": 0.2,
  "presence_penalty": 0.3,
  "stream": false
})
print(chat)`;

const searchNodeStatic = `require("dotenv").config();
const client = require("alle-ai-sdk");
const alleai = new client.AlleAIClient({
  apiKey: process.env.ALLEAI_API_KEY
});

// chat search
async function chatSearch() {
  const chat = await alleai.chat.search({
    "models": [
      "gpt-4o",
      "yi-large"
    ],
    "messages": [
      {
        "user": [
          {
            "type": "text",
            "text": "tell me about lions"
          }
        ]
      }
    ],
    "web_search": true,
    "combination": false,
    "comparison": false,
    "temperature": 0.7,
    "max_tokens": 2000,
    "top_p": 1,
    "frequency_penalty": 0.2,
    "presence_penalty": 0.3,
    "stream": false
  });
  console.log(chat);
}
chatSearch()`;

// comparison
const compareCurlStatic = `# Replace YOUR_API_KEY with your actual AlleAI API key
curl -X POST https://api.alle-ai.com/api/v1/chat/comparison \\
  -H "X-API-KEY: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
  "models": [
    "gpt-4o",
    "yi-large"
  ],
  "messages": [
    {
      "user": [
        {
          "type": "text",
          "text": "tell me about lions"
        }
      ]
    }
  ],
  "web_search": false,
  "combination": false,
  "comparison": true,
  "temperature": 0.7,
  "max_tokens": 2000,
  "top_p": 1,
  "frequency_penalty": 0.2,
  "presence_penalty": 0.3,
  "stream": false
}'`;

const comparePythonStatic = `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
# Ensure ALLEAI_API_KEY is set in your .env file
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)
chat = client.chat.comparison({
  "models": [
    "gpt-4o",
    "yi-large"
  ],
  "messages": [
    {
      "user": [
        {
          "type": "text",
          "text": "tell me about lions"
        }
      ]
    }
  ],
  "web_search": false,
  "combination": false,
  "comparison": true,
  "temperature": 0.7,
  "max_tokens": 2000,
  "top_p": 1,
  "frequency_penalty": 0.2,
  "presence_penalty": 0.3,
  "stream": false
})
print(chat)`;

const compareNodeStatic = `require("dotenv").config();
const client = require("alle-ai-sdk");
const alleai = new client.AlleAIClient({
  apiKey: process.env.ALLEAI_API_KEY
});

// chat comparison
async function chatComparison() {
  const chat = await alleai.chat.comparison({
    "models": [
      "gpt-4o",
      "yi-large"
    ],
    "messages": [
      {
        "user": [
          {
            "type": "text",
            "text": "tell me about lions"
          }
        ]
      }
    ],
    "web_search": false,
    "combination": false,
    "comparison": true,
    "temperature": 0.7,
    "max_tokens": 2000,
    "top_p": 1,
    "frequency_penalty": 0.2,
    "presence_penalty": 0.3,
    "stream": false
  });
  console.log(chat);
}
chatComparison()`;

// image
const imageGenerationCurlStatic = `# Image Generation
# Replace YOUR_API_KEY with your actual AlleAI API key
curl -X POST https://api.alle-ai.com/api/v1/image/generate \
-H "X-API-KEY: YOUR_API_KEY" \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{
  "models": [
    "dall-e-3",
    "grok-2-image"
  ],
  "prompt": "",
  "n": 1,
  "height": 1024,
  "width": 1024,
  "seed": null,
  "style_preset": null,
  "model_specific_params": {}
}'`;

const imageGenerationPythonStatic = `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
# Ensure ALLEAI_API_KEY is set in your .env file
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client
client = AlleAIClient(api_key=api_key)

# Generate image
image = client.image.generate({
  "models": [
    "dall-e-3",
    "grok-2-image"
  ],
  "prompt": "",
  "n": 1,
  "height": 1024,
  "width": 1024,
  "seed": null,
  "style_preset": null,
  "model_specific_params": {}
})
print(image)`;

const imageGenerationNodeStatic = `require("dotenv").config();
const { AlleAIClient } = require("alle-ai-sdk");

// Initialize the AlleAI client
const alleai = new AlleAIClient({
  apiKey: process.env.ALLEAI_API_KEY,
});

// Image generation function
async function generateImage() {
  try {
    const image = await alleai.image.generate({
  "models": [
    "dall-e-3",
    "grok-2-image"
  ],
  "prompt": "",
  "n": 1,
  "height": 1024,
  "width": 1024,
  "seed": null,
  "style_preset": null,
  "model_specific_params": {}
});
    console.log(image);
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateImage();`;

const imageEditCurlStatic = `# Image Editing
# Note: Image file upload requires multipart/form-data
# Replace YOUR_API_KEY with your actual AlleAI API key
curl -X POST https://api.alle-ai.com/api/v1/image/edit \
-H "X-API-KEY: YOUR_API_KEY" \
-H "Content-Type: multipart/form-data" \
-H "Accept: application/json" \
-F 'models=["nova-canvas"]' \
-F 'prompt=make the background blue' \
-F 'image_file=@image.jpg'`;

const imageEditPythonStatic = `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
# Ensure ALLEAI_API_KEY is set in your .env file
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client
client = AlleAIClient(api_key=api_key)

# Edit image
edit = client.image.edit({
  "models": [
    "nova-canvas"
  ],
  "prompt": "make the backgroun blue",
  "image_file": "./image.jpg"
})
print(edit)`;

const imageEditNodeStatic = `require("dotenv").config();
const { AlleAIClient } = require("alle-ai-sdk");

// Initialize the AlleAI client
const alleai = new AlleAIClient({
  apiKey: process.env.ALLEAI_API_KEY,
});

// Image edit function
async function editImage() {
  try {
    const edit = await alleai.image.edit({
  "models": [
    "nova-canvas"
  ],
  "prompt": "make the background blue",
  "image_file": "./image.jpg"
});
    console.log(edit);
  } catch (error) {
    console.error("Error editing image:", error);
  }
}

editImage();`;

// audio
const ttsCurlStatic = `curl -X POST https://api.alle-ai.com/api/v1/audio/tts \
-H "X-API-KEY: YOUR_API_KEY" \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{
  "models": [
    "gpt-4o-mini-tts"
  ],
  "prompt": "Hello! How can I help you today?",
  "voice": "nova",
  "model_specific_params": {}
}'`;

const ttsPythonStatic = `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
# Create a .env file in your project root with: ALLEAI_API_KEY=your_api_key_here
load_dotenv()

# Get API key from .env
# Ensure ALLEAI_API_KEY is set in your .env file
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

tts = client.audio.tts({
  "models": [
    "gpt-4o-mini-tts"
  ],
  "prompt": "Hello! How can I help you today?",
  "voice": "nova",
  "model_specific_params": {}
})
print(tts)`;

const ttsNodeStatic = `require("dotenv").config();
const client = require("alle-ai-sdk");

const alleai = new client.AlleAIClient({
  // Ensure ALLEAI_API_KEY is set in your .env file
  apiKey: process.env.ALLEAI_API_KEY,
});

async function generateTextToSpeech() {
  const tts = await alleai.audio.tts({
  "models": [
    "gpt-4o-mini-tts"
  ],
  "prompt": "Hello! How can I help you today?",
  "voice": "nova",
  "model_specific_params": {}
});
  console.log(tts);
}
generateTextToSpeech()`;

const sttCurlStatic = `curl -X POST https://api.alle-ai.com/api/v1/audio/stt \
-H "X-API-Key: YOUR_API_KEY" \
-H "Content-Type: multipart/form-data" \
-H "Accept: application/json" \
-F 'models=["gpt-4o-transcribe"]' \
-F 'audio_file=@sample.mp3'`;

const sttPythonStatic = `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
# Create a .env file in your project root with: ALLEAI_API_KEY=your_api_key_here
load_dotenv()

# Get API key from .env
# Ensure ALLEAI_API_KEY is set in your .env file
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

speechToText = client.audio.stt({
  "models": [
    "gpt-4o-transcribe"
  ],
  "audio_file": "sample.mp3",
  "model_specific_params": {}
})
print(speechToText)`;

const sttNodeStatic = `require("dotenv").config();
const client = require("alle-ai-sdk");

const alleai = new client.AlleAIClient({
  // Ensure ALLEAI_API_KEY is set in your .env file
  apiKey: process.env.ALLEAI_API_KEY,
});

async function transcribeAudio() {
  const speechToText = await alleai.audio.stt({
  "models": [
    "gpt-4o-transcribe"
  ],
  "audio_file": "sample.mp3",
  "model_specific_params": {}
});
  console.log(speechToText);
}
transcribeAudio();`;

const audioGenCurlStatic = `curl -X POST "https://api.alle-ai.com/api/v1/audio/generate" \
  -H "X-API-KEY: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "models": [
    "lyria"
  ],
  "prompt": "A calm lo-fi beat with soft piano and vinyl crackle, 30 seconds long.\n",
  "model_specific_params": {}
}'`;

const audioGenPythonStatic = `from alleai.core import AlleAIClient
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
  "models": [
    "lyria"
  ],
  "prompt": "A calm lo-fi beat with soft piano and vinyl crackle, 30 seconds long.\n",
  "model_specific_params": {}
})

print(response)`;

const audioGenNodeStatic = `const client = require("alle-ai-sdk");
require("dotenv").config();

async function generateAudio() {
    // Get API key from .env
    const apiKey = process.env.ALLEAI_API_KEY;

    // Initialize client with API key
    const alleai = new client.AlleAIClient({ apiKey });

    // Make audio generation request
    const response = await alleai.audio.generate({
  "models": [
    "lyria"
  ],
  "prompt": "A calm lo-fi beat with soft piano and vinyl crackle, 30 seconds long.\n",
  "model_specific_params": {}
});

    console.log(response);
}

generateAudio();`;

// video
const videoGenerationCurlStatic = `curl -X POST https://api.alle-ai.com/api/v1/video/generate \
-H "X-API-KEY: YOUR_API_KEY" \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{
  "models": [
    "nova-reel",
    "veo-2"
  ],
  "prompt": "a bird singing on a tree",
  "duration": 6,
  "loop": false,
  "aspect_ratio": "16:9",
  "fps": 24,
  "dimension": "1280x720",
  "resolution": "720p",
  "seed": 8,
  "model_specific_params": {}
}'`;

const videoGenerationPythonStatic = `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
# Ensure ALLEAI_API_KEY is set in your .env file
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

video = client.video.generate({
  "models": [
    "nova-reel",
    "veo-2"
  ],
  "prompt": "a bird singing on a tree",
  "duration": 6,
  "loop": False,
  "aspect_ratio": "16:9",
  "fps": 24,
  "dimension": "1280x720",
  "resolution": "720p",
  "seed": 8,
  "model_specific_params": {}
})
print(video)`;

const videoGenerationNodeStatic = `require("dotenv").config();
const client = require("alle-ai-sdk");

const alleai = new client.AlleAIClient({
  // Ensure ALLEAI_API_KEY is set in your .env file
  apiKey: process.env.ALLEAI_API_KEY,
});

async function generateVideo() {
  const video = await alleai.video.generate({
  "models": [
    "nova-reel",
    "veo-2"
  ],
  "prompt": "a bird singing on a tree",
  "duration": 6,
  "loop": false,
  "aspect_ratio": "16:9",
  "fps": 24,
  "dimension": "1280x720",
  "resolution": "720p",
  "seed": 8,
  "model_specific_params": {}
});
  console.log(video);
}
generateVideo()`;

const videoStatusCurlStatic = `curl -X POST https://api.alle-ai.com/api/v1/video/status \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "requestId": "requestId"
  }'`;

const videoStatusPythonStatic = `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

response = client.video.get_video_status(requestId)
print(response)`;

const videoStatusNodeStatic = `const { AlleAIClient } = require("alle-ai-sdk");
const alleai = new AlleAIClient({ apiKey: process.env.ALLEAI_API_KEY });

async function getStatus() {
  const status = await alleai.video.get_video_status(requestId);
  console.log(status);
}
getStatus();`;

// Export all constants in a single object
export {
  // Chat endpoints
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

  // Image endpoints
  imageGenerationCurlStatic,
  imageGenerationPythonStatic,
  imageGenerationNodeStatic,
  imageEditCurlStatic,
  imageEditPythonStatic,
  imageEditNodeStatic,

  // Audio endpoints
  ttsCurlStatic,
  ttsPythonStatic,
  ttsNodeStatic,
  sttCurlStatic,
  sttPythonStatic,
  sttNodeStatic,
  audioGenCurlStatic,
  audioGenPythonStatic,
  audioGenNodeStatic,

  // Video endpoints
  videoGenerationCurlStatic,
  videoGenerationPythonStatic,
  videoGenerationNodeStatic,
  videoStatusCurlStatic,
  videoStatusPythonStatic,
  videoStatusNodeStatic,
};
