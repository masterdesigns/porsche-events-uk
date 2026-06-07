import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'PorscheEvents.co.uk — Every UK Porsche Event in One Place',
  description: 'Track days, car meets, club drives and shows. The UK\'s only dedicated Porsche events directory. Updated daily.',
  keywords: 'Porsche events UK, Porsche track day, Porsche car meet, Porsche club drive, Porsche show',
  openGraph: {
    title: 'PorscheEvents.co.uk',
    description: 'Every UK Porsche event in one place. Track days, meets, drives and shows.',
    url: 'https://porscheevents.co.uk',
    siteName: 'PorscheEvents.co.uk',
    locale: 'en_GB',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="bg-porsche-off-white font-body text-porsche-black min-h-screen">
        {children}
      </body>
    </html>
  )
}
