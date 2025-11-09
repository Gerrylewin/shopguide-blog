interface Integration {
  title: string
  description: string
  category: string
  href?: string
  imgSrc?: string
}

const integrationsData: Integration[] = [
  {
    title: 'Rivyo',
    description: `Rivyo x ShopGuide - Agentic Commerce for Shopify.`,
    category: 'Reviews',
    href: 'https://integrations.yourshopguide.com/post/rivyo',
    imgSrc: '/static/images/integrations/rivyo.png',
  },
  {
    title: 'Judge.me',
    description: `Judge.me x ShopGuide - Agentic Commerce for Shopify.`,
    category: 'Reviews',
    href: 'https://integrations.yourshopguide.com/post/judge-me',
    imgSrc: '/static/images/integrations/judge-me.png',
  },
  {
    title: 'Klaviyo',
    description: `Klaviyo x ShopGuide - Agentic Commerce for Shopify.`,
    category: 'Acquisition',
    href: 'https://integrations.yourshopguide.com/post/klaviyo',
    imgSrc: '/static/images/integrations/klaviyo.png',
  },
  {
    title: 'Smile.io',
    description: `Smile.io x ShopGuide - Agentic Commerce for Shopify.`,
    category: 'Upsells',
    href: 'https://integrations.yourshopguide.com/post/smile-io',
    imgSrc: '/static/images/integrations/smile-io.png',
  },
  {
    title: 'Alia',
    description: `Alia x ShopGuide - Agentic Commerce for Shopify.`,
    category: 'Personalization',
    href: 'https://integrations.yourshopguide.com/post/Alia',
    imgSrc: '/static/images/integrations/alia.png',
  },
]

export default integrationsData

