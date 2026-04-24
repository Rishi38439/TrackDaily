'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loading({ 
  message = 'Loading...', 
  size = 'md',
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className="relative">
        {/* Outer ring */}
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-blue-500/20 animate-pulse",
          sizeClasses[size]
        )} />
        
        {/* Middle ring */}
        <div className={cn(
          "absolute inset-1 rounded-full border-2 border-cyan-500/30 animate-spin",
          sizeClasses[size]
        )} />
        
        {/* Inner ring */}
        <div className={cn(
          "absolute inset-2 rounded-full border-2 border-blue-500/40 animate-ping",
          sizeClasses[size]
        )} />
        
        {/* Center dot */}
        <div className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse",
          size === 'sm' ? 'w-2 h-2 top-3 left-3' :
          size === 'md' ? 'w-3 h-3 top-4.5 left-4.5' :
          'w-4 h-4 top-6 left-6'
        )} />
      </div>
      
      {message && (
        <div className="text-center space-y-2">
          <p className="text-white/60 animate-pulse">{message}</p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
          <div className="h-3 bg-white/5 rounded w-16 animate-pulse" />
        </div>
        <div className="h-8 w-8 bg-white/10 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
        <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse" />
      </div>
    </div>
  );
}

export function AnimatedCounter({ 
  value, 
  duration = 1000,
  className 
}: { 
  value: number; 
  duration?: number; 
  className?: string; 
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(value * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value, duration]);

  return (
    <span className={className}>
      {displayValue.toLocaleString()}
    </span>
  );
}
