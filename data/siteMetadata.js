/** @type {import("pliny/config").PlinyConfig } */
const basePath = process.env.BASE_PATH || ''
const siteUrl = 'https://blog.yourshopguide.com'

const siteMetadata = {
  title: 'ShopGuide Blog | Agentic Commerce for Shopify',
  author: 'Isaac Lewin',
  headerTitle: 'ShopGuide | Agentic Commerce',
  description:
    'The official guide to Agentic Commerce for Shopify. Learn how AI Agents, autonomous shopping, and guided discovery are transforming high-SKU stores and increasing AOV.',
  keywords: [
    'Agentic Commerce',
    'Shopify AI Agents',
    'AI Product Recommendations Shopify',
    'Guided Shopping',
    'High SKU Shopify Stores',
    'ShopGuide',
    'Autonomous Shopping',
    'AI Shopping Assistant',
  ],
  language: 'en-us',
  theme: 'system', // system, dark or light
  siteUrl,
  siteRepo: 'https://github.com/Gerrylewin/shopguide-blog',
  siteLogo: `${basePath}/static/images/logo.png`,
  // Default Open Graph / Twitter card image (same asset as header logo)
  socialBanner: `${siteUrl}${basePath}/static/images/shopguide-logo-new.png`,
  email: 'isaac.lewin@yourshopguide.com',
  github: '', // ShopGuide doesn't have a public GitHub yet
  x: 'https://x.com/iliveoffgrid', // Isaac's personal Twitter
  linkedin: 'https://www.linkedin.com/company/theshopguide', // ShopGuide company LinkedIn
  instagram: 'https://www.instagram.com/shopguide_ai/', // ShopGuide Instagram
  facebook: '', // Not provided
  youtube: '', // Not provided
  threads: '', // Not provided
  medium: '', // Not provided
  bluesky: '', // Not provided
  mastodon: '', // Not provided
  locale: 'en-US',
  // set to true if you want a navbar fixed to the top
  stickyNav: false,
  analytics: {
    umamiAnalytics: {
      umamiWebsiteId: process.env.NEXT_UMAMI_ID,
    },
    posthogAnalytics: {
      posthogProjectApiKey: 'phc_kvJ3pTMrXx2oOOPFXH9z2epaoyoHUH5MLA6tMLIUXJk',
    },
  },
  newsletter: {
    provider: 'custom',
  },
  comments: {
    provider: 'giscus',
    giscusConfig: {
      get repo() {
        return process.env.NEXT_PUBLIC_GISCUS_REPO || ''
      },
      get repositoryId() {
        return process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID || ''
      },
      get category() {
        return process.env.NEXT_PUBLIC_GISCUS_CATEGORY || ''
      },
      get categoryId() {
        return process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || ''
      },
      mapping: 'pathname',
      reactions: '1',
      metadata: '0',
      theme: 'light',
      darkTheme: 'dark_dimmed',
      themeURL: '',
      lang: 'en',
    },
  },
  search: {
    provider: 'kbar',
    kbarConfig: {
      searchDocumentsPath: `${process.env.BASE_PATH || ''}/search.json`,
    },
  },
}

module.exports = siteMetadata
