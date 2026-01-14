export interface ModelDetails {
  id: string
  name: string
  provider: string
  description: string
  image: string
  type: "chat" | "image" | "audio" | "video" | "multimodal"
  version: string
  releaseDate: string
  capabilities: string[]
  technicalSpecs: {
    parameters?: string
    contextWindow?: string
    inputCost?: string
    outputCost?: string
    trainingData?: string
    architecture?: string
  }
  benchmarks: {
    name: string
    score: number
    maxScore: number
  }[]
  useCases: {
    title: string
    description: string
  }[]
  limitations: string[]
}

export const models: ModelDetails[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "GPT-4o is a variant of GPT-4 optimized for enhanced performance in specific tasks, providing better reasoning, problem-solving, and context handling.",
    image: "/models/gpt-4o.webp",
    type: "chat",
    version: "4o",
    releaseDate: "2024-05-13",
    capabilities: [
      "Enhanced natural language understanding",
      "Advanced text and image generation",
      "Improved complex problem solving",
      "Better long-term context management",
      "Code generation",
      "Translation",
      "Question answering",
      "Multimodal input and output"
    ],
    technicalSpecs: {
      parameters: "1 Trillion+",
      contextWindow: "16,384 tokens",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2024",
      architecture: "Transformer-based with optimized efficiency"
    },
    benchmarks: [
      { name: "MMLU", score: 90, maxScore: 100 },
      { name: "GSM8K", score: 80, maxScore: 100 },
      { name: "HumanEval", score: 75, maxScore: 100 }
    ],
    useCases: [
      {
        title: "Content Creation",
        description: "Generate high-quality, long-form content, articles, stories, and creative writing with improved coherence over longer texts."
      },
      {
        title: "Programming Assistance",
        description: "Offer advanced code generation, debugging, and comprehensive technical documentation support."
      },
      {
        title: "Multimodal Applications",
        description: "Leverage both text and image inputs for generating detailed creative content, such as generating images based on descriptions and vice versa."
      },
      {
        title: "Educational Support",
        description: "Provide tailored tutoring and problem-solving support across a wide range of subjects, including complex reasoning and detailed explanations."
      }
    ],
    limitations: [
      "May still generate incorrect or biased information in specific scenarios",
      "No real-time or browsing capability",
      "Potential for high computational resource demands in certain tasks"
    ]
  },
  {
    id: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    description: "Gemini 1.5 Pro is a state-of-the-art AI model from Google, designed for advanced natural language processing, multimodal tasks, and high-precision performance in complex problem solving.",
    image: "/models/gemini.webp",
    type: "chat",
    version: "1.5 Pro",
    releaseDate: "2024-05-14",
    capabilities: [
      "Advanced natural language understanding",
      "High-performance multimodal processing",
      "Enhanced reasoning and logical deduction",
      "Complex problem solving and analysis",
      "Image and text generation",
      "Code generation and debugging",
      "Real-time question answering",
      "Contextual conversation with long-term memory"
    ],
    technicalSpecs: {
      parameters: "1.5 Trillion+",
      contextWindow: "32,768 tokens",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2024",
      architecture: "Transformer-based with cross-modal optimization"
    },
    benchmarks: [
      { name: "MMLU", score: 92, maxScore: 100 },
      { name: "GSM8K", score: 85, maxScore: 100 },
      { name: "HumanEval", score: 78, maxScore: 100 }
    ],
    useCases: [
      {
        title: "Content Creation",
        description: "Generate highly coherent, long-form content across various domains, including articles, blogs, and creative fiction, with improved detail and narrative structure."
      },
      {
        title: "Multimodal Applications",
        description: "Create images from text and text from images, facilitating seamless integration of visual and textual content for creative and professional use."
      },
      {
        title: "Complex Problem Solving",
        description: "Solve intricate and domain-specific problems, including advanced math, logic puzzles, and detailed reasoning tasks across multiple fields."
      },
      {
        title: "Programming Assistance",
        description: "Assist with advanced coding tasks, including code generation, bug fixing, optimization, and producing detailed technical documentation."
      },
      {
        title: "Personalized Tutoring",
        description: "Offer tailored educational support, including solving complex academic problems and providing detailed explanations on a wide range of subjects."
      }
    ],
    limitations: [
      "May still generate inaccurate or biased content in certain contexts",
      "Limited real-time interaction capabilities",
      "Requires substantial computational resources for specific tasks"
    ]
  },  
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Claude 3.5 Sonnet, an advanced AI language model optimized for creative writing and natural language processing, featuring improved sentiment analysis and poetry generation.",
    image: "/models/claude-3.webp",
    type: "chat",
    version: "3.5",
    releaseDate: "2024-06-20",
    capabilities: [
      "Sentiment analysis",
      "Creative writing",
      "Poetry generation",
      "Text summarization",
      "Advanced reasoning"
    ],
    technicalSpecs: {
      parameters: "1.5 trillion",
      contextWindow: "8,000 tokens",
      inputCost: "$0.04 / 1K tokens",
      outputCost: "$0.08 / 1K tokens",
      trainingData: "Up to 2024",
      architecture: "Transformer-based"
    },
    benchmarks: [
      { name: "MMLU", score: 88.0, "maxScore": 100 },
      { name: "GSM8K", score: 93.5, "maxScore": 100 },
      { name: "HumanEval", score: 75.0, "maxScore": 100 }
    ],
    useCases: [
      { 
        title: "Poetry Creation", 
        description: "Generating creative, emotionally resonant poetry" 
      },
      { 
        title: "Advanced Text Generation", 
        description: "Sophisticated text generation for various literary and creative purposes" 
      },
      { 
        title: "Sentiment Analysis", 
        description: "Evaluating and understanding sentiment in written text" 
      }
    ],
    limitations: [
      "High cost relative to simpler models",
      "Occasional difficulty with coherence in longer texts",
      "Limited real-time knowledge",
      "Resource-heavy processing"
    ]
  },
  {
    id: "sonar-large-32k-online",
    name: "Sonar Large 32k Online",
    provider: "Perplexity AI",
    description: "Sonar Large 32k Online is a powerful language model optimized for long-context processing, capable of handling large token windows for advanced reasoning, conversation, and complex data analysis in real-time.",
    image: "/models/perplexity-ai.webp",
    type: "chat",
    version: "Large 32k Online",
    releaseDate: "2024",
    capabilities: [
      "Extended context window of 32,768 tokens for detailed long-form reasoning",
      "Real-time online learning with dynamic content adaptation",
      "Enhanced natural language processing",
      "Advanced multimodal integration",
      "High-precision data analysis and complex problem solving",
      "Fast and efficient question answering",
      "Contextual memory and dynamic conversation flow",
      "Customizable API for enterprise integration"
    ],
    technicalSpecs: {
      parameters: "1 Trillion+",
      contextWindow: "32,768 tokens",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2024",
      architecture: "Transformer-based with specialized long-context and dynamic learning optimization"
    },
    benchmarks: [
      { name: "MMLU", score: 89, maxScore: 100 },
      { name: "GSM8K", score: 82, maxScore: 100 },
      { name: "HumanEval", score: 76, maxScore: 100 }
    ],
    useCases: [
      {
        title: "Long-Form Content Creation",
        description: "Generate coherent, high-quality long-form text for articles, reports, and research papers, with a focus on maintaining context over extended content lengths."
      },
      {
        title: "Advanced Data Analysis",
        description: "Analyze large datasets, perform complex calculations, and generate insights from structured or unstructured data across various domains."
      },
      {
        title: "Multimodal Applications",
        description: "Combine text and image inputs for creative tasks, including generating visual content based on textual descriptions and vice versa."
      },
      {
        title: "Real-Time Query Processing",
        description: "Support real-time question answering, providing instant responses to complex queries and personalized recommendations."
      },
      {
        title: "Enterprise Integration",
        description: "Provide customizable solutions for businesses, including API integration, automation of workflows, and tailored enterprise knowledge bases."
      }
    ],
    limitations: [
      "May generate inaccurate or biased content in certain contexts",
      "Relies on high computational resources for real-time processing",
      "Limited to the pre-existing training data and cannot access real-time web information"
    ]
  },  
  {
    id: "gpt-4o-mini",
    name: "GPT 4o-mini",
    provider: "OpenAI",
    description: "GPT-4o Mini is a compact, lightweight variant of GPT-4o designed for faster performance with optimized efficiency for smaller tasks while maintaining high-level reasoning and natural language capabilities.",
    image: "/models/gpt-4o.webp",
    type: "chat",
    version: "4o-mini",
    releaseDate: "2024-07-18",
    capabilities: [
      "Efficient natural language understanding",
      "Quick problem-solving for smaller-scale tasks",
      "Enhanced code generation and debugging",
      "Improved real-time question answering",
      "Streamlined context management for shorter conversations",
      "Basic image processing capabilities",
      "Lightweight model with optimized resource use"
    ],
    technicalSpecs: {
      parameters: "500 Billion+",
      contextWindow: "8,192 tokens",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2024",
      architecture: "Transformer-based with lightweight optimization"
    },
    benchmarks: [
      { name: "MMLU", score: 85, maxScore: 100 },
      { name: "GSM8K", score: 75, maxScore: 100 },
      { name: "HumanEval", score: 70, maxScore: 100 }
    ],
    useCases: [
      {
        title: "Lightweight Content Generation",
        description: "Generate concise content for social media, short-form articles, and quick writing tasks while maintaining clarity and coherence."
      },
      {
        title: "Code Assistance",
        description: "Provide fast, efficient code generation, debugging, and assistance with smaller programming tasks and quick technical queries."
      },
      {
        title: "Real-Time Question Answering",
        description: "Offer quick responses to user queries, providing answers to a wide range of topics with reduced latency."
      },
      {
        title: "Basic Image Processing",
        description: "Perform simple image-related tasks, such as basic description generation or interpreting images based on textual input."
      },
      {
        title: "Personalized Assistance",
        description: "Provide focused, personalized support in various areas, including education, scheduling, and light business applications."
      }
    ],
    limitations: [
      "May not handle highly complex tasks as effectively as larger models",
      "Limited long-term memory and context for extended conversations",
      "Reduced capabilities for advanced multimodal tasks compared to larger versions"
    ]
  }, 
  {
    id: "gemini-1.0-pro",
    name: "Gemini 1.0 Pro",
    provider: "Google DeepMind",
    description: "Gemini 1.0 Pro is Google's most advanced model, featuring highly efficient multimodal understanding and powerful reasoning capabilities for both text and visual data.",
    image: "/models/gemini.webp",
    type: "chat",
    version: "1.0",
    releaseDate: "2024-02-08",
    capabilities: [
      "Multimodal understanding (text + image)",
      "Complex reasoning",
      "Real-time data integration",
      "Knowledge synthesis",
      "Creative and technical content generation"
    ],
    technicalSpecs: {
      parameters: "1.2 trillion",
      contextWindow: "12,000 tokens",
      inputCost: "$0.05 / 1K tokens",
      outputCost: "$0.09 / 1K tokens",
      trainingData: "Up to 2024",
      architecture: "Transformer-based"
    },
    benchmarks: [
      { name: "MMLU", score: 90.0, maxScore: 100 },
      { name: "GSM8K", score: 95.0, maxScore: 100 },
      { name: "HumanEval", score: 80.0, maxScore: 100 }
    ],
    useCases: [
      { 
        title: "Multimodal Analysis", 
        description: "Integrated analysis of text and images for a wide range of applications" 
      },
      { 
        title: "Real-time Data Insights", 
        description: "Extracting real-time insights from ongoing or live data streams" 
      },
      { 
        title: "Creative & Technical Content", 
        description: "Supporting both artistic and engineering project development" 
      }
    ],
    limitations: [
      "Resource-intensive for multimodal tasks",
      "Limited real-time memory",
      "Expensive processing costs",
      "Possible issues with visual context accuracy"
    ]
  }, 
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "Claude 3 Opus is an advanced version of Claude focused on safe and interpretable AI, designed for ethical AI interactions and complex reasoning tasks.",
    image: "/models/claude-3.webp",
    type: "chat",
    version: "3.0 Opus",
    releaseDate: "2024-04-11",
    capabilities: [
      "Ethical AI frameworks",
      "Natural language understanding",
      "Text generation",
      "Code assistance",
      "Complex problem-solving"
    ],
    technicalSpecs: {
      parameters: "TBD",
      contextWindow: "TBD",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2024",
      architecture: "Transformer-based"
    },
    benchmarks: [
      { name: "MMLU", score: 0, maxScore: 100 },
      { name: "GSM8K", score: 0, maxScore: 100 },
      { name: "HumanEval", score: 0, maxScore: 100 }
    ],
    useCases: [
      {
        title: "Safe AI Interactions",
        description: "Designed to engage with humans in ethical, transparent, and responsible ways."
      },
      {
        title: "Complex Problem Solving",
        description: "Capable of solving intricate problems in various fields, especially where ethical considerations are important."
      },
      {
        title: "Programming Assistance",
        description: "Providing help with debugging, code generation, and technical documentation."
      }
    ],
    limitations: [
      "May require extra tuning for specific applications",
      "Ethical focus might limit creative outputs in some cases"
    ]
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    description: "Claude 3 Sonnet is an advanced AI language model from Anthropic, designed for high-performance conversational AI, with an emphasis on ethical reasoning, creative content generation, and human-like interactions in diverse contexts.",
    image: "/models/claude-3.webp",
    type: "chat",
    version: "3 Sonnet",
    releaseDate: "2024-06-20",
    capabilities: [
      "Enhanced conversational ability with ethical reasoning",
      "High-quality text generation for creative and artistic writing",
      "Contextual understanding and memory",
      "Advanced problem-solving and logical reasoning",
      "Complex question answering",
      "Content moderation and filtering",
      "Multimodal text generation with light image processing capabilities"
    ],
    technicalSpecs: {
      parameters: "1 Trillion+",
      contextWindow: "16,384 tokens",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2024",
      architecture: "Transformer-based with alignment-focused safety and transparency"
    },
    benchmarks: [
      { name: "MMLU", score: 88, maxScore: 100 },
      { name: "GSM8K", score: 77, maxScore: 100 },
      { name: "HumanEval", score: 72, maxScore: 100 }
    ],
    useCases: [
      {
        title: "Creative Content Generation",
        description: "Generate high-quality, creative writing, including poetry, stories, scripts, and artistic content, with a focus on maintaining stylistic consistency and emotional depth."
      },
      {
        title: "Conversational AI",
        description: "Offer sophisticated conversational interactions, simulating human-like dialogue with ethical grounding and empathy."
      },
      {
        title: "Problem Solving and Analysis",
        description: "Provide detailed explanations, logical reasoning, and solutions to complex problems, particularly in academic, technical, and philosophical domains."
      },
      {
        title: "Ethical Decision Making",
        description: "Assist in making ethically sound decisions by considering diverse perspectives and potential impacts, useful in both business and personal contexts."
      },
      {
        title: "Content Moderation and Safety",
        description: "Provide content filtering and moderation tools to ensure safe, inclusive, and non-harmful outputs, helping manage digital spaces responsibly."
      }
    ],
    limitations: [
      "May generate biased or inaccurate content in certain contexts despite safety measures",
      "No real-time access to external databases or the web",
      "Limited to the pre-existing knowledge within its training data, which could affect novel or rapidly changing topics"
    ]
  },  
  {
    id: "claude-3-hiaku",
    name: "Claude 3 Hiaku",
    provider: "Anthropic",
    description: "Claude 3 Hiaku is a variant of Claude 3, specifically optimized for creative writing, such as poetry and short-form narratives.",
    image: "/models/claude-3.webp",
    type: "chat",
    version: "3.0 Hiaku",
    releaseDate: "2024",
    capabilities: [
      "Creative writing",
      "Poetry generation",
      "Short-form storytelling",
      "Ethical AI framework"
    ],
    technicalSpecs: {
      parameters: "TBD",
      contextWindow: "TBD",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2024",
      architecture: "Transformer-based"
    },
    benchmarks: [
      { name: "MMLU", score: 0, maxScore: 100 },
      { name: "GSM8K", score: 0, maxScore: 100 },
      { name: "HumanEval", score: 0, maxScore: 100 }
    ],
    useCases: [
      {
        title: "Poetry Creation",
        description: "Specialized in generating poetry and other forms of short, creative writing."
      },
      {
        title: "Short-form Storytelling",
        description: "Generating compelling short stories and other forms of brief creative writing."
      }
    ],
    limitations: [
      "Limited to more artistic and creative applications",
      "Less suited for technical or highly logical tasks"
    ]
  },
  {
    id: "sonar-small-32k-online",
    name: "Sonar Small 32k Online",
    provider: "Perplexity AI",
    description: "Sonar Small 32k Online is a compact and efficient AI model optimized for real-time performance, offering a 32k token context window and a focus on faster, less resource-intensive tasks while maintaining high accuracy and flexibility.",
    image: "/models/perplexity-ai.webp",
    type: "chat",
    version: "Small 32k Online",
    releaseDate: "2024",
    capabilities: [
      "Efficient natural language processing with 32k context window",
      "Real-time question answering with low latency",
      "Multimodal capabilities for basic image processing and text generation",
      "Streamlined conversational flow and context retention",
      "Optimized for small-scale tasks and rapid responses",
      "Contextual analysis of long-form content in shorter bursts"
    ],
    technicalSpecs: {
      parameters: "500 Billion+",
      contextWindow: "32,768 tokens",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2024",
      architecture: "Transformer-based with efficiency-focused optimization"
    },
    "benchmarks": [
      { name: "MMLU", score: 85, maxScore: 100 },
      { name: "GSM8K", score: 75, maxScore: 100 },
      { name: "HumanEval", score: 70, maxScore: 100 }
    ],
    "useCases": [
      {
        title: "Real-Time Interaction",
        description: "Provide real-time, low-latency interaction with users, answering queries and offering conversational engagement with quick response times."
      },
      {
        title: "Basic Multimodal Applications",
        description: "Support simple multimodal tasks such as generating brief descriptions from images or processing text and image input together."
      },
      {
        title: "Short-Form Content Generation",
        description: "Generate concise, focused content for articles, emails, summaries, and reports, maintaining quality despite the smaller-scale model."
      },
      {
        title: "Educational Support",
        description: "Assist in providing quick educational support, such as answering questions or providing short, digestible explanations for complex topics."
      },
      {
        title: "Data Insights and Analysis",
        description: "Perform data analysis on moderate-sized datasets, extracting insights, summarizing reports, and answering data-driven questions in real-time."
      }
    ],
    limitations: [
      "May not handle highly complex or resource-intensive tasks as effectively as larger models",
      "Limited advanced multimodal capabilities compared to more powerful models",
      "Smaller context window may not capture longer, more intricate conversational threads or documents"
    ]
  },  
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    description: "The most advanced language model from OpenAI, featuring enhanced reasoning and broader knowledge.",
    image: "/models/gpt-4.webp",
    type: "chat",
    version: "4.0",
    releaseDate: "2023-03-14",
    capabilities: [
      "Advanced reasoning",
      "Complex problem solving",
      "Multimodal understanding",
      "Creative writing",
      "Technical analysis"
    ],
    technicalSpecs: {
      parameters: "1.76 trillion",
      contextWindow: "8,192 tokens",
      inputCost: "$0.03 / 1K tokens",
      outputCost: "$0.06 / 1K tokens",
      trainingData: "Up to 2023",
      architecture: "Transformer-based"
    },
    benchmarks: [
      { name: "MMLU", score: 86.4, maxScore: 100 },
      { name: "GSM8K", score: 92.0, maxScore: 100 },
      { name: "HumanEval", score: 67.0, maxScore: 100 }
    ],
    useCases: [
      {
        title: "Research Analysis",
        description: "Complex data analysis and research synthesis"
      },
      {
        title: "Advanced Coding",
        description: "Software architecture and system design"
      },
      {
        title: "Creative Projects",
        description: "Sophisticated content creation and editing"
      }
    ],
    limitations: [
      "Higher cost compared to other models",
      "May still produce hallucinations",
      "Limited real-time knowledge",
      "Resource-intensive processing"
    ]
  },  
  {
    id: "chatgpt-3-5",
    name: "ChatGPT 3.5",
    provider: "OpenAI",
    description: "A powerful language model capable of understanding and generating human-like text across a wide range of topics and tasks.",
    image: "/models/gpt-3-5.webp",
    type: "chat",
    version: "3.5",
    releaseDate: "2022-11-30",
    capabilities: [
      "Natural language understanding",
      "Text generation",
      "Translation",
      "Code generation",
      "Question answering"
    ],
    technicalSpecs: {
      parameters: "175 billion",
      contextWindow: "4,096 tokens",
      inputCost: "$0.0015 / 1K tokens",
      outputCost: "$0.002 / 1K tokens",
      trainingData: "Up to 2021",
      architecture: "Transformer-based"
    },
    benchmarks: [
      { name: "MMLU", score: 70.1, maxScore: 100 },
      { name: "GSM8K", score: 57.1, maxScore: 100 },
      { name: "HumanEval", score: 48.1, maxScore: 100 }
    ],
    useCases: [
      {
        title: "Content Creation",
        description: "Generate articles, stories, and creative writing"
      },
      {
        title: "Programming Assistance",
        description: "Help with coding, debugging, and technical documentation"
      },
      {
        title: "Educational Support",
        description: "Tutoring, explanations, and homework help"
      }
    ],
    limitations: [
      "May occasionally generate incorrect information",
      "Limited knowledge cutoff date",
      "Can exhibit biases present in training data",
      "No real-time information or browsing capability"
    ]
  },
  {
    id: "llama-3-70b-instruct",
    name: "Llama 3 70B Instruct",
    provider: "Meta",
    description: "Llama 3 70B Instruct is an instruction-tuned model designed for high accuracy in specific task-oriented NLP, with a large scale for complex applications.",
    image: "/models/meta.webp",
    type: "chat",
    version: "3.0",
    releaseDate: "2024-02-15",
    capabilities: [
      "Task-specific instruction following",
      "High-accuracy natural language understanding",
      "Complex reasoning for specialized tasks",
      "Fast response times",
      "Customizable for specific domains"
    ],
    technicalSpecs: {
      parameters: "70 billion",
      contextWindow: "6,000 tokens",
      inputCost: "$0.02 / 1K tokens",
      outputCost: "$0.04 / 1K tokens",
      trainingData: "Up to 2024",
      architecture: "Transformer-based"
    },
    "benchmarks": [
      { name: "MMLU", score: 85.5, maxScore: 100 },
      { name: "GSM8K", score: 90.0, maxScore: 100 },
      { name: "HumanEval", score: 72.5, maxScore: 100 }
    ],
    "useCases": [
      { title: "Instruction Following", "description": "Performing specific tasks based on detailed instructions" },
      { title: "Technical Problem Solving", "description": "Providing solutions for specialized and technical challenges" },
      { title: "Task Automation", "description": "Optimizing workflows and automating repetitive tasks" }
    ],
    limitations: [
      "Cannot generate creative content without specific instructions",
      "Limited adaptability for open-ended tasks",
      "Occasional misunderstanding of ambiguous instructions"
    ]
  },
  {
    id: "mistral-7b-instruct",
    name: "Mistral 7B Instruct",
    provider: "Mistral AI",
    description: "Mistral 7B Instruct is a highly efficient, instruction-based model designed for precise natural language understanding and task execution with a compact architecture.",
    image: "/models/mistral-ai.webp",
    type: "chat",
    version: "1.0",
    releaseDate: "2023-12-05",
    capabilities: [
      "Task-oriented instruction following",
      "Natural language understanding",
      "Concise answer generation",
      "Efficient memory utilization",
      "Low-latency processing"
    ],
    technicalSpecs: {
      parameters: "7 billion",
      contextWindow: "4,096 tokens",
      inputCost: "$0.01 / 1K tokens",
      outputCost: "$0.02 / 1K tokens",
      trainingData: "Up to 2023",
      architecture: "Transformer-based"
    },
    benchmarks: [
      { name: "MMLU", score: 78.5, maxScore: 100 },
      { name: "GSM8K", score: 85.5, maxScore: 100 },
      { name: "HumanEval", score: 60.5, maxScore: 100 }
    ],
    useCases: [
    { title: "Efficient Task Execution", "description": "Handling specific tasks with minimal resources" },
      { title: "Real-Time Chat Applications", "description": "Providing low-latency responses in interactive applications" },
      { title: "Simple Query Resolution", "description": "Answering direct questions or following brief instructions" }
    ],
    limitations: [
      "Limited context window",
      "Less effective with ambiguous or complex queries",
      "May struggle with creativity or open-ended tasks"
    ]
  },
  {
    id: "perplexity",
    name: "Perplexity",
    provider: "Perplexity AI",
    description: "Perplexity AI is a large-scale language model designed to answer questions by searching the web in real time.",
    image: "/models/perplexity-ai.webp",
    type: "chat",
    version: "N/A",
    releaseDate: "2023",
    capabilities: [
      "Real-time internet search",
      "Text generation",
      "Question answering",
      "Summarization"
    ],
    technicalSpecs: {
      parameters: "Varies",
      contextWindow: "Varies",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Constantly updated (via real-time browsing)"
    },
    benchmarks: [
      { name: "MMLU", score: 0, maxScore: 100 },
      { name: "GSM8K", score: 0, maxScore: 100 },
      { name: "HumanEval", score: 0, maxScore: 100 }
    ],
    useCases: [
      {
        title: "Real-time Information Retrieval",
        description: "Fetching up-to-date data from the web for accurate answers."
      },
      {
        title: "Fact-checking",
        description: "Providing accurate and current data to confirm or refute claims."
      },
      {
        title: "Content Summarization",
        description: "Summarizing large bodies of text for easier consumption."
      }
    ],
    limitations: [
      "May sometimes pull inaccurate or unreliable information",
      "Lacks advanced creative writing abilities compared to other models"
    ]
  },
  {
    id: "llama-2-13b",
    name: "Llama 2 13B",
    provider: "Meta",
    description: "Llama 2 13B is a medium-sized version of Meta's Llama 2 model, designed for a wide range of natural language tasks.",
    image: "/models/meta.webp",
    type: "chat",
    version: "2.0",
    releaseDate: "2023-07",
    capabilities: [
      "Text generation",
      "Translation",
      "Question answering",
      "Summarization",
      "Knowledge extraction"
    ],
    technicalSpecs: {
      parameters: "13 Billion",
      contextWindow: "4,096 tokens",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2023",
      architecture: "Transformer-based"
    },
    benchmarks: [
      { name: "MMLU", score: 58.0, maxScore: 100 },
      { name: "GSM8K", score: 50, maxScore: 100 },
      { name: "HumanEval", score: 30 , maxScore: 100 }
    ],
    useCases: [
      {
        title: "Text Generation",
        description: "Generating text for a wide variety of applications such as articles, reports, and summaries."
      },
      {
        title: "Programming Assistance",
        description: "Helping with code generation, debugging, and problem-solving."
      },
      {
        title: "Question Answering",
        description: "Providing accurate answers based on available data and context."
      }
    ],
    limitations: [
      "Smaller context window compared to GPT-4",
      "May struggle with highly complex or abstract queries"
    ]
  },

  {
    id: "dall-e-3",
    name: "DALL-E 3",
    provider: "OpenAI",
    description: "Advanced image generation model capable of creating highly detailed and accurate images from text descriptions.",
    image: "/models/dall-e.webp",
    type: "image",
    version: "3.0",
    releaseDate: "2023",
    capabilities: [
      "Photorealistic image generation",
      "Artistic style adaptation",
      "Complex scene composition",
      "Text integration",
      "Multiple style outputs"
    ],
    technicalSpecs: {
      inputCost: "$0.040 / image",
      outputCost: "$0.080 / image",
      trainingData: "Up to 2023",
      architecture: "Diffusion-based"
    },
    benchmarks: [
      { name: "FID Score", score: 92.5, maxScore: 100 },
      { name: "CLIP Score", score: 88.3, maxScore: 100 },
      { name: "User Preference", score: 94.0, maxScore: 100 }
    ],
    useCases: [
      {
        title: "Digital Art Creation",
        description: "Generate professional-quality artwork and illustrations"
      },
      {
        title: "Marketing Content",
        description: "Create engaging visual content for marketing campaigns"
      },
      {
        title: "Product Design",
        description: "Rapid prototyping and concept visualization"
      }
    ],
    limitations: [
      "Cannot generate certain types of content",
      "May struggle with specific details",
      "Limited animation capabilities",
      "Output size restrictions"
    ]
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    provider: "Stability AI",
    description: "Stable Diffusion is a text-to-image generation model that creates high-quality images based on textual descriptions.",
    image: "/models/stability-ai.webp",
    type: "image",
    version: "2.x",
    releaseDate: "2023",
    capabilities: [
      "Text-to-image generation",
      "Artistic style transformation",
      "Inpainting and editing"
    ],
    technicalSpecs: {
      parameters: "Varies (up to billions for the largest models)",
      contextWindow: "N/A",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Images + text data"
    },
    benchmarks: [
      { name: "Image Quality", score: 0, maxScore: 0 },
      { name: "Inpainting Accuracy", score: 0, maxScore: 0 }
    ],
    useCases: [
      {
        title: "Art and Design",
        description: "Create stunning artworks, illustrations, and design concepts."
      },
      {
        title: "Concept Art",
        description: "Generate initial sketches and concepts for art projects."
      }
    ],
    limitations: [
      "May struggle with highly abstract or complex concepts",
      "Not suitable for text-based tasks like other models"
    ]
  },
  {
    id: "stable-diffusion-xl",
    name: "Stable Diffusion XL",
    provider: "Stability AI",
    description: "Stable Diffusion XL is a powerful image generation model from Stability AI, designed for creating high-quality, detailed images from text prompts. It offers advanced capabilities for artistic, photorealistic, and creative visual content generation.",
    image: "/models/stability-ai.webp",
    type: "image",
    version: "XL",
    releaseDate: "2024-07-10",
    capabilities: [
      "High-quality text-to-image generation with photorealistic results",
      "Advanced control over image style, composition, and details",
      "Support for complex and multi-step prompts",
      "Image inpainting and editing capabilities",
      "Image-to-image translation and style transfer",
      "Support for diverse artistic styles and genres",
      "Highly customizable output for different creative needs"
    ],
    technicalSpecs: {
      parameters: "2.5 Billion+",
      // "resolution": "Up to 2048x2048 pixels",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2024",
      architecture: "Transformer-based with advanced denoising and conditioning techniques"
    },
    benchmarks: [
      { name: "Image Quality (FID)", score: 8.5, maxScore: 10 },
      { name: "Image Diversity (IS)", score: 7.9, maxScore: 10 },
      { name: "Content Fidelity (CLIP Score)", score: 9.0, maxScore: 10 }
    ],
    useCases: [
      {
        title: "Artistic Image Generation",
        description: "Create stunning, high-resolution artwork from text descriptions, including diverse artistic styles such as impressionism, surrealism, and abstract art."
      },
      {
        title: "Photorealistic Image Generation",
        description: "Generate lifelike, photorealistic images from prompts, useful for creating realistic environments, product designs, and digital media content."
      },
      {
        title: "Image Inpainting and Editing",
        description: "Edit existing images by providing text instructions for modifying specific areas, including image restoration and creative content editing."
      },
      {
        title: "Style Transfer and Image Translation",
        description: "Convert images into different styles or transfer one image's visual characteristics to another, enabling creative flexibility for designers and artists."
      },
      {
        title: "Customizable Visual Content Generation",
        description: "Generate highly customizable images for commercial, creative, and marketing purposes with detailed control over visual elements, color palettes, and composition."
      }
    ],
    limitations: [
      "Generates images based on existing knowledge, potentially producing generic or similar outputs for certain prompts",
      "Limited to the resolution capabilities of the model, may not meet the needs for ultra-high-resolution professional media",
      "Image quality can vary based on the complexity of the prompt or style requested"
    ]
  },  
  {
    id: "titan-image-generator",
    name: "Titan Image Generator",
    provider: "Amazon",
    description: "Titan Image Generator is a cutting-edge AI model developed by Amazin, designed for generating high-quality images from text prompts. Leveraging advanced deep learning techniques, it creates photorealistic, artistic, and creative images suitable for various applications in marketing, entertainment, and design.",
    image: "/models/titan.webp",
    type: "image",
    version: "1.0",
    releaseDate: "2023",
    capabilities: [
      "High-resolution image generation from text prompts",
      "Advanced artistic style control for diverse outputs",
      "Image super-resolution and enhancement",
      "Image-to-image transformations with fine-grained control",
      "Support for photorealistic, fantasy, and conceptual imagery",
      "Seamless generation of complex scenes with multiple elements",
      "Real-time content generation with low latency"
    ],
    technicalSpecs: {
      parameters: "3 Billion+",
      // "resolution": "Up to 2048x2048 pixels",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2024",
      architecture: "Advanced GANs (Generative Adversarial Networks) combined with Transformer-based models"
    },
    benchmarks: [
      { name: "Image Quality (FID)", score: 8.9, maxScore: 10 },
      { name: "Image Diversity (IS)", score: 8.2, maxScore: 10 },
      { name: "Content Fidelity (CLIP Score)", score: 9.1, maxScore: 10 }
    ],
    useCases: [
      {
        title: "Creative Image Generation",
        description: "Generate unique, high-quality images for creative industries such as marketing, advertising, and social media, with flexibility in artistic style and composition."
      },
      {
        title: "Concept Art and Visualization",
        description: "Create conceptual art, environment designs, and illustrations for games, movies, and entertainment projects, with a focus on detailed scene generation and visual storytelling."
      },
      {
        title: "Product Visualization",
        description: "Generate photorealistic renderings of products for e-commerce, prototyping, or promotional materials, enabling quick and accurate visual representation of concepts."
      },
      {
        title: "Image Super-Resolution",
        description: "Enhance the resolution and quality of low-resolution images, ideal for applications requiring detailed upscaling or image refinement."
      },
      {
        title: "Image Editing and Inpainting",
        description: "Edit and refine existing images through image-to-image transformations, including inpainting, object removal, and scene adjustment."
      }
    ],
    limitations: [
      "May generate generic or repetitive images for common prompts",
      "Performance can vary with highly abstract or unconventional prompts",
      "Limited by the resolution ceiling (2048x2048 pixels) for extremely high-quality or professional uses"
    ]
  },

  {
    id: "whisper-ai",
    name: "Whisper AI",
    provider: "OpenAI",
    description: "Whisper AI is a robust automatic speech recognition (ASR) model developed by OpenAI. Capable of transcribing audio into text with high accuracy, it supports multiple languages and dialects. Whisper is designed to work in noisy environments, making it ideal for real-world applications such as transcription, voice commands, and accessibility services.",
    image: "/models/gpt-4.webp",
    type: "audio",
    version: "1.0",
    releaseDate: "2022",
    capabilities: [
      "High-accuracy transcription in multiple languages",
      "Real-time speech recognition with low latency",
      "Noise-robust transcription in challenging environments",
      "Support for both short and long-form audio transcription",
      "Multi-speaker transcription",
      "Automatic language detection and transcription",
      "Preprocessing of noisy or distorted audio for improved accuracy"
    ],
    technicalSpecs: {
      parameters: "400 Million+",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2022",
      architecture: "Transformer-based model trained on diverse multilingual datasets"
    },
    benchmarks: [
      { name: "Word Error Rate (WER)", score: 5.2, maxScore: 10 },
      { name: "Language Support", score: 9.5, maxScore: 10 },
      { name: "Noise Resilience", score: 9.0, maxScore: 10 }
    ],
    useCases: [
      {
        title: "Real-Time Transcription",
        description: "Provide live transcription services for meetings, lectures, webinars, and more, offering accurate text representation of spoken language."
      },
      {
        title: "Multilingual Support",
        description: "Translate and transcribe speech from various languages to text, making it an ideal tool for global communication and content accessibility."
      },
      {
        title: "Speech-to-Text for Accessibility",
        description: "Enhance accessibility by providing real-time captions and transcriptions for individuals with hearing impairments, enabling more inclusive experiences."
      },
      {
        title: "Voice Commands and Control",
        description: "Integrate Whisper AI into voice-activated systems, enabling efficient voice control and interaction for applications ranging from smart homes to virtual assistants."
      },
      {
        title: "Audio Search and Indexing",
        description: "Enable text search and indexing of large audio or video archives by transcribing speech and providing searchable text outputs."
      }
    ],
    limitations: [
      "Transcription accuracy may be lower for non-standard speech, heavy accents, or specialized jargon",
      "May struggle with very long audio segments or poor-quality recordings",
      "Requires a clean environment for optimal transcription performance"
    ]
  },
  {
    id: "musicgen-ai",
    name: "MusicGen AI",
    provider: "Meta",
    description: "MusicGen AI is an advanced generative model by Meta designed to create high-quality music from text prompts. Capable of producing a variety of genres and styles, MusicGen allows for creative exploration in music composition. Its deep learning architecture allows users to input simple text descriptions and generate complex, multi-instrumental pieces of music.",
    image: "/models/meta.webp",
    type: "audio",
    version: "1.0",
    releaseDate: "2023",
    capabilities: [
      "Generate music compositions based on text descriptions",
      "Support for multiple genres including classical, jazz, rock, and electronic",
      "Create melodies, harmonies, and full compositions",
      "Real-time music generation with minimal latency",
      "Multi-instrumental compositions with dynamic arrangement",
      "High-quality sound production suitable for professional music production",
      "Customizable generation parameters for style, tempo, and mood"
    ],
    technicalSpecs: {
      parameters: "1 Billion+",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2023",
      architecture: "Transformer-based model trained on a diverse collection of musical datasets"
    },
    benchmarks: [
      { name: "Melody Coherence", score: 8.7, maxScore: 10 },
      { name: "Genre Adaptation", score: 8.4, maxScore: 10 },
      { name: "Tempo and Rhythm Control", score: 9.0, maxScore: 10 }
    ],
    useCases: [
      {
        title: "Creative Music Composition",
        description: "Generate original music tracks from scratch based on descriptive text prompts, providing an innovative tool for musicians and content creators."
      },
      {
        title: "Film and Game Scoring",
        description: "Create soundtrack music for films, games, and media projects, allowing for flexible composition that fits specific themes, moods, or scenes."
      },
      {
        title: "Jingles and Commercial Music",
        description: "Generate catchy, brand-appropriate music for advertising, commercials, and promotional content."
      },
      {
        title: "Music for Video Content",
        description: "Generate background music for videos, YouTube channels, and social media content, ensuring a unique, royalty-free soundtrack."
      },
      {
        title: "Music Remixing and Arrangement",
        description: "Modify existing compositions by rearranging elements, changing instruments, or adapting the style to suit different genres or preferences."
      }
    ],
    limitations: [
      "Generated music may lack the depth and emotional nuance of human compositions",
      "MusicGen may struggle with complex rhythmic patterns or very specific stylistic requests",
      "Performance may vary when creating highly experimental or niche music genres"
    ]
  },

  {
    id: "sora-ai",
    name: "Sora AI",
    provider: "Sora Labs",
    description: "Sora AI is an advanced generative model that creates highly realistic avatars and animated characters based on simple text descriptions. With a focus on animation, Sora can generate characters, facial expressions, and complex motions suitable for gaming, animation, and virtual reality environments.",
    image: "/models/gpt-4.webp",
    type: "video",
    version: "1.0",
    releaseDate: "2023",
    capabilities: [
      "Create animated avatars and characters from text prompts",
      "Generate realistic facial expressions and gestures",
      "High-quality 3D animation with advanced motion synthesis",
      "Support for a wide range of character designs, from realistic to stylized",
      "Full-body motion capture and animation generation",
      "Integrate with game engines and virtual environments",
      "Real-time animation generation for interactive applications"
    ],
    technicalSpecs: {
      parameters: "2 Billion+",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2023",
      architecture: "Transformer-based models for motion synthesis and avatar generation"
    },
    benchmarks: [
      { name: "Avatar Realism", score: 8.8, maxScore: 10 },
      { name: "Facial Expression Accuracy", score: 9.2, maxScore: 10 },
      { name: "Motion Fluidity", score: 8.5, maxScore: 10 }
    ],
    useCases: [
      {
        title: "Character Creation for Games",
        description: "Generate realistic characters with diverse visual styles, suitable for integration into games, animated films, or virtual worlds."
      },
      {
        title: "Virtual Reality Avatars",
        description: "Create personalized avatars for virtual reality platforms that adapt dynamically to user interactions and real-time scenarios."
      },
      {
        title: "Motion Capture and Animation",
        description: "Generate lifelike animations for characters, reducing the need for manual animation by using text prompts for automated creation."
      },
      {
        title: "Film and Animation Production",
        description: "Generate animated characters for films and animations, saving time in character design and animation processes."
      },
      {
        title: "Interactive Virtual Assistants",
        description: "Generate real-time animated avatars for virtual assistants that can mimic human interactions in a more dynamic and engaging way."
      }
    ],
    limitations: [
      "Generated avatars may have limited diversity in appearance",
      "Performance may degrade when handling very complex or highly detailed prompts",
      "Realism is dependent on the training dataset, so highly stylized characters may vary in quality"
    ]
  },
  {
    id: "runway-gen-2",
    name: "Runway Gen-2",
    provider: "Runway",
    description: "Runway Gen-2 is a powerful generative model designed to produce high-quality video content from text prompts. Combining advanced AI with video processing, it allows for seamless creation of videos, animations, and visual content in various styles, from photorealistic to abstract.",
    image: "/models/runway.webp",
    type: "video",
    version: "2.0",
    releaseDate: "2023",
    capabilities: [
      "Generate video content from text prompts",
      "Create photorealistic and stylized animations",
      "Support for multiple video genres, including short clips, music videos, and experimental art",
      "Seamless video generation with smooth transitions and effects",
      "Ability to modify existing video footage with text-based edits",
      "Support for video-to-video synthesis (i.e., transforming an input video into a new style)",
      "High-level customization for visual effects, color grading, and more"
    ],
    technicalSpecs: {
      parameters: "3 Billion+",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2023",
      architecture: "Combination of generative adversarial networks (GANs) and diffusion models"
    },
    benchmarks: [
      { name: "Video Quality", score: 9.0, maxScore: 10 },
      { name: "Animation Fluidity", score: 8.8, maxScore: 10 },
      { name: "Creativity and Novelty", score: 8.5, maxScore: 10 }
    ],
    useCases: [
      {
        title: "Content Creation for Social Media",
        description: "Create dynamic and engaging video content for social media platforms, from quick clips to high-quality productions."
      },
      {
        title: "Advertising and Marketing",
        description: "Generate customized video ads and promotional material based on brand guidelines or creative briefs."
      },
      {
        title: "Music Video Generation",
        description: "Generate music videos from song lyrics and prompts, producing visually striking and creative visual representations."
      },
      {
        title: "Film and Animation Production",
        description: "Assist in the production of films and animations by automating video synthesis, reducing production times and costs."
      },
      {
        title: "Interactive Video Experiences",
        description: "Create interactive and immersive video content for VR, AR, and web-based platforms."
      }
    ],
    limitations: [
      "Complex scenes may result in less fluid transitions or artifacts",
      "Longer videos may require higher compute resources or longer generation times",
      "Performance can vary with very abstract or unclear prompts"
    ]
  },
  {
    id: "luma-ai-video",
    name: "Luma AI",
    provider: "Luma Labs",
    description: "Luma AI (Video) is a powerful generative model designed to create high-quality, photorealistic video content from text descriptions. This AI can synthesize entire video scenes, generate dynamic environments, animate objects, and control lighting in a fully generative manner, making it ideal for virtual production, cinematic content creation, and immersive media experiences.",
    image: "/models/luma.webp",
    type: "video",
    version: "1.0",
    releaseDate: "2023",
    capabilities: [
      "Generate realistic video content from text prompts",
      "Create dynamic 3D environments with photorealistic lighting and animation",
      "Support for action sequences, object movement, and character animation",
      "High-quality visual effects including smoke, fire, and weather effects",
      "Synthesize full video scenes with varying camera angles and transitions",
      "Real-time video generation for interactive experiences",
      "Generate virtual cinematography with camera control (angles, zoom, focus)"
    ],
    technicalSpecs: {
      parameters: "5 Billion+",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2023",
      architecture: "Generative networks combined with advanced video synthesis and dynamic scene rendering"
    },
    benchmarks: [
      { name: "Video Quality", score: 9.4, maxScore: 10 },
      { name: "Scene Realism", score: 9.1, maxScore: 10 },
      { name: "Action Fluidity", score: 8.8, maxScore: 10 }
    ],
    useCases: [
      {
        title: "Cinematic Production",
        description: "Generate high-quality video content for films, commercials, and music videos, including complex scenes with dynamic action and camera movements."
      },
      {
        title: "Virtual Environments",
        description: "Create immersive virtual environments for VR, AR, and simulation applications, with full control over scene composition and dynamic elements."
      },
      {
        title: "Game Development",
        description: "Automate video cutscenes, trailers, and in-game cinematics by generating realistic, high-quality video from game scripts or concepts."
      },
      {
        title: "Advertising and Marketing",
        description: "Produce customized video ads, product videos, and promotional material with dynamic visual effects and seamless transitions."
      },
      {
        title: "Interactive Media",
        description: "Enable real-time video generation for interactive media experiences like virtual events, live-streaming, and social media content."
      }
    ],
    limitations: [
      "May struggle with generating highly abstract or very specific visual concepts",
      "Video generation can be resource-intensive and time-consuming for long or complex clips",
      "Performance varies with scene complexity and desired level of detail"
    ]
  },
  {
    id: "kling-ai-video",
    name: "Kling AI",
    provider: "Kling Labs",
    description: "Kling AI (Video) is an advanced generative video model designed to create contextually rich, high-quality video content from simple text prompts. With its ability to generate entire video sequences with dynamic environments, actions, and nuanced dialogue, it’s an ideal tool for content creators, filmmakers, and virtual assistants seeking immersive video production.",
    image: "/models/kling.webp",
    type: "video",
    version: "1.0",
    releaseDate: "2023",
    capabilities: [
      "Generate full video sequences from text descriptions",
      "Realistic video synthesis with complex environments and motion",
      "Contextual dialogue generation, including video-based conversation",
      "Ability to generate interactive video content for entertainment or educational purposes",
      "Create dynamic action scenes, character interactions, and cinematic storytelling",
      "Support for multiple video styles, from realistic to stylized animations",
      "Real-time video generation for virtual assistants and media production"
    ],
    technicalSpecs: {
      parameters: "4 Billion+",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2023",
      architecture: "Transformer-based models with video synthesis and advanced language-video generation techniques"
    },
    benchmarks: [
      { name: "Video Realism", score: 9.3, maxScore: 10 },
      { name: "Action Fluidity", score: 8.8, maxScore: 10 },
      { name: "Dialog Contextualization", score: 9.0, maxScore: 10 }
    ],
    useCases: [
      {
        title: "Automated Video Production",
        description: "Generate video content directly from written scripts or text descriptions, ideal for filmmakers, advertisers, and digital content creators."
      },
      {
        title: "Virtual Assistants",
        description: "Create interactive video responses for virtual assistants, integrating voice, actions, and real-time content generation."
      },
      {
        title: "Educational Content",
        description: "Generate instructional videos, explainer videos, or interactive educational content tailored to specific learning objectives."
      },
      {
        title: "Gaming and Entertainment",
        description: "Create in-game cinematics, trailers, and interactive storylines that adapt to user choices or random events."
      },
      {
        title: "Creative Storytelling",
        description: "Generate narrative-driven content with complex character interactions, rich environments, and high-quality visuals."
      }
    ],
    limitations: [
      "Realism may be compromised with highly abstract or complex prompts",
      "Generating full-length, high-quality videos may require significant computational resources",
      "Performance may vary depending on scene complexity and desired motion detail"
    ]
  },
  {
    id: "animate-diff-video",
    name: "Animate Diff (Video)",
    provider: "Stability AI",
    description: "Animate Diff (Video) uses advanced diffusion-based models to generate fluid and lifelike video animations from a sequence of images or a single image. The model excels at producing dynamic movements, object transformations, and scene evolution, making it ideal for enhancing art, marketing visuals, and game assets with motion and cinematic effects.",
    image: "/models/stability-ai.webp",
    type: "video",
    version: "1.0",
    releaseDate: "2023",
    capabilities: [
      "Transform static images into realistic video animations",
      "Generate fluid motion and dynamic transitions between objects and scenes",
      "Support for complex animations with detailed lighting, shadows, and effects",
      "Ability to animate a wide variety of objects, characters, and environments",
      "Create interactive animations for advertising, social media, and video games",
      "Enable object tracking and motion synthesis for more dynamic video outputs",
      "Real-time animation generation suitable for content creators and visual designers"
    ],
    technicalSpecs: {
      parameters: "2 Billion+",
      inputCost: "TBD",
      outputCost: "TBD",
      trainingData: "Up to 2023",
      architecture: "Diffusion model with advanced temporal motion synthesis"
    },
    benchmarks: [
      { name: "Animation Fluidity", score: 9.1, maxScore: 10 },
      { name: "Motion Realism", score: 8.9, maxScore: 10 },
      { name: "Visual Quality", score: 9.3, maxScore: 10 }
    ],
    useCases: [
      {
        title: "Animation from Images",
        description: "Create animations and motion sequences from single or multiple images, ideal for adding movement to still art, product images, or characters."
      },
      {
        title: "Marketing Video Content",
        description: "Enhance marketing materials by turning static product images or promotional visuals into engaging animated videos."
      },
      {
        title: "Interactive Media and Social Media Content",
        description: "Generate dynamic video content for social media platforms, including short animated ads, gifs, and creative clips."
      },
      {
        title: "Game Asset Animation",
        description: "Animate game assets, objects, and characters from concept art or static 3D models to bring them to life in motion."
      },
      {
        title: "Creative Video Effects",
        description: "Apply cinematic effects such as camera movements, slow motion, and lighting changes to enhance video production quality."
      }
    ],
    limitations: [
      "Animation quality can be affected by overly complex or abstract input images",
      "Performance may vary depending on the type of animation requested (e.g., character animations vs environmental effects)",
      "Rendering longer or more complex animations may require high processing power"
    ]
  }
  
  
  
  
  
  
  
  
];