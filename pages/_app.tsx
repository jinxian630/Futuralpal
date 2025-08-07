import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { UserProvider } from '@/lib/contexts/UserContext'
import '@/app/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <UserProvider>
        <div className="min-h-screen bg-gray-50">
          <Component {...pageProps} />
        </div>
      </UserProvider>
    </SessionProvider>
  )
}