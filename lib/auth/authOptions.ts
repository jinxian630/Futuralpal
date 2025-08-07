import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: 'openid email profile',
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('🔐 SignIn Callback:', {
        user: user?.email,
        account: account?.provider,
        provider: account?.provider,
        type: account?.type
      })
      
      if (account?.error) {
        console.error('❌ OAuth Account Error:', account.error)
        return false
      }
      
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect Callback:', { url, baseUrl })
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      
      return baseUrl
    },
    async jwt({ token, account, profile, user }) {
      console.log('🎫 JWT Callback:', {
        hasToken: !!token,
        hasAccount: !!account,
        provider: account?.provider,
        hasIdToken: !!account?.id_token
      })
      
      // Store the JWT token from Google OAuth
      if (account && account.id_token) {
        token.idToken = account.id_token
        console.log('✅ ID Token stored in JWT')
      }
      return token
    },
    async session({ session, token }) {
      console.log('📋 Session Callback:', {
        hasSession: !!session,
        hasToken: !!token,
        hasIdToken: !!token?.idToken,
        userEmail: session?.user?.email
      })
      
      // Pass JWT token to session
      session.idToken = token.idToken as string
      return session
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('🎉 SignIn Event:', {
        userEmail: user.email,
        provider: account?.provider,
        isNewUser
      })
    }
  },
  pages: {
    signIn: '/register',
    error: '/register',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}