import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CardioTrack ZA - Heart Health Monitoring',
  description: 'Mobile-first heart health tracking app for South Africa',
  manifest: '/manifest.json',
  themeColor: '#0E8A8A',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CardioTrack ZA'
  },
  formatDetection: {
    telephone: false
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}