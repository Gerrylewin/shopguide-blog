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
      className="text-primary-300 hover:text-primary-200 font-medium transition-colors"
    >
      {attribution}
    </Link>
  ) : (
    <span className="text-primary-200 font-medium">{attribution}</span>
  )

  const showImage = image && !imageError

  return (
    <figure className="my-10">
      {/* TRON-style quote panel: glowy blue dashboard screen */}
      <blockquote
        className="group border-primary-500/60 hover:border-primary-400/80 relative overflow-hidden rounded-lg border bg-gray-950/95 px-6 py-6 shadow-[0_0_20px_rgba(46,154,179,0.15),0_0_40px_rgba(46,154,179,0.08),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(46,154,179,0.25),0_0_56px_rgba(46,154,179,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] dark:bg-gray-950/98"
        cite={source}
      >
        {/* Subtle grid overlay for tech feel */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(46,154,179,0.4) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(46,154,179,0.4) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
        {/* Top edge glow line */}
        <div className="via-primary-400/70 absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent" />

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

          <p className="text-lg leading-relaxed font-medium text-gray-100 sm:text-xl">
            <span className="text-primary-100/95">&ldquo;{quote}</span>
            {/* Animated ellipsis: "more message to come" / live screen effect */}
            <span className="text-primary-400 inline-block animate-pulse align-bottom" aria-hidden>
              ...
            </span>
            <span className="text-primary-100/95">&rdquo;</span>
          </p>

          <footer className="text-primary-300/90 mt-5 flex flex-wrap items-center gap-x-1.5 text-sm">
            <span className="text-primary-500/90">—</span>
            {attributionEl}
            {sourceLabel && source && <span className="text-primary-400/70">({sourceLabel})</span>}
          </footer>
        </div>
      </blockquote>

      {caption && (
        <figcaption className="text-primary-400/80 mt-3 text-center text-sm italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
