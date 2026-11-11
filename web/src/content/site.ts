// Public copy and links. Keep RDX first, and list only released projects.

export type Project = {
  name: string
  description: string
  href: string
  label: string
  links: { label: string; href: string }[]
}

export const site = {
  name: "DuH Nunes",
  domain: "duhnunes.dev",
  tagline: "truck driver, front-end, bearded",
  description:
    "DuH Nunes builds tools: RDX, a documentation framework, SCS IntelliSense and Sightline.",
}

export const projects: Project[] = [
  {
    name: "RDX",
    description:
      "A documentation framework built with Next.js, Tailwind CSS and shadcn/ui. Versioning, i18n and search out of the box.",
    href: "https://github.com/lexibase/rdx",
    label: "@lexibase/rdx",
    links: [{ label: "RDX on GitHub", href: "https://github.com/lexibase/rdx" }],
  },
  {
    name: "SCS IntelliSense",
    description:
      "Language support for SCS Software game files in VS Code, with diagnostics and formatting.",
    href: "https://docs.duhnunes.dev/scs-intellisense/docs",
    label: "docs.duhnunes.dev/scs-intellisense",
    links: [
      { label: "SCS IntelliSense docs", href: "https://docs.duhnunes.dev/scs-intellisense/docs" },
      { label: "SCS IntelliSense on GitHub", href: "https://github.com/duhnunes/scs-intellisense" },
    ],
  },
  {
    name: "Sightline",
    description:
      "An in-game multi-monitor editor for American Truck Simulator and Euro Truck Simulator 2. Drag your views and every change applies live.",
    href: "https://docs.duhnunes.dev/sightline",
    label: "docs.duhnunes.dev/sightline",
    links: [
      { label: "Sightline docs", href: "https://docs.duhnunes.dev/sightline" },
      { label: "Download Sightline", href: "https://docs.duhnunes.dev/sightline/download" },
    ],
  },
]

export const social = [
  { label: "GitHub", href: "https://github.com/duhnunes" },
  { label: "LinkedIn", href: "https://linkedin.com/in/duhnunes/" },
  { label: "Email", href: "mailto:duhnunes.dev@gmail.com" },
]
