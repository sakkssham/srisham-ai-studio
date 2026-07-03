'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  displayValue?: string | number;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ label, value, min = 0, max = 100, step = 1, onChange, displayValue, className, ...props }, ref) => {
    
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    };

    // Calculate progress percentage for track background highlighting
    const progressPct = ((value - min) / (max - min)) * 100;

    return (
      <div className={twMerge("flex flex-col gap-2 w-full", className)}>
        <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 uppercase tracking-wide">
          <span>{label}</span>
          <span className="text-white font-medium normal-case font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
            {displayValue !== undefined ? displayValue : `${Math.round(value)}%`}
          </span>
        </div>
        
        <div className="relative flex items-center h-6">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            style={{
              background: `linear-gradient(to right, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.2) ${progressPct}%, rgba(255, 255, 255, 0.05) ${progressPct}%, rgba(255, 255, 255, 0.05) 100%)`
            }}
            className="glass-slider w-full h-[6px] rounded-full appearance-none outline-none cursor-pointer"
            {...props}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
