'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { Card } from './card';

interface ModalDialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ModalDialog({
  children,
  isOpen,
  onClose,
  title,
  className,
  size = 'md',
}: ModalDialogProps) {
  
  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Panel Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={twMerge("w-full relative z-10", sizeClasses[size])}
          >
            <Card className={twMerge("p-6 flex flex-col gap-4 border border-white/8 bg-[#121216]/95", className)} blurLevel="xl">
              {/* Header */}
              <div className="flex justify-between items-center select-none pb-2">
                {title ? (
                  <h3 className="font-serif text-lg font-bold text-white tracking-wide">{title}</h3>
                ) : (
                  <div />
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-zinc-500 hover:text-white transition duration-200"
                  aria-label="Close dialog"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 text-sm text-zinc-300 leading-relaxed">
                {children}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
