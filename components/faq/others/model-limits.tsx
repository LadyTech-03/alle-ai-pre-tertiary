import React from "react";
import { Zap, Crown, Sparkles } from "lucide-react";
import Image from "next/image";

const planLimits = [
  {
    icon: <Zap className="h-10 w-10 text-gray-500" />,
    title: "Free Plan",
    description: "Select up to 2 models maximum",
    details: "Perfect for casual users who want to compare basic model responses and explore AI capabilities."
  },
  {
    icon: <Image src={`/icons/silver-alle-ai.webp`} width={100} height={100} alt="plan-icon" className="h-10 w-10 text-amber-500" />,
    title: "Standard Plan",
    description: "Select up to 3 models maximum",
    details: "Ideal for professionals who need more diverse perspectives and enhanced verification capabilities."
  },
  {
    icon: <Image src={`/icons/gold-alle-ai.webp`} width={100} height={100} alt="plan-icon" className="h-10 w-10 text-amber-500" />,
    title: "Plus Plan",
    description: "Select up to 5 models maximum",
    details: "Designed for power users who require comprehensive model comparison and the highest level of insight verification."
  }
];

export default function ModelLimits() {
  return (
    <div className="container">
      <p className="dark:text-muted-foreground leading-relaxed mb-8">
        Alle-AI offers different model selection limits based on your subscription plan. 
        Each tier provides access to more simultaneous models, allowing for more comprehensive 
        comparisons and deeper insights as you upgrade.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {planLimits.map((plan, index) => (
          <div 
            key={index} 
            className="bg-secondary dark:bg-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                {plan.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
              <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                {plan.description}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {plan.details}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
        <p className="text-blue-700 dark:text-blue-400">
          <span className="font-medium">Pro Tip:</span> Using more models simultaneously provides better cross-verification 
          and reduces the chance of AI hallucinations. Consider upgrading your plan if you frequently work with complex 
          topics that benefit from multiple AI perspectives.
        </p>
      </div>
    </div>
  );
}