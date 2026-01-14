// image generations
import { convertJsonToPythonFormat } from "../../../utils";

// Types for image operations
export type ImageGenerationConfig = {
  models: string[];
  prompt: string;
  model_specific_params?: {
    [key: string]: {
      n?: number;
      height?: number;
      width?: number;
      [key: string]: any;
    };
  };
  n?: number;
  height?: number;
  width?: number;
  seed?: number;
  style_preset?: string | null;
};

export type ImageEditConfig = {
  models: string[];
  prompt: string;
  image_file: string;
};

// Image Generation Generators
const generateImageGenerationCurl = (config: ImageGenerationConfig) => {
  const configString = JSON.stringify(config, null, 2);
  
  return `# Image Generation
# Replace YOUR_API_KEY with your actual AlleAI API key
curl -X POST https://api.alle-ai.com/api/v1/image/generate \\
-H "X-API-KEY: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-H "Accept: application/json" \\
-d '${configString}'`;
};

const generateImageGenerationPython = (config: ImageGenerationConfig) => {
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

# Initialize client
client = AlleAIClient(api_key=api_key)

# Generate image
image = client.image.generate(${pythonConfigString})

print(image)`;
};

const generateImageGenerationNode = (config: ImageGenerationConfig) => {
  const configString = JSON.stringify(config, null, 2);
  
  return `require("dotenv").config();
const { AlleAIClient } = require("alle-ai-sdk"); // Correctly import the AlleAI class

// Initialize the AlleAI client
const alleai = new AlleAIClient({
  apiKey: process.env.ALLEAI_API_KEY, // Ensure ALLEAI_API_KEY is set in your .env file
});

// Image generation function
async function generateImage() {
  try {
    const image = await alleai.image.generate(${configString});
    console.log(image); // Output the result
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

// Call the function
generateImage();`;
};

// Image Edit Generators
const generateImageEditCurl = (config: ImageEditConfig) => {
  return `# Image Editing
# Note: Image file upload requires multipart/form-data
# Replace YOUR_API_KEY with your actual AlleAI API key
curl -X POST https://api.alle-ai.com/api/v1/image/edit \\
-H "X-API-KEY: YOUR_API_KEY" \\
-H "Content-Type: multipart/form-data" \\
-H "Accept: application/json" \\
-F 'models=${JSON.stringify(config.models)}' \\
-F 'prompt=${config.prompt}' \\
-F 'image_file=@${config.image_file}'`;
};

const generateImageEditPython = (config: ImageEditConfig) => {
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
client = AlleAIClient(api_key=api_key)
edit = client.image.edit(${pythonConfigString})
print(edit)`;
};

const generateImageEditNode = (config: ImageEditConfig) => {
  const configString = JSON.stringify(config, null, 2);
  
  return `require("dotenv").config();
const client = require("alle-ai-sdk");

const alleai = new client.AlleAIClient({
  // Ensure ALLEAI_API_KEY is set in your .env file
  apiKey: process.env.ALLEAI_API_KEY,
});

async function editImage() {
  const edit = await alleai.image.edit(${configString});
  console.log(edit);
}
editImage()`;
};

// Response type example (kept for reference)
const exampleImageResponse = {
  success: true,
  responses: {
    id: "alleai-U",
    object: "ai.imageGeneration",
    created: {
      date: "2025-05-22 10:48:07",
      timezone: "UTC"
    },
    source_models: [
      "nova-canvas",
      "gemini-2-0-flash-image-generation"
    ],
    responses: {
      "nova-canvas": "https://alle-ai-file-server...png",
      "gemini-2-0-flash-image-generation": "https://alle-ai-file-server...png"
    },
    usage: {
      total_requests: 2,
      total_cost: "0.0000000000"
    }
  },
  usage: {
    total_input_cost: "0.0000000000",
    total_output_cost: "0.0000000000",
    total_cost: "0.0000000000"
  }
};

export {
  // Image Generation exports
  generateImageGenerationCurl,
  generateImageGenerationPython,
  generateImageGenerationNode,
  // Image Edit exports
  generateImageEditCurl,
  generateImageEditPython,
  generateImageEditNode,
  exampleImageResponse,
};
