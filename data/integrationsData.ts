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
    description:
      'Surface Rivyo reviews and UGC inside the agent so recommendations feel backed by real shoppers—not generic copy.',
    category: 'Reviews',
    href: 'https://integrations.yourshopguide.com/post/rivyo',
    imgSrc:
      'https://storage.googleapis.com/msgsndr/YwFixzedrximlLRmcQo3/media/690bfe727b2dc5250f47c9aa.png',
  },
  {
    title: 'Judge.me',
    description:
      'Bring verified Judge.me reviews and photo proof into chat so social proof stays in the flow instead of a separate tab.',
    category: 'Reviews',
    href: 'https://integrations.yourshopguide.com/post/judge-me',
    imgSrc:
      'https://storage.googleapis.com/msgsndr/YwFixzedrximlLRmcQo3/media/690bfaa3dc2a5445cc8e53cd.png',
  },
  {
    title: 'Klaviyo',
    description:
      'Turn on-site intent into Klaviyo audiences and follow-ups so strong conversations don’t die when the visitor bounces.',
    category: 'Acquisition',
    href: 'https://integrations.yourshopguide.com/post/klaviyo',
    imgSrc:
      'https://storage.googleapis.com/msgsndr/YwFixzedrximlLRmcQo3/media/6906908ee98d663337cfad9a.png',
  },
  {
    title: 'Smile.io',
    description:
      'Reference points, VIP tiers, and rewards while the agent sells—loyalty is part of the path to checkout, not an afterthought.',
    category: 'Upsells',
    href: 'https://integrations.yourshopguide.com/post/smile-io',
    imgSrc:
      'https://storage.googleapis.com/msgsndr/YwFixzedrximlLRmcQo3/media/6906825a3081bc33c9441c5a.png',
  },
  {
    title: 'Alia',
    description:
      'Pair Alia’s personalized incentives with ShopGuide so openings and picks match what you already know about each visitor.',
    category: 'Personalization',
    href: 'https://integrations.yourshopguide.com/post/Alia',
    imgSrc:
      'https://storage.googleapis.com/msgsndr/YwFixzedrximlLRmcQo3/media/690bfca2bbb4c86c4e37fe75.png',
  },
  {
    title: 'Slack',
    description:
      'Escalate high-stakes or stuck conversations to Slack with full context—your team sees the thread and cart without digging through tickets.',
    category: 'Customer Support',
    href: 'https://integrations.yourshopguide.com/post/Slack',
    imgSrc:
      'https://assets.cdn.filesafe.space/YwFixzedrximlLRmcQo3/media/69b37c6d277ba0eb7cba1a17.png',
  },
]

export default integrationsData
