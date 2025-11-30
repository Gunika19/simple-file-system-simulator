import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import RootClientExtras from "@/components/rootclientextras"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// <CHANGE> Updated metadata for SecureShare
export const metadata: Metadata = {
  title: "SecureShare - Secure File Sharing",
  description: "Share files securely with end-to-end encryption. Upload, set expiry, and share with specific people.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
          <div className="fixed bottom-4 right-4 z-50">
            <ModeToggle />
          </div>
          <RootClientExtras />
        </ThemeProvider>
      </body>
    </html>
  )
}
