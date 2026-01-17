"use client";

import React, { useState, useEffect, useRef } from "react";
import { textReveal } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion"
import { Sparkles, Wand2, MessagesSquare, Zap } from "lucide-react";
import { useAuthStore } from "@/stores";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { usePathname } from 'next/navigation';

interface option {
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface GreetingMessageProp {
  username?: string;
  options?: option[];
  handlePressed?: (option: option) => void;
  questionText?: string;
}

const charVariants = {
  hidden: { opacity: 0 },
  reveal: { opacity: 1 },
};

const defaultOptions = [
  {
    label: "Get creative inspiration",
    icon: <Wand2 className="w-4 h-4" />,
  },
  {
    label: "Solve problems together",
    icon: <Zap className="w-4 h-4" />,
  },
];

// const getTimeBasedGreeting = (): string => {
//   const hour = new Date().getHours();
  
//   if (hour < 12) return "Good morning";
//   if (hour < 17) return "Good afternoon";
//   return "Good evening";
// };

let cachedFestiveGreeting: string | null = null;

const getTimeBasedGreeting = (): string => {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth();
  const date = now.getDate();

  const isChristmas = month === 11 && date >= 15 && date <= 31;

  if (isChristmas) {
    if (!cachedFestiveGreeting) {
      const festiveGreetings = [
        "Merry Christmas 🎄",
        "Season’s Greetings",
        "Happy Holidays ❄️",
        "Festive greetings",
      ];

      cachedFestiveGreeting =
        festiveGreetings[
          Math.floor(Math.random() * festiveGreetings.length)
        ];
    }

    return cachedFestiveGreeting;
  }

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const GreetingMessage = ({
  options,
  handlePressed = () => {},
  questionText,
}: GreetingMessageProp) => {
  const handleOptionClick = (option: option) => {
    handlePressed({
      ...option,
      label: `${option.description?.toLowerCase()}`
    });
  };

  const { user } = useAuthStore();
  const pathname = usePathname();
  
  // Animation controls for the moving options
  const ltrControls = useAnimation();
  const rtlControls = useAnimation();

  const getCurrentType = (): 'chat' | 'image' | 'audio' | 'video' => {
    if (pathname.startsWith('/image')) return 'image';
    if (pathname.startsWith('/audio')) return 'audio';
    if (pathname.startsWith('/video')) return 'video';
    return 'chat';
  };

  const currentType = getCurrentType();

  const getSectionStyles = (type: 'chat' | 'image' | 'audio' | 'video') => {
    switch (type) {
      case 'image':
        return {
          textColor: 'text-purple-500',
          darkTextColor: 'text-purple-500',
        };
      case 'audio':
        return {
          textColor: 'text-blue-500',
          darkTextColor: 'text-blue-500',
        };
      case 'video':
        return {
          textColor: 'text-yellow-500',
          darkTextColor: 'text-yellow-500',
        };
      default:
        return {
          textColor: 'text-green-500',
          darkTextColor: 'text-green-500',
        };
    }
  };
  
  // Move these inside the component to recalculate when props change
  const [questionTextArray, setQuestionTextArray] = useState<Array<{char: string, id: number}>>([]);
  
  // Recalculate text arrays when props change
  useEffect(() => {
    setQuestionTextArray(textReveal(questionText ? questionText : "What would you like to do today?"));
  }, [questionText, user?.first_name]);

  // Start animations when options are available
  useEffect(() => {
    if (options && options.length > 0) {
      const halfLength = Math.ceil(options.length / 2);
      const moveDistance = halfLength * 200; // Approximate width per option
      
      // Fixed duration for constant speed - top row
      const topRowDuration = 160; // seconds
      
      // Fixed duration for constant speed - bottom row (slower)
      const bottomRowDuration = 180; // seconds
      
      // Left to right animation (top row)
      ltrControls.start({
        x: [-moveDistance, 0],
        transition: {
          repeat: Infinity,
          duration: topRowDuration,
          ease: "linear", // Linear for constant speed
        },
      });
      
      // Right to left animation (bottom row - slower)
      rtlControls.start({
        x: [moveDistance, 0],
        transition: {
          repeat: Infinity,
          duration: bottomRowDuration,
          ease: "linear", // Linear for constant speed
        },
      });
    }
  }, [options, ltrControls, rtlControls]);

  return (
    <div className="w-full max-w-sm sm:max-w-2xl mx-auto px-2">
      <div className="text-center space-y-4 mb-8">
        {
          (() => {
            // const name = user?.first_name ? `${user.first_name}!` : "there!";
            const name = "Pascal!";
            const greeting = getTimeBasedGreeting(); // e.g., "Good morning"
            const [firstWord, secondWord] = greeting.split(" ");
            const secondWithComma = secondWord ? `${secondWord},` : ",";
            const words = [
              { text: firstWord },
              { text: secondWithComma },
              { text: name, className: `${getSectionStyles(currentType).textColor} dark:${getSectionStyles(currentType).darkTextColor}` },
            ];
            return (
              <TypewriterEffectSmooth
                key={`greeting-${user?.first_name}`}
                words={words}
                className="my-2 justify-center"
                duration={1}
                delay={0.2}
                hideCursorOnComplete
              />
            );
          })()
        }

          {questionText && (
            <motion.p 
            key={`question-${questionText}`} // Add key to force re-animation
            initial="hidden" 
            animate="reveal" // Change from whileInView to animate
            transition={{staggerChildren: .015}} 
            className="text-lg text-gray-500"
            >
            {questionTextArray.map(({char, id}) => (
                <motion.span
                key={id}
                transition={{duration: 0.5}}
                variants={charVariants}
                >
                  {char}
                </motion.span>
              ))}
            </motion.p>
          )}
      </div>

      {options && options.length > 0 && (
        <motion.div 
          key={`options-${options.length}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="relative overflow-hidden py-2 sm:py-4"
        >
          {/* Left to Right Moving Row */}
          <div className="relative flex gap-2 sm:gap-4 mb-2 sm:mb-4 overflow-hidden">
            {/* Fade gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <motion.div
              className="flex gap-2 sm:gap-4 whitespace-nowrap"
              animate={ltrControls}
              style={{ width: "max-content" }}
              onMouseEnter={() => ltrControls.stop()}
              onMouseLeave={() => {
                const halfLength = Math.ceil(options.length / 2);
                const moveDistance = halfLength * 200;
                const topRowDuration = 160; // Fixed duration for constant speed
                ltrControls.start({
                  x: [-moveDistance, 0],
                  transition: {
                    repeat: Infinity,
                    duration: topRowDuration,
                    ease: "linear", // Linear for constant speed
                  },
                });
              }}
            >
              {/* Duplicate options for seamless loop */}
              {[...options.slice(0, Math.ceil(options.length / 2)), ...options.slice(0, Math.ceil(options.length / 2))].map((option, index) => (
                <motion.button
                  key={`ltr-${index}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOptionClick(option)}
                  className="group inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-background/50 hover:bg-primary/5 border border-borderColorPrimary hover:border-primary/30 rounded-full text-xs sm:text-sm transition-all duration-200 flex-shrink-0"
                >
                  <div className="flex-shrink-0 text-primary group-hover:text-primary/80 transition-colors">
                    {option.icon}
                  </div>
                  <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors whitespace-nowrap">
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Right to Left Moving Row */}
          <div className="relative flex gap-2 sm:gap-4 justify-end overflow-hidden">
            {/* Fade gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <motion.div
              className="flex gap-2 sm:gap-4 whitespace-nowrap"
              animate={rtlControls}
              style={{ width: "max-content" }}
              onMouseEnter={() => rtlControls.stop()}
              onMouseLeave={() => {
                const halfLength = Math.ceil(options.length / 2);
                const moveDistance = halfLength * 200;
                const bottomRowDuration = 180; // Fixed duration for constant speed (slower)
                rtlControls.start({
                  x: [moveDistance, 0],
                  transition: {
                    repeat: Infinity,
                    duration: bottomRowDuration,
                    ease: "linear", // Linear for constant speed
                  },
                });
              }}
            >
              {/* Duplicate options for seamless loop */}
              {[...options.slice(Math.ceil(options.length / 2)), ...options.slice(Math.ceil(options.length / 2))].map((option, index) => (
                <motion.button
                  key={`rtl-${index}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOptionClick(option)}
                  className="group inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-background/50 hover:bg-primary/5 border border-borderColorPrimary hover:border-primary/30 rounded-full text-xs sm:text-sm transition-all duration-200 flex-shrink-0"
                >
                  <div className="flex-shrink-0 text-primary group-hover:text-primary/80 transition-colors">
                    {option.icon}
                  </div>
                  <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors whitespace-nowrap">
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GreetingMessage;
