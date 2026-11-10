// Canvas 2D black hole: a tilted accretion disk drawn as light streaks, a lensed
// ring around the horizon and stars pushed away from it. `fall` (0..1) moves the
// hole from its corner to the centre and grows it until it covers the screen.

type Particle = { k: number; a: number; len: number; b: number; v: number }
type Star = { x: number; y: number; b: number }

export type FrameState = {
  cx: number
  cy: number
  radius: number
  width: number
  height: number
  fall: number
}

export type BlackHole = {
  setFall: (fall: number) => void
  setActive: (active: boolean) => void
  destroy: () => void
}

const TILT = 0.2
const ROT = -0.12
const COS_ROT = Math.cos(ROT)
const SIN_ROT = Math.sin(ROT)
const ALPHA_LEVELS = 7
const SEGMENTS = 6
// Disk layers: 0 = behind the hole, 1 = lensed ring, 2 = in front of the hole.
const LAYER_WIDTH = [1, 0.7, 1.25]
const LAYER_ALPHA = [0.85, 0.35, 0.85]

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

function spawn(p: Particle, fresh: boolean) {
  const u = Math.pow(Math.random(), 1.7)
  p.k = fresh ? 1.3 + u * 2.3 : 3.4 + Math.random() * 0.2
  p.a = Math.random() * Math.PI * 2
  p.len = 0.12 + Math.random() * 0.38
  p.b = Math.random() < 0.15 ? 1 : 0.3 + Math.random() * 0.5
  p.v = 0.8 + Math.random() * 0.4
  return p
}

type Anchor = (width: number, height: number) => { x: number; y: number }

// Bottom-right corner on wide screens; upper right on phones, clear of the hero text.
const cornerAnchor: Anchor = (width) => (width < 640 ? { x: 0.74, y: 0.3 } : { x: 0.84, y: 0.78 })

export function createBlackHole(
  canvas: HTMLCanvasElement,
  {
    reducedMotion,
    onFrame,
    anchor = cornerAnchor,
  }: { reducedMotion: boolean; onFrame?: (state: FrameState) => void; anchor?: Anchor },
): BlackHole {
  const ctx = canvas.getContext("2d")!
  let width = 0
  let height = 0
  let particles: Particle[] = []
  let stars: Star[] = []
  let fall = 0
  let active = true
  let frame = 0
  let last = performance.now()

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    width = canvas.clientWidth
    height = canvas.clientHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    // Fewer streaks on small screens: the effect reads the same and costs less battery.
    const count = width < 640 ? 450 : 800
    if (particles.length !== count)
      particles = Array.from({ length: count }, () => spawn({} as Particle, true))
    const starCount = Math.min(300, Math.round((width * height) / 6000))
    if (stars.length !== starCount)
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random(),
        y: Math.random(),
        b: 0.12 + Math.random() * 0.45,
      }))
    if (reducedMotion) draw(0)
  }

  function draw(dt: number) {
    const q = clamp(fall)
    const eq = ease(q)
    const a = anchor(width, height)
    const r0 = Math.max(40, Math.min(110, Math.min(width, height) * 0.12))
    const cx = (a.x + (0.5 - a.x) * eq) * width
    const cy = (a.y + (0.5 - a.y) * eq) * height
    const R = r0 * (1 + q * q * 16)
    onFrame?.({ cx, cy, radius: R, width, height, fall: q })

    if (q >= 1) {
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, width, height)
      return
    }

    ctx.globalCompositeOperation = "source-over"
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, width, height)

    for (const s of stars) {
      let x = s.x * width
      let y = s.y * height
      const dx = x - cx
      const dy = y - cy
      const d = Math.hypot(dx, dy) || 1
      if (d < R * 1.1) continue
      const push = (R * R * 0.9) / d
      x += (dx / d) * push
      y += (dy / d) * push
      ctx.fillStyle = `rgba(250,250,250,${s.b * (1 - q)})`
      ctx.fillRect(x, y, 1, 1)
    }

    const paths = [0, 1, 2].map(() => Array.from({ length: ALPHA_LEVELS }, () => new Path2D()))
    const add = (layer: number, al: number, x0: number, y0: number, x1: number, y1: number) => {
      if (al < 0.04) return
      const path = paths[layer][Math.min(ALPHA_LEVELS - 1, Math.floor(al * ALPHA_LEVELS))]
      path.moveTo(x0, y0)
      path.lineTo(x1, y1)
    }
    const speed = 1 + q * 2

    for (const p of particles) {
      if (dt > 0) {
        p.a += (0.016 * p.v * speed * dt) / Math.pow(p.k, 1.5)
        p.k -= 0.0012 * speed * dt * (1 + 1.5 / p.k)
        if (p.k < 1.25) spawn(p, false)
      }
      const r = R * p.k
      const fade = Math.min(1, (p.k - 1.25) / 0.3) * Math.min(1, (3.6 - p.k) / 0.6)
      const lens = R * 1.06 + (p.k - 1.3) * R * 0.26
      let px = 0, py = 0, lx = 0, ly = 0
      for (let i = 0; i <= SEGMENTS; i++) {
        const t = i / SEGMENTS
        const th = p.a - t * p.len
        const ex = Math.cos(th) * r
        const ey = Math.sin(th) * r * TILT
        const x = cx + ex * COS_ROT - ey * SIN_ROT
        const y = cy + ex * SIN_ROT + ey * COS_ROT
        const qx = cx + Math.cos(th) * lens
        const qy = cy + Math.sin(th) * lens * 0.98
        if (i > 0) {
          const tail = Math.pow(1 - t, 1.3)
          const doppler = 1 + 0.55 * Math.cos(th)
          const al = Math.min(1, p.b * fade * doppler * tail * (1.5 / p.k))
          add(Math.sin(th) < 0 ? 0 : 2, al, px, py, x, y)
          add(1, al, lx, ly, qx, qy)
        }
        px = x; py = y; lx = qx; ly = qy
      }
    }

    const flush = (layer: number) => {
      ctx.lineWidth = LAYER_WIDTH[layer]
      for (let i = 0; i < ALPHA_LEVELS; i++) {
        ctx.strokeStyle = `rgba(244,244,245,${((i + 1) / ALPHA_LEVELS) * LAYER_ALPHA[layer]})`
        ctx.stroke(paths[layer][i])
      }
    }
    ctx.lineCap = "round"
    ctx.globalCompositeOperation = "lighter"
    flush(0)
    flush(1)
    ctx.globalCompositeOperation = "source-over"
    ctx.fillStyle = "#000"
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = `rgba(250,250,250,${0.5 * (1 - q)})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, R * 1.02, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalCompositeOperation = "lighter"
    flush(2)
    ctx.globalCompositeOperation = "source-over"
  }

  function loop(now: number) {
    const dt = Math.min(3, (now - last) / 16.67)
    last = now
    draw(dt)
    frame = active ? requestAnimationFrame(loop) : 0
  }

  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()
  if (!reducedMotion) frame = requestAnimationFrame(loop)

  return {
    setFall(value) {
      fall = value
      if (reducedMotion) draw(0)
    },
    setActive(value) {
      if (value === active) return
      active = value
      if (active && !reducedMotion && !frame) {
        last = performance.now()
        frame = requestAnimationFrame(loop)
      }
    },
    destroy() {
      cancelAnimationFrame(frame)
      frame = 0
      observer.disconnect()
    },
  }
}
