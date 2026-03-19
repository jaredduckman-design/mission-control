import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'Dark premium operations dashboard for Jared’s agent stack.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
