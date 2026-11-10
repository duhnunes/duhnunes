import { FallHero } from "@/components/fall-hero"
import { ProjectCard } from "@/components/project-card"
import { SiteNav } from "@/components/site-nav"
import { projects, site, social } from "@/content/site"

export default function Home() {
  return (
    <>
      <SiteNav />
      <main id="top">
        <FallHero />
        <section id="projects" aria-label="Projects" className="min-h-svh bg-black px-6 pt-24 pb-16 sm:px-12">
          <div className="mx-auto max-w-5xl">
            <p className="font-mono text-sm text-zinc-600">~/limbo</p>
            <h2 className="sr-only">Projects</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-[1.25fr_1fr]">
              {projects.map((project, i) => (
                <ProjectCard
                  key={project.name}
                  project={project}
                  index={i}
                  className={i === 0 ? "md:min-h-80" : undefined}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-black px-6 pb-10 sm:px-12">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 font-mono text-xs text-zinc-600">
          <span>{site.name}</span>
          <ul className="flex gap-4">
            {social.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-zinc-300">
                  {link.label.toLowerCase()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </>
  )
}
