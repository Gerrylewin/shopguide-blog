# AGENTS.md

## Learned User Preferences

- When deploying via Vercel CLI, check for errors during the build.

## Learned Workspace Facts

- The build runs format:check first; unformatted files (e.g. new or edited MDX) can fail the deploy. Run yarn format (or format:check) before pushing or deploying.
- .cursor/ is in .gitignore; Cursor state files (e.g. continual-learning) should not be committed.
