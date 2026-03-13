'use client'

import { useState, useCallback } from 'react'
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
  const [imageError, setImageError] = useState(false)
  const handleImageError = useCallback(() => setImageError(true), [])

  const attributionEl: ReactNode = source ? (
    <Link
      href={source}
      className="text-primary-300 hover:text-primary-200 decoration-primary-400/60 font-medium underline underline-offset-2 transition-colors"
    >
      {attribution}
    </Link>
  ) : (
    <span className="text-primary-200 font-medium">{attribution}</span>
  )

  const sourceLabelEl: ReactNode =
    sourceLabel && source ? (
      <Link
        href={source}
        className="text-primary-300 hover:text-primary-200 decoration-primary-400/60 font-medium underline underline-offset-2 transition-colors"
      >
        {sourceLabel}
      </Link>
    ) : sourceLabel ? (
      <span className="text-primary-400/70">{sourceLabel}</span>
    ) : null

  const showImage = image && !imageError

  return (
    <figure className="my-10">
      {/* Thought-leader quote: rounded panel, glowing light blue-teal border, italic quote */}
      <blockquote
        className="group border-primary-400/70 hover:border-primary-300/80 relative overflow-hidden rounded-xl border-2 bg-gray-950/95 px-6 py-6 shadow-[0_0_24px_rgba(46,154,179,0.2),0_0_48px_rgba(46,154,179,0.1),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(46,154,179,0.3),0_0_64px_rgba(46,154,179,0.12)] dark:bg-gray-950/98"
        cite={source}
      >
        {/* Subtle geometric overlay (light blue-teal) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(46,154,179,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(46,154,179,0.5) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative">
          {showImage && (
            <div className="mb-5 flex justify-center">
              <Image
                src={image}
                alt={`Quote by ${attribution}`}
                width={800}
                height={400}
                className="border-primary-500/30 rounded border object-contain shadow-lg"
                unoptimized={image.startsWith('/static/')}
                onError={handleImageError}
              />
            </div>
          )}

          <p className="text-primary-200/95 text-lg leading-relaxed italic sm:text-xl">
            <span>&ldquo;{quote}&rdquo;</span>
          </p>

          <footer className="text-primary-300/90 mt-5 flex flex-wrap items-center gap-x-1.5 text-sm not-italic">
            <span className="text-primary-400">—</span>
            {attributionEl}
            {sourceLabelEl != null && (
              <span className="text-primary-400/80"> ({sourceLabelEl})</span>
            )}
          </footer>
        </div>
      </blockquote>

      {caption && (
        <figcaption className="text-primary-400/80 mt-3 text-center text-sm not-italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
