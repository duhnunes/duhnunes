"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { projects, site, social } from "@/content/site"

// The browser's smooth scroll starts fast and eases out. Going up to #top, the
// fall plays backwards in that slow tail, which feels right. Going down, the
// whole fall would rush by in the first ~200ms, so the dive to #projects starts
// slowly instead and gives the fall about the same time as the way back out.
const DIVE_MS = 1100
const INTERRUPT = ["wheel", "touchstart", "keydown"] as const
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function dive(target: Element) {
  const from = window.scrollY
  const to = from + target.getBoundingClientRect().top
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: to, behavior: "instant" })
    return
  }
  const start = performance.now()
  let frame = 0
  let listening = false
  // Any wheel, touch or key hands the scroll back to the visitor.
  const stop = () => {
    cancelAnimationFrame(frame)
    for (const type of INTERRUPT) window.removeEventListener(type, stop)
  }
  const step = (now: number) => {
    // Listen from the first frame on, so the Enter that picked "Projects" in the
    // menu (still bubbling now) doesn't cancel the dive it started.
    if (!listening) {
      listening = true
      for (const type of INTERRUPT) window.addEventListener(type, stop, { passive: true })
    }
    const p = Math.min(1, (now - start) / DIVE_MS)
    window.scrollTo({ top: from + (to - from) * easeInOutCubic(p), behavior: "instant" })
    if (p < 1) frame = requestAnimationFrame(step)
    else stop()
  }
  frame = requestAnimationFrame(step)
}

function go(href: string) {
  if (href === "#projects") {
    const target = document.querySelector(href)
    if (target) dive(target)
    history.pushState(null, "", href)
  } else if (href.startsWith("#")) document.querySelector(href)?.scrollIntoView({ behavior: "smooth" })
  else if (href.startsWith("mailto:")) window.location.href = href
  else window.open(href, "_blank", "noopener,noreferrer")
}

const noSubscribe = () => () => {}

export function SiteNav() {
  const [open, setOpenState] = useState(false)
  const [query, setQuery] = useState("")
  // Every visit to the menu starts with an empty search.
  const setOpen = (value: boolean | ((value: boolean) => boolean)) => {
    setOpenState(value)
    setQuery("")
  }
  const shortcut = useSyncExternalStore(
    noSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘K" : "Ctrl K"),
    () => "Ctrl K",
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const run = (href: string) => {
    setOpen(false)
    go(href)
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-4 text-sm sm:px-12">
        <a href="#top" className="font-mono text-zinc-50">
          {site.domain}
        </a>
        <nav className="flex items-center gap-5 text-zinc-400">
          <a
            href="#projects"
            onClick={(event) => {
              event.preventDefault()
              go("#projects")
            }}
            className="transition-colors hover:text-zinc-50"
          >
            projects
          </a>
          <a
            href={social[0].href}
            className="transition-colors hover:text-zinc-50"
            target="_blank"
            rel="noopener noreferrer"
          >
            github
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-md border border-zinc-700 px-1.5 py-0.5 font-mono text-xs transition-colors hover:border-zinc-500 hover:text-zinc-50"
            aria-label="Open command menu"
          >
            <span className="hidden sm:inline">{shortcut}</span>
            <span className="sm:hidden">menu</span>
          </button>
        </nav>
      </header>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Command menu"
        description="Jump to a project or a link"
      >
        <Command>
          <CommandInput placeholder="Where to?" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>Nothing here. Just the void.</CommandEmpty>
            <CommandGroup heading="Navigate">
              <CommandItem onSelect={() => run("#projects")}>Projects</CommandItem>
              <CommandItem onSelect={() => run("#top")}>Back to the surface</CommandItem>
            </CommandGroup>
            <CommandGroup heading="Projects">
              {projects.flatMap((project) =>
                project.links.map((link) => (
                  <CommandItem key={link.href} onSelect={() => run(link.href)}>
                    {link.label}
                  </CommandItem>
                )),
              )}
            </CommandGroup>
            <CommandGroup heading="Elsewhere">
              {social.map((link) => (
                <CommandItem key={link.href} onSelect={() => run(link.href)}>
                  {link.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
