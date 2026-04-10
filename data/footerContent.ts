/** Mirrors yourshopguide.com footer menus — update manually when the store footer changes. */

export const shopStoreUrl = 'https://www.yourshopguide.com'

export type FooterColumn = {
  title: string
  titleHref: string
  titleTargetBlank?: boolean
  links: { label: string; href: string }[]
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Why ShopGuide',
    titleHref: `${shopStoreUrl}/blogs/why-shopguide`,
    links: [
      {
        label: 'ShopGuide vs Zipchat',
        href: `${shopStoreUrl}/blogs/why-shopguide/shopguide-vs-zipchat-which-ai-actually-fits-a-shopify-store`,
      },
      {
        label: 'ShopGuide vs Tidio',
        href: `${shopStoreUrl}/blogs/why-shopguide/shopguide-vs-tidio`,
      },
    ],
  },
  {
    title: 'Integrations',
    titleHref: 'https://integrations.yourshopguide.com/shopify',
    links: [
      { label: 'Slack', href: 'https://integrations.yourshopguide.com/post/Slack' },
      { label: 'Klaviyo', href: 'https://integrations.yourshopguide.com/post/klaviyo' },
      { label: 'Smile.io', href: 'https://integrations.yourshopguide.com/post/smile-io' },
      { label: 'Alia', href: 'https://integrations.yourshopguide.com/post/Alia' },
      { label: 'Judge.me', href: 'https://integrations.yourshopguide.com/post/judge-me' },
      { label: 'Rivyo', href: 'https://integrations.yourshopguide.com/post/rivyo' },
    ],
  },
  {
    title: 'Company',
    titleHref: 'https://www.linkedin.com/company/yourshopguide',
    titleTargetBlank: true,
    links: [
      {
        label: 'About the founder',
        href: 'https://blog.yourshopguide.com/blog/from-chatbots-to-digital-employees-how-noah-muller-is-building-the-future-of-agentic-commerce',
      },
      { label: 'About the team', href: 'https://blog.yourshopguide.com/about' },
      {
        label: 'Free ShopGuide Demo',
        href: `${shopStoreUrl}/pages/book-a-call`,
      },
      {
        label: 'ShopGuide Tutorial [YouTube]',
        href: 'https://youtu.be/PYH2w-_xjuE?si=_pDuKteeINOO-Ylm',
      },
    ],
  },
]

export const footerPolicies: { label: string; href: string }[] = [
  { label: 'Privacy policy', href: `${shopStoreUrl}/policies/privacy-policy` },
  { label: 'Contact information', href: `${shopStoreUrl}/policies/contact-information` },
  { label: 'Legal notice', href: `${shopStoreUrl}/policies/legal-notice` },
  { label: 'Refund policy', href: `${shopStoreUrl}/policies/refund-policy` },
  { label: 'Terms of service', href: `${shopStoreUrl}/policies/terms-of-service` },
  { label: 'Documentation', href: 'https://www.docs.yourshopguide.com/' },
]
