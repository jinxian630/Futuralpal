import './globals.css'
import { Inter } from 'next/font/google'
import { UserProvider } from '@/lib/contexts/UserContext'
import { NextAuthProvider } from '@/lib/providers/NextAuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'FuturoPal - AI Study Buddy & Digital Learning World',
  description: 'Transform your notes into personalized lessons. Earn NFT points, customize your digital room, and learn smarter with AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}