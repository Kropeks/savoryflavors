import './globals.css';
import { Inter, Poppins, Fredoka, Kalam, Merienda } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from './providers';
import SiteShell from '@/components/SiteShell';
import { auth } from '@/lib/auth';

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';

// Load fonts with proper subsets and display settings
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  preload: true,
  adjustFontFallback: false,
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
  preload: true,
  adjustFontFallback: false,
});

// Load design-specified fonts
const fredoka = Fredoka({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fredoka',
  weight: ['400', '500', '600', '700'],
  preload: true,
  adjustFontFallback: false,
});

const kalam = Kalam({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-kalam',
  weight: ['400', '700'],
  preload: true,
  adjustFontFallback: false,
});

const merienda = Merienda({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-merienda',
  weight: ['400', '700'],
  preload: true,
  adjustFontFallback: false,
});

// Define metadata
export const metadata = {
  title: 'SavoryFlavors - Discover & Share Amazing Recipes',
  description: 'Explore thousands of delicious recipes from around the world. Save your favorites, share with friends, and become a better cook today!',
  keywords: ['recipes', 'cooking', 'food', 'cuisine', 'meal planning', 'cooking at home'],
  authors: [{ name: 'SavoryFlavors Team' }],
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#6B8E23',
      },
    ],
  },
  openGraph: {
    title: 'SavoryFlavors - Discover & Share Amazing Recipes',
    description: 'Explore thousands of delicious recipes from around the world.',
    url: 'https://savoryflavors.com',
    siteName: 'SavoryFlavors',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SavoryFlavors - Delicious Recipes',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SavoryFlavors - Discover & Share Amazing Recipes',
    description: 'Explore thousands of delicious recipes from around the world.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export const viewport = {
  themeColor: '#6B8E23',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }) {
  let session = null;
  try {
    session = await auth();
  } catch (e) {
    // Prevent auth errors from breaking the entire app render
    console.error('Failed to retrieve session in RootLayout:', e);
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${fredoka.variable} ${kalam.variable} ${merienda.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <Analytics />
        <SpeedInsights />

        {/* Preload critical assets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preload hero image */}
        <link rel="preload" as="image" href="/placeholder-recipe.jpg" />

        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "SavoryFlavors",
            "url": "https://savoryflavors.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://savoryflavors.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </head>

      <body className="min-h-screen bg-white dark:bg-gray-900 font-fredoka text-olive-800 dark:text-gray-200 antialiased">
        <Providers session={session}>
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:p-4 focus:ring-2 focus:ring-olive-600 dark:focus:bg-gray-800"
          >
            Skip to main content
          </a>

          <SiteShell>
            {children}
          </SiteShell>

          {/* Notification Toaster */}
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 5000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                boxShadow: 'var(--shadow-md)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: '0.9375rem',
                lineHeight: '1.5',
                maxWidth: '100%',
                width: 'auto',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'hsl(var(--primary-foreground))',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'hsl(var(--destructive-foreground))',
                },
              },
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                      },
                      function(err) {
                        console.log('ServiceWorker registration failed: ', err);
                      }
                    );
                  });
                }
              `,
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
