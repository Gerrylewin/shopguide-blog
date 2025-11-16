# Prettier Error Prevention Setup

## What Was Fixed

We've identified and fixed Prettier formatting errors that were causing build failures. The main issues were:

1. **Tailwind CSS class ordering** - Prettier with the Tailwind plugin requires classes to be in a specific order
2. **Missing format checks** - No automated way to catch formatting issues before builds
3. **No auto-formatting** - Files weren't being formatted automatically on save

## Changes Made

### 1. Fixed Formatting Issues
- Fixed Tailwind class ordering in `components/SectionContainer.tsx`
- Formatted all files using Prettier to ensure consistency

### 2. Added Format Scripts to `package.json`
```json
"format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,md,mdx}\" --ignore-path .gitignore",
"format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,css,md,mdx}\" --ignore-path .gitignore"
```

### 3. Updated Build Script
The build script now runs format check before building:
```json
"build": "yarn format:check && next build && ..."
```

This ensures formatting errors are caught **before** the build runs, preventing Vercel build failures.

### 4. VS Code Auto-Formatting
Updated `.vscode/settings.json` to:
- Format files automatically on save
- Use Prettier as the default formatter for all relevant file types
- Run ESLint fixes on save

### 5. Created `.prettierignore`
Added a `.prettierignore` file to exclude build outputs, dependencies, and generated files from formatting checks.

### 6. Pre-Commit Hook (Already Configured)
The project already has Husky + lint-staged configured to:
- Run ESLint on JavaScript/TypeScript files
- Run Prettier on all relevant files before commits

## How to Use

### Format All Files
```bash
yarn format
```

### Check Formatting (Without Fixing)
```bash
yarn format:check
```

### Before Committing
The pre-commit hook will automatically:
1. Run ESLint fixes on staged JS/TS files
2. Format staged files with Prettier

### VS Code Users
Files will automatically format on save if you have the Prettier VS Code extension installed.

## Why Prettier Errors Happen

1. **Tailwind CSS Plugin** - The `prettier-plugin-tailwindcss` automatically reorders Tailwind classes according to best practices. This can cause "errors" when classes aren't in the expected order.

2. **Manual Editing** - When editing files manually, especially MDX files with long lines, formatting can drift.

3. **Copy-Paste** - Copying code from external sources often brings different formatting styles.

4. **Team Collaboration** - Different developers might have different editor settings.

## Prevention Strategies

### ✅ Automatic (Already Set Up)
1. **Format on Save** - VS Code will format files automatically
2. **Pre-Commit Hook** - Husky runs Prettier before commits
3. **Build Check** - Format check runs before every build

### 📝 Manual (When Needed)
1. Run `yarn format` before committing if you've made many changes
2. Run `yarn format:check` before pushing to catch any missed issues
3. Check the build output locally with `yarn build` before pushing

## Common Prettier Errors

### Tailwind Class Ordering
**Error:** `Replace 'xl:max-w-5xl xl:px-0 lg:pr-64' with 'lg:pr-64 xl:max-w-5xl xl:px-0'`

**Fix:** Run `yarn format` or let VS Code format on save. The Tailwind plugin will automatically reorder classes.

### Line Length
**Error:** Lines exceeding 100 characters (printWidth)

**Fix:** Prettier will automatically wrap long lines. Just save the file.

### Trailing Commas
**Error:** Missing trailing commas in arrays/objects

**Fix:** Prettier adds trailing commas automatically (configured in `prettier.config.js`).

## Troubleshooting

### Build Fails with Format Errors
1. Run `yarn format` to fix all files
2. Commit the formatted files
3. Try building again

### Pre-Commit Hook Not Running
1. Ensure Husky is installed: `yarn install`
2. Check `.husky/pre-commit` exists
3. Make sure the file is executable (on Unix systems)

### VS Code Not Formatting
1. Install the Prettier extension: `esbenp.prettier-vscode`
2. Check `.vscode/settings.json` has the correct settings
3. Reload VS Code window

## Best Practices

1. **Always format before committing** - The pre-commit hook handles this automatically
2. **Run format check before pushing** - Use `yarn format:check` as a final check
3. **Keep VS Code settings synced** - The `.vscode/settings.json` is committed to the repo
4. **Don't disable format checks** - They prevent build failures and keep code consistent

## Summary

With these changes, Prettier errors should be caught and fixed automatically:
- ✅ Format on save (VS Code)
- ✅ Format before commit (Husky)
- ✅ Format check before build (package.json script)
- ✅ Easy manual formatting (`yarn format`)

You should no longer need to rebuild through Vercel to check for formatting errors - they'll be caught locally first!

