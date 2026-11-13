import type { Metadata } from "next"

import { CollapsingPath } from "@/components/collapsing-path"

export const metadata: Metadata = {
  title: "Lost in the void · DuH Nunes",
}

export default function NotFound() {
  return <CollapsingPath />
}
