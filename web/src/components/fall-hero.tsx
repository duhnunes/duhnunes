"use client"

import { useEffect, useRef } from "react"

import { projects, site } from "@/content/site"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { createBlackHole, type FrameState } from "@/lib/black-hole"

// The fall finishes before the section ends, leaving a stretch of pure black
// (the limbo) before the projects scroll in.
const FALL_END = 0.8

export function FallHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const hero = heroRef.current
    if (!section || !canvas || !hero || reducedMotion === null) return

    // The hero text is pulled towards the horizon as the visitor falls.
    const onFrame = ({ cx, cy, fall }: FrameState) => {
      const e = fall < 0.5 ? 2 * fall * fall : 1 - Math.pow(-2 * fall + 2, 2) / 2
      // Layout box (offset*), not the transformed one, so the pull doesn't feed back.
      const dx = (cx - hero.offsetLeft - hero.offsetWidth / 2) * e * 0.5
      const dy = (cy - hero.offsetTop - hero.offsetHeight) * e * 0.5
      hero.style.opacity = String(Math.max(0, 1 - fall * 1.4))
      hero.style.transform = `translate(${dx}px, ${dy}px) scale(${1 - e * 0.7}) rotate(${e * 25}deg)`
      hero.style.visibility = fall >= 0.72 ? "hidden" : "visible"
    }
    const blackHole = createBlackHole(canvas, { reducedMotion, onFrame })

    const update = () => {
      if (reducedMotion) return
      const rect = section.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const progress = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0
      blackHole.setFall(Math.min(1, progress / FALL_END))
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)

    // Stop animating while the section is off screen.
    const visibility = new IntersectionObserver(([entry]) =>
      blackHole.setActive(entry.isIntersecting),
    )
    visibility.observe(section)

    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      visibility.disconnect()
      blackHole.destroy()
    }
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      aria-label="Intro"
      className={reducedMotion ? "relative h-svh" : "relative h-[260svh]"}
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-[#0a0a0a]">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
        <div
          ref={heroRef}
          className="absolute bottom-10 left-6 origin-bottom-left sm:bottom-14 sm:left-12"
        >
          <h1 className="text-4xl font-medium tracking-tight text-zinc-50 sm:text-5xl">
            {site.name}
          </h1>
          <p className="mt-2 text-base text-zinc-400">{site.tagline}</p>
          <ul className="mt-4 flex gap-3 font-mono text-sm text-zinc-500">
            {projects.map((project, i) => (
              <li key={project.name} className="flex gap-3">
                {i > 0 && <span aria-hidden="true">·</span>}
                <a href={project.href} className="transition-colors hover:text-zinc-200">
                  {project.name.toLowerCase().replace(/ /g, "-")}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
