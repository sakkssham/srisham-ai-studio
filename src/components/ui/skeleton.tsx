import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={twMerge(
        "animate-pulse bg-white/5 relative overflow-hidden",
        variant === 'rectangular' && "rounded-2xl",
        variant === 'circular' && "rounded-full",
        variant === 'text' && "rounded h-4 w-3/4 my-1.5",
        className
      )}
      {...props}
    >
      {/* Shimmer gradient line sweep */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite] pointer-events-none" />
    </div>
  );
}
