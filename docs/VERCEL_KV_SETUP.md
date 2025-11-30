# Vercel KV Setup for Newsletter Storage

## Why Vercel KV?

In production (Vercel), the file system is **read-only**. This means emails cannot be saved to `newsletter-subscribers.json` in production.

**Vercel KV** is a Redis-compatible database that provides persistent storage for your newsletter subscribers.

## Setup Instructions

### Step 1: Create a Vercel KV Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `shopguide-blog`
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis-compatible)
6. Choose a name (e.g., `newsletter-storage`)
7. Select a region (choose closest to your users)
8. Click **Create**

### Step 2: Add Environment Variables

After creating the KV database, Vercel will automatically add these environment variables to your project:

- `KV_URL` - The connection URL for your KV database
- `KV_REST_API_TOKEN` - The authentication token

**Verify they're set:**

1. Go to **Settings** → **Environment Variables**
2. Check that both `KV_URL` and `KV_REST_API_TOKEN` are present
3. Make sure they're enabled for **Production**, **Preview**, and **Development** (if you want to test locally)

### Step 3: Redeploy

After adding the environment variables:

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

Or push a new commit to trigger a new deployment.

## Testing

### Check Storage Configuration

Visit: `https://blog.yourshopguide.com/api/newsletter/debug`

This will show you:

- Whether Vercel KV is configured
- Which storage method is being used
- Current subscriber count
- List of subscribers

### Test Newsletter Signup

1. Go to your blog
2. Enter an email in the newsletter form
3. Check the debug endpoint to see if the email was saved
4. Check Vercel KV dashboard to verify the data

## How It Works

The newsletter system automatically detects if Vercel KV is available:

- **If KV is configured**: Emails are saved to Vercel KV (production-ready)
- **If KV is NOT configured**:
  - In production: Emails are NOT saved (file system is read-only)
  - In development: Emails are saved to `data/newsletter-subscribers.json`

## Troubleshooting

### Emails not being saved?

1. Check the debug endpoint: `/api/newsletter/debug`
2. Verify `KV_URL` and `KV_REST_API_TOKEN` are set in Vercel
3. Check Vercel deployment logs for error messages
4. Make sure you've redeployed after adding the environment variables

### Still using file system in production?

- The code checks for `KV_URL` and `KV_REST_API_TOKEN` environment variables
- If they're not set, it falls back to file system (which fails in production)
- Make sure both variables are set and the project has been redeployed

## Viewing Subscribers

### Via API

```bash
GET /api/newsletter/subscribers
```

### Via Debug Endpoint

```bash
GET /api/newsletter/debug
```

### Via Vercel KV Dashboard

1. Go to Vercel Dashboard → Your Project → Storage
2. Click on your KV database
3. Use the data browser to view the `newsletter:subscribers` key
