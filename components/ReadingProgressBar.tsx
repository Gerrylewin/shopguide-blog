'use client'

import { useEffect, useState } from 'react'

const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      
      // Calculate the total scrollable height
      const totalScrollableHeight = documentHeight - windowHeight
      
      // Calculate progress percentage
      const scrollProgress = totalScrollableHeight > 0 
        ? (scrollTop / totalScrollableHeight) * 100 
        : 0
      
      setProgress(Math.min(100, Math.max(0, scrollProgress)))
    }

    // Initial calculation
    handleScroll()

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-800">
      <div
        className="h-full bg-primary-500 dark:bg-primary-400 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default ReadingProgressBar

