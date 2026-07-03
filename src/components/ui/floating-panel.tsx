'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { Card } from './card';

interface FloatingPanelProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  side?: 'left' | 'right' | 'bottom';
}

export function FloatingPanel({
  children,
  className,
  isOpen,
  onClose,
  title,
  side = 'left',
}: FloatingPanelProps) {
  
  // Transition directions
  const slideVariants = {
    left: {
      hidden: { x: -350, opacity: 0 },
      visible: { x: 0, opacity: 1 }
    },
    right: {
      hidden: { x: 350, opacity: 0 },
      visible: { x: 0, opacity: 1 }
    },
    bottom: {
      hidden: { y: 250, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    }
  };

  const placementClasses = {
    left: "left-6 top-28 bottom-6 w-80 md:w-85",
    right: "right-6 top-28 bottom-6 w-80 md:w-85",
    bottom: "bottom-6 left-6 right-6 h-52 md:left-96 md:right-96"
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={slideVariants[side]}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={twMerge("fixed z-30 pointer-events-auto", placementClasses[side], className)}
    >
      <Card className="w-full h-full flex flex-col p-5 border border-white/5" blurLevel="xl">
        {/* Header (Optional) */}
        {(title || onClose) && (
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5 select-none">
            {title && <h3 className="font-serif text-base font-bold text-white tracking-wide">{title}</h3>}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition duration-200"
              >
                ✕
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {children}
        </div>
      </Card>
    </motion.div>
  );
}
