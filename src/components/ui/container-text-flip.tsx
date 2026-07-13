"use client";

import React, { useState, useEffect, useId } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface ContainerTextFlipProps {
  /** Array of words to cycle through in the animation */
  words?: string[];
  /** Time in milliseconds between word transitions */
  interval?: number;
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** Additional CSS classes to apply to the text */
  textClassName?: string;
  /** Duration of the transition animation in milliseconds */
  animationDuration?: number;
}

export function ContainerTextFlip({
  words = ["better", "modern", "beautiful", "awesome"],
  interval = 3000,
  className,
  textClassName,
  animationDuration = 700,
}: ContainerTextFlipProps) {
  const id = useId();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [width, setWidth] = useState(100);
  const textRef = React.useRef<HTMLDivElement>(null);

  const updateWidthForWord = () => {
    if (textRef.current) {
      // Add some padding to the text width
      const textWidth = textRef.current.scrollWidth + 40;
      setWidth(textWidth);
    }
  };

  useEffect(() => {
    // Update width whenever the word changes
    updateWidthForWord();
  }, [currentWordIndex]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      // Width will be updated in the effect that depends on currentWordIndex
    }, interval);

    return () => clearInterval(intervalId);
  }, [words, interval]);

  return (
    <motion.span
      layout
      layoutId={`words-here-${id}`}
      animate={{ width }}
      transition={{ duration: animationDuration / 2000 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl px-2 py-0 text-center font-bold cursor-pointer align-middle",
        "transition-shadow duration-300",
        // Adaptação para o tema Dark/Cyan da MajorHub sem o "SaaS cliché"
        "bg-white/5 backdrop-blur-sm border border-white/10",
        "shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.02)]",
        "hover:border-[#00e5ff]/40 hover:bg-[#00e5ff]/10",
        "hover:shadow-[0_0_40px_rgba(0,229,255,0.3),inset_0_0_20px_rgba(0,229,255,0.1)]",
        className
      )}
      key={words[currentWordIndex]}
    >
      <motion.div
        transition={{
          duration: animationDuration / 1000,
          ease: "easeInOut",
        }}
        className={cn("inline-block", textClassName)}
        ref={textRef}
        layoutId={`word-div-${words[currentWordIndex]}-${id}`}
      >
        <motion.div className="inline-block whitespace-nowrap">
          {words[currentWordIndex].split("").map((letter, index) => (
            <motion.span
              key={index}
              initial={{
                opacity: 0,
                filter: "blur(10px)",
                y: 10,
              }}
              animate={{
                opacity: 1,
                filter: "blur(0px)",
                y: 0,
              }}
              transition={{
                delay: index * 0.02,
              }}
              className="inline-block"
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.span>
  );
}
