"use client"

import { useEffect, useRef, useState } from "react"

import type { Tool } from "@/content/site"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

const DURATION = 1400
const RADIUS = 12

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

/** Points along a rounded rectangle, clockwise from the top-left corner. */
function perimeter(x: number, y: number, w: number, h: number, r: number) {
  const points: [number, number][] = []
  const line = (ax: number, ay: number, bx: number, by: number) => {
    const steps = Math.max(8, Math.round(Math.hypot(bx - ax, by - ay) / 6))
    for (let i = 0; i < steps; i++)
      points.push([ax + ((bx - ax) * i) / steps, ay + ((by - ay) * i) / steps])
  }
  const arc = (ox: number, oy: number, start: number) => {
    for (let i = 0; i < 8; i++) {
      const a = start + (i / 8) * (Math.PI / 2)
      points.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r])
    }
  }
  line(x + r, y, x + w - r, y)
  arc(x + w - r, y + r, -Math.PI / 2)
  line(x + w, y + r, x + w, y + h - r)
  arc(x + w - r, y + h - r, 0)
  line(x + w - r, y + h, x + r, y + h)
  arc(x + r, y + h - r, Math.PI / 2)
  line(x, y + h - r, x, y + r)
  arc(x + r, y + r, Math.PI)
  return points
}

/** A streak of light runs once around the card, leaves its border and fades. */
function traceBorder(canvas: HTMLCanvasElement, onDone: () => void) {
  const ctx = canvas.getContext("2d")!
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.lineCap = "round"
  const points = perimeter(1.5, 1.5, w - 3, h - 3, RADIUS)
  const n = points.length
  const trail = Math.floor(n * 0.3)
  const start = performance.now()
  let frame = 0

  const step = (now: number) => {
    const p = clamp((now - start) / DURATION)
    const head = Math.floor(ease(clamp(p / 0.85)) * (n - 1))
    const gone = clamp((p - 0.8) / 0.2)
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = `rgba(161,161,170,${0.18 * (1 - gone)})`
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(points[0][0], points[0][1])
    for (let j = 1; j <= head; j++) ctx.lineTo(points[j][0], points[j][1])
    ctx.stroke()
    for (let j = Math.max(1, head - trail); j <= head; j++) {
      const t = (j - (head - trail)) / trail
      ctx.strokeStyle = `rgba(244,244,245,${t * t * 0.9 * (1 - gone)})`
      ctx.lineWidth = 0.6 + t * 1.4
      ctx.beginPath()
      ctx.moveTo(points[j - 1][0], points[j - 1][1])
      ctx.lineTo(points[j][0], points[j][1])
      ctx.stroke()
    }
    if (p < 1) frame = requestAnimationFrame(step)
    else {
      ctx.clearRect(0, 0, w, h)
      onDone()
    }
  }
  frame = requestAnimationFrame(step)
  return () => cancelAnimationFrame(frame)
}

type Stage = "hidden" | "tracing" | "shown"

export function ToolCard({
  tool,
  index,
  className,
}: {
  tool: Tool
  index: number
  className?: string
}) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  const [traced, setTraced] = useState<Stage>("hidden")
  // Without motion there is nothing to trace: the card is simply there.
  const stage: Stage = reducedMotion ? "shown" : traced

  useEffect(() => {
    const card = cardRef.current
    const canvas = canvasRef.current
    if (!card || !canvas || reducedMotion !== false) return
    let stop = () => {}
    let delay = 0
    let armed = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.4) {
          if (!armed) return
          armed = false
          delay = window.setTimeout(() => {
            setTraced("tracing")
            stop = traceBorder(canvas, () => setTraced("shown"))
          }, index * 250)
        } else if (!armed && !entry.isIntersecting && entry.boundingClientRect.top > 0) {
          // Left through the bottom: the visitor went back up towards the hole.
          // Reset off screen, so the light traces the card again on the way down.
          window.clearTimeout(delay)
          stop()
          stop = () => {}
          canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height)
          armed = true
          setTraced("hidden")
        }
      },
      { threshold: [0, 0.4] },
    )
    observer.observe(card)
    return () => {
      observer.disconnect()
      window.clearTimeout(delay)
      stop()
    }
  }, [index, reducedMotion])

  return (
    <a
      ref={cardRef}
      href={tool.href}
      className={cn(
        "group relative flex min-h-56 flex-col rounded-xl border p-6 outline-none transition-[border-color,background-color] duration-700 focus-visible:ring-2 focus-visible:ring-zinc-400",
        stage === "shown"
          ? "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-950"
          : "border-transparent",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px size-[calc(100%+2px)]"
      />
      <div
        className={cn(
          "flex flex-1 flex-col transition-opacity duration-700",
          stage === "hidden" ? "opacity-0" : "opacity-100",
          stage === "tracing" && "delay-700",
        )}
      >
        <h3 className="text-xl font-medium text-zinc-50">{tool.name}</h3>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-zinc-400">
          {tool.description}
        </p>
        <span className="mt-auto pt-6 font-mono text-xs text-zinc-500 transition-colors group-hover:text-zinc-300">
          {tool.label}
        </span>
      </div>
    </a>
  )
}
