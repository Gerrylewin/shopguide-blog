'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from '@/components/Link'

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
      className="text-primary-300 hover:text-primary-100 decoration-primary-500/50 hover:text-glow-primary font-bold underline underline-offset-4 transition-all"
    >
      {attribution}
    </Link>
  ) : (
    <span className="text-primary-200 font-bold tracking-tight">{attribution}</span>
  )

  const avatarObjectClass =
    'object-cover object-center grayscale transition-all duration-500 group-hover/card:grayscale-0'

  const sourceLabelEl: ReactNode =
    sourceLabel && source ? (
      <Link
        href={source}
        className="text-primary-400 hover:text-primary-200 decoration-primary-500/30 font-medium underline underline-offset-4 transition-all"
      >
        {sourceLabel}
      </Link>
    ) : sourceLabel ? (
      <span className="text-primary-500/60 font-mono text-[10px] tracking-widest uppercase">
        {sourceLabel}
      </span>
    ) : null

  return (
    <figure className="group/card my-12">
      {/* Main Container: Deep Navy with Neon Glow */}
      <blockquote
        className="border-primary-500/30 hover:border-primary-400/60 relative overflow-hidden rounded-xl border bg-gray-950 px-8 py-10 shadow-[0_0_40px_rgba(46,154,179,0.1),inset_0_0_20px_rgba(46,154,179,0.05)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(46,154,179,0.2)] dark:bg-gray-950"
        cite={source}
      >
        {/* Tron Grid Background with Scanning Effect */}
        <div className="tron-grid-bg pointer-events-none absolute inset-0 opacity-[0.15]">
          <div className="animate-grid-scan via-primary-500/10 absolute inset-0 h-20 w-full bg-gradient-to-b from-transparent to-transparent" />
        </div>

        {/* Border Beam Animation (Racing Light Trail) */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div
            className="animate-border-beam via-primary-400 absolute h-[2px] w-24 bg-gradient-to-r from-transparent to-transparent"
            style={{
              offsetPath: 'inset(0% round 0.75rem)',
              offsetAnchor: '50% 50%',
            }}
          />
          <div
            className="animate-border-beam via-primary-300 absolute h-[2px] w-24 bg-gradient-to-r from-transparent to-transparent"
            style={{
              offsetPath: 'inset(0% round 0.75rem)',
              offsetAnchor: '50% 50%',
              animationDelay: '-3s',
            }}
          />
        </div>

        {/* Decorative Corner Brackets */}
        <div className="pointer-events-none absolute top-0 left-0 p-2">
          <div className="border-primary-400/80 h-4 w-4 border-t-2 border-l-2 shadow-[0_0_8px_rgba(46,154,179,0.8)]" />
        </div>
        <div className="pointer-events-none absolute right-0 bottom-0 p-2">
          <div className="border-primary-400/80 h-4 w-4 border-r-2 border-b-2 shadow-[0_0_8px_rgba(46,154,179,0.8)]" />
        </div>

        <div className="relative z-10">
          {/* Quote Text: Large, Italic, Luminous */}
          <div className="relative">
            <p className="text-glow-primary text-primary-100 relative text-xl leading-relaxed font-medium tracking-tight italic sm:text-2xl">
              {quote}
            </p>
          </div>

          {/* Attribution: Modernized & Clean */}
          <footer className="border-primary-500/20 mt-12 flex flex-col gap-x-3 gap-y-4 border-t pt-6 not-italic sm:flex-row sm:items-center">
            <div className="flex items-center gap-x-3">
              {image && (
                <div className="border-primary-500/30 relative h-10 w-10 shrink-0 overflow-hidden rounded-full border bg-gray-900 shadow-[0_0_15px_rgba(46,154,179,0.2)]">
                  <Image
                    src={image}
                    alt={attribution}
                    fill
                    sizes="40px"
                    className={avatarObjectClass}
                  />
                  <div className="ring-primary-500/20 absolute inset-0 ring-1 ring-inset" />
                </div>
              )}
              <div className="flex items-center gap-x-2">
                <span className="bg-primary-500/60 h-px w-6" />
                {attributionEl}
              </div>
            </div>
            {sourceLabelEl != null && (
              <div className="flex items-center gap-x-2">
                <span className="text-primary-500/40 hidden sm:inline">|</span>
                {sourceLabelEl}
              </div>
            )}

            {/* Tech Meta Info */}
            <div className="ml-auto hidden md:block">
              <span className="text-primary-500/40 font-mono text-[10px] tracking-widest uppercase">
                [Agent_Verified_Source]
              </span>
            </div>
          </footer>
        </div>
      </blockquote>

      {caption && (
        <figcaption className="text-primary-500/60 group-hover/card:text-primary-400 mt-4 text-center text-xs font-medium tracking-[0.2em] uppercase transition-colors">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
