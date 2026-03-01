import { defineDocumentType, ComputedFields, makeSource } from 'contentlayer2/source-files'
import { writeFileSync } from 'fs'
import readingTime from 'reading-time'
import { slug } from 'github-slugger'
import path from 'path'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
// Remark packages
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { remarkAlert } from 'remark-github-blockquote-alert'
import {
  remarkExtractFrontmatter,
  remarkCodeTitles,
  remarkImgToJsx,
  extractTocHeadings,
} from 'pliny/mdx-plugins/index.js'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeKatexNoTranslate from 'rehype-katex-notranslate'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'
import siteMetadata from './data/siteMetadata'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'
import prettier from 'prettier'

const root = process.cwd()
const isProduction = process.env.NODE_ENV === 'production'

type HastNode = {
  type?: string
  tagName?: string
  value?: string
  children?: HastNode[]
  properties?: Record<string, unknown>
}

type HastElement = HastNode & {
  type: 'element'
  tagName: string
  children: HastNode[]
}

const FAQ_HEADING_TEXT = 'frequently asked questions'

function isElement(node: HastNode | undefined, tagName?: string): node is HastElement {
  if (!node || node.type !== 'element' || typeof node.tagName !== 'string') {
    return false
  }
  if (!tagName) {
    return true
  }
  return node.tagName === tagName
}

function getNodeText(node: HastNode | undefined): string {
  if (!node) {
    return ''
  }
  if (node.type === 'text') {
    return node.value || ''
  }
  if (!Array.isArray(node.children)) {
    return ''
  }
  return node.children.map((child) => getNodeText(child)).join('')
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

function getHeadingLevel(node: HastNode): number | null {
  if (!isElement(node)) {
    return null
  }
  const match = /^h([1-6])$/.exec(node.tagName)
  if (!match) {
    return null
  }
  return Number(match[1])
}

function trimLeadingWhitespace(nodes: HastNode[]): HastNode[] {
  if (nodes.length === 0) {
    return nodes
  }
  const cloned = [...nodes]
  const first = cloned[0]
  if (first?.type === 'text') {
    cloned[0] = {
      ...first,
      value: (first.value || '').replace(/^\s+/, ''),
    }
  }
  return cloned
}

function hasVisibleContent(nodes: HastNode[]): boolean {
  return nodes.some((node) => normalizeText(getNodeText(node)).length > 0)
}

function getQuestionFromParagraph(
  node: HastNode
): { question: string; inlineAnswer: HastNode[] } | null {
  if (!isElement(node, 'p')) {
    return null
  }

  const paragraphChildren = node.children || []
  const firstContentIndex = paragraphChildren.findIndex((child) => {
    if (child.type !== 'text') {
      return true
    }
    return normalizeText(child.value || '').length > 0
  })

  if (firstContentIndex < 0) {
    return null
  }

  const firstContentNode = paragraphChildren[firstContentIndex]
  if (!isElement(firstContentNode, 'strong')) {
    return null
  }

  const question = getNodeText(firstContentNode).trim()
  if (!question) {
    return null
  }

  const inlineAnswer = trimLeadingWhitespace(paragraphChildren.slice(firstContentIndex + 1))
  return { question, inlineAnswer }
}

function createFaqItem(question: string, answerNodes: HastNode[]): HastElement {
  const normalizedAnswerNodes = hasVisibleContent(answerNodes)
    ? answerNodes
    : [{ type: 'element', tagName: 'p', properties: {}, children: [] }]

  return {
    type: 'element',
    tagName: 'details',
    properties: { className: ['faq-item'] },
    children: [
      {
        type: 'element',
        tagName: 'summary',
        properties: { className: ['faq-question'] },
        children: [{ type: 'text', value: question }],
      },
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['faq-answer'] },
        children: normalizedAnswerNodes,
      },
    ],
  }
}

function transformFaqSection(sectionNodes: HastNode[]): { changed: boolean; nodes: HastNode[] } {
  const transformed: HastNode[] = []
  let changed = false
  let index = 0

  while (index < sectionNodes.length) {
    const currentNode = sectionNodes[index]
    const questionData = getQuestionFromParagraph(currentNode)

    if (!questionData) {
      transformed.push(currentNode)
      index += 1
      continue
    }

    changed = true
    const answerNodes: HastNode[] = []

    if (hasVisibleContent(questionData.inlineAnswer)) {
      answerNodes.push({
        type: 'element',
        tagName: 'p',
        properties: {},
        children: questionData.inlineAnswer,
      })
    }

    index += 1
    while (index < sectionNodes.length) {
      const candidate = sectionNodes[index]
      if (getQuestionFromParagraph(candidate)) {
        break
      }
      answerNodes.push(candidate)
      index += 1
    }

    transformed.push(createFaqItem(questionData.question, answerNodes))
  }

  return { changed, nodes: transformed }
}

function transformFaqAccordions(node: HastNode): void {
  if (!Array.isArray(node.children) || node.children.length === 0) {
    return
  }

  const children = node.children
  let index = 0

  while (index < children.length) {
    const currentNode = children[index]
    const isFaqHeading =
      isElement(currentNode, 'h2') && normalizeText(getNodeText(currentNode)) === FAQ_HEADING_TEXT

    if (!isFaqHeading) {
      index += 1
      continue
    }

    let endIndex = index + 1
    while (endIndex < children.length) {
      const level = getHeadingLevel(children[endIndex])
      if (level !== null && level <= 2) {
        break
      }
      endIndex += 1
    }

    const sectionNodes = children.slice(index + 1, endIndex)
    const transformedSection = transformFaqSection(sectionNodes)

    if (transformedSection.changed) {
      const faqWrapper: HastElement = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['faq-accordion'] },
        children: transformedSection.nodes,
      }
      children.splice(index + 1, endIndex - (index + 1), faqWrapper)
      index += 2
      continue
    }

    index = endIndex
  }

  for (const child of children) {
    transformFaqAccordions(child)
  }
}

const rehypeFaqAccordion = () => {
  return (tree: HastNode) => {
    transformFaqAccordions(tree)
  }
}

// heroicon mini link
const icon = fromHtmlIsomorphic(
  `
  <span class="content-header-link">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 linkicon">
  <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
  <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
  </svg>
  </span>
`,
  { fragment: true }
)

const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.replace(/^.+?(\/)/, ''),
  },
  path: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath,
  },
  filePath: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFilePath,
  },
  toc: { type: 'json', resolve: (doc) => extractTocHeadings(doc.body.raw) },
}

/**
 * Count the occurrences of all tags across blog posts and write to json file
 */
async function createTagCount(allBlogs) {
  const tagCount: Record<string, number> = {}
  allBlogs.forEach((file) => {
    if (file.tags && (!isProduction || file.draft !== true)) {
      file.tags.forEach((tag) => {
        const formattedTag = slug(tag)
        if (formattedTag in tagCount) {
          tagCount[formattedTag] += 1
        } else {
          tagCount[formattedTag] = 1
        }
      })
    }
  })
  const formatted = await prettier.format(JSON.stringify(tagCount, null, 2), { parser: 'json' })
  writeFileSync('./app/tag-data.json', formatted)
}

function createSearchIndex(allBlogs) {
  if (
    siteMetadata?.search?.provider === 'kbar' &&
    siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    writeFileSync(
      `public/${path.basename(siteMetadata.search.kbarConfig.searchDocumentsPath)}`,
      JSON.stringify(allCoreContent(sortPosts(allBlogs)))
    )
    console.log('Local search index generated...')
  }
}

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    lastmod: { type: 'date' },
    draft: { type: 'boolean' },
    summary: { type: 'string' },
    images: { type: 'json' },
    authors: { type: 'list', of: { type: 'string' } },
    layout: { type: 'string' },
    bibliography: { type: 'string' },
    canonicalUrl: { type: 'string' },
    callout: { type: 'string' },
  },
  computedFields: {
    ...computedFields,
    structuredData: {
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: doc.title,
        datePublished: doc.date,
        dateModified: doc.lastmod || doc.date,
        description: doc.summary,
        image: doc.images ? doc.images[0] : siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/${doc._raw.flattenedPath}`,
      }),
    },
  },
}))

export const Authors = defineDocumentType(() => ({
  name: 'Authors',
  filePathPattern: 'authors/**/*.mdx',
  contentType: 'mdx',
  fields: {
    name: { type: 'string', required: true },
    avatar: { type: 'string' },
    occupation: { type: 'string' },
    company: { type: 'string' },
    email: { type: 'string' },
    twitter: { type: 'string' },
    bluesky: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },
    layout: { type: 'string' },
  },
  computedFields,
}))

export default makeSource({
  contentDirPath: 'data',
  documentTypes: [Blog, Authors],
  mdx: {
    cwd: process.cwd(),
    remarkPlugins: [
      remarkExtractFrontmatter,
      remarkGfm,
      remarkCodeTitles,
      remarkMath,
      remarkImgToJsx,
      remarkAlert,
    ],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          headingProperties: {
            className: ['content-header'],
          },
          content: icon,
        },
      ],
      rehypeKatex,
      rehypeKatexNoTranslate,
      [rehypeCitation, { path: path.join(root, 'data') }],
      [rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }],
      rehypeFaqAccordion,
      rehypePresetMinify,
    ],
  },
  onSuccess: async (importData) => {
    const { allBlogs } = await importData()
    createTagCount(allBlogs)
    createSearchIndex(allBlogs)

    // Check for new blog posts and send email notifications
    // Only run in production or when explicitly enabled
    if (process.env.ENABLE_AUTO_EMAIL_SENDING === 'true' || process.env.NODE_ENV === 'production') {
      try {
        // Dynamic import to avoid build-time errors if email sending fails
        const { checkAndSendNewPosts } = await import('./lib/blog-post-tracker')
        const result = await checkAndSendNewPosts(allBlogs)
        console.log('📧 Blog post email check:', {
          checked: result.checked,
          sent: result.sent,
          skipped: result.skipped,
          errors: result.errors.length > 0 ? result.errors : undefined,
        })
      } catch (error) {
        // Don't fail the build if email sending fails
        console.warn('⚠️ Failed to check for new blog posts to email:', error)
      }
    }
  },
})
