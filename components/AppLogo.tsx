import NextImage from 'next/image'
import { ReactNode } from 'react'

interface AppLogoProps {
  src: string
  alt: string
  children?: ReactNode
}

export default function AppLogo({ src, alt, children }: AppLogoProps) {
  // Check if it's an external URL
  const isExternal = src.startsWith('http://') || src.startsWith('https://')
  
  return (
    <div className="relative my-8 inline-block">
      {/* Outer glow container */}
      <div className="relative inline-block rounded-lg border-2 border-primary-500/30 bg-gray-950/80 p-4 shadow-[0_0_20px_rgba(46,154,179,0.3)] backdrop-blur-sm transition-all duration-300 hover:border-primary-400/50 hover:shadow-[0_0_30px_rgba(46,154,179,0.5)] dark:bg-gray-900/80">
        {/* Scanline overlay effect */}
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-[linear-gradient(transparent_50%,rgba(46,154,179,0.03)_50%)] bg-[length:100%_4px] opacity-30" />
        
        {/* Glitch effect overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 hover:opacity-100">
          <div className="absolute inset-0 animate-pulse rounded-lg bg-primary-500/5 blur-sm" />
        </div>

        {/* Image container with gaussian blur background */}
        <div className="relative overflow-hidden rounded-md bg-gradient-to-br from-primary-500/10 via-primary-400/5 to-transparent p-2">
          {/* Brand color glow behind image */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-primary-400/10 to-transparent blur-xl" />
          
          {/* The actual logo image */}
          <div className="relative z-10 flex h-[400px] w-[400px] items-center justify-center overflow-hidden rounded-md bg-white/5 backdrop-blur-sm">
            <NextImage
              src={src}
              alt={alt}
              width={400}
              height={400}
              className="object-contain p-4 transition-transform duration-300 hover:scale-105"
              unoptimized={isExternal}
            />
          </div>
        </div>

        {/* Corner accent lines */}
        <div className="absolute -left-1 -top-1 h-8 w-8 border-l-2 border-t-2 border-primary-500/50" />
        <div className="absolute -bottom-1 -right-1 h-8 w-8 border-b-2 border-r-2 border-primary-500/50" />

        {/* Optional children content below */}
        {children && (
          <div className="mt-4 text-center text-sm text-gray-400">{children}</div>
        )}
      </div>
    </div>
  )
}

