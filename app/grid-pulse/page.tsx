'use client'

import { useState, useEffect } from 'react'
import LiveGridPulseNetwork from '@/components/LiveGridPulseNetwork'
import { motion, AnimatePresence } from 'framer-motion'

type TimeOfDay = 'sunrise' | 'morning' | 'noon' | 'afternoon' | 'sunset' | 'evening' | 'night' | 'mid-night'

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
  evening: {
    from: 'rgba(75, 0, 130, 0.3)',
    via: 'rgba(25, 25, 112, 0.3)',
    to: 'rgba(0, 0, 50, 0.4)',
    ambient: 'rgba(75, 0, 130, 0.04)'
  },
  night: {
    from: 'rgba(25, 25, 112, 0.4)',
    via: 'rgba(0, 0, 50, 0.3)',
    to: 'rgba(0, 0, 0, 0.8)',
    ambient: 'rgba(25, 25, 112, 0.03)'
  },
  'mid-night': {
    from: 'rgba(0, 0, 20, 0.6)',
    via: 'rgba(0, 0, 40, 0.4)',
    to: 'rgba(0, 0, 0, 0.9)',
    ambient: 'rgba(0, 0, 60, 0.02)'
  }
}

export default function GridPulseDemo() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning')

  // Detect time of day
  useEffect(() => {
    const getTimeOfDay = (): TimeOfDay => {
      const now = new Date()
      const hour = now.getHours()
      const minute = now.getMinutes()
      const timeInHours = hour + minute / 60
      
      if (timeInHours >= 5 && timeInHours < 6) return 'sunrise'
      if (timeInHours >= 6 && timeInHours < 12) return 'morning'
      if (timeInHours >= 12 && timeInHours < 14) return 'noon'
      if (timeInHours >= 14 && timeInHours < 17) return 'afternoon'
      if (timeInHours >= 17 && timeInHours < 18.5) return 'evening'
      if (timeInHours >= 18.5 && timeInHours < 20) return 'sunset'
      if (timeInHours >= 20 && timeInHours < 24) return 'night'
      return 'mid-night'
    }

    setTimeOfDay(getTimeOfDay())
  }, [])

  const currentSky = skyGradients[timeOfDay]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen overflow-hidden"
        style={{
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
          `
        }}
      >
        {/* Background Animation */}
        <LiveGridPulseNetwork />
        
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
            x: [0, 10, 0, -10, 0],
            y: [0, -5, 0, 5, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            type: "tween"
          }}
          style={{
            background: `radial-gradient(
              ellipse at center,
              ${currentSky.ambient} 0%,
              transparent 60%
            )`,
            filter: 'blur(50px)',
          }}
        />
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="text-white text-sm md:text-base font-light tracking-widest mb-8"
              style={{
                fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                textShadow: `0 0 20px ${currentSky.ambient}`,
                letterSpacing: '0.15em',
                fontWeight: 300,
              }}
            >
              Premium live background animation
            </motion.h3>
            
            <motion.h1
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 2.5, 
                ease: "easeOut",
                delay: 0.3
              }}
              className="text-white font-light tracking-widest mb-6"
              style={{
                fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                textShadow: `0 0 60px ${currentSky.ambient}, 0 0 120px ${currentSky.ambient}`,
                letterSpacing: '0.15em',
                fontWeight: 300,
              }}
            >
              Grid Pulse Network
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-xl text-white/80 mb-8 leading-relaxed"
              style={{
                textShadow: `0 0 20px ${currentSky.ambient}`,
              }}
            >
              For modern SaaS dashboards
            </motion.p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-6"
              >
                <h3 className="text-white/90 font-semibold mb-2">Intelligent</h3>
                <p className="text-white/60 text-sm">
                  Organic motion patterns and responsive node activation
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-6"
              >
                <h3 className="text-white/90 font-semibold mb-2">Subtle</h3>
                <p className="text-white/60 text-sm">
                  Calm, professional aesthetic that enhances content
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-6"
              >
                <h3 className="text-white/90 font-semibold mb-2">Optimized</h3>
                <p className="text-white/60 text-sm">
                  GPU-accelerated canvas rendering for smooth performance
                </p>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.3 }}
              className="mt-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/30 rounded-full">
                <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-sm font-medium">Live Infrastructure Active</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Subtle lens diffusion overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.1) 100%)',
            filter: 'blur(2px)',
          }}
        />
        
        {/* Usage Example */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-8 right-8 z-10"
        >
          <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-4 max-w-2xl mx-auto">
            <h4 className="text-white/80 font-mono text-sm mb-2">Usage Example:</h4>
            <pre className="text-white/60 text-xs font-mono overflow-x-auto">
{`import LiveGridPulseNetwork from '@/components/LiveGridPulseNetwork'

export default function Dashboard() {
  return (
    <div className="relative min-h-screen">
      <LiveGridPulseNetwork />
      {/* Your dashboard content here */}
    </div>
  )
}`}
            </pre>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
