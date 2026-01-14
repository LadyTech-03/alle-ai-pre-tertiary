"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TextStreamProps {
  text: string;
  className?: string;
  isStreaming: boolean;
  streamDuration?: number;
}

export function TextStream({ 
  text, 
  className, 
  isStreaming, 
  streamDuration = 500 
}: TextStreamProps) {
  // Create a character-by-character reveal animation
  const characters = text.split("");
  
  // Set up container for the letter animation
  const container = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: streamDuration / (1000 * Math.max(characters.length, 1)),
        ease: "easeOut"
      }
    }
  };
  
  // Set up letter animation
  const letter = {
    hidden: { opacity: 0, x: -5 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { ease: "easeOut" }
    }
  };
  
  // If not streaming, just show the text
  if (!isStreaming) {
    return <span className={className}>{text}</span>;
  }

  // If streaming, animate each character
  return (
    <motion.span
      className={cn(className, "inline-block")}
      key={text}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${index}-${char}`}
          variants={letter}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
} 