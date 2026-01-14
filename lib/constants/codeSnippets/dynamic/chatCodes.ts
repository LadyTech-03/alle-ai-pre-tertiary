// chat completions codes
import { convertJsonToPythonFormat } from "../../../utils";

export type ChatConfig = {
  models: string[];
  messages: Array<{
    system?: Array<{ type: string; text: string }>;
    user?: Array<{ type: string; text: string }>;
    assistant?: Array<{ type: string; text: string }>;
  }>;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  stream: boolean;
};

const generateCompletionsCurl = (config: ChatConfig) => {
  const configString = JSON.stringify(config, null, 2);

  return `# Replace YOUR_API_KEY with your actual AlleAI API key
curl -X POST https://api.alle-ai.com/api/v1/chat/completions \\
  -H "X-API-KEY: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '${configString}'`;
};

const generateCompletionsPython = (config: ChatConfig) => {
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
chat = client.chat.completions(${pythonConfigString})
print(chat)`;
};

const generateCompletionsNode = (config: ChatConfig) => {
  const configString = JSON.stringify(config, null, 2);

  return `require("dotenv").config();
const client = require("alle-ai-sdk");
const alleai = new client.AlleAIClient({
  apiKey: process.env.ALLEAI_API_KEY
});

// chat completions
async function chatCompletions() {
  const chat = await alleai.chat.completions(${configString});
  console.log(chat);
}
chatCompletions()`;
};

// completions Response

const chatCompletionsResponse = {
  success: {
    value: true,
    description:
      "Indicates if the API call was successful. Use for conditional rendering (e.g., show error if false).",
  },
  created: {
    value: {
      date: "2025-05-11 01:04:07",
      timezone: "UTC",
    },
    description:
      "Timestamp of when the response was generated. Render as a formatted date (e.g., 'May 11, 2025, 1:04 AM UTC').",
    subfields: {
      date: {
        description: "Date and time in YYYY-MM-DD HH:MM:SS format.",
      },
      timezone: {
        description: "Timezone of the timestamp (e.g., 'UTC').",
      },
    },
  },
  source_models: {
    value: ["o4-mini", "claude-3-sonnet", "gpt-4o"],
    description:
      "List of models used to generate responses. Render as a summary (e.g., 'Models: o4-mini, claude-3-sonnet, gpt-4o').",
  },
  modelResponses: {
    value: [
      {
        model: {
          value: "o4-mini",
          description:
            "Model name. Render as a label (e.g., 'o4-mini Response').",
        },
        content: {
          value: "Text response from the o4-mini model",
          description:
            "Response text from the model. Render as the main content in a card or chat bubble.",
        },
        finish_reason: {
          value: "stop",
          description:
            "Reason the model stopped (e.g., 'stop', 'end_turn'). Optionally render in a details section or tooltip.",
        },
        total_tokens: {
          value: 842,
          description:
            "Total tokens used (prompt + completion). Render in a usage summary (e.g., '842 tokens').",
        },
      },
      {
        model: {
          value: "claude-3-sonnet",
          description:
            "Model name. Render as a label (e.g., 'claude-3-sonnet Response').",
        },
        content: {
          value: "Text response from the claude-3-sonnet model",
          description:
            "Response text from the model. Render as the main content in a card or chat bubble.",
        },
        finish_reason: {
          value: "end_turn",
          description:
            "Reason the model stopped (e.g., 'stop', 'end_turn'). Optionally render in a details section or tooltip.",
        },
        total_tokens: {
          value: 459,
          description:
            "Total tokens used (prompt + completion). Render in a usage summary (e.g., '459 tokens').",
        },
      },
      {
        model: {
          value: "gpt-4o",
          description:
            "Model name. Render as a label (e.g., 'gpt-4o Response').",
        },
        content: {
          value: "Text response from the gpt-4o model",
          description:
            "Response text from the model. Render as the main content in a card or chat bubble.",
        },
        finish_reason: {
          value: "stop",
          description:
            "Reason the model stopped (e.g., 'stop', 'end_turn'). Optionally render in a details section or tooltip.",
        },
        total_tokens: {
          value: 453,
          description:
            "Total tokens used (prompt + completion). Render in a usage summary (e.g., '453 tokens').",
        },
      },
    ],
    description:
      "Array of responses from each model. Map to render individual response cards or sections.",
  },
  usage: {
    value: {
      total_requests: 3,
      total_cost: "0.0000000000",
    },
    description:
      "Usage summary for the request. Render as a footer (e.g., 'Queried 3 models, Cost: $0.00').",
    subfields: {
      total_requests: {
        description: "Number of models queried.",
      },
      total_cost: {
        description:
          "Total cost of the request (as a string). Format as currency for display (e.g., '$0.00').",
      },
    },
  },
};

const chatRequestbody = ``;

const chatSearchCurl = `curl -X POST "https://api.alle-ai.com/ai/web-search" \

  -H "X-API-Key: YOUR_API_KEY" \

  -H "Content-Type: application/json" \

  -d '{
    "models": ["gpt-4o", "claude-3.5-sonnet"],
    "messages": [{"user": [{"type": "text", "text": "Hello!"}]}],
    "response_format": {"type": "text"}
  }'`;

const chatCombinations = ``;
const chatSearch = ``;
const chatSummary = ``;
// combination codes
const generateCombinationCurl = (config: ChatConfig) => {
  const configString = JSON.stringify(config, null, 2);

  return `# Replace YOUR_API_KEY with your actual AlleAI API key
curl -X POST https://api.alle-ai.com/api/v1/chat/combination \\
  -H "X-API-KEY: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '${configString}'`;
};

const generateCombinationPython = (config: ChatConfig) => {
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
chat = client.chat.combination(${pythonConfigString})
print(chat)`;
};

const generateCombinationNode = (config: ChatConfig) => {
  const configString = JSON.stringify(config, null, 2);

  return `require("dotenv").config();
const client = require("alle-ai-sdk");
const alleai = new client.AlleAIClient({
  apiKey: process.env.ALLEAI_API_KEY
});

// chat combination
async function chatCombination() {
  const chat = await alleai.chat.combination(${configString});
  console.log(chat);
}
chatCombination()`;
};

// search codes
const generateSearchCurl = (config: ChatConfig) => {
  const configString = JSON.stringify(config, null, 2);

  return `# Replace YOUR_API_KEY with your actual AlleAI API key
curl -X POST https://api.alle-ai.com/api/v1/chat/search \\
  -H "X-API-KEY: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '${configString}'`;
};

const generateSearchPython = (config: ChatConfig) => {
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
chat = client.chat.search(${pythonConfigString})
print(chat)`;
};

const generateSearchNode = (config: ChatConfig) => {
  const configString = JSON.stringify(config, null, 2);

  return `require("dotenv").config();
const client = require("alle-ai-sdk");
const alleai = new client.AlleAIClient({
  apiKey: process.env.ALLEAI_API_KEY
});

// chat search
async function chatSearch() {
  const chat = await alleai.chat.search(${configString});
  console.log(chat);
}
chatSearch()`;
};

//was summary later changed to comparison instead codes
const generateSummaryCurl = (config: ChatConfig) => {
  const configString = JSON.stringify(config, null, 2);

  return `# Replace YOUR_API_KEY with your actual AlleAI API key
curl -X POST https://api.alle-ai.com/api/v1/chat/comparison \\
  -H "X-API-KEY: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '${configString}'`;
};

const generateSummaryPython = (config: ChatConfig) => {
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
chat = client.chat.comparison(${pythonConfigString})
print(chat)`;
};

const generateSummaryNode = (config: ChatConfig) => {
  const configString = JSON.stringify(config, null, 2);

  return `require("dotenv").config();
const client = require("alle-ai-sdk");
const alleai = new client.AlleAIClient({
  apiKey: process.env.ALLEAI_API_KEY
});

// chat comparison
async function chatComparison() {
  const chat = await alleai.chat.comparison(${configString});
  console.log(chat);
}
chatComparison()`;
};

export {
  generateCompletionsCurl,
  generateCompletionsPython,
  generateCompletionsNode,
  generateCombinationCurl,
  generateCombinationPython,
  generateCombinationNode,
  generateSearchCurl,
  generateSearchPython,
  generateSearchNode,
  generateSummaryCurl,
  generateSummaryPython,
  generateSummaryNode,
  chatCompletionsResponse,
  chatSearchCurl,
};
