// Generates an animated SVG of the site's black hole for the GitHub profile README.
// Pure SVG + CSS animations (GitHub serves README images without scripts).
// Run from the repository root: node .github/readme/make-void.mjs .github/readme/void.svg
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

// Geist, subset to the letters drawn here (GitHub blocks external fonts in images).
const here = dirname(fileURLToPath(import.meta.url))
const font = (w) => readFileSync(join(here, `geist-${w}.woff2`)).toString("base64")

const out = process.argv[2]
const W = 1200
const H = 360
const CX = 930
const CY = 190
const R = 74
const TILT = 0.2
const ROT = (-0.12 * 180) / Math.PI

let seed = 7
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
const f = (n) => Math.round(n * 100) / 100

// Disk rings: each is a dashed circle (the streaks) spinning at its Keplerian pace.
const rings = []
for (let i = 0; i < 190; i++) {
  const k = 1.3 + Math.pow(rand(), 1.6) * 2.3
  const r = R * k
  const c = 2 * Math.PI * r
  const dashes = []
  let used = 0
  const fill = 0.15 + rand() * 0.35
  while (used < c * 0.95) {
    const dash = c * (0.012 + rand() * 0.04)
    const gap = dash * (1 / fill - 1) * (0.4 + rand() * 1.2)
    dashes.push(f(dash), f(gap))
    used += dash + gap
  }
  const period = f(6.5 * Math.pow(k, 1.5))
  const bright = rand() < 0.12 ? 1 : 0.25 + rand() * 0.45
  const alpha = f(Math.min(0.9, bright * (1.5 / k) * Math.min(1, (3.6 - k) / 0.6)))
  const width = f(0.5 + rand() * 0.8)
  const phase = f(-rand() * period)
  rings.push(
    `<circle r="${f(r)}" stroke-opacity="${alpha}" stroke-width="${width}" stroke-dasharray="${dashes.join(" ")}" style="animation-duration:${period}s;animation-delay:${phase}s"/>`,
  )
}

// Lensed light: the far side of the disk bent up and around the horizon.
const lens = []
for (let i = 0; i < 40; i++) {
  const r = R * (1.04 + Math.pow(rand(), 1.5) * 0.32)
  const c = 2 * Math.PI * r
  const dash = c * (0.01 + rand() * 0.05)
  const period = f(7 + rand() * 6)
  lens.push(
    `<circle r="${f(r)}" stroke-opacity="${f(0.04 + rand() * 0.14)}" stroke-width="${f(0.5 + rand() * 0.6)}" stroke-dasharray="${f(dash)} ${f(dash * (2 + rand() * 6))}" style="animation-duration:${period}s;animation-delay:${f(-rand() * period)}s"/>`,
  )
}

// Stars, pushed away from the hole like the site's lensing.
const stars = []
for (let i = 0; i < 140; i++) {
  let x = rand() * W
  let y = rand() * H
  const dx = x - CX
  const dy = y - CY
  const d = Math.hypot(dx, dy) || 1
  if (d < R * 1.1) continue
  const push = (R * R * 0.9) / d
  x += (dx / d) * push
  y += (dy / d) * push
  stars.push(`<rect x="${f(x)}" y="${f(y)}" width="1" height="1" fill-opacity="${f(0.12 + rand() * 0.45)}"/>`)
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<!-- nothing comes back out -->
<style>
.ring{fill:none;stroke:#f4f4f5;stroke-linecap:round;animation-name:spin;animation-timing-function:linear;animation-iteration-count:infinite;vector-effect:non-scaling-stroke}
@keyframes spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.ring{animation:none}}
@font-face{font-family:G;font-weight:500;src:url(data:font/woff2;base64,${font(500)}) format("woff2")}
@font-face{font-family:G;font-weight:400;src:url(data:font/woff2;base64,${font(400)}) format("woff2")}
text{font-family:G,-apple-system,"Segoe UI",sans-serif}
</style>
<defs>
<clipPath id="frame"><rect width="${W}" height="${H}" rx="14"/></clipPath>
<clipPath id="far" clipPathUnits="userSpaceOnUse"><rect x="-999" y="-999" width="1998" height="999"/></clipPath>
<clipPath id="near" clipPathUnits="userSpaceOnUse"><rect x="-999" y="0" width="1998" height="999"/></clipPath>
<linearGradient id="doppler" gradientUnits="userSpaceOnUse" x1="${CX - R * 3.6}" x2="${CX + R * 3.6}" y1="0" y2="0">
<stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff"/>
</linearGradient>
<mask id="shift"><rect width="${W}" height="${H}" fill="url(#doppler)"/></mask>
<g id="disk" class="disk">${rings.map((r) => r.replace("<circle", '<circle class="ring"')).join("")}</g>
</defs>
<g clip-path="url(#frame)">
<rect width="${W}" height="${H}" fill="#0a0a0a"/>
<g fill="#fafafa">${stars.join("")}</g>
<text x="56" y="${H - 86}" font-size="52" font-weight="500" letter-spacing="-1.3" fill="#fafafa">DuH Nunes</text>
<text x="58" y="${H - 50}" font-size="20" fill="#a1a1aa">truck driver, front-end, bearded</text>
<g mask="url(#shift)">
<g transform="translate(${CX} ${CY}) rotate(${f(ROT)}) scale(1 ${TILT})"><use href="#disk" clip-path="url(#far)"/></g>
<g transform="translate(${CX} ${CY})">${lens.map((r) => r.replace("<circle", '<circle class="ring"')).join("")}</g>
</g>
<circle cx="${CX}" cy="${CY}" r="${R}" fill="#000"/>
<g mask="url(#shift)">
<g transform="translate(${CX} ${CY}) rotate(${f(ROT)}) scale(1 ${TILT})"><use href="#disk" clip-path="url(#near)"/></g>
</g>
</g>
</svg>
`
writeFileSync(out, svg)
console.log(`${(svg.length / 1024).toFixed(1)} KB`)
