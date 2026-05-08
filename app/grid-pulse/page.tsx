'use client'

import LiveGridPulseNetwork from '@/components/LiveGridPulseNetwork'
import { motion } from 'framer-motion'

export default function GridPulseDemo() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Animation */}
      <LiveGridPulseNetwork />
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
            Grid Pulse Network
          </h1>
          <p className="text-xl text-emerald-400/80 mb-8 leading-relaxed">
            Premium live background animation for modern SaaS dashboards
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="bg-white/5 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6"
            >
              <h3 className="text-emerald-400 font-semibold mb-2">Intelligent</h3>
              <p className="text-gray-400 text-sm">
                Organic motion patterns and responsive node activation
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="bg-white/5 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6"
            >
              <h3 className="text-emerald-400 font-semibold mb-2">Subtle</h3>
              <p className="text-gray-400 text-sm">
                Calm, professional aesthetic that enhances content
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="bg-white/5 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6"
            >
              <h3 className="text-emerald-400 font-semibold mb-2">Optimized</h3>
              <p className="text-gray-400 text-sm">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm font-medium">Live Infrastructure Active</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Usage Example */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-8 right-8 z-10"
      >
        <div className="bg-black/60 backdrop-blur-md border border-emerald-500/20 rounded-lg p-4 max-w-2xl mx-auto">
          <h4 className="text-emerald-400 font-mono text-sm mb-2">Usage Example:</h4>
          <pre className="text-gray-400 text-xs font-mono overflow-x-auto">
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
    </div>
  )
}
