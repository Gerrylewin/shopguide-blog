'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ImageGalleryProps {
  images: string[]
  alt?: string
}

export default function ImageGallery({ images, alt = 'Gallery images' }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
  }

  // Keyboard navigation + lightbox close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
      } else if (event.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      } else if (event.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images.length, isLightboxOpen])

  return (
    <div className="group relative my-8">
      {/* Hacker-style border container */}
      <div className="border-primary-500/30 relative rounded-sm border-2 bg-gray-900/50 p-2 shadow-[0_0_20px_rgba(46,154,179,0.3)] backdrop-blur-sm">
        {/* Glitch effect overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <div className="via-primary-500/20 absolute inset-0 animate-pulse bg-gradient-to-r from-transparent to-transparent" />
        </div>

        {/* Main image container */}
        <div
          className="relative aspect-video w-full overflow-hidden bg-black/50"
          role="button"
          tabIndex={0}
          onClick={() => openLightbox(currentIndex)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openLightbox(currentIndex)
            }
          }}
          aria-label="Open image in larger view"
        >
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((src, index) => (
              <div key={index} className="relative h-full min-w-full">
                <Image
                  src={src}
                  alt={`${alt} ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goToPrevious}
          className="bg-primary-500/20 hover:bg-primary-500/40 border-primary-500/50 text-primary-400 absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-sm border px-3 py-2 font-mono text-sm backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_15px_rgba(46,154,179,0.5)]"
          aria-label="Previous image"
        >
          {'<'}
        </button>
        <button
          onClick={goToNext}
          className="bg-primary-500/20 hover:bg-primary-500/40 border-primary-500/50 text-primary-400 absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-sm border px-3 py-2 font-mono text-sm backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_15px_rgba(46,154,179,0.5)]"
          aria-label="Next image"
        >
          {'>'}
        </button>

        {/* Dots indicator */}
        <div className="mt-4 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-primary-500 w-8 shadow-[0_0_10px_rgba(46,154,179,0.8)]'
                  : 'bg-primary-500/30 hover:bg-primary-500/50 w-2'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>

        {/* Image counter - hacker style */}
        <div className="border-primary-500/30 text-primary-400 absolute top-2 right-2 rounded-sm border bg-black/70 px-2 py-1 font-mono text-xs backdrop-blur-sm">
          {currentIndex + 1}/{images.length}
        </div>
      </div>

      {/* Keyboard navigation hint (only visible on hover) */}
      <div className="mt-2 text-center font-mono text-xs text-gray-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-400">
        [← →] navigate | [click] select
      </div>

      {isLightboxOpen && (
        <div
          className="bg-black/85 fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded image view"
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="bg-black/70 hover:bg-black/60 border-primary-500/50 text-primary-100 absolute right-2 top-2 z-10 rounded-full border px-3 py-1 text-sm font-semibold shadow-[0_0_15px_rgba(46,154,179,0.45)] transition-colors"
              aria-label="Close expanded image"
            >
              Close
            </button>

            <div className="relative h-[70vh] w-full overflow-hidden rounded-md border border-primary-500/40 bg-black/70 shadow-[0_0_25px_rgba(46,154,179,0.4)]">
              <Image
                src={images[currentIndex]}
                alt={`${alt} ${currentIndex + 1} enlarged`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            <div className="text-primary-200/80 mt-3 flex items-center justify-between text-sm font-mono">
              <span>{alt}</span>
              <span>
                {currentIndex + 1}/{images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
