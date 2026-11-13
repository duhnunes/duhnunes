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

// The birth, in seconds from the page opening.
const READ = 1.2 // the typed path sits still, long enough to read
const COMPRESS = 2.2 // its letters have crushed into one point of light
const IMPLODE = 2.8 // the star swells, then caves in: the hole begins here
const FORMED = 4.6 // horizon and disk fully formed
const MESSAGE = 4.1 // the text shows while the disk settles
const MAX_CHARS = 40
// The hole's trip from the middle of the 404 to where the home page's hole opens.
const SURFACE_MS = 1200

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
const easeIn = (t: number) => t * t * t

const voidAnchor: Anchor = (width) => ({ x: 0.5, y: width < 640 ? 0.3 : 0.36 })

const noSubscribe = () => () => {}

/** The 404: the path the visitor typed collapses into a star, which implodes into the black hole. */
export function CollapsingPath() {
  const holeRef = useRef<HTMLCanvasElement>(null)
  const lettersRef = useRef<HTMLCanvasElement>(null)
  const blackHoleRef = useRef<BlackHole | null>(null)
  // 0 in the middle of the 404, 1 at the home page's opening spot.
  const travel = useRef(0)
  const reducedMotion = useReducedMotion()
  const router = useRouter()
  const [born, setBorn] = useState(false)
  const [surfacing, setSurfacing] = useState(false)
  const path = useSyncExternalStore(
    noSubscribe,
    () => decodeURIComponent(window.location.pathname),
    () => "",
  )
  const shown = path.length > MAX_CHARS ? `${path.slice(0, MAX_CHARS - 1)}…` : path

  // Load the home page during the birth, so the hand-over has nothing to wait for.
  useEffect(() => {
    router.prefetch("/")
  }, [router])

  useEffect(() => {
    const holeCanvas = holeRef.current
    const canvas = lettersRef.current
    if (!holeCanvas || !canvas || reducedMotion === null) return

    const skip = reducedMotion || !shown
    const hole = { cx: 0, cy: 0 }
    const blackHole = createBlackHole(holeCanvas, {
      reducedMotion,
      formation: skip ? 1 : 0,
      anchor: (width, height) => {
        const from = voidAnchor(width, height)
        const to = cornerAnchor(width, height)
        const e = travel.current
        return { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }
      },
      onFrame: ({ cx, cy }) => Object.assign(hole, { cx, cy }),
    })
    blackHoleRef.current = blackHole
    const destroy = () => {
      blackHoleRef.current = null
      blackHole.destroy()
    }
    if (skip) {
      // Without the birth there is nothing to wait for. Deferred: an effect
      // shouldn't set state while it runs.
      const shownNow = window.setTimeout(() => setBorn(true))
      return () => {
        window.clearTimeout(shownNow)
        destroy()
      }
    }

    const ctx = canvas.getContext("2d")!
    const font = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono")
    const start = performance.now()
    let frame = 0
    let told = false

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
      const t = (now - start) / 1000
      const { cx, cy } = hole
      const unit = Math.min(width, height)

      if (t < COMPRESS) {
        // The typed path, then its letters crushed together into one point.
        const c = easeIn(clamp((t - READ) / (COMPRESS - READ)))
        const size = Math.min(28, (width - 48) / (shown.length * 0.62))
        ctx.font = `${size}px ${font}, monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "#fafafa"
        ctx.shadowColor = "rgba(250,250,250,0.9)"
        ctx.shadowBlur = 2 + c * 22
        const total = ctx.measureText(shown).width
        let x = cx - total / 2
        for (const ch of shown) {
          const w = ctx.measureText(ch).width
          const x0 = x + w / 2
          x += w
          const scale = 1 - 0.85 * c
          ctx.save()
          ctx.translate(cx + (x0 - cx) * (1 - c), cy)
          ctx.scale(scale, scale)
          ctx.fillText(ch, 0, 0)
          ctx.restore()
        }
        ctx.shadowBlur = 0
      } else if (t < IMPLODE) {
        // A star: it swells and brightens, then caves in on itself.
        const p = (t - COMPRESS) / (IMPLODE - COMPRESS)
        const swell = Math.sin(clamp(p / 0.7) * Math.PI * 0.5)
        const cave = easeIn(clamp((p - 0.7) / 0.3))
        const r = (5 + swell * 5) * (1 - cave)
        if (r > 0.2) {
          const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 5)
          glow.addColorStop(0, "rgba(255,255,255,1)")
          glow.addColorStop(0.2, "rgba(244,244,245,0.6)")
          glow.addColorStop(1, "rgba(244,244,245,0)")
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(cx, cy, r * 5, 0, Math.PI * 2)
          ctx.fill()
        }
      } else {
        // The implosion's light rushing out, kept soft: no hard flash on a dark page.
        const p = clamp((t - IMPLODE) / 0.9)
        if (p < 1) {
          const radius = unit * 0.45 * (1 - Math.pow(1 - p, 3))
          ctx.strokeStyle = `rgba(244,244,245,${0.4 * (1 - p)})`
          ctx.lineWidth = 1 + 2 * (1 - p)
          ctx.beginPath()
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
          ctx.stroke()
          const haze = ctx.createRadialGradient(cx, cy, 0, cx, cy, unit * 0.3)
          haze.addColorStop(0, `rgba(244,244,245,${0.14 * (1 - p)})`)
          haze.addColorStop(1, "rgba(244,244,245,0)")
          ctx.fillStyle = haze
          ctx.fillRect(0, 0, width, height)
        }
        blackHole.setFormation(clamp((t - IMPLODE) / (FORMED - IMPLODE)))
      }

      if (!told && t >= MESSAGE) {
        told = true
        setBorn(true)
      }
      if (t < FORMED) frame = requestAnimationFrame(step)
      else {
        ctx.clearRect(0, 0, width, height)
        blackHole.setFormation(1)
      }
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
    // Mid-birth, the plain link just loads the home page.
    if (reducedMotion !== false || !blackHole || surfacing || !born) return
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

  const done = born && !surfacing

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
