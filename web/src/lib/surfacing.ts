// "Back to the surface": the 404 carries its black hole to where the home page's
// hole opens, then hands over with a client navigation (no reload). The home
// page continues the same streaks and stars, and fades its content in.

import type { Sky } from "@/lib/black-hole"

const ATTRIBUTE = "data-surfacing"
// The longest fade in globals.css (delay + duration), plus a margin.
const FADE_MS = 2200

// The hand-over is good for a few seconds: long enough for the home page to
// mount (twice, in development), short enough that a later visit draws a new sky.
const SKY_TTL_MS = 5000

let handedSky: Sky | null = null
let handedAt = 0

export function markSurfacing(sky: Sky) {
  handedSky = sky
  handedAt = performance.now()
  const root = document.documentElement
  root.setAttribute(ATTRIBUTE, "")
  // Cleared afterwards, so later visits to the home page show it at once.
  window.setTimeout(() => root.removeAttribute(ATTRIBUTE), FADE_MS)
}

/** The sky the 404 just handed over; null on any ordinary visit. */
export function takeSky() {
  return handedSky && performance.now() - handedAt < SKY_TTL_MS ? handedSky : null
}
