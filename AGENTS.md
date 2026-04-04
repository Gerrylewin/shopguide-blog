# AGENTS.md

## Learned User Preferences

- When deploying via Vercel CLI, check for errors during the build.
- When the user asks to remove the "inside quote" or redundant quote, remove only the duplicate block or image; keep the main quote and do not change the quote wording.
- Do not add affiliate/referral link markup to blog post frontmatter `title` fields; titles must remain plain text for SEO and meta tags.
- Keep developer documentation links (e.g. shopify.dev) intact; do not replace technical doc URLs with affiliate links.
- Blog post `date` and `lastmod` should match the actual merge/release date; always verify today's date via the terminal before setting.
- On the integrations page, each card description should lead with a concrete value prop for the reader (what the pairing helps them achieve); the in-card “Learn more” link carries the full how-to—avoid empty placeholder copy.
- When adjusting blog advertisement sizing or layout, change only the placement the user named (e.g. bottom-of-post); do not resize or restyle the floating ad unless they ask. Keep banner-style ads roughly rectangular—avoid disproportionate height.

## Learned Workspace Facts

- The build runs format:check first; unformatted files (e.g. new or edited MDX) can fail the deploy. Run yarn format (or format:check) before pushing or deploying.
- .cursor/ is in .gitignore; Cursor state files (e.g. continual-learning) should not be committed.
- Blog post body: double-quoted text is styled in primary blue via rehype plugin; do not add manual span wrappers for quotes.
- Each blog post should have a unique hero image; check for duplicate Unsplash photo IDs across posts when adding new posts, and replace hero image URLs that return 404.
- Merge conflicts in `app/tag-data.json` are common when branches both update tag counts; take one side (e.g. main), then run `npx contentlayer2 build` to regenerate the file from all posts instead of hand-merging counts.
- External/automated PRs (e.g. from Jules) may not pass Prettier; run `yarn format` on files from automated PRs before deploying.
- `QuoteCard` renders `attribution` as plain text; do not put markdown links in `attribution` (they show verbatim). Use `source` / `sourceLabel` for clickable links.
- For circular quote avatars (`QuoteCard` `image` prop), use a sized div with CSS `background-image`, `background-size: cover`, and `background-position: center` rather than `next/image` with `fill` inside prose; Preflight `img` rules and layout can otherwise hide most of the photo in the circle.
- For integration tiles and similar thumbnails, prefer direct asset URLs on hosts already in `next.config.js` `remotePatterns` over proxied or wrapper image URLs when both work, to avoid extra hops and patterns.
- In the App Router root layout, `<html>` should only wrap `<head>` and `<body>`; keep `<script>`, `<link>`, and `<meta>` inside `<head>` so the document stays valid and you avoid hydration warnings.
- When `BASE_PATH` is set, do not prepend it to absolute `http://`, `https://`, or `data:` image `src` values (e.g. in `components/Image.tsx`); prepending breaks external URLs on subpath deployments.
