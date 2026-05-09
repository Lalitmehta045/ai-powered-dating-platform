import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-card border border-border/30 overflow-hidden relative",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
};

export const FullScreenLoader = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-8 animate-bounce shadow-xl shadow-primary/20">
      <span className="text-white font-bold text-2xl font-accent">H</span>
    </div>
    <div className="w-48 space-y-4">
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-4 w-3/4 rounded-full mx-auto" />
    </div>
  </div>
);
