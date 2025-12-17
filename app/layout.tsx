import 'css/tailwind.css'
import 'pliny/search/algolia.css'
import 'remark-github-blockquote-alert/alert.css'

import { Archivo, Questrial } from 'next/font/google'
import { Analytics, AnalyticsConfig } from 'pliny/analytics'
import { SearchProvider, SearchConfig } from 'pliny/search'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics as VercelAnalytics } from '@vercel/analytics/next'
import Header from '@/components/Header'
import SectionContainer from '@/components/SectionContainer'
import Footer from '@/components/Footer'
import siteMetadata from '@/data/siteMetadata'
import { ThemeProviders } from './theme-providers'
import { Metadata } from 'next'
import Script from 'next/script'
import { PostHogProvider } from '@/components/PostHogProvider'
import { GoogleAnalyticsProvider } from '@/components/GoogleAnalytics'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-3BNNFQ6N5R'

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
})

const questrial = Questrial({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-questrial',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  icons: {
    icon: [
      { url: '/static/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/static/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/static/favicons/apple-touch-icon.png',
    shortcut: '/static/favicons/favicon.ico',
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: './',
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
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
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    images: [siteMetadata.socialBanner],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const basePath = process.env.BASE_PATH || ''

  return (
    <html
      lang={siteMetadata.language}
      className={`${archivo.variable} ${questrial.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      {/* Google tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <Script id="branded-console" strategy="afterInteractive">
        {`
          (function() {
            // Clear console completely
            if (typeof console.clear === 'function') {
              console.clear();
            }
            
            // Brand colors - ShopGuide blue: #2E9AB3 (RGB: 46, 154, 179)
            const brandBlue = '#2E9AB3';
            const brandBlueRGB = '46, 154, 179';
            const lightBlue = '#4db8d1';
            
            // Styled console message
            const styles = {
              header: \`font-size: 20px; font-weight: 700; color: \${brandBlue}; padding: 8px 0; letter-spacing: 2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\`,
              subtitle: \`font-size: 11px; color: \${lightBlue}; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;\`,
              accent: \`font-size: 14px; color: \${brandBlue}; font-weight: 600; margin-top: 12px;\`,
              text: \`font-size: 13px; color: #555; line-height: 1.8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\`,
              link: \`font-size: 13px; color: \${brandBlue}; text-decoration: underline; font-weight: 600;\`,
              stat: \`font-size: 13px; color: #fff; font-weight: 700; background: \${brandBlue}; padding: 3px 8px; border-radius: 3px;\`,
              divider: \`color: rgba(\${brandBlueRGB}, 0.15); font-size: 10px;\`
            };
            
            // Minimalistic AI-themed header
            console.log(
              \`%c
╔═══════════════════════════════════════════════╗
║                                               ║
║              SHOPGUIDE                        ║
║                                               ║
║        Agentic Commerce for Shopify          ║
║                                               ║
╚═══════════════════════════════════════════════╝\`,
              styles.header
            );
            
            console.log('%cAGENTIC COMMERCE FOR SHOPIFY', styles.subtitle);
            console.log('');
            console.log('%c🤖 AI-Powered Shopping Agents', styles.accent);
            console.log('');
            console.log('%cTransform your Shopify store with autonomous AI agents that drive real conversions.', styles.text);
            console.log('');
            console.log(
              \`%c💰 Revenue Generated: %c$100,000+%c across our merchant network\`,
              styles.text,
              styles.stat,
              styles.text
            );
            console.log('');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.divider);
            console.log('');
            console.log('%c🚀 Ready to transform your store?', styles.accent);
            console.log('');
            console.log(
              \`%c👉 Shopify App: %chttps://apps.shopify.com/die-ai-agent-official-app\`,
              styles.text,
              styles.link
            );
            console.log(
              \`%c🌐 Learn More: %chttps://yourshopguide.com\`,
              styles.text,
              styles.link
            );
            console.log('');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.divider);
            console.log('');
            console.log('%cBuilt with ❤️ by the ShopGuide team', styles.text);
          })();
        `}
      </Script>
      <link rel="shortcut icon" href={`${basePath}/static/favicons/favicon.ico`} />
      <link rel="icon" type="image/png" href={`${basePath}/static/favicons/favicon-32x32.png`} />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={`${basePath}/static/favicons/favicon-32x32.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`${basePath}/static/favicons/favicon-16x16.png`}
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={`${basePath}/static/favicons/apple-touch-icon.png`}
      />
      <link rel="manifest" href={`${basePath}/static/favicons/site.webmanifest`} />
      <link
        rel="mask-icon"
        href={`${basePath}/static/favicons/safari-pinned-tab.svg`}
        color="#5bbad5"
      />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />
      <link rel="alternate" type="application/rss+xml" href={`${basePath}/feed.xml`} />
      <body
        className="bg-white pl-[calc(100vw-100%)] text-black antialiased dark:bg-gray-950 dark:text-white"
        suppressHydrationWarning
      >
        <PostHogProvider>
          <GoogleAnalyticsProvider>
            <ThemeProviders>
              <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
              <SpeedInsights />
              <VercelAnalytics />
              <SectionContainer>
                <SearchProvider searchConfig={siteMetadata.search as SearchConfig}>
                  <Header />
                  <main className="mb-auto">{children}</main>
                </SearchProvider>
                <Footer />
              </SectionContainer>
            </ThemeProviders>
          </GoogleAnalyticsProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
