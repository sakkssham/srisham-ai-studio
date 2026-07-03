'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  isHoverable?: boolean;
  blurLevel?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, isHoverable = false, blurLevel = 'lg', ...props }, ref) => {
    
    const blurClasses = {
      sm: "backdrop-blur-sm",
      md: "backdrop-blur-md",
      lg: "backdrop-blur-lg saturate-[140%]",
      xl: "backdrop-blur-2xl saturate-[160%]"
    };

    return (
      <div
        ref={ref}
        className={twMerge(
          "relative bg-zinc-900/45 border border-white/5 rounded-3xl overflow-hidden shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-500",
          blurClasses[blurLevel],
          isHoverable && "hover:-translate-y-1 hover:border-white/12 hover:bg-zinc-800/50",
          className
        )}
        {...props}
      >
        {/* Top edge subtle reflection overlay */}
        <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge("p-6 flex flex-col gap-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={twMerge("font-serif text-lg font-bold text-white tracking-wide", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={twMerge("text-xs text-zinc-400 font-medium", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge("p-6 pt-0 flex-1", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge("p-6 pt-0 border-t border-white/5 flex items-center justify-end gap-3", className)} {...props}>
      {children}
    </div>
  );
}
