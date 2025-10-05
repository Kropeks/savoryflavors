import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getMockSession } from './auth-utils';
import { queryOne } from './db';

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
          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isCorrectPassword) {
            throw new Error('Invalid password. Please check your credentials and try again.');
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role || 'user'
          };
        } catch (error) {
          // If it's a database connection error or other MySQL error
          if (error.code === 'ECONNREFUSED' || error.message.includes('database') || error.message.includes('connect')) {
            throw new Error('Database connection error. Please check your database configuration.');
          }

          // If it's a user not found error, provide helpful message
          if (error.message.includes('No account found')) {
            throw error;
          }

          // For other errors, provide a generic message
          throw new Error('Authentication failed. Please try again later.');
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (isAuthDisabled) {
        // Return mock session when auth is disabled
        return getMockSession();
      }

      if (token) {
        session.user.id = token.id;
        // Ensure role is always lowercase for consistent comparison
        session.user.role = token.role?.toLowerCase() || 'user';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Normalize role to lowercase when setting in token
        token.role = user.role?.toUpperCase();
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      // Default to homepage
      return `${baseUrl}/`;
    }
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: isAuthDisabled ? 'dummy-secret-for-disabled-auth' : process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});
