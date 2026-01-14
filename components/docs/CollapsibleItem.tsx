"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface CollapsibleItem {
  id: string;
  question: string;
  answer: string;
}

interface CollapsibleItemsProps {
  items: CollapsibleItem[];
}

export default function CollapsibleItems({ items }: CollapsibleItemsProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  // Toggle function to expand/collapse items
  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <button
            className="w-full p-5 text-left flex justify-between items-center bg-gray-50 dark:bg-accent hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => toggleItem(item.id)}
            aria-expanded={expandedItems[item.id]}
            aria-controls={`content-${item.id}`}
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {item.question}
              </h2>
            </div>
            {expandedItems[item.id] ? (
              <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          <div
            id={`content-${item.id}`}
            className={`px-5 py-4 bg-background ${
              expandedItems[item.id] ? "block" : "hidden"
            }`}
          >
            <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
