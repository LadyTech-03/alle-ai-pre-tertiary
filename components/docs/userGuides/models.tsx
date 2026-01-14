import RenderCode from "@/components/RenderCode";
import { ChevronRight, ChevronLeft } from "lucide-react";
import NavigationContainer from "@/components/NavigationContainer";
const ModelDocumentation = () => {
  const models = [
    { name: "SummaFlow-Pro", context: "200k", type: "Text Summarization" },
    { name: "SummaFlow-Lite", context: "127k", type: "Text Comparison" },
    { name: "NexaSumm-Advanced", context: "127k", type: "Text Summarization" },
    { name: "NexaSumm-Basic", context: "127k", type: "Text Summarization" },
    { name: "SynthAI-Max", context: "200k", type: "Text Summarization" },
    { name: "SynthAI-Mini", context: "127k", type: "Text Summarization" },
  ];

  const pythonCode = `import requests

# API endpoint
url = "https://api.yourservice.com/v1/summarize"

# Your API key
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

# Input text (e.g., a response from ChatGPT)
input_text = """
ChatGPT is a powerful language model developed by OpenAI. It can generate human-like text based on the input it receives. 
However, sometimes the responses can be lengthy and difficult to parse. This is where SummaFlow-Pro comes in, 
providing concise summaries of such responses.
"""

# Payload for the API call
data = {
    "model": "SummaFlow-Pro",
    "text": input_text,
    "max_length": 100  # Optional: Limit the summary length
}

# Make the API request
response = requests.post(url, headers=headers, json=data)

# Print the summarized text
if response.status_code == 200:
    summary = response.json().get("summary")
    print("Summary:", summary)
else:
    print("Error:", response.status_code, response.text)`;

  const curlCode = `curl -X POST "https://api.yourservice.com/v1/summarize" \\
-H "Authorization: Bearer YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "model": "SummaFlow-Pro",
  "text": "ChatGPT is a powerful language model developed by OpenAI. It can generate human-like text based on the input it receives. However, sometimes the responses can be lengthy and difficult to parse. This is where SummaFlow-Pro comes in, providing concise summaries of such responses.",
  "max_length": 100
}'`;

  return (
    <div className="space-y-8 ">
      {/* Introduction Section */}
      <div className="space-y-4 text-muted-foreground">
        <p>
          <strong>Alle-AI</strong> provides a powerful API that allows you to
          compare responses from multiple AI models, based on your selection.
          You can choose from models like <strong>ChatGPT</strong>,{" "}
          <strong>Claude</strong>, <strong>Gemini</strong>, and others, and
          seamlessly compare their outputs to find the best response.
        </p>

        <p>With our platform, you can:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Select from various models</strong>: Choose which AI model
            you want to query (e.g., ChatGPT, Claude, Gemini).
          </li>
          <li>
            <strong>Compare the outputs</strong>: Get responses from each
            selected model and compare them side-by-side.
          </li>
          <li>
            <strong>Make more informed decisions</strong>: Evaluate diverse
            perspectives and select the most accurate or creative response based
            on your needs.
          </li>
        </ul>

        <p>
          The <strong>Alle-AI</strong> API allows you to unlock the power of
          multiple AI models, ensuring you get the most relevant, reliable, and
          creative insights for your application.
        </p>
      </div>

      {/* Supported Models Section */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold ">Alle-AI Models</h2>
        <div className="overflow-x-auto text-muted-foreground">
          <table className="w-full border-collapse">
            <thead className="bg-accent">
              <tr>
                <th className="p-4 text-left">Model Name</th>
                <th className="p-4 text-left">Context Length</th>
                <th className="p-4 text-left">Model Type</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="p-4 font-medium">{model.name}</td>
                  <td className="p-4">{model.context}</td>
                  <td className="p-4">{model.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Capabilities Section */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">What Our Models Can Do</h2>
        <div className="text-muted-foreground">
          <p className="mb-4  ">
            Our models are designed to summarize output responses from various
            AI models like ChatGPT, Claude, Gemini, DeepSeek, and more. They are
            optimized for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Efficient Summarization:</strong> Condense long
              AI-generated responses into concise, meaningful summaries.
            </li>
            <li>
              <strong>Context Retention:</strong> Maintain the core meaning and
              context of the original text, even for inputs up to 200k tokens.
            </li>
            <li>
              <strong>Multi-Model Compatibility:</strong> Work seamlessly with
              outputs from different AI models, ensuring consistent performance
              across platforms.
            </li>
          </ul>
        </div>
      </div>

      {/* Example Use Cases Section */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">Example Use Cases</h2>
        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong>Summarizing AI-Generated Content:</strong> Reduce lengthy AI
            responses into digestible summaries for faster consumption.
          </li>
          <li>
            <strong>Content Aggregation:</strong> Combine outputs from multiple
            AI models into a single, coherent summary.
          </li>
          <li>
            <strong>Research Assistance:</strong> Quickly extract key insights
            from large volumes of AI-generated text.
          </li>
        </ol>
      </div>

      {/* API Examples Section */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Example API Calls</h2>
        <div>
          <h3 className="text-lg font-semibold mb-2">Python Example</h3>
          <RenderCode language="python" code={pythonCode} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">cURL Example</h3>
          <RenderCode language="bash" code={curlCode} />
        </div>
      </div>
      {/* Navigation container aligned with content */}
      <NavigationContainer
        previousTitle="Pricing"
        // previousDescription="Learn about model pricing"
        preUrl=""
        nextTitle="Platform capabilities"
        // nextDesciption="Learn about platform capabilities "
        nextUrl="/docs/user-guides/text-generation"
      />
    </div>
  );
};

export default ModelDocumentation;
