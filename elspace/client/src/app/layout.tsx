import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { SocketProvider } from '@/components/providers/SocketProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

export const metadata: Metadata = {
  title: 'EL SPACE - Freelance Without Friction',
  description: 'Curated freelance marketplace by EL VERSE TECHNOLOGIES. Hire vetted talent or get paid instantly.',
  keywords: 'freelance, marketplace, developers, designers, remote work',
  authors: [{ name: 'EL VERSE TECHNOLOGIES' }],
  openGraph: {
    title: 'EL SPACE - Freelance Without Friction',
    description: 'Curated freelance marketplace. 3-5% fees vs Upwork\'s 20%.',
    url: 'https://elspace.tech',
    siteName: 'EL SPACE',
    images: [
      {
        url: 'https://elspace.tech/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EL SPACE - Freelance Without Friction',
    description: 'Curated freelance marketplace. Keep up to 97% of your earnings.',
    images: ['https://elspace.tech/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <SocketProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </SocketProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
