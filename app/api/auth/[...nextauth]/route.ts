import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { connectToDatabase } from '@/lib/mongodb'
import { UserModel } from '@/models/User'

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        await connectToDatabase()

        if (!user.email) {
          return false
        }

        // Check if user exists, if not create
        let dbUser = await UserModel.findOne({ email: user.email })

        if (!dbUser) {
          dbUser = await UserModel.create({
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account?.providerAccountId,
            accessToken: account?.access_token,
            refreshToken: account?.refresh_token,
            tokenExpiresAt: account?.expires_at ? new Date(account.expires_at * 1000) : undefined,
          })
        } else {
          // Update tokens if they changed
          if (account?.access_token) {
            dbUser.accessToken = account.access_token
            dbUser.refreshToken = account.refresh_token
            dbUser.tokenExpiresAt = account?.expires_at ? new Date(account.expires_at * 1000) : undefined
            await dbUser.save()
          }
        }

        return true
      } catch (error) {
        console.error('[NextAuth] Error in signIn callback:', error)
        return false
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }

      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email
      }

      return session
    },
  },
  events: {
    async signOut() {
      try {
        console.info('[NextAuth] User signed out')
      } catch (error) {
        console.error('[NextAuth] Error in signOut event:', error)
      }
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
