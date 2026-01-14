import useChatAPIStore from "@/stores/developer-benchmark";


export const requestBody = {
  chat: `
 "models": ["o4-mini", "claude-3-sonnet"],
"messages": [
  {
    "system": [
      {
        "type": "text",
        "text": "You are a helpful assistant.",
        "model_specific": {
          "gpt-4o": "Answer very concisely, always start your response with: 'DEAR'",
          "claude-3-sonnet": "Kindly Begin All Statements with 'According to claude-3-sonnet'",
          "o4-mini": "Beign your responses with Turbo"
        }
      }
    ]
  },
  {
    "user": [
      {
        "type": "text",
        "text": "tell me about photosynthesis?"
      }
    ]
  }
],
"temperature": 0.7,
"max_tokens": 2000,
"top_p": 1,
"frequency_penalty": 0.2,
"presence_penalty": 0.3,
"stream": false
 `,
  imageGen: `
 "models": ["nova-canvas"],
"prompt": "A Futuristic scence",
"model_specific_params": {
  "nova-canvas": {
    "n": 1,
    "height": 1024,
    "width": 1024
  }
},
"n": 1,
"height": 1024,
"width": 1024,
"seed": 8
 `,
  videoGen: `"models": ["nova-reel"],
"prompt": "Talking tom",
"duration": 6,
"loop": false,
"aspect_ratio": "16:9",
"fps": 24,
"dimension": "1280x720",
"resolution": "720p",
"seed": 8`,
};