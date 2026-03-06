import type { ReactNode } from 'react'
import Link from '@/components/Link'

interface QuoteCardProps {
  quote: string
  attribution: string
  source?: string
  sourceLabel?: string
  caption?: string
}

export default function QuoteCard({
  quote,
  attribution,
  source,
  sourceLabel,
  caption,
}: QuoteCardProps) {
  const attributionEl: ReactNode = source ? (
    <Link href={source} className="font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
      {attribution}
    </Link>
  ) : (
    <span className="font-medium text-gray-700 dark:text-gray-300">{attribution}</span>
  )

  return (
    <figure className="my-8">
      <blockquote
        className="border-primary-200 dark:border-primary-800 border-l-4 bg-gray-50 py-5 pl-6 pr-5 dark:bg-gray-800/50"
        cite={source}
      >
        <p className="text-lg font-medium leading-relaxed text-gray-800 dark:text-gray-100 sm:text-xl">
          &ldquo;{quote}&rdquo;
        </p>
        <footer className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          — {attributionEl}
          {sourceLabel && source && (
            <span className="ml-1.5">
              ({sourceLabel})
            </span>
          )}
        </footer>
      </blockquote>
      {caption && (
        <figcaption className="mt-2 text-center text-sm italic text-gray-500 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
