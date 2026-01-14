// @ts-nocheck


// file : initial-setup.tsx make your first request
export const makeYourFirstRequest = {
  python: `from alleai.core import AlleAIClient

# Initialize client
client = AlleAIClient(api_key="your_api_key")

# Make a request
response = client.chat.completions({
    "models": ["gpt-4o", "deepseek-r1", "claude-3.5-sonnet"],
    "messages": [
        {"system": "You are a helpful assistant."},
        {
            "user": [
                {"type": "text", "text": "What is photosynthesis?"}
            ]
        }
    ],
    "response_format": {"type": "text"}
})
`,

  javascript: `const client = require("alleai-sdk");

async function runChat() {
    const alleai = new client.AlleAI({
        apiKey: "your-apiKey"
    });

    const chat = await alleai.chat.completions({
        models: ["gpt-4o", "deepseek-r1", "claude-3.5-sonnet"],
        messages: [
            { system: "You are a helpful assistant." },
            {
                user: [{
                    type: "text",
                    text: "What is photosynthesis?"
                }]
            }
        ],
        response_format: { type: "text" }
    });

    console.log(chat);
}

runChat();
`,
};

// file : text-generation.tsx

export const GuidestextGeneration = {
  python: makeYourFirstRequest.python,
  javascript: makeYourFirstRequest.javascript,
};

// audio generations

export const GuidesAudiodeGeneration = {
  python: `from alleai.core import AlleAIClient

# Initialize client
client = AlleAIClient(api_key="[YOUR API KEY HERE]")

# Generate audio
response = client.audio.generate({
    "models": ["audio-model-1", "audio-model-2"],
    "prompt": "Create a relaxing ambient track",
    "duration": 120,    # Duration in seconds
    "genre": "ambient", # Music genre
    "format": "mp3"     # Output format
})

# Access the audio URL and metadata
print("Audio URL:", response.audio_url)
print(f"Generation time: {response.metadata.generation_time}s")`,
  javascript: `const client = require("alleai-sdk");

async function generateAudio() {
    const alleai = new client.AlleAI({
        apiKey: "[YOUR API KEY HERE]"
    });

    const response = await alleai.audio.generate({
        models: ["audio-model-1", "audio-model-2"],
        prompt: "Create a relaxing ambient track",
        duration: 120,      // Duration in seconds
        genre: "ambient",   // Music genre
        format: "mp3"       // Output format
    });

    // Access the audio URL
    console.log("Audio URL:", response.audioUrl);
}

generateAudio();`,
};

// file : image-generation.tsx image generation

export const GuidesImageGeneration = {
  python: `from alleai.core import AlleAIClient

# Initialize client
client = AlleAIClient(api_key="[YOUR API KEY HERE]")

# Generate image
response = client.image.generate({
    "models": ["image-model-1", "image-model-2"],
    "prompt": "A futuristic cityscape at sunset",
    "width": 512,      # Width in pixels
    "height": 512,     # Height in pixels
    "num_images": 1,   # Number of images to generate
    "format": "png"    # Output format
})

# Access the image URL and metadata
print("Image URL:", response.image_url)
print(f"Generation time: {response.metadata.generation_time}s")`,
  javascript: `const client = require("alleai-sdk");

async function generateImage() {
    const alleai = new client.AlleAI({
        apiKey: "[YOUR API KEY HERE]"
    });

    const response = await alleai.image.generate({
        models: ["image-model-1", "image-model-2"],
        prompt: "A futuristic cityscape at sunset",
        width: 512,        // Width in pixels
        height: 512,       // Height in pixels
        num_images: 1,     // Number of images to generate
        format: "png"      // Output format
    });

    // Access the image URL and metadata
    console.log("Image URL:", response.imageUrl);
}

generateImage();`,
};

// file : video-generation.tsx video generation
export const GuidesVideoGeneration = {
  python: `from alleai.core import AlleAIClient

# Initialize client
client = AlleAIClient(api_key="[YOUR API KEY HERE]")

# Generate video
response = client.video.generate({
    "models": ["video-model-1", "video-model-2"],
    "prompt": "A serene beach sunset with waves crashing",
    "output_format": "mp4",    # Output video format
    "duration": 30,            # Duration in seconds
    "aspect_ratio": "16:9"     # Aspect ratio
})

# Access the video URL and metadata
print("Video URL:", response.video_url)
print(f"Generation time: {response.metadata.generation_time}s")`,
  javascript: `const client = require("alleai-sdk");

async function generateVideo() {
    const alleai = new client.AlleAI({
        apiKey: "[YOUR API KEY HERE]"
    });

    const response = await alleai.video.generate({
        models: ["video-model-1", "video-model-2"],
        prompt: "A serene beach sunset with waves crashing",
        output_format: "mp4",      // Output video format
        duration: 30,              // Duration in seconds
        aspect_ratio: "16:9"       // Aspect ratio
    });

    // Access the video URL and metadata
    console.log("Video URL:", response.videoUrl);
}

generateVideo();`,
};


//  attaching files snippet 

