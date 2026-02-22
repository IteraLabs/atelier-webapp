import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono as GeistMono } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import { Providers } from "./providers"

const geistMono = GeistMono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Atelier | IteraLabs",
  description: "Quantitative research platform for defi & market microstructure analysis",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistMono.className} bg-black text-white antialiased`}>
        <Providers>{children}</Providers>
        <Script
          src="https://cdn.plot.ly/plotly-basic-2.35.2.min.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  )
}
