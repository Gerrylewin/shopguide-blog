# Supabase Setup for Newsletter Storage

## Why Supabase?

- ✅ **Free tier available** - Perfect for newsletter storage
- ✅ **Works everywhere** - Local development and production
- ✅ **Simple setup** - Just a few environment variables
- ✅ **Reliable** - PostgreSQL database with REST API

## Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in (free account works)
3. Click **New Project**
4. Fill in:
   - **Name**: `shopguide-newsletter` (or any name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click **Create new project**
6. Wait 2-3 minutes for project to be ready

### Step 2: Create the Table

1. In your Supabase project, go to **SQL Editor**
2. Click **New query**
3. Paste this SQL:

```sql
-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to do everything
-- (This uses the service role key, which bypasses RLS)
-- For production, you might want more restrictive policies
CREATE POLICY IF NOT EXISTS "Service role can manage subscribers"
ON newsletter_subscribers
FOR ALL
USING (true)
WITH CHECK (true);
```

4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

### Step 3: Get Your API Keys

1. Go to **Settings** → **API**
2. You'll see:
   - **Project URL** (this is `NEXT_PUBLIC_SUPABASE_URL`)
   - **service_role key** (this is `SUPABASE_SERVICE_ROLE_KEY` - keep this secret!)

### Step 4: Add Environment Variables

#### For Local Development

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### For Vercel Production

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `shopguide-blog`
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://your-project-id.supabase.co`
   - **Environment**: Production, Preview, Development
5. Add:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: `your-service-role-key-here`
   - **Environment**: Production, Preview, Development
   - ⚠️ **Important**: Make sure this is marked as "Sensitive"

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

- Whether Supabase is configured
- Which storage method is being used
- Current subscriber count
- List of subscribers

### Test Newsletter Signup

1. Go to your blog
2. Enter an email in the newsletter form
3. Check the debug endpoint to see if the email was saved
4. Check Supabase dashboard → Table Editor → `newsletter_subscribers` to verify

## How It Works

The newsletter system uses this priority order:

1. **Supabase** (if configured) - Works everywhere, recommended
2. **Vercel KV** (if configured) - Fallback option
3. **File System** (local development only) - Last resort

## Viewing Subscribers

### Via Supabase Dashboard

1. Go to your Supabase project
2. Click **Table Editor**
3. Select `newsletter_subscribers` table
4. View all subscribers

### Via API

```bash
GET /api/newsletter/subscribers
```

### Via Debug Endpoint

```bash
GET /api/newsletter/debug
```

## Troubleshooting

### "Supabase is not configured"

- Check that both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Make sure you've redeployed after adding environment variables
- Check Vercel deployment logs for errors

### "relation newsletter_subscribers does not exist"

- You need to run the SQL query to create the table (Step 2)
- Go to Supabase → SQL Editor and run the CREATE TABLE query

### Emails not being saved?

1. Check the debug endpoint: `/api/newsletter/debug`
2. Verify environment variables are set correctly
3. Check Supabase logs: **Logs** → **API Logs**
4. Make sure the table was created successfully

## Free Tier Limits

Supabase free tier includes:

- ✅ 500 MB database storage (plenty for emails)
- ✅ 2 GB bandwidth
- ✅ Unlimited API requests

For a newsletter, this is more than enough!

## Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` has full access to your database
- Keep it secret - never commit it to git
- Only use it in server-side code (API routes)
- The `NEXT_PUBLIC_SUPABASE_URL` is safe to expose (it's public)
