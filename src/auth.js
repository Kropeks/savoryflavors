import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getMockSession } from './lib/auth-utils';
import { queryOne } from './lib/db';

// Check if authentication is disabled
const isAuthDisabled = process.env.DISABLE_AUTH === 'true';

if (isAuthDisabled) {
  console.warn('⚠️  Authentication is currently DISABLED. All routes are accessible without authentication.');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Do not use PrismaAdapter because your Prisma schema does not include NextAuth tables
  adapter: undefined,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (isAuthDisabled) {
          // Return mock session when auth is disabled
          return getMockSession();
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password');
        }

        try {
          // Find user in database
          const user = await queryOne(
            'SELECT * FROM users WHERE email = ?',
            [credentials.email]
          );

          if (!user) {
            throw new Error('No account found with this email address. Please sign up first.');
          }

          // Ensure password field exists
          if (!user.password) {
            throw new Error('Please sign in using your social account or reset your password');
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Incorrect password. Please try again.');
          }

          // Return user object without the password
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error(error.message || 'An error occurred during authentication');
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (isAuthDisabled) {
        return session;
      }
      
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
});
