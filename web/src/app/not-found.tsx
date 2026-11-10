import type { Metadata } from "next"

import { SpaghettifiedPath } from "@/components/spaghettified-path"

export const metadata: Metadata = {
  title: "Lost in the void · DuH Nunes",
}

export default function NotFound() {
  return <SpaghettifiedPath />
}
