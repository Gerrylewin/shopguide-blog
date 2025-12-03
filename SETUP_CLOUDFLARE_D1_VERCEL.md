# Setting Up Cloudflare D1 in Vercel

## The Problem

Your Cloudflare D1 environment variables are NOT set in Vercel, so emails are falling back to file system storage (which is read-only in production). That's why emails aren't being saved.

## Solution: Add Environment Variables to Vercel

### Step 1: Get Your Cloudflare API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template (or create custom with D1:Edit permissions)
4. Click **Continue to summary** → **Create Token**
5. **Copy the token immediately** (you won't see it again!)

### Step 2: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `shopguide-blog`
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:

#### Variable 1: CLOUDFLARE_ACCOUNT_ID

- **Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Value**: `eaabbba4ca3d9e87724080904f8da93a`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 2: CLOUDFLARE_API_TOKEN

- **Name**: `CLOUDFLARE_API_TOKEN`
- **Value**: (paste your API token from Step 1)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- ⚠️ **Mark as "Sensitive"**

#### Variable 3: CLOUDFLARE_D1_DATABASE_ID

- **Name**: `CLOUDFLARE_D1_DATABASE_ID`
- **Value**: `b31cfb5b-cd34-469d-97cc-250866c9314a`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### Step 3: Redeploy

After adding the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

Or push a new commit to trigger a new deployment.

### Step 4: Test

After redeploying, visit:

```
https://blog.yourshopguide.com/api/newsletter/debug
```

You should now see:

- `cloudflareD1Configured: true`
- `storage.method: "Cloudflare D1"`

Then test the newsletter signup form - emails will be saved to Cloudflare D1!

## Why This Happened

The code is correct and working. The issue was simply that the environment variables weren't set in Vercel, so:

1. Cloudflare D1 check failed → fell back to file system
2. File system is read-only in Vercel → emails couldn't be saved
3. GHL webhook still worked (it's independent)

Now with the env vars set, Cloudflare D1 will be used and emails will be saved properly!



