import React from "react";
import { AlertTriangle, Scale, BrainCircuit, Layers, CheckCircle2, Fingerprint } from "lucide-react";

const multiModelBenefits = [
  {
    icon: <AlertTriangle className="h-10 w-10 text-amber-500" />,
    title: "Reduce Hallucinations",
    description: "AI models can sometimes generate false or misleading information. Using multiple models helps identify inconsistencies and reduces the risk of hallucinations."
  },
  {
    icon: <Scale className="h-10 w-10 text-blue-500" />,
    title: "Balanced Perspectives",
    description: "Different AI models have different training data and approaches. Multiple models provide diverse viewpoints and more balanced insights on complex topics."
  },
  {
    icon: <CheckCircle2 className="h-10 w-10 text-green-500" />,
    title: "Verify Accuracy",
    description: "When multiple models agree on an answer, you can have higher confidence in its accuracy. Cross-verification is a powerful tool for quality assurance."
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-purple-500" />,
    title: "Complementary Strengths",
    description: "Each AI model has unique strengths and specializations. One model might excel at creative writing while another provides more factual, concise responses."
  },
  {
    icon: <Fingerprint className="h-10 w-10 text-rose-500" />,
    title: "Identify Model Bias",
    description: "All AI models contain some degree of bias from their training data. Using multiple models helps highlight and mitigate these biases for more objective results."
  },
  {
    icon: <Layers className="h-10 w-10 text-indigo-500" />,
    title: "Deeper Insights",
    description: "Multiple perspectives lead to deeper understanding. When models approach a problem differently, you gain richer insights and more comprehensive solutions."
  }
];

export default function ModelSelection() {
  return (
    <div className="container">
      <p className="dark:text-muted-foreground leading-relaxed mb-8">
        In the world of AI, no single model has all the answers. Each has unique strengths, weaknesses, and biases. 
        By comparing responses from multiple models, you get more reliable information, diverse perspectives, and 
        protection against AI hallucinations—those convincing but incorrect answers that can lead you astray.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {multiModelBenefits.map((benefit, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {benefit.icon}
              </div>
              <div>
                <span className="text-xl font-bold mb-2">{benefit.title}</span>
                <p className="text-gray-600 dark:text-gray-300">
                  {benefit.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg flex items-start gap-3">
        {/* <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" /> */}
        <div>
          <span className="font-medium text-amber-800 dark:text-amber-300">Did you know?</span>
          <p className="text-amber-700 dark:text-amber-400 mt-1">
            Studies show that AI models can hallucinate facts up to 27% of the time when answering complex questions. 
            Using multiple models can reduce this error rate by identifying inconsistencies between responses.
          </p>
        </div>
      </div>
    </div>
  );
}
