'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  brightness: number
  targetBrightness: number
  pulsePhase: number
  connections: number[]
}

interface Pulse {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  speed: number
  color: string
}

interface ScanLine {
  x: number
  y: number
  angle: number
  length: number
  opacity: number
  speed: number
  direction: 'horizontal' | 'diagonal'
}

type TimeOfDay = 'sunrise' | 'morning' | 'noon' | 'afternoon' | 'sunset' | 'night';

interface SkyGradient {
  grid: string;
  node: string;
  nodeActive: string;
  pulse: string;
  scan: string;
  background: string;
}

const skyGradients: Record<TimeOfDay, SkyGradient> = {
  sunrise: {
    grid: 'rgba(255, 94, 77, 0.08)',
    node: 'rgba(255, 154, 0, 0.3)',
    nodeActive: 'rgba(255, 154, 0, 0.8)',
    pulse: 'rgba(255, 94, 77, 0.4)',
    scan: 'rgba(255, 154, 0, 0.2)',
    background: 'rgba(0, 0, 0, 1)'
  },
  morning: {
    grid: 'rgba(135, 206, 235, 0.08)',
    node: 'rgba(135, 206, 235, 0.3)',
    nodeActive: 'rgba(135, 206, 235, 0.8)',
    pulse: 'rgba(135, 206, 250, 0.4)',
    scan: 'rgba(135, 206, 235, 0.2)',
    background: 'rgba(0, 0, 0, 1)'
  },
  noon: {
    grid: 'rgba(135, 206, 250, 0.08)',
    node: 'rgba(255, 255, 255, 0.3)',
    nodeActive: 'rgba(255, 255, 255, 0.8)',
    pulse: 'rgba(135, 206, 250, 0.4)',
    scan: 'rgba(255, 255, 255, 0.2)',
    background: 'rgba(0, 0, 0, 1)'
  },
  afternoon: {
    grid: 'rgba(255, 206, 84, 0.08)',
    node: 'rgba(255, 206, 84, 0.3)',
    nodeActive: 'rgba(255, 206, 84, 0.8)',
    pulse: 'rgba(255, 140, 0, 0.4)',
    scan: 'rgba(255, 206, 84, 0.2)',
    background: 'rgba(0, 0, 0, 1)'
  },
  sunset: {
    grid: 'rgba(255, 94, 77, 0.08)',
    node: 'rgba(255, 94, 77, 0.3)',
    nodeActive: 'rgba(255, 94, 77, 0.8)',
    pulse: 'rgba(255, 154, 0, 0.4)',
    scan: 'rgba(255, 94, 77, 0.2)',
    background: 'rgba(0, 0, 0, 1)'
  },
  night: {
    grid: 'rgba(25, 25, 112, 0.08)',
    node: 'rgba(25, 25, 112, 0.3)',
    nodeActive: 'rgba(25, 25, 112, 0.8)',
    pulse: 'rgba(75, 0, 130, 0.4)',
    scan: 'rgba(25, 25, 112, 0.2)',
    background: 'rgba(0, 0, 0, 1)'
  }
};

const LiveGridPulseNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const nodesRef = useRef<Node[]>([])
  const pulsesRef = useRef<Pulse[]>([])
  const scanLinesRef = useRef<ScanLine[]>([])
  const timeRef = useRef<number>(0)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning')

  const GRID_SIZE = 40
  const NODE_SPACING = 80
  const MAX_CONNECTION_DISTANCE = 120
  const PULSE_INTERVAL = 2000
  const SCAN_INTERVAL = 4000

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

  const colors = skyGradients[timeOfDay as TimeOfDay];

  const initializeNodes = useCallback((width: number, height: number) => {
    const nodes: Node[] = []
    const cols = Math.ceil(width / NODE_SPACING) + 2
    const rows = Math.ceil(height / NODE_SPACING) + 2

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        nodes.push({
          x: i * NODE_SPACING - NODE_SPACING,
          y: j * NODE_SPACING - NODE_SPACING,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          brightness: Math.random() * 0.3,
          targetBrightness: Math.random() * 0.3,
          pulsePhase: Math.random() * Math.PI * 2,
          connections: []
        })
      }
    }

    // Build connections
    nodes.forEach((node, i) => {
      nodes.forEach((other, j) => {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2)
          )
          if (distance < MAX_CONNECTION_DISTANCE) {
            node.connections.push(j)
          }
        }
      })
    })

    return nodes
  }, [])

  const createPulse = useCallback((x: number, y: number): Pulse => {
    return {
      x,
      y,
      radius: 0,
      maxRadius: 150,
      opacity: 0.6,
      speed: 0.8,
      color: colors.pulse
    }
  }, [colors.pulse])

  const createScanLine = useCallback((width: number, height: number): ScanLine => {
    const direction = Math.random() > 0.5 ? 'horizontal' : 'diagonal'
    
    if (direction === 'horizontal') {
      return {
        x: -50,
        y: Math.random() * height,
        angle: 0,
        length: 200,
        opacity: 0.3,
        speed: 1.2,
        direction
      }
    } else {
      return {
        x: Math.random() * width,
        y: -50,
        angle: Math.PI / 4,
        length: 250,
        opacity: 0.25,
        speed: 1.0,
        direction
      }
    }
  }, [])

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = colors.grid
    ctx.lineWidth = 0.5

    // Vertical lines
    for (let x = 0; x < width; x += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y < height; y += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }, [colors.grid])

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D, nodes: Node[]) => {
    nodes.forEach((node, i) => {
      node.connections.forEach(connectionIndex => {
        if (connectionIndex > i) { // Draw each connection only once
          const other = nodes[connectionIndex]
          const distance = Math.sqrt(
            Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2)
          )
          
          if (distance < MAX_CONNECTION_DISTANCE) {
            const opacity = (1 - distance / MAX_CONNECTION_DISTANCE) * 0.15
            ctx.strokeStyle = `${colors.node.replace('0.3', String(opacity))}`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.stroke()
          }
        }
      })
    })
  }, [colors.node])

  const drawNodes = useCallback((ctx: CanvasRenderingContext2D, nodes: Node[], time: number) => {
    nodes.forEach(node => {
      // Smooth brightness transitions
      node.brightness += (node.targetBrightness - node.brightness) * 0.05
      
      // Organic pulse animation
      const pulseFactor = Math.sin(time * 0.001 + node.pulsePhase) * 0.2 + 0.8
      const finalBrightness = node.brightness * pulseFactor
      
      // Occasionally activate nodes
      if (Math.random() < 0.001) {
        node.targetBrightness = 0.6 + Math.random() * 0.4
        setTimeout(() => {
          node.targetBrightness = Math.random() * 0.3
        }, 2000 + Math.random() * 3000)
      }

      // Draw node
      const size = 2 + finalBrightness * 2
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 2)
      
      if (finalBrightness > 0.5) {
        gradient.addColorStop(0, `${colors.nodeActive.replace('0.8', String(finalBrightness))}`)
        gradient.addColorStop(0.5, `${colors.pulse.replace('0.4', String(finalBrightness * 0.6))}`)
        gradient.addColorStop(1, `${colors.nodeActive.replace('0.8', '0')}`)
      } else {
        gradient.addColorStop(0, `${colors.node.replace('0.3', String(finalBrightness))}`)
        gradient.addColorStop(1, `${colors.node.replace('0.3', '0')}`)
      }

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(node.x, node.y, size * 2, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [colors.node, colors.nodeActive, colors.pulse])

  const drawPulses = useCallback((ctx: CanvasRenderingContext2D, pulses: Pulse[]) => {
    pulses.forEach((pulse, index) => {
      pulse.radius += pulse.speed
      pulse.opacity -= 0.008

      if (pulse.opacity > 0) {
        const gradient = ctx.createRadialGradient(
          pulse.x, pulse.y, 0,
          pulse.x, pulse.y, pulse.radius
        )
        gradient.addColorStop(0, `${pulse.color.replace('0.4', String(pulse.opacity * 0.3))}`)
        gradient.addColorStop(0.7, `${pulse.color.replace('0.4', String(pulse.opacity * 0.1))}`)
        gradient.addColorStop(1, `${pulse.color.replace('0.4', '0')}`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2)
        ctx.fill()
      } else {
        pulses.splice(index, 1)
      }
    })
  }, [])

  const drawScanLines = useCallback((ctx: CanvasRenderingContext2D, scanLines: ScanLine[], width: number, height: number) => {
    scanLines.forEach((scanLine, index) => {
      ctx.save()
      ctx.translate(scanLine.x, scanLine.y)
      ctx.rotate(scanLine.angle)
      
      const gradient = ctx.createLinearGradient(0, 0, scanLine.length, 0)
      gradient.addColorStop(0, `${colors.scan.replace('0.2', '0')}`)
      gradient.addColorStop(0.5, `${colors.scan.replace('0.2', String(scanLine.opacity))}`)
      gradient.addColorStop(1, `${colors.scan.replace('0.2', '0')}`)
      
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(scanLine.length, 0)
      ctx.stroke()
      
      ctx.restore()

      // Update scan line position
      if (scanLine.direction === 'horizontal') {
        scanLine.x += scanLine.speed
        if (scanLine.x > width + 100) {
          scanLines.splice(index, 1)
        }
      } else {
        scanLine.x += scanLine.speed * Math.cos(scanLine.angle)
        scanLine.y += scanLine.speed * Math.sin(scanLine.angle)
        if (scanLine.x > width + 100 || scanLine.y > height + 100) {
          scanLines.splice(index, 1)
        }
      }
    })
  }, [colors.scan])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    timeRef.current += 16

    // Clear canvas with gradient background
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2)
    bgGradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
    bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // Draw all layers
    drawGrid(ctx, width, height)
    drawConnections(ctx, nodesRef.current)
    drawScanLines(ctx, scanLinesRef.current, width, height)
    drawPulses(ctx, pulsesRef.current)
    drawNodes(ctx, nodesRef.current, timeRef.current)

    // Update node positions (subtle organic movement)
    nodesRef.current.forEach(node => {
      node.x += node.vx
      node.y += node.vy

      // Boundary check with smooth bouncing
      if (node.x < 0 || node.x > width) node.vx *= -1
      if (node.y < 0 || node.y > height) node.vy *= -1

      // Slight random walk
      node.vx += (Math.random() - 0.5) * 0.01
      node.vy += (Math.random() - 0.5) * 0.01

      // Speed limiting
      node.vx = Math.max(-0.2, Math.min(0.2, node.vx))
      node.vy = Math.max(-0.2, Math.min(0.2, node.vy))
    })

    // Create new pulses periodically
    if (timeRef.current % PULSE_INTERVAL < 16 && nodesRef.current.length > 0) {
      const randomNode = nodesRef.current[Math.floor(Math.random() * nodesRef.current.length)]
      pulsesRef.current.push(createPulse(randomNode.x, randomNode.y))
    }

    // Create new scan lines periodically
    if (timeRef.current % SCAN_INTERVAL < 16) {
      scanLinesRef.current.push(createScanLine(width, height))
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [drawGrid, drawConnections, drawNodes, drawPulses, drawScanLines, createPulse, createScanLine])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      if (nodesRef.current.length === 0) {
        nodesRef.current = initializeNodes(canvas.width, canvas.height)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, initializeNodes])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'black' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
    </div>
  )
}

export default LiveGridPulseNetwork
