# AGENTS.md

## Learned User Preferences

- When deploying via Vercel CLI, check for errors during the build.
- When the user asks to remove the "inside quote" or redundant quote, remove only the duplicate block or image; keep the main quote and do not change the quote wording.

## Learned Workspace Facts

- The build runs format:check first; unformatted files (e.g. new or edited MDX) can fail the deploy. Run yarn format (or format:check) before pushing or deploying.
- .cursor/ is in .gitignore; Cursor state files (e.g. continual-learning) should not be committed.
- Blog post body: double-quoted text is styled in primary blue via rehype plugin; do not add manual span wrappers for quotes.
