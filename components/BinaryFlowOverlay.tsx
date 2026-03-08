'use client'

import { useEffect, useRef } from 'react'

type BinaryFlowOverlayProps = {
  accentColor?: string
  className?: string
}

const BINARY_FLOW_CHARS = ' 0011~'
const CELL_SIZE = 12
const MAX_DPR = 1.5
const TARGET_FPS = 24

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export default function BinaryFlowOverlay({
  accentColor = '#0ea5e9',
  className = '',
}: BinaryFlowOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return

    let width = 1
    let height = 1
    let dpr = 1
    let isVisible = true
    let rafId = 0
    let lastFrameAt = 0
    const minFrameDelta = 1000 / TARGET_FPS
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const setCanvasSize = () => {
      const bounds = container.getBoundingClientRect()
      width = Math.max(1, Math.floor(bounds.width))
      height = Math.max(1, Math.floor(bounds.height))
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.font = `${CELL_SIZE}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
      context.textBaseline = 'top'
    }

    const drawFrame = (timeSeconds: number) => {
      context.clearRect(0, 0, width, height)
      context.fillStyle = accentColor

      const columns = Math.ceil(width / CELL_SIZE)
      const rows = Math.ceil(height / CELL_SIZE)

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const nx = (column + 0.5 - columns / 2) / (columns / 2)
          const ny = (row + 0.5 - rows / 2) / (rows / 2)

          let value = 0
          let alpha = 0.2

          const blockSize = 0.34
          const inBlock = Math.abs(nx) < blockSize && Math.abs(ny) < blockSize

          if (inBlock) {
            const edgeDist = Math.min(blockSize - Math.abs(nx), blockSize - Math.abs(ny))
            const erosion = clamp(
              timeSeconds * 0.03 + (Math.sin(timeSeconds * 0.6 + nx * 9 + ny * 7) + 1) * 0.03,
              0.04,
              0.24
            )
            value = edgeDist > erosion ? 0.98 : -0.12
            alpha = edgeDist > erosion ? 0.62 : 0.35
          } else {
            const angle = Math.atan2(ny, nx)
            const distance = Math.hypot(nx, ny)
            const flow =
              Math.sin(distance * 18 - timeSeconds * 1.1 + angle * 1.5) +
              Math.cos(nx * 8 + ny * 3 - timeSeconds * 0.8)

            value = clamp(flow * 0.5, -1, 1)
            alpha = clamp(0.2 + Math.abs(value) * 0.38, 0.14, 0.62)
          }

          const characterIndex = clamp(
            Math.floor(((value + 1) / 2) * (BINARY_FLOW_CHARS.length - 1)),
            0,
            BINARY_FLOW_CHARS.length - 1
          )
          context.globalAlpha = alpha
          context.fillText(BINARY_FLOW_CHARS[characterIndex], column * CELL_SIZE, row * CELL_SIZE)
        }
      }

      context.globalAlpha = 1
    }

    const animate = (timestamp: number) => {
      rafId = requestAnimationFrame(animate)
      if (!isVisible) return
      if (timestamp - lastFrameAt < minFrameDelta) return

      lastFrameAt = timestamp
      drawFrame(timestamp / 1000)
    }

    const resizeObserver = new ResizeObserver(() => setCanvasSize())
    resizeObserver.observe(container)

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = Boolean(entry?.isIntersecting)
    })
    intersectionObserver.observe(container)

    setCanvasSize()

    if (reducedMotion) {
      drawFrame(0)
    } else {
      rafId = requestAnimationFrame(animate)
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
    }
  }, [accentColor])

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} ref={containerRef}>
      <canvas className="h-full w-full opacity-65 dark:opacity-75" ref={canvasRef} />
    </div>
  )
}
