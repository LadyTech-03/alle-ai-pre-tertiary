// Types for different audio operations
import { convertJsonToPythonFormat } from "../../../utils";

export type TTSConfig = {
  models: string[];
  prompt: string;
  voice: string;
  model_specific_params?: {
    [key: string]: {
      voice?: string;
      [key: string]: any;
    };
  };
};

export type STTConfig = {
  models: string[];
  audio_file: string;
  model_specific_params?: {
    [key: string]: any;
  };
};

export type AudioGenConfig = {
  models: string[];
  prompt: string;
};

// Text to Speech Generators
const generateTTSCurl = (config: TTSConfig) => {
  const configString = JSON.stringify(config, null, 2);
  
  return `curl -X POST https://api.alle-ai.com/api/v1/audio/tts \\
-H "X-API-KEY: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-H "Accept: application/json" \\
-d '${configString}'`;
};

const generateTTSPython = (config: TTSConfig) => {
  const configString = JSON.stringify(config, null, 2);
  const pythonConfigString = convertJsonToPythonFormat(configString);
  
  return `from alleai.core import AlleAIClient
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

tts = client.audio.tts(${pythonConfigString})
print(tts)`;
};

const generateTTSNode = (config: TTSConfig) => {
  const configString = JSON.stringify(config, null, 2);
  
  return `require("dotenv").config();
const client = require("alle-ai-sdk");

const alleai = new client.AlleAIClient({
  // Ensure ALLEAI_API_KEY is set in your .env file
  apiKey: process.env.ALLEAI_API_KEY,
});

async function generateTextToSpeech() {
  const tts = await alleai.audio.tts(${configString});
  console.log(tts);
}
generateTextToSpeech()`;
};

// Speech to Text Generators
const generateSTTCurl = (config: STTConfig) => {
  return `curl -X POST https://api.alle-ai.com/api/v1/audio/stt \\
-H "X-API-Key: YOUR_API_KEY" \\
-H "Content-Type: multipart/form-data" \\
-H "Accept: application/json" \\
-F 'models=${JSON.stringify(config.models)}' \\
-F 'audio_file=@${config.audio_file}'`;
};

const generateSTTPython = (config: STTConfig) => {
  const configString = JSON.stringify(config, null, 2);
  const pythonConfigString = convertJsonToPythonFormat(configString);
  
  return `from alleai.core import AlleAIClient
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

speechToText = client.audio.stt(${pythonConfigString})
print(speechToText)`;
};

const generateSTTNode = (config: STTConfig) => {
  const configString = JSON.stringify(config, null, 2);
  
  return `require("dotenv").config();
const client = require("alle-ai-sdk");

const alleai = new client.AlleAIClient({
  // Ensure ALLEAI_API_KEY is set in your .env file
  apiKey: process.env.ALLEAI_API_KEY,
});

async function transcribeAudio() {
  const speechToText = await alleai.audio.stt(${configString});
  console.log(speechToText);
}
transcribeAudio();`;
};

// Audio Generation Generators
const generateAudioGenCurl = (config: AudioGenConfig) => {
  const configString = JSON.stringify(config, null, 2);
  
  return `curl -X POST "https://api.alle-ai.com/api/v1/audio/generate" \\
  -H "X-API-KEY: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${configString}'`;
};

const generateAudioGenNode = (config: AudioGenConfig) => {
  const configString = JSON.stringify(config, null, 2);
  
  return `const client = require("alle-ai-sdk");
require("dotenv").config();

async function generateAudio() {
    // Get API key from .env
    const apiKey = process.env.ALLEAI_API_KEY;

    // Initialize client with API key
    const alleai = new client.AlleAIClient({ apiKey });

    // Make audio generation request
    const response = await alleai.audio.generate(${configString});

    console.log(response);
}

generateAudio();`;
};

const generateAudioGenPython = (config: AudioGenConfig) => {
  const configString = JSON.stringify(config, null, 2);
  const pythonConfigString = convertJsonToPythonFormat(configString);
  
  return `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

# Make audio generation request
response = client.audio.generate(${pythonConfigString})

print(response)`;
};

export {
  // TTS exports
  generateTTSCurl,
  generateTTSPython,
  generateTTSNode,
  // STT exports
  generateSTTCurl,
  generateSTTPython,
  generateSTTNode,
  // Audio Generation exports
  generateAudioGenCurl,
  generateAudioGenNode,
  generateAudioGenPython
};
