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
      <div className="border-primary-500/30 hover:border-primary-400/50 relative inline-block rounded-lg border-2 bg-gray-950/80 p-4 shadow-[0_0_20px_rgba(46,154,179,0.3)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(46,154,179,0.5)] dark:bg-gray-900/80">
        {/* Scanline overlay effect */}
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-[linear-gradient(transparent_50%,rgba(46,154,179,0.03)_50%)] bg-[length:100%_4px] opacity-30" />

        {/* Glitch effect overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 hover:opacity-100">
          <div className="bg-primary-500/5 absolute inset-0 animate-pulse rounded-lg blur-sm" />
        </div>

        {/* Image container with gaussian blur background */}
        <div className="from-primary-500/10 via-primary-400/5 relative overflow-hidden rounded-md bg-gradient-to-br to-transparent p-2">
          {/* Brand color glow behind image */}
          <div className="from-primary-500/20 via-primary-400/10 absolute inset-0 bg-gradient-to-br to-transparent blur-xl" />

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
        <div className="border-primary-500/50 absolute -top-1 -left-1 h-8 w-8 border-t-2 border-l-2" />
        <div className="border-primary-500/50 absolute -right-1 -bottom-1 h-8 w-8 border-r-2 border-b-2" />

        {/* Optional children content below */}
        {children && <div className="mt-4 text-center text-sm text-gray-400">{children}</div>}
      </div>
    </div>
  )
}
