'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface NavigationProps {
  children: React.ReactNode;
  className?: string;
}

export function NavigationDock({ children, className }: NavigationProps) {
  return (
    <div
      className={twMerge(
        "glass-panel p-4 flex flex-row items-center gap-3 border border-white/5 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)] z-30 pointer-events-auto",
        className
      )}
    >
      {/* Top reflection line */}
      <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}

interface NavigationItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon: React.ReactNode;
  label?: string;
}

export function NavigationItem({
  active = false,
  icon,
  label,
  className,
  ...props
}: NavigationItemProps) {
  return (
    <button
      type="button"
      className={twMerge(
        "w-12 h-12 rounded-full flex items-center justify-center bg-white/3 border border-white/5 text-zinc-400 cursor-pointer select-none transition-all duration-500",
        active && "bg-white text-zinc-950 border-white shadow-[0_4px_15px_rgba(255,255,255,0.25)] scale-108",
        !active && "hover:bg-white/10 hover:text-white hover:border-white/15",
        className
      )}
      {...props}
    >
      {icon}
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}
