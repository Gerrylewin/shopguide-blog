# ShopGuide Blog - Complete Setup & Configuration Guide

This is the comprehensive setup and configuration guide for the ShopGuide Blog. All setup instructions, customizations, and troubleshooting information are consolidated here for easy reference.

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Environment Variables](#environment-variables)
3. [Newsletter System](#newsletter-system)
4. [Custom MDX Components](#custom-mdx-components)
5. [Search Customization (Kbar)](#search-customization-kbar)
6. [Deployment](#deployment)
7. [Project Structure](#project-structure)
8. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Prerequisites

- Node.js 18+
- Yarn or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Gerrylewin/shopguide-blog.git

# Navigate to the project directory
cd shopguide-blog

# Install dependencies
yarn install
```

### Development

```bash
# Start the development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the blog.

### Building for Production

```bash
# Build the site
yarn build

# Start the production server
yarn start
```

---

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Newsletter (ButtonDown)

```env
BUTTONDOWN_API_KEY=your_buttondown_api_key_here
```

### Cloudflare D1 (Already Configured)

```env
CLOUDFLARE_ACCOUNT_ID=eaabbba4ca3d9e87724080904f8da93a
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_D1_DATABASE_ID=b31cfb5b-cd34-469d-97cc-250866c9314a
```

**Note**: These should already be set in your Vercel environment variables. For local development, add them to `.env.local`.

### Analytics (Umami)

```env
NEXT_PUBLIC_UMAMI_ID=your_umami_website_id
```

### Comments (Giscus)

```env
NEXT_PUBLIC_GISCUS_REPO=your_github_repo
NEXT_PUBLIC_GISCUS_REPOSITORY_ID=your_repository_id
NEXT_PUBLIC_GISCUS_CATEGORY=your_category_name
NEXT_PUBLIC_GISCUS_CATEGORY_ID=your_category_id
```

### Email Service (for blog post notifications)

Choose one:

**Resend:**

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**SendGrid:**

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

**AWS SES:**

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

### Base Path (if deploying to a subdirectory)

```env
BASE_PATH=/your-subdirectory
```

---

## Newsletter System

### Overview

The newsletter system has been set up with the following features:

1. **Cloudflare D1 Database**: Emails are stored in Cloudflare D1 (already configured and ready to use)
2. **ButtonDown Integration**: Emails are also sent to your ButtonDown account (via Pliny)
3. **GoHighLevel Integration**: Subscriptions automatically trigger a webhook to your GHL automation
4. **RSS Email Sender**: Utility to send new blog post notifications to all subscribers

### Cloudflare D1 Setup (Already Complete)

✅ **Database is already configured:**

- Database Name: `newsletter-storage`
- Database ID: `b31cfb5b-cd34-469d-97cc-250866c9314a`
- Account ID: `eaabbba4ca3d9e87724080904f8da93a`

The database table and indexes have been created. Environment variables should be set in Vercel:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_D1_DATABASE_ID`

### Fixed Issues

✅ **JSON Parsing Error**: Fixed the "Unexpected end of JSON input" error by:

- Properly handling request body reading
- Ensuring all responses are valid JSON
- Adding comprehensive error handling

### File Structure

```
app/api/newsletter/
├── route.ts                    # Main subscription endpoint (handles ButtonDown + GHL + Cloudflare D1)
├── subscribers/
│   └── route.ts               # Manage subscribers (GET, POST, DELETE)
└── send-post/
    └── route.ts               # Send blog post notifications

lib/
├── newsletter-storage.ts      # Cloudflare D1 database utilities
└── rss-email-sender.ts        # Email sending utilities for blog posts
```

### How It Works

#### Newsletter Subscription Flow

When a user subscribes via the newsletter form:

1. **Cloudflare D1 Storage**: The email is saved to Cloudflare D1 database
2. **ButtonDown Integration**: The email is sent to ButtonDown (your newsletter provider)
3. **GHL Webhook**: A webhook is sent to your GoHighLevel automation
4. **Response**: A success response is returned to the user

All operations happen independently - if one fails, the others still succeed.

#### Cloudflare D1 Database Storage

Emails are stored in Cloudflare D1 with the following schema:

- `id`: Auto-incrementing primary key
- `email`: Unique email address (case-insensitive)
- `subscribed_at`: Timestamp of subscription

**Features:**

- Automatic duplicate detection (enforced by database UNIQUE constraint)
- Timestamp tracking
- Scalable cloud-based storage
- Fast queries with indexed email field

### Managing Subscribers

#### Get All Subscribers

```bash
GET /api/newsletter/subscribers
```

Response:

```json
{
  "subscribers": [{ "email": "user@example.com", "subscribedAt": "2025-01-15T10:30:00.000Z" }],
  "count": 1
}
```

#### Add Subscriber Manually

```bash
POST /api/newsletter/subscribers
Content-Type: application/json

{
  "email": "newuser@example.com"
}
```

#### Remove Subscriber

```bash
DELETE /api/newsletter/subscribers
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Sending Blog Post Notifications

#### Option 1: Manual API Call

When you publish a new blog post, call:

```bash
POST /api/newsletter/send-post
Content-Type: application/json

{
  "title": "My New Blog Post",
  "slug": "my-new-blog-post",
  "date": "2025-01-15",
  "summary": "This is a summary of the post"
}
```

#### Option 2: Automated via Build Script

You can integrate this into your build process. Add to `scripts/postbuild.mjs`:

```javascript
import { sendBlogPostEmails } from '../lib/rss-email-sender.js'

// After building, send notifications for new posts
// (You'll need to detect which posts are new)
```

#### Option 3: Webhook Integration

Set up a webhook in your CMS/deployment platform to call `/api/newsletter/send-post` when a new post is published.

### Email Service Integration

Currently, the email sending function (`lib/rss-email-sender.ts`) is set up but not connected to an email service. You need to integrate with one of these:

#### Recommended: Resend (Best for Next.js)

1. Install Resend:

```bash
npm install resend
```

2. Get your API key from [resend.com](https://resend.com)

3. Add to `.env.local`:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

4. Update `lib/rss-email-sender.ts` - uncomment the Resend code and add your API key.

#### Alternative: SendGrid

1. Install SendGrid:

```bash
npm install @sendgrid/mail
```

2. Add to `.env.local`:

```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

3. Update `lib/rss-email-sender.ts` to use SendGrid instead.

#### Alternative: AWS SES

1. Install AWS SDK:

```bash
npm install @aws-sdk/client-ses
```

2. Configure AWS credentials and update the email sender.

### GoHighLevel Webhook

The webhook URL is configured in `app/api/newsletter/route.ts`:

```typescript
const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/...'
```

**What gets sent:**

```json
{
  "email": "user@example.com",
  "source": "newsletter_subscription",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

Your GHL automation can use this data to:

- Add the contact to a list
- Trigger email sequences
- Tag the contact
- Update custom fields

---

## Custom MDX Components

Here's how to add custom MDX components to your blog posts.

### Example: Adding a Donut Chart Component

1. Create a new component in `components/DonutChart.tsx`:

```tsx
'use client'

import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const DonutChart = ({ data }) => {
  return <Doughnut data={data} />
}

export default DonutChart
```

**Important Notes:**

- Add the `'use client'` directive for components using React hooks
- Export the component as the default export (named exports have issues with MDX)

2. Add the component to `components/MDXComponents.tsx`:

```tsx
import DonutChart from './DonutChart'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  DonutChart, // Add your component here
  BlogNewsletterForm,
}
```

3. Use the component in `.mdx` files:

```mdx
## Example Donut Chart

export const data = {
  labels: ['Red', 'Blue', 'Yellow'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
      ],
      borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
      borderWidth: 1,
    },
  ],
}

<DonutChart data={data} />
```

### Available Built-in Components

- `Image` - Optimized image component
- `TOCInline` - Table of contents
- `BlogNewsletterForm` - Newsletter subscription form
- `AudioPlayer` - Audio player component (see `components/AudioPlayer.tsx`)

---

## Search Customization (Kbar)

### Customizing the Search Provider

Add a `SearchProvider` component and use it in place of the default in `app/layout.tsx`.

Create `components/SearchProvider.tsx`:

```tsx
'use client'

import { KBarSearchProvider } from 'pliny/search/KBar'
import { useRouter } from 'next/navigation'
import { CoreContent } from 'pliny/utils/contentlayer'
import { Blog } from 'contentlayer/generated'

export const SearchProvider = ({ children }) => {
  const router = useRouter()
  return (
    <KBarSearchProvider
      kbarConfig={{
        searchDocumentsPath: 'search.json',
        defaultActions: [
          {
            id: 'homepage',
            name: 'Homepage',
            keywords: '',
            shortcut: ['h', 'h'],
            section: 'Home',
            perform: () => router.push('/'),
          },
          {
            id: 'integrations',
            name: 'Integrations',
            keywords: '',
            shortcut: ['i'],
            section: 'Home',
            perform: () => router.push('/integrations'),
          },
        ],
        onSearchDocumentsLoad(json) {
          return json.map((post: CoreContent<Blog>) => ({
            id: post.path,
            name: post.title,
            keywords: post?.summary || '',
            section: 'Blog',
            subtitle: post.tags.join(', '),
            perform: () => router.push('/' + post.path),
          }))
        },
      }}
    >
      {children}
    </KBarSearchProvider>
  )
}
```

### Full Text Search

To enable full text search over entire blog content (larger search index):

1. Modify `createSearchIndex` function in `contentlayer.config.ts`:

```tsx
function createSearchIndex(allBlogs) {
  if (
    siteMetadata?.search?.provider === 'kbar' &&
    siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    writeFileSync(
      `public/${siteMetadata.search.kbarConfig.searchDocumentsPath}`,
      JSON.stringify(sortPosts(allBlogs)) // Changed from allCoreContent(sortPosts(allBlogs))
    )
    console.log('Local search index generated...')
  }
}
```

2. Update `SearchProvider` to use raw content:

```tsx
onSearchDocumentsLoad(json) {
  return json.map((post: Blog) => ({
    id: post.path,
    name: post.title,
    keywords: post.body.raw,  // Use raw content for full text search
    section: 'Blog',
    subtitle: post.tags.join(', '),
    perform: () => router.push('/' + post.path),
  }))
}
```

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Docker Deployment

1. Copy the Dockerfile from [Next.js Docker example](https://github.com/vercel/next.js/tree/canary/examples/with-docker)

2. Modify `next.config.js`:

```js
module.exports = {
  // ... rest of the configuration.
  output: 'standalone',
}
```

3. Build and run:

```bash
docker build -t nextjs-docker .
docker run -p 3000:3000 nextjs-docker
```

### Docker Compose

Refer to the [Next.js docker compose example](https://github.com/vercel/next.js/tree/canary/examples/with-docker-compose) for docker compose setup.

---

## Project Structure

```
shopguide-blog/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── newsletter/   # Newsletter endpoints
│   │   └── feed/         # RSS feed endpoint
│   ├── blog/             # Blog pages and routing
│   ├── about/             # About page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── AudioPlayer.tsx   # Audio player component
│   ├── MDXComponents.tsx # MDX component mappings
│   └── ...
├── data/                  # Content and configuration
│   ├── blog/             # Blog posts (MDX files)
│   ├── authors/          # Author information
│   └── siteMetadata.js   # Site configuration
├── lib/                   # Utility libraries
│   ├── newsletter-storage.ts
│   └── rss-email-sender.ts
├── layouts/              # Page layouts
├── public/               # Static assets
└── scripts/              # Build scripts
```

---

## Troubleshooting

### Newsletter Issues

#### JSON Parsing Error

If you still see JSON parsing errors:

1. Check browser console for the exact error
2. Check server logs for detailed error messages
3. Verify ButtonDown API credentials are correct
4. Ensure the request body is being sent correctly from the form

#### Emails Not Saving to Cloudflare D1

1. Verify Cloudflare D1 environment variables are set correctly
2. Check server logs for database connection errors
3. Verify the database table exists (should already be created)
4. Test the connection via `/api/newsletter/debug` endpoint

#### GHL Webhook Not Firing

1. Check server logs for webhook errors
2. Verify the webhook URL is correct
3. Test the webhook URL manually with a tool like Postman
4. Check GHL webhook logs

### Comments Not Showing

If Giscus comments aren't showing:

1. Verify all environment variables are set:
   - `NEXT_PUBLIC_GISCUS_REPO`
   - `NEXT_PUBLIC_GISCUS_REPOSITORY_ID`
   - `NEXT_PUBLIC_GISCUS_CATEGORY`
   - `NEXT_PUBLIC_GISCUS_CATEGORY_ID`

2. Check browser console for errors
3. Ensure Giscus app is installed on your GitHub repository
4. Restart the dev server after adding environment variables

### Build Errors

1. **TypeScript Errors**: Run `yarn build` to see detailed TypeScript errors
2. **MDX Errors**: Check that all MDX files have valid frontmatter
3. **Missing Dependencies**: Run `yarn install` to ensure all packages are installed

### Search Not Working

1. Verify `search.json` is generated in `public/` directory
2. Check that `siteMetadata.search.provider` is set to `'kbar'`
3. Ensure search documents path is correct in `siteMetadata.js`

---

## Privacy & Security

- ✅ Subscriber emails are stored in Cloudflare D1 (cloud database)
- ✅ Database is secure and managed by Cloudflare
- ✅ Consider adding authentication to `/api/newsletter/subscribers` endpoints if you expose them publicly
- ✅ Never commit `.env.local` or `.env` files to version control
- ✅ Keep your Cloudflare API token secure and never expose it in client-side code

---

## Next Steps

1. **Set up email service**: Choose Resend, SendGrid, or AWS SES and integrate it
2. **Test subscription flow**: Subscribe with a test email and verify:
   - Email appears in ButtonDown
   - Email is saved locally
   - GHL webhook fires
3. **Set up blog post notifications**: Configure automatic email sending when new posts are published
4. **Add authentication** (optional): Protect subscriber management endpoints
5. **Customize components**: Add your own MDX components as needed
6. **Configure search**: Customize the Kbar search provider for your needs

---

## Additional Resources

- 📖 [ShopGuide Documentation](https://docs.yourshopguide.com)
- 🛍️ [Shopify App Store Listing](https://apps.shopify.com/die-ai-agent-official-app)
- 🌐 [ShopGuide Website](https://www.yourshopguide.com)
- 📧 [Contact Support](mailto:support@yourshopguide.com)

---

**Last Updated**: January 2025

For questions or issues, check the code comments in each file for detailed explanations or review the API route handlers for request/response formats.
