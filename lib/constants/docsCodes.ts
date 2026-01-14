// sdk installation codes
export const installSdk = {
  python: "pip install alleai",
  node: "npm install alleai",
};

// user guides related

export const guideCodes = {
  makeYourFirstRequest: `from alleai.core import AlleAIClient
# initialize the client
client = AlleAIClient(api_key="your_api_key")
# make request to the API
response = client.chat.completion(
    {
        {
            "models": ["gpt-4o", "deepseek-r1", "claude-3.5-sonnet"],
            "messages": [
                {"system": "You are a helpful assistant."},
                {
                    "user": [
                        {"type": "text", "text": "What is photosynthesis?"},
                    ]
                },
            ],
            "response_format": {"type": "text"},
        }
    }
)

  `,
};

export const textGencodes = {
  exampePython: `
    from alleai.core import AlleAIClient
# initialize the client
client = AlleAIClient(api_key="your_api_key")
# make request to the API
response = client.chat.completion(
    {
        {
            "models": ["gpt-4o", "deepseek-r1", "claude-3.5-sonnet"],
            "messages": [
                {"system": "You are a helpful assistant."},
                {
                    "user": [
                        {"type": "text", "text": "What is photosynthesis?"},
                    ]
                },
            ],
            "response_format": {"type": "text"},
        }
    }
)
    `,
  exampleNode: `const alleai = require('alleai');
// Initialize the client
const client = new alleai.Client({ apiKey: 'your_api" });
// Make a request
const response = client.chat.completion({
  models: ["gpt-4o", "deepseek-r1", "claude-3.5-sonnet"],
  messages: [
    { system: "You are a helpful assistant." },
    {
      user: [{ type: "text", text: "What is photosynthesis?" }],
    },
  ],
  response_format: { type: "text" },
})
`,
};

export const imageGencodes = {
  examplePython: `from alleai.core import AlleAIClient
# initialize the client
client = AlleAIClient(api_key="your_api_key")
# make request to the API

response = client.image.generate({
    "models": ["dall-e_3","stable-diffusion"],}),
     "prompt": "A photo of a cat",
    `,
};

// api reference
