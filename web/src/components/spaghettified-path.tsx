"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { site } from "@/content/site"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { createBlackHole } from "@/lib/black-hole"
import { cn } from "@/lib/utils"

// Long enough to read the path before it starts falling.
const START = 1.5
const STAGGER = 0.07
const DURATION = 2.3
const MAX_CHARS = 40

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

const noSubscribe = () => () => {}

/** The 404: the path the visitor typed is stretched and pulled into the hole. */
export function SpaghettifiedPath() {
  const holeRef = useRef<HTMLCanvasElement>(null)
  const lettersRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  const [swallowed, setSwallowed] = useState(false)
  const path = useSyncExternalStore(
    noSubscribe,
    () => decodeURIComponent(window.location.pathname),
    () => "",
  )
  const shown = path.length > MAX_CHARS ? `${path.slice(0, MAX_CHARS - 1)}…` : path

  useEffect(() => {
    const holeCanvas = holeRef.current
    const canvas = lettersRef.current
    if (!holeCanvas || !canvas || reducedMotion === null) return

    const hole = { cx: 0, cy: 0, radius: 0 }
    const blackHole = createBlackHole(holeCanvas, {
      reducedMotion,
      anchor: (width) => ({ x: 0.5, y: width < 640 ? 0.3 : 0.36 }),
      onFrame: ({ cx, cy, radius }) => Object.assign(hole, { cx, cy, radius }),
    })
    if (reducedMotion || !shown) return () => blackHole.destroy()

    const ctx = canvas.getContext("2d")!
    const font = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono")
    const start = performance.now()
    let frame = 0

    const step = (now: number) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (canvas.width !== Math.round(width * dpr)) {
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      const size = Math.min(24, (width - 48) / (shown.length * 0.62))
      ctx.font = `${size}px ${font}, monospace`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const t = (now - start) / 1000
      const { cx, cy, radius } = hole
      const total = ctx.measureText(shown).width
      let x = width / 2 - total / 2
      let alive = 0
      // Long paths fall faster, so every 404 takes about the same time.
      const stagger = Math.min(STAGGER, 1.4 / shown.length)
      for (let i = 0; i < shown.length; i++) {
        const ch = shown[i]
        const w = ctx.measureText(ch).width
        const x0 = x + w / 2
        const y0 = height * 0.66
        x += w
        const p = clamp((t - START - i * stagger) / DURATION)
        if (p < 1) alive++
        const e = ease(p)
        // Spiral in while stretching along the fall and thinning across it.
        const r0 = Math.hypot(x0 - cx, y0 - cy)
        const a0 = Math.atan2(y0 - cy, x0 - cx)
        const r = r0 * (1 - e) + radius * 0.85 * e
        const a = a0 + p * p * 2.4
        const alpha = 1 - clamp((p - 0.72) / 0.28)
        if (alpha <= 0) continue
        ctx.save()
        ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r * (1 - 0.55 * e))
        // Upright at rest; while falling, the stretched axis turns to point at the hole.
        const radial = Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))
        ctx.rotate(radial * e)
        ctx.scale(1 - 0.6 * e, 1 + 3.2 * e * e)
        ctx.fillStyle = `rgba(250,250,250,${alpha})`
        ctx.fillText(ch, 0, 0)
        ctx.restore()
      }
      if (t > START && alive === 0) {
        ctx.clearRect(0, 0, width, height)
        setSwallowed(true)
        return
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frame)
      blackHole.destroy()
    }
  }, [reducedMotion, shown])

  const done = swallowed || reducedMotion === true

  // Plain links on purpose: a full load starts the home page at the top of the
  // fall, while client navigation restored it scrolled down into the limbo.
  return (
    <main className="relative h-svh overflow-hidden bg-[#0a0a0a]">
      <canvas ref={holeRef} aria-hidden="true" className="absolute inset-0 size-full" />
      <canvas ref={lettersRef} aria-hidden="true" className="absolute inset-0 size-full" />
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full load on purpose */}
      <a href="/" className="absolute top-4 left-6 font-mono text-sm text-zinc-50 sm:left-12">
        {site.domain}
      </a>
      <div
        className={cn(
          "absolute inset-x-6 bottom-[16svh] text-center transition-opacity duration-1000",
          done ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <p className="font-mono text-xs text-zinc-600">404</p>
        <h1 className="mt-3 text-2xl font-medium tracking-tight text-zinc-50 sm:text-3xl">
          This page crossed the event horizon.
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          Nothing comes back out. Not even{" "}
          <span className="font-mono text-zinc-300">{shown || "this page"}</span>.
        </p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full load on purpose */}
        <a
          href="/"
          className="mt-8 inline-block rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition-colors hover:border-zinc-500 hover:text-zinc-50"
        >
          Back to the surface
        </a>
      </div>
    </main>
  )
}
