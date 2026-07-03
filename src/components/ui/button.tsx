'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'primary' | 'glass' | 'gold' | 'ghost';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = 'glass', isLoading = false, leftIcon, rightIcon, disabled, ...props }, ref) => {
    
    // Core design system classes mapped to variants
    const baseClasses = "relative px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold tracking-wide cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-accentGold/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300";
    
    const variantClasses = {
      primary: "bg-white text-zinc-950 hover:bg-zinc-100 border border-transparent shadow-[0_4px_20px_rgba(255,255,255,0.15)]",
      glass: "bg-white/5 hover:bg-white/12 border border-white/10 text-white backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
      gold: "bg-gradient-to-b from-accentGold/30 to-accentGold/10 hover:from-accentGold/45 hover:to-accentGold/15 border border-accentGold/40 text-white shadow-[0_4px_20px_rgba(212,175,55,0.15)]",
      ghost: "bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent"
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.025 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.975 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        disabled={disabled || isLoading}
        className={twMerge(baseClasses, variantClasses[variant], className)}
        {...(props as any)}
      >
        {/* Subtle top reflection overlay for premium glass look */}
        {variant === 'glass' && (
          <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        )}
        
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        
        {!isLoading && leftIcon && <span className="opacity-80">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="opacity-80">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: React.ReactNode;
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, variant = 'glass', isLoading = false, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.08 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        disabled={disabled || isLoading}
        className={twMerge(
          "relative w-11 h-11 rounded-full flex items-center justify-center cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-accentGold/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300",
          variant === 'primary' && "bg-white text-zinc-950 hover:bg-zinc-100 border border-transparent shadow-[0_4px_15px_rgba(255,255,255,0.15)]",
          variant === 'glass' && "bg-white/5 hover:bg-white/12 border border-white/10 text-white backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.15)]",
          variant === 'gold' && "bg-accentGold/20 hover:bg-accentGold/30 border border-accentGold/40 text-white",
          variant === 'ghost' && "bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent",
          className
        )}
        {...(props as any)}
      >
        {variant === 'glass' && (
          <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        )}
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          icon
        )}
      </motion.button>
    );
  }
);

IconButton.displayName = 'IconButton';
