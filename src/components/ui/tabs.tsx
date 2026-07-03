'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  containerId?: string; // namespace for layoutId animations
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  containerId = 'segmented-pill',
}: TabsProps) {
  return (
    <div
      className={twMerge(
        "bg-white/3 border border-white/5 rounded-2xl p-1 flex relative w-full select-none backdrop-blur-md",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={twMerge(
              "flex-1 relative py-2.5 text-xs font-semibold tracking-wide text-zinc-400 hover:text-white rounded-xl select-none outline-none cursor-pointer focus:outline-none transition duration-300",
              isActive && "text-white"
            )}
          >
            {/* Sliding Pill Indicator */}
            {isActive && (
              <motion.div
                layoutId={containerId}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="absolute inset-0 bg-white/8 border border-white/8 rounded-xl shadow-sm z-0"
              />
            )}
            
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
