# Cloudflare D1 Setup for Newsletter Storage

## Why Cloudflare D1?

Since you're already using **Cloudflare R2** for audio files, using **Cloudflare D1** for newsletter storage makes perfect sense:

- ✅ **Free tier available** - 5 GB storage, 5 million reads/day
- ✅ **Same ecosystem** - Everything in one place (R2 + D1)
- ✅ **Fast and reliable** - Global edge network
- ✅ **Simple setup** - Just a few environment variables

## Quick Setup (5 minutes)

### Step 1: Create Cloudflare D1 Database

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Go to **Workers & Pages** → **D1** (or search for "D1" in the sidebar)
4. Click **Create database**
5. Fill in:
   - **Database name**: `newsletter-storage` (or any name)
   - **Primary location**: Choose closest to your users
6. Click **Create**
7. Wait a few seconds for the database to be created

### Step 2: Get Your Credentials

1. In the D1 database page, you'll see:
   - **Account ID** (you might already have this from R2 setup)
   - **Database ID** (new - you'll need this)

2. For the API Token:
   - Go to **My Profile** → **API Tokens**
   - Click **Create Token**
   - Use **Edit Cloudflare Workers** template (or create custom with D1:Edit permissions)
   - Copy the token (you won't see it again!)

### Step 3: Create the Table

1. In your D1 database page, click **Console** tab
2. Paste this SQL and click **Run**:

```sql
-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
```

3. You should see "Success" message

### Step 4: Add Environment Variables

#### For Local Development

Add to `.env.local`:

```env
CLOUDFLARE_ACCOUNT_ID=your-account-id-here
CLOUDFLARE_API_TOKEN=your-api-token-here
CLOUDFLARE_D1_DATABASE_ID=your-database-id-here
```

#### For Vercel Production

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `shopguide-blog`
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `CLOUDFLARE_ACCOUNT_ID`
   - **Value**: Your Cloudflare Account ID
   - **Environment**: Production, Preview, Development
5. Add:
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: Your Cloudflare API Token
   - **Environment**: Production, Preview, Development
   - ⚠️ **Important**: Mark as "Sensitive"
6. Add:
   - **Name**: `CLOUDFLARE_D1_DATABASE_ID`
   - **Value**: Your D1 Database ID
   - **Environment**: Production, Preview, Development

### Step 5: Redeploy

After adding environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

Or push a new commit to trigger a new deployment.

## Testing

### Check Storage Configuration

Visit: `https://blog.yourshopguide.com/api/newsletter/debug`

This will show you:

- Whether Cloudflare D1 is configured
- Which storage method is being used
- Current subscriber count
- List of subscribers

### Test Newsletter Signup

1. Go to your blog
2. Enter an email in the newsletter form
3. Check the debug endpoint to see if the email was saved
4. Check Cloudflare D1 dashboard → **Data** tab to verify

## How It Works

The newsletter system uses this priority order:

1. **Cloudflare D1** (if configured) - Recommended since you already use Cloudflare
2. **Supabase** (if configured) - Alternative option
3. **Vercel KV** (if configured) - Fallback option
4. **File System** (local development only) - Last resort

## Viewing Subscribers

### Via Cloudflare Dashboard

1. Go to your Cloudflare Dashboard
2. Navigate to **Workers & Pages** → **D1**
3. Click on your database
4. Go to **Data** tab
5. View all subscribers in the `newsletter_subscribers` table

### Via API

```bash
GET /api/newsletter/subscribers
```

### Via Debug Endpoint

```bash
GET /api/newsletter/debug
```

## Troubleshooting

### "Cloudflare D1 is not configured"

- Check that all three environment variables are set:
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_D1_DATABASE_ID`
- Make sure you've redeployed after adding environment variables
- Check Vercel deployment logs for errors

### "table newsletter_subscribers does not exist"

- You need to run the SQL query to create the table (Step 3)
- Go to Cloudflare D1 → Your database → **Console** tab
- Run the CREATE TABLE query

### "Cloudflare D1 API error: 401"

- Your API token might be invalid or expired
- Check that the token has D1:Edit permissions
- Create a new token if needed

### Emails not being saved?

1. Check the debug endpoint: `/api/newsletter/debug`
2. Verify all three environment variables are set correctly
3. Check Cloudflare D1 logs: **Logs** tab in your database
4. Make sure the table was created successfully
5. Verify your API token has the correct permissions

## Free Tier Limits

Cloudflare D1 free tier includes:

- ✅ 5 GB database storage (plenty for emails)
- ✅ 5 million reads/day
- ✅ 100,000 writes/day
- ✅ Unlimited databases

For a newsletter, this is more than enough!

## Security Notes

- The `CLOUDFLARE_API_TOKEN` has access to your Cloudflare account
- Keep it secret - never commit it to git
- Only use it in server-side code (API routes)
- The Account ID and Database ID are safe to expose (they're identifiers)

## Finding Your Account ID

If you don't know your Cloudflare Account ID:

1. Go to any Cloudflare service (like R2)
2. Look at the URL - it will have `/accounts/` followed by your Account ID
3. Or go to **My Profile** → **API Tokens** → **Global API Key** section
