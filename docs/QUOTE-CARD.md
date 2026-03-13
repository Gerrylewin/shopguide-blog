# QuoteCard component

Thought-leader quote block used on blog posts. Renders a rounded panel with a glowing light blue-teal border, italic quote text, attribution with optional source link, and an optional caption.

## Usage (MDX)

`QuoteCard` is available in all blog MDX files via the global MDX components (no import needed).

```mdx
<QuoteCard
  quote="You're going to see a torrent of agentic commerce. Crypto-native rails are structurally well suited to support it."
  attribution="John Collison, Co-founder of Stripe"
  source="https://x.com/collision/status/1836814238515597444"
  sourceLabel="X"
  caption="John Collison predicting the agentic commerce torrent."
/>
```

With optional image:

```mdx
<QuoteCard
  quote="..."
  attribution="..."
  source="..."
  sourceLabel="X (Twitter)"
  caption="..."
  image="/static/images/blog/collison-quote-v2.png"
/>
```

## Props

| Prop          | Type   | Required | Description                                                                                                           |
| ------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `quote`       | string | Yes      | The quoted text (no surrounding quotes; component adds “ ”).                                                          |
| `attribution` | string | Yes      | e.g. `"John Collison, Co-founder of Stripe"`.                                                                         |
| `source`      | string | No       | URL for the quote/source. When set, attribution and sourceLabel render as underlined links.                           |
| `sourceLabel` | string | No       | Short label for the source, e.g. `"X"`, `"LinkedIn"`, `"The Block"`. Shown in parentheses; linked if `source` is set. |
| `caption`     | string | No       | Context line below the block (e.g. “John Collison predicting the agentic commerce torrent.”).                         |
| `image`       | string | No       | Optional image path; shown above the quote.                                                                           |

## Design

- **Container:** Rounded (`rounded-xl`), 2px border, light blue-teal glow (`primary-400/70`), dark background.
- **Quote:** Italic, light blue-teal, larger type; opening and closing curly quotes added by the component.
- **Attribution:** Em dash (—), non-italic, smaller; name and source label are underlined links when `source` is provided.
- **Caption:** Centered below the block, smaller, non-italic.
- **Background:** Subtle blue-teal grid overlay inside the panel.

Component location: `components/QuoteCard.tsx`. Registered in `components/MDXComponents.tsx`.

## Where it’s used

Thought-leader quotes should use `QuoteCard` (not raw `> ` blockquotes) so all agentic-commerce quotes share the same design. Current posts using it include:

- agentic-commerce-the-future-of-shopping.mdx
- the-rise-of-agentic-commerce-2026.mdx
- agentic-commerce-the-new-standard-for-shopify-merchants.mdx
- the-4-pillars-of-agentic-commerce-architecture.mdx
- stripe-agentic-commerce-suite-shopify-integration.mdx
- agentic-indexing-the-secret-behind-the-2026-organic-traffic-spike.mdx
- the-agentic-revolution-merit-based-shopping.mdx
- how-to-allow-customers-to-edit-shopify-orders-after-purchase.mdx
- agent-first-discovery-machine-readable-shopify.mdx
- automate-shopify-returns-billing-agentic-commerce.mdx
- google-business-agent-direct-offers-shopify.mdx

When adding new thought-leader quotes, use `<QuoteCard>` with the props above instead of markdown blockquotes.
