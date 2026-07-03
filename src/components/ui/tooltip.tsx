'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({
  children,
  content,
  className,
  position = 'top',
}: TooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {children}
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={twMerge(
              "absolute z-50 px-3 py-1.5 bg-[#121216]/95 border border-white/8 rounded-lg text-[10px] font-semibold tracking-wide text-zinc-300 whitespace-nowrap pointer-events-none shadow-md backdrop-blur-md",
              positionClasses[position],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
