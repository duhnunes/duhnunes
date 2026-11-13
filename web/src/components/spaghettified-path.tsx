"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent } from "react"

import { site } from "@/content/site"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import {
  cornerAnchor,
  createBlackHole,
  HOME_FALL_START,
  type Anchor,
  type BlackHole,
} from "@/lib/black-hole"
import { markSurfacing } from "@/lib/surfacing"
import { cn } from "@/lib/utils"

// Long enough to read the path before it starts falling.
const START = 1.5
const STAGGER = 0.07
const DURATION = 2.3
const MAX_CHARS = 40
// The hole's trip from the middle of the 404 to where the home page's hole opens.
const SURFACE_MS = 1200

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

const voidAnchor: Anchor = (width) => ({ x: 0.5, y: width < 640 ? 0.3 : 0.36 })

const noSubscribe = () => () => {}

/** The 404: the path the visitor typed is stretched and pulled into the hole. */
export function SpaghettifiedPath() {
  const holeRef = useRef<HTMLCanvasElement>(null)
  const lettersRef = useRef<HTMLCanvasElement>(null)
  const blackHoleRef = useRef<BlackHole | null>(null)
  // 0 in the middle of the 404, 1 at the home page's opening spot.
  const travel = useRef(0)
  const reducedMotion = useReducedMotion()
  const router = useRouter()
  const [swallowed, setSwallowed] = useState(false)
  const [surfacing, setSurfacing] = useState(false)
  const path = useSyncExternalStore(
    noSubscribe,
    () => decodeURIComponent(window.location.pathname),
    () => "",
  )
  const shown = path.length > MAX_CHARS ? `${path.slice(0, MAX_CHARS - 1)}…` : path

  // Load the home page while the letters fall, so the hand-over has nothing to wait for.
  useEffect(() => {
    router.prefetch("/")
  }, [router])

  useEffect(() => {
    const holeCanvas = holeRef.current
    const canvas = lettersRef.current
    if (!holeCanvas || !canvas || reducedMotion === null) return

    const hole = { cx: 0, cy: 0, radius: 0 }
    const blackHole = createBlackHole(holeCanvas, {
      reducedMotion,
      anchor: (width, height) => {
        const from = voidAnchor(width, height)
        const to = cornerAnchor(width, height)
        const e = travel.current
        return { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }
      },
      onFrame: ({ cx, cy, radius }) => Object.assign(hole, { cx, cy, radius }),
    })
    blackHoleRef.current = blackHole
    const destroy = () => {
      blackHoleRef.current = null
      blackHole.destroy()
    }
    if (reducedMotion || !shown) return destroy

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
      destroy()
    }
  }, [reducedMotion, shown])

  // Carry the hole to the home page's opening spot (same anchor, same point of
  // the fall), then switch pages without a reload: the home page's hole draws on
  // its first frame where this one stopped, and the content fades in around it.
  // Without motion, the plain link does a normal full load to the top.
  const surface = (event: MouseEvent<HTMLAnchorElement>) => {
    const blackHole = blackHoleRef.current
    if (reducedMotion !== false || !blackHole || surfacing) return
    event.preventDefault()
    setSurfacing(true)
    lettersRef.current?.getContext("2d")?.clearRect(0, 0, 1e5, 1e5)
    const start = performance.now()
    const step = (now: number) => {
      const p = clamp((now - start) / SURFACE_MS)
      const e = ease(p)
      travel.current = e
      blackHole.setFall(HOME_FALL_START * e)
      if (p < 1) requestAnimationFrame(step)
      else {
        markSurfacing(blackHole.sky())
        // scroll: false — Next would scroll the new page into view, and with the
        // home page's several top-level parts it lands in the limbo. The 404 never
        // scrolls, so the home page already opens at the top of the fall.
        router.push("/", { scroll: false })
      }
    }
    requestAnimationFrame(step)
  }

  const done = (swallowed || reducedMotion === true) && !surfacing

  return (
    <main className="relative h-svh overflow-hidden bg-[#0a0a0a]">
      <canvas ref={holeRef} aria-hidden="true" className="absolute inset-0 size-full" />
      <canvas
        ref={lettersRef}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 size-full transition-opacity duration-500",
          surfacing && "opacity-0",
        )}
      />
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full load on purpose */}
      <a
        href="/"
        onClick={surface}
        className="absolute top-4 left-6 font-mono text-sm text-zinc-50 sm:left-12"
      >
        {site.domain}
      </a>
      <div
        className={cn(
          "absolute inset-x-6 bottom-[16svh] text-center transition-opacity",
          surfacing ? "duration-500" : "duration-1000",
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
          onClick={surface}
          className="mt-8 inline-block rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition-colors hover:border-zinc-500 hover:text-zinc-50"
        >
          Back to the surface
        </a>
      </div>
    </main>
  )
}
