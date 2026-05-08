'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfrastructureIntroProps {
  onComplete?: () => void;
}

type TimeOfDay = 'sunrise' | 'morning' | 'noon' | 'afternoon' | 'sunset' | 'night';

interface SkyGradient {
  from: string;
  via: string;
  to: string;
  ambient: string;
}

const skyGradients: Record<TimeOfDay, SkyGradient> = {
  sunrise: {
    from: 'rgba(255, 94, 77, 0.3)',
    via: 'rgba(255, 154, 0, 0.2)',
    to: 'rgba(135, 206, 235, 0.4)',
    ambient: 'rgba(255, 154, 0, 0.05)'
  },
  morning: {
    from: 'rgba(135, 206, 235, 0.3)',
    via: 'rgba(255, 255, 255, 0.2)',
    to: 'rgba(135, 206, 250, 0.4)',
    ambient: 'rgba(135, 206, 235, 0.05)'
  },
  noon: {
    from: 'rgba(135, 206, 250, 0.3)',
    via: 'rgba(255, 255, 255, 0.3)',
    to: 'rgba(135, 206, 235, 0.3)',
    ambient: 'rgba(255, 255, 255, 0.08)'
  },
  afternoon: {
    from: 'rgba(135, 206, 235, 0.3)',
    via: 'rgba(255, 206, 84, 0.2)',
    to: 'rgba(255, 140, 0, 0.3)',
    ambient: 'rgba(255, 206, 84, 0.05)'
  },
  sunset: {
    from: 'rgba(255, 94, 77, 0.4)',
    via: 'rgba(255, 154, 0, 0.3)',
    to: 'rgba(75, 0, 130, 0.3)',
    ambient: 'rgba(255, 94, 77, 0.06)'
  },
  night: {
    from: 'rgba(25, 25, 112, 0.4)',
    via: 'rgba(0, 0, 50, 0.3)',
    to: 'rgba(0, 0, 0, 0.8)',
    ambient: 'rgba(25, 25, 112, 0.03)'
  }
};

export default function InfrastructureIntro({ onComplete }: InfrastructureIntroProps) {
  const [subtitleOpacity, setSubtitleOpacity] = useState(0);
  const [titleOpacity, setTitleOpacity] = useState(0);
  const [backgroundProgress, setBackgroundProgress] = useState(0);
  const [ambientIntensity, setAmbientIntensity] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');

  // Detect time of day
  useEffect(() => {
    const getTimeOfDay = (): TimeOfDay => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 7) return 'sunrise';
      if (hour >= 7 && hour < 10) return 'morning';
      if (hour >= 10 && hour < 14) return 'noon';
      if (hour >= 14 && hour < 17) return 'afternoon';
      if (hour >= 17 && hour < 20) return 'sunset';
      return 'night';
    };

    setTimeOfDay(getTimeOfDay());
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      // Phase 1: Background transition (0-3 seconds)
      if (elapsed < 3000) {
        setBackgroundProgress(elapsed / 3000);
      }
      
      // Phase 2: Subtitle appears (2-4 seconds)
      if (elapsed > 2000 && elapsed < 4000) {
        setSubtitleOpacity((elapsed - 2000) / 2000);
      } else if (elapsed >= 4000) {
        setSubtitleOpacity(0.7);
      }
      
      // Phase 3: Title appears (4-6 seconds)
      if (elapsed > 4000 && elapsed < 6000) {
        setTitleOpacity((elapsed - 4000) / 2000);
      } else if (elapsed >= 6000) {
        setTitleOpacity(1);
      }
      
      // Phase 4: Ambient breathing (continuous after 3 seconds)
      if (elapsed > 3000) {
        setAmbientIntensity(0.3 + Math.sin((elapsed - 3000) / 2000) * 0.1);
      }
      
      // Complete animation after 9 seconds
      if (elapsed > 9000) {
        onComplete?.();
        return;
      }
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [onComplete]);

  // Get current sky gradient
  const currentSky = skyGradients[timeOfDay];

  // Calculate background gradient based on progress and time of day
  const backgroundStyle = {
    background: `
      radial-gradient(
        ellipse at center,
        ${currentSky.from} 0%,
        ${currentSky.via} 40%,
        ${currentSky.to} 100%
      ),
      linear-gradient(
        180deg,
        ${currentSky.from} 0%,
        ${currentSky.to} 100%
      )
    `,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="fixed inset-0 z-50 overflow-hidden"
        style={backgroundStyle}
      >
        {/* Ambient atmospheric overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(
              ellipse at 30% 40%,
              ${currentSky.ambient} 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse at 70% 60%,
              ${currentSky.ambient} 0%,
              transparent 50%
            )`,
            filter: 'blur(40px)',
          }}
        />
        
        {/* Subtle moving haze */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            x: [0, 20, 0, -20, 0],
            y: [0, -10, 0, 10, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: `radial-gradient(
              ellipse at center,
              ${currentSky.ambient} 0%,
              transparent 60%
            )`,
            filter: 'blur(60px)',
          }}
        />
        
        {/* Content container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Subtitle */}
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: subtitleOpacity, y: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-white text-sm md:text-base font-light tracking-widest mb-8"
            style={{
              fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
              textShadow: `0 0 20px ${currentSky.ambient}`,
              letterSpacing: '0.15em',
              fontWeight: 300,
            }}
          >
            Your day starts here.
          </motion.h3>
          
          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: titleOpacity, y: 0, scale: 1 }}
            transition={{ 
              duration: 2.5, 
              ease: "easeOut",
              delay: 0.3
            }}
            className="text-white font-light tracking-widest"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 7rem)',
              fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
              textShadow: `0 0 60px ${currentSky.ambient}, 0 0 120px ${currentSky.ambient}`,
              letterSpacing: '0.15em',
              fontWeight: 300,
            }}
          >
            TrackDaily
          </motion.h1>
        </div>
        
        {/* Subtle lens diffusion overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.1) 100%)',
            filter: 'blur(2px)',
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
