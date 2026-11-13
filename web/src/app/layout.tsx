import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { site } from "@/content/site"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// Vercel sets the production domain; it becomes duhnunes.dev once the domain is attached.
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl ? `https://${productionUrl}` : "http://localhost:3000"),
  title: site.name,
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.domain,
    title: site.name,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="bg-black">
        {children}
        {/* Cookie-free visit counts (Vercel Web Analytics); does nothing outside Vercel. */}
        <Analytics />
      </body>
    </html>
  )
}
