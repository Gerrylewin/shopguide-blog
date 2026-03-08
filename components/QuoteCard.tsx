import type { ReactNode } from 'react'
import Link from '@/components/Link'
import Image from '@/components/Image'

interface QuoteCardProps {
  quote: string
  attribution: string
  source?: string
  sourceLabel?: string
  caption?: string
  image?: string
}

export default function QuoteCard({
  quote,
  attribution,
  source,
  sourceLabel,
  caption,
  image,
}: QuoteCardProps) {
  const attributionEl: ReactNode = source ? (
    <Link
      href={source}
      className="hover:text-primary-600 dark:hover:text-primary-400 font-medium text-gray-700 dark:text-gray-300"
    >
      {attribution}
    </Link>
  ) : (
    <span className="font-medium text-gray-700 dark:text-gray-300">{attribution}</span>
  )

  return (
    <figure className="my-8">
      {image && (
        <div className="mb-4 flex justify-center">
          <Image
            src={image}
            alt={`Quote by ${attribution}`}
            width={800}
            height={400}
            className="rounded-lg object-contain shadow-md"
          />
        </div>
      )}
      <blockquote
        className="border-primary-200 dark:border-primary-800 border-l-4 py-4 pr-0 pl-5"
        cite={source}
      >
        <p className="text-lg leading-relaxed font-medium text-gray-800 sm:text-xl dark:text-gray-100">
          &ldquo;{quote}&rdquo;
        </p>
        <footer className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          — {attributionEl}
          {sourceLabel && source && <span className="ml-1.5">({sourceLabel})</span>}
        </footer>
      </blockquote>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-500 italic dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
