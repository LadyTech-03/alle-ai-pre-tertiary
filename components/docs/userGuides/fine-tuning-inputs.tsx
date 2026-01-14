import React from "react";
import RenderCode from "@/components/RenderCode";
import NavigationContainer from "@/components/NavigationContainer";

const PromptEngineeringGuide = () => {
  // Example JSON data for different use cases
  const getJsonExamples = () => [
    {
      language: "json",
      code: JSON.stringify({
        // Basic prompt structure
        basic_example: {
          system: "You are an AI assistant that provides detailed and accurate explanations.",
          input: "Explain the concept of prompt engineering.",
          models: ["DeepSeek", "Claude", "ChatGPT", "Gemini"],
          prompt: "Provide a clear and concise explanation of prompt engineering, including its importance and best practices."
        },
        // Expected response
        expected_response: {
          response: "Prompt engineering is the process of crafting inputs (prompts) to guide AI models toward generating desired outputs. It involves clarity, context, and iterative refinement to achieve optimal results. Best practices include being specific, providing examples, and tailoring prompts to the strengths of different models."
        }
      }, null, 2)
    },
    {
      language: "json",
      code: JSON.stringify({
        // Advanced prompt structure with multiple components
        advanced_example: {
          system: {
            role: "expert_tutor",
            capabilities: ["detailed_explanations", "examples", "step_by_step_guidance"],
            constraints: ["avoid_technical_jargon", "focus_on_practical_applications"]
          },
          context: {
            audience_level: "intermediate",
            domain: "machine_learning",
            preferred_style: "conversational"
          },
          input: {
            topic: "gradient descent optimization",
            depth: "comprehensive",
            include_examples: true,
            visual_aids: true
          },
          models: ["DeepSeek-Math", "Claude-2", "GPT-4"],
          format_preferences: {
            structure: "hierarchical",
            include_diagrams: true,
            code_snippets: true,
            mathematical_notation: true
          }
        },
        metadata: {
          version: "2.0",
          timestamp: "2024-02-18T14:00:00Z",
          api_version: "v2"
        }
      }, null, 2)
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
        Prompt Engineering Guide
      </h1>

      {/* Introduction */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Introduction to Prompt Engineering
        </h2>
        <p className="text-muted-foreground text-gray-600 dark:text-gray-300">
          Prompt engineering is the process of designing and refining inputs
          (prompts) to guide AI models toward generating desired outputs. With
          the rise of multi-model AI platforms like ours, understanding how to
          craft prompts that work across different models is essential.
        </p>
      </section>

      {/* Key Principles */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Key Principles of Prompt Design
        </h2>
        <ul className="list-disc list-inside text-muted-foreground text-gray-600 dark:text-gray-300 space-y-2">
          <li>
            <strong>Clarity and Specificity</strong>: Clearly define what you
            want the AI to do.
          </li>
          <li>
            <strong>Contextual Framing</strong>: Provide context to help the
            AI understand the task.
          </li>
          <li>
            <strong>Instructional Directives</strong>: Use explicit
            instructions to guide the AI.
          </li>
          <li>
            <strong>Iterative Refinement</strong>: Experiment and refine
            prompts for better results.
          </li>
        </ul>
      </section>

      {/* JSON Examples Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          JSON Examples
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Basic Structure</h3>
            <p className="text-muted-foreground text-gray-600 dark:text-gray-300 mb-4">
              A simple example showing the basic structure of a prompt with system message, input, and model selection:
            </p>
            <RenderCode
              languages={[getJsonExamples()[0]]}
              maxHeight={300}
              className="w-full"
            />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Advanced Structure</h3>
            <p className="text-muted-foreground text-gray-600 dark:text-gray-300 mb-4">
              A more complex example demonstrating advanced prompt structuring with detailed configuration:
            </p>
            <RenderCode
              languages={[getJsonExamples()[1]]}
              maxHeight={400}
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Navigation */}
      <NavigationContainer
        previousTitle="Libraries"
        // previousDescription="Working with file uploads"
        preUrl="/docs/user-guides/libraries"
        nextTitle="Rate Limits"
        // nextDesciption="know about use case limitations"
        nextUrl="/docs/user-guides/limits"
      />
    </div>
  );
};

export default PromptEngineeringGuide;
