import React from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

// Convert native button props to motion props safely
type MotionButtonProps = HTMLMotionProps<"button"> & Omit<ButtonProps, keyof HTMLMotionProps<"button">>;

export const Button = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25 border border-transparent',
      secondary: 'bg-secondary text-white hover:bg-secondary-hover shadow-lg shadow-secondary/25 border border-transparent',
      outline: 'bg-transparent border border-border text-text-primary hover:bg-white/5',
      ghost: 'bg-transparent text-text-primary hover:bg-white/5 border border-transparent',
      glass: 'glass hover:bg-white/10 text-white',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg font-medium',
      icon: 'h-10 w-10 flex items-center justify-center p-0',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(
          'relative inline-flex items-center justify-center rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 overflow-hidden',
          variants[variant],
          sizes[size],
          (disabled || isLoading) && 'opacity-60 cursor-not-allowed',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {children}
        
        {/* Shine effect overlay for primary/secondary */}
        {(variant === 'primary' || variant === 'secondary') && !disabled && !isLoading && (
          <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        )}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
