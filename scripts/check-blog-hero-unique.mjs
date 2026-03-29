import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const blogDir = path.join(process.cwd(), 'data/blog')
const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.mdx'))

/** @type {Map<string, string[]>} */
const idToFiles = new Map()

for (const file of files) {
  const raw = fs.readFileSync(path.join(blogDir, file), 'utf8')
  const { data } = matter(raw)
  const images = data.images
  if (!Array.isArray(images)) continue
  for (const url of images) {
    if (typeof url !== 'string') continue
    const m = url.match(/images\.unsplash\.com\/photo-([^?#]+)/i)
    if (!m) continue
    const id = m[1]
    if (!idToFiles.has(id)) idToFiles.set(id, [])
    idToFiles.get(id).push(file)
  }
}

const dupes = [...idToFiles.entries()].filter(([, fl]) => fl.length > 1)
if (dupes.length) {
  console.error('Duplicate Unsplash image IDs in blog frontmatter (images):')
  for (const [id, fl] of dupes) {
    console.error(`  ${id}:\n    ${fl.join('\n    ')}`)
  }
  process.exit(1)
}

console.log('Blog hero images: all Unsplash photo IDs are unique.')
