'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ImageGalleryProps {
  images: string[]
  alt?: string
}

export default function ImageGallery({ images, alt = 'Gallery images' }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
      } else if (event.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images.length])

  return (
    <div className="my-8 relative group">
      {/* Hacker-style border container */}
      <div className="relative border-2 border-primary-500/30 bg-gray-900/50 backdrop-blur-sm p-2 rounded-sm shadow-[0_0_20px_rgba(46,154,179,0.3)]">
        {/* Glitch effect overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent animate-pulse" />
        </div>

        {/* Main image container */}
        <div className="relative aspect-video w-full overflow-hidden bg-black/50">
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((src, index) => (
              <div key={index} className="min-w-full h-full relative">
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
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-primary-500/20 hover:bg-primary-500/40 border border-primary-500/50 text-primary-400 px-3 py-2 rounded-sm transition-all duration-200 backdrop-blur-sm font-mono text-sm hover:shadow-[0_0_15px_rgba(46,154,179,0.5)]"
          aria-label="Previous image"
        >
          {'<'}
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-primary-500/20 hover:bg-primary-500/40 border border-primary-500/50 text-primary-400 px-3 py-2 rounded-sm transition-all duration-200 backdrop-blur-sm font-mono text-sm hover:shadow-[0_0_15px_rgba(46,154,179,0.5)]"
          aria-label="Next image"
        >
          {'>'}
        </button>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'w-8 bg-primary-500 shadow-[0_0_10px_rgba(46,154,179,0.8)]'
                  : 'w-2 bg-primary-500/30 hover:bg-primary-500/50'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>

        {/* Image counter - hacker style */}
        <div className="absolute top-2 right-2 bg-black/70 border border-primary-500/30 px-2 py-1 rounded-sm font-mono text-xs text-primary-400 backdrop-blur-sm">
          {currentIndex + 1}/{images.length}
        </div>
      </div>

      {/* Keyboard navigation hint (only visible on hover) */}
      <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
        [← →] navigate | [click] select
      </div>
    </div>
  )
}

