# How to Remove a Newsletter Subscriber

If you're getting an "already subscribed" error but want to test with the same email, you need to remove it from the storage backend.

## ✅ EASIEST SOLUTION: Remove via Cloudflare Dashboard

**This is the fastest way - no scripts needed!**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **D1** → Find your database (ID: `b31cfb5b-cd34-469d-97cc-250866c9314a`)
3. Click on your database → **Console** tab
4. Run this SQL query:

   ```sql
   DELETE FROM newsletter_subscribers WHERE LOWER(email) = LOWER('isaac.g.lewin@gmail.com');
   ```

   Or to see what's stored first:

   ```sql
   SELECT * FROM newsletter_subscribers;
   ```

   Then delete the specific email you see.

5. **Done!** Try subscribing again with the same email.

---

## Alternative: Remove via Script (Requires Cloudflare Credentials)

### Step 1: Get Your Cloudflare API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template (or create custom with D1:Edit permissions)
4. Click **Continue to summary** → **Create Token**
5. **Copy the token immediately** (you won't see it again!)

### Step 2: Set Environment Variables

**Option A: PowerShell (temporary, for this session)**

```powershell
$env:CLOUDFLARE_ACCOUNT_ID="eaabbba4ca3d9e87724080904f8da93a"
$env:CLOUDFLARE_API_TOKEN="your-token-here"
$env:CLOUDFLARE_D1_DATABASE_ID="b31cfb5b-cd34-469d-97cc-250866c9314a"
```

**Option B: Create `.env.local` file (permanent)**

```env
CLOUDFLARE_ACCOUNT_ID=eaabbba4ca3d9e87724080904f8da93a
CLOUDFLARE_API_TOKEN=your-token-here
CLOUDFLARE_D1_DATABASE_ID=b31cfb5b-cd34-469d-97cc-250866c9314a
```

### Step 3: Check What's Stored

```bash
npx tsx scripts/check-and-remove-subscriber.ts
```

This will show you all subscribers and their exact email format.

### Step 4: Remove the Email

```bash
npx tsx scripts/check-and-remove-subscriber.ts isaac.g.lewin@gmail.com
```

Or use the dedicated removal script:

```bash
npx tsx scripts/remove-from-cloudflare-d1.ts isaac.g.lewin@gmail.com
```

---

## Current Storage Status

Based on the production debug endpoint:

- **Storage Method:** Cloudflare D1 ✅
- **Subscriber Count:** 1
- **Email to Remove:** `isaac.g.lewin@gmail.com`

The email is definitely stored in Cloudflare D1. Use the Cloudflare Dashboard method above for the quickest removal!
