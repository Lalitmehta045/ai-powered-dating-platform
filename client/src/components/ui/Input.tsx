import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, icon, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-sm font-medium text-text-secondary ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "flex h-12 w-full rounded-xl border bg-card/50 px-4 py-2 text-sm text-text-primary transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-11",
              error ? "border-danger focus-visible:ring-danger/50" : "border-border focus:border-primary/50",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-danger ml-1 font-medium"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
