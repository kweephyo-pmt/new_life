import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "New Life - AI Travel Companion",
  description: "Your personalized AI-powered travel companion for simplified and smart travel planning",
  icons: {
    icon: '/NewLifeLOGO.png',
    shortcut: '/NewLifeLOGO.png',
    apple: '/NewLifeLOGO.png',
  },
  openGraph: {
    title: "New Life - AI Travel Companion",
    description: "Your personalized AI-powered travel companion for simplified and smart travel planning",
    url: "https://new-life-ai.vercel.app",
    siteName: "New Life",
    images: [
      {
        url: 'https://new-life-ai.vercel.app/preview.png',
        width: 1200,
        height: 630,
        alt: 'New Life - AI Travel Companion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "New Life - AI Travel Companion",
    description: "Your personalized AI-powered travel companion for simplified and smart travel planning",
    images: ['https://new-life-ai.vercel.app/preview.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <Analytics />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
