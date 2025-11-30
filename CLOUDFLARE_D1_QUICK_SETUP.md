# Cloudflare D1 Quick Setup - Your Database is Ready! ✅

## ✅ Database Created Successfully

Your Cloudflare D1 database has been created:

- **Database Name**: `newsletter-storage`
- **Database ID**: `b31cfb5b-cd34-469d-97cc-250866c9314a`
- **Account ID**: `eaabbba4ca3d9e87724080904f8da93a`
- **Region**: ENAM (East North America)

## Step 1: Create the Table (via Dashboard)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **D1**
3. Click on **newsletter-storage** database
4. Click the **Console** tab
5. **Run these SQL statements ONE AT A TIME** (Cloudflare D1 console requires separate queries):

**First query** - Create the table:
```sql
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```
Click **Execute** - You should see "Success" message.

**Second query** - Create the index:
```sql
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
```
Click **Execute** again - You should see "Success" message.

⚠️ **Important**: Run each query separately, don't paste both at once!

## Step 2: Get Your API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use **Edit Cloudflare Workers** template (or create custom with D1:Edit permissions)
4. Click **Continue to summary** → **Create Token**
5. **Copy the token immediately** (you won't see it again!)

## Step 3: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `shopguide-blog`
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:

### Variable 1: CLOUDFLARE_ACCOUNT_ID
- **Value**: `eaabbba4ca3d9e87724080904f8da93a`
- **Environment**: Production, Preview, Development

### Variable 2: CLOUDFLARE_API_TOKEN
- **Value**: (paste your API token from Step 2)
- **Environment**: Production, Preview, Development
- ⚠️ **Mark as "Sensitive"**

### Variable 3: CLOUDFLARE_D1_DATABASE_ID
- **Value**: `b31cfb5b-cd34-469d-97cc-250866c9314a`
- **Environment**: Production, Preview, Development

## Step 4: For Local Development

Add to `.env.local`:

```env
CLOUDFLARE_ACCOUNT_ID=eaabbba4ca3d9e87724080904f8da93a
CLOUDFLARE_API_TOKEN=your-api-token-here
CLOUDFLARE_D1_DATABASE_ID=b31cfb5b-cd34-469d-97cc-250866c9314a
```

## Step 5: Redeploy

After adding environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

Or push a new commit to trigger a new deployment.

## Test It!

After redeploying, visit:
`https://blog.yourshopguide.com/api/newsletter/debug`

This will show you:
- ✅ Cloudflare D1 is configured
- ✅ Current subscriber count
- ✅ List of subscribers

Then test the newsletter signup form - emails will be saved to Cloudflare D1!

## Summary

You now have:
- ✅ D1 Database created
- ✅ Account ID: `eaabbba4ca3d9e87724080904f8da93a`
- ✅ Database ID: `b31cfb5b-cd34-469d-97cc-250866c9314a`

**Next steps:**
1. Create the table (Step 1 - via dashboard)
2. Get API token (Step 2)
3. Add environment variables (Step 3)
4. Redeploy (Step 5)

That's it! 🎉

