import type { Blog } from 'contentlayer/generated'

/**
 * Extract main points/key takeaways from a blog post
 * This function extracts the first few key sections or bullet points
 * to create a summarized version for email newsletters
 */
export function extractMainPoints(post: Blog, maxPoints: number = 5): string[] {
  const mainPoints: string[] = []
  
  // If there's a summary, use it as the first point
  if (post.summary) {
    mainPoints.push(post.summary)
  }
  
  // Extract headings (H2, H3) from the TOC to get main sections
  if (post.toc && Array.isArray(post.toc)) {
    const headings = post.toc
      .filter((item: any) => item.lvl === 2 || item.lvl === 3) // H2 and H3 headings
      .slice(0, maxPoints - (post.summary ? 1 : 0))
      .map((item: any) => item.content)
    
    mainPoints.push(...headings)
  }
  
  // If we still don't have enough points, extract from the raw content
  if (mainPoints.length < maxPoints && post.body?.raw) {
    const rawContent = post.body.raw
    
    // Look for bullet points or numbered lists
    const bulletPattern = /^[\s]*[-*•]\s+(.+)$/gm
    const numberedPattern = /^[\s]*\d+\.\s+(.+)$/gm
    
    const bullets = Array.from(rawContent.matchAll(bulletPattern))
      .map(m => m[1])
      .slice(0, maxPoints - mainPoints.length)
    
    const numbered = Array.from(rawContent.matchAll(numberedPattern))
      .map(m => m[1])
      .slice(0, maxPoints - mainPoints.length)
    
    mainPoints.push(...bullets, ...numbered)
  }
  
  // Remove duplicates and limit to maxPoints
  const uniquePoints = Array.from(new Set(mainPoints)).slice(0, maxPoints)
  
  return uniquePoints.length > 0 ? uniquePoints : [post.summary || post.title]
}

/**
 * Format main points as HTML for email
 */
export function formatMainPointsAsHTML(mainPoints: string[]): string {
  if (mainPoints.length === 0) return ''
  
  return `
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2E9AB3;">
      <h3 style="color: #0D0324; margin: 0 0 15px 0; font-family: 'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 18px; font-weight: 600;">
        Key Takeaways:
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #313131;">
        ${mainPoints.map(point => `
          <li style="margin-bottom: 10px; line-height: 1.6;">
            ${point}
          </li>
        `).join('')}
      </ul>
    </div>
  `
}

/**
 * Generate an enhanced summary for email newsletters
 * Combines the post summary with main points
 */
export function generateEmailSummary(post: Blog): string {
  const summary = post.summary || ''
  const mainPoints = extractMainPoints(post, 3) // Get top 3 points
  
  // If we have a good summary, use it
  if (summary && summary.length > 50) {
    return summary
  }
  
  // Otherwise, combine the first main points
  if (mainPoints.length > 0) {
    return mainPoints.slice(0, 2).join(' ')
  }
  
  // Fallback to title
  return post.title
}

