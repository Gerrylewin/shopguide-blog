# AGENTS.md

## Learned User Preferences

- When deploying via Vercel CLI, check for errors during the build.
- When the user asks to remove the "inside quote" or redundant quote, remove only the duplicate block or image; keep the main quote and do not change the quote wording.
- Do not add affiliate/referral link markup to blog post frontmatter `title` fields; titles must remain plain text for SEO and meta tags.
- Keep developer documentation links (e.g. shopify.dev) intact; do not replace technical doc URLs with affiliate links.
- Blog post `date` and `lastmod` should match the actual merge/release date; always verify today's date via the terminal before setting.

## Learned Workspace Facts

- The build runs format:check first; unformatted files (e.g. new or edited MDX) can fail the deploy. Run yarn format (or format:check) before pushing or deploying.
- .cursor/ is in .gitignore; Cursor state files (e.g. continual-learning) should not be committed.
- Blog post body: double-quoted text is styled in primary blue via rehype plugin; do not add manual span wrappers for quotes.
- Each blog post should have a unique hero image; check for duplicate Unsplash photo IDs across posts when adding new posts, and replace hero image URLs that return 404.
- Merge conflicts in `app/tag-data.json` are common when branches both update tag counts; take one side (e.g. main), then run `npx contentlayer2 build` to regenerate the file from all posts instead of hand-merging counts.
- External/automated PRs (e.g. from Jules) may not pass Prettier; run `yarn format` on files from automated PRs before deploying.
