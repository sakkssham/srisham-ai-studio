'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, type = 'text', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={twMerge(
            "w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white text-sm outline-none backdrop-blur-md shadow-inner transition-all duration-300",
            "focus:bg-white/6 focus:border-accentGold/40 focus:ring-1 focus:ring-accentGold/20",
            error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-[10px] font-semibold text-red-400 tracking-wide mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
