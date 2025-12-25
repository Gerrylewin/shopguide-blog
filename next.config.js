const { withContentlayer } = require('next-contentlayer2')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// You might need to insert additional domains in script-src if you are using external services
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app analytics.umami.is cloud.umami.is vercel.live us.i.posthog.com us-assets.i.posthog.com app.posthog.com www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src *.s3.amazonaws.com *.r2.dev;
  connect-src *;
  font-src 'self';
  frame-src giscus.app vercel.live
`

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

const output = process.env.EXPORT ? 'export' : undefined
const basePath = process.env.BASE_PATH || undefined
const unoptimized = process.env.UNOPTIMIZED ? true : undefined

/**
 * @type {import('next/dist/next-server/server/config').NextConfig}
 **/
module.exports = () => {
  const plugins = [withContentlayer, withBundleAnalyzer]
  return plugins.reduce((acc, next) => next(acc), {
    output,
    basePath,
    reactStrictMode: true,
    trailingSlash: false,
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    // Optimize CSS loading - inlines critical CSS to reduce render-blocking
    // Note: CSS preload warnings in console are expected - Next.js preloads CSS
    // for potential navigation, which improves performance despite the browser warning
    experimental: {
      optimizeCss: true,
    },
    eslint: {
      dirs: ['app', 'components', 'layouts', 'scripts'],
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
        },
        {
          protocol: 'https',
          hostname: 'storage.googleapis.com',
        },
        {
          protocol: 'https',
          hostname: 'private-us-east-1.manuscdn.com',
        },
        {
          protocol: 'https',
          hostname: 'shopgblog-wvpm3pdv.manus.space',
        },
      ],
      unoptimized,
    },
    async redirects() {
      return [
        {
          // Redirect root-level blog post slugs to /blog/{slug}
          // Excludes known routes: about, blog, tags, projects, integrations, admin, api, feed.xml, sitemap.xml, robots.txt
          source:
            '/:slug((?!about|blog|tags|projects|integrations|admin|api|feed\\.xml|sitemap\\.xml|robots\\.txt|icon\\.png)[a-z0-9]+(?:-[a-z0-9]+)*)',
          destination: '/blog/:slug',
          permanent: true, // 308 permanent redirect for SEO
        },
      ]
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
        {
          // Add caching headers for RSS feed to prevent rate limiting
          source: '/feed.xml',
          headers: [
            ...securityHeaders,
            {
              key: 'Cache-Control',
              value: 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          ],
        },
      ]
    },
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })

      return config
    },
  })
}
