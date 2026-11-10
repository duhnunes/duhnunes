import { useSyncExternalStore } from "react"

const query = "(prefers-reduced-motion: reduce)"

function subscribe(callback: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener("change", callback)
  return () => media.removeEventListener("change", callback)
}

/** `null` until hydrated, so server and client agree on the first render. */
export function useReducedMotion() {
  return useSyncExternalStore<boolean | null>(
    subscribe,
    () => window.matchMedia(query).matches,
    () => null,
  )
}
