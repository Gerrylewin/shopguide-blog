'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useState, useEffect, Component, type ReactNode } from 'react'
import siteMetadata from '@/data/siteMetadata'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class CommentsErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Comments component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <p className="font-semibold">Unable to load comments</p>
          <p className="mt-1">
            {this.state.error?.message ||
              'An error occurred while loading comments. Please check your configuration.'}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validate comments configuration
  useEffect(() => {
    if (loadComments && siteMetadata.comments?.provider === 'giscus') {
      const giscusConfig = siteMetadata.comments.giscusConfig

      // Debug: Log the actual values being loaded
      console.log('Giscus Config:', {
        repo: giscusConfig?.repo,
        repositoryId: giscusConfig?.repositoryId,
        category: giscusConfig?.category,
        categoryId: giscusConfig?.categoryId,
      })

      const missingVars: string[] = []
      if (!giscusConfig?.repo) missingVars.push('NEXT_PUBLIC_GISCUS_REPO')
      if (!giscusConfig?.repositoryId) missingVars.push('NEXT_PUBLIC_GISCUS_REPOSITORY_ID')
      if (!giscusConfig?.category) missingVars.push('NEXT_PUBLIC_GISCUS_CATEGORY')
      if (!giscusConfig?.categoryId) missingVars.push('NEXT_PUBLIC_GISCUS_CATEGORY_ID')

      if (missingVars.length > 0) {
        setError(
          `Comments are not properly configured. Missing or empty environment variables: ${missingVars.join(', ')}. Please check your .env.local file and restart your Next.js dev server.`
        )
      }
    }
  }, [loadComments])

  if (!siteMetadata.comments?.provider) {
    return null
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
        <p className="font-semibold">Unable to load comments</p>
        <p className="mt-1">{error}</p>
      </div>
    )
  }

  return (
    <>
      {loadComments ? (
        <CommentsErrorBoundary>
          <div className="min-h-[200px]">
            <CommentsComponent commentsConfig={siteMetadata.comments} slug={slug} />
          </div>
        </CommentsErrorBoundary>
      ) : (
        <button
          onClick={() => setLoadComments(true)}
          className="bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 rounded-lg px-4 py-2 text-white transition-colors"
        >
          Load Comments
        </button>
      )}
    </>
  )
}
