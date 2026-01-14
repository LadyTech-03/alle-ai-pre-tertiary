// video generation codes
import { convertJsonToPythonFormat } from "../../../utils";

// Types for video operations
export type VideoGenerationConfig = {
  models: string[];
  prompt: string;
  duration: number;
  loop: boolean;
  aspect_ratio: string;
  fps: number;
  dimension: string;
  resolution: string;
  seed: number;
};

export type VideoStatusConfig = {
  requestId: string;
};

// Video Generation Generators
const generateVideoGenerationCurl = (config: VideoGenerationConfig) => {
  const configString = JSON.stringify(config, null, 2);

  return `curl -X POST https://api.alle-ai.com/api/v1/video/generate \\
-H "X-API-KEY: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-H "Accept: application/json" \\
-d '${configString}'`;
};

const generateVideoGenerationPython = (config: VideoGenerationConfig) => {
  const configString = JSON.stringify(config, null, 2);
  const pythonConfigString = convertJsonToPythonFormat(configString);

  return `from alleai.core import AlleAIClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from .env
# Ensure ALLEAI_API_KEY is set in your .env file
api_key = os.getenv("ALLEAI_API_KEY")

# Initialize client with API key
client = AlleAIClient(api_key=api_key)

video = client.video.generate(${pythonConfigString})
print(video)`;
};

const generateVideoGenerationNode = (config: VideoGenerationConfig) => {
  const configString = JSON.stringify(config, null, 2);

  return `require("dotenv").config();
const client = require("alle-ai-sdk");

const alleai = new client.AlleAIClient({
  // Ensure ALLEAI_API_KEY is set in your .env file
  apiKey: process.env.ALLEAI_API_KEY,
});

async function generateVideo() {
  const video = await alleai.video.generate(${configString});
  console.log(video);
}
generateVideo()`;
};

// Video Status Check Generators
const generateVideoStatusCurl = (config: VideoStatusConfig) => {
  const configString = JSON.stringify(config, null, 2);

  return `curl -X POST https://api.alle-ai.com/api/v1/video/status \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${configString}'`;
};

const generateVideoStatusNode = (config: VideoStatusConfig) => {
  const configString = JSON.stringify(config, null, 2);

  return `const { AlleAIClient } = require("alle-ai-sdk");
const alleai = new AlleAIClient({ apiKey: process.env.ALLEAI_API_KEY });

async function getStatus() {
    const status = await alleai.video.get_video_status(${configString});
    console.log(status);
}
getStatus();`;
};

const generateVideoStatusPython = (config: VideoStatusConfig) => {
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

response = client.video.get_video_status(${pythonConfigString})
print(response)`;
};

// Response type examples (kept for reference)
export const immediateVideoResponse = {
  success: true,
  responses: {
    id: "alleai-W",
    object: "ai.videoGeneration",
    created: {
      date: "2025-05-22 17:07:40",
      timezone: "UTC",
    },
    source_models: ["nova-reel", "ray"],
    usage: {
      total_requests: 2,
      total_cost: "0.0000000000",
    },
  },
  usage: {
    total_input_cost: "0.0000000000",
    total_output_cost: "0.0000000000",
    total_cost: "0.0000000000",
  },
};

export {
  // Video Generation exports
  generateVideoGenerationCurl,
  generateVideoGenerationPython,
  generateVideoGenerationNode,
  // Video Status Check exports
  generateVideoStatusCurl,
  generateVideoStatusNode,
  generateVideoStatusPython,
};
