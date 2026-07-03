'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={twMerge("flex flex-col gap-2 w-full relative", className)}>
      {label && (
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={twMerge(
          "w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-left text-zinc-300 text-sm flex items-center justify-between outline-none backdrop-blur-md transition-all duration-300",
          isOpen && "border-accentGold/40 ring-1 ring-accentGold/20",
          selectedOption && "text-white"
        )}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          className={twMerge("w-4 h-4 text-zinc-400 transition-transform duration-300", isOpen && "transform rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Options Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#121216]/90 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 p-1.5"
          >
            {/* Top reflect highlight */}
            <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            
            <div className="max-h-60 overflow-y-auto flex flex-col">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={twMerge(
                    "w-full px-4 py-2.5 rounded-xl text-left text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition duration-200 select-none outline-none",
                    opt.value === value && "bg-white/8 text-white font-semibold"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
