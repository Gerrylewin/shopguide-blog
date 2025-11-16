import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import AudioPlayer from './AudioPlayer'
import AppLogo from './AppLogo'

// Ensure all components are defined to prevent "undefined component" errors
export const components: MDXComponents = {
  Image: Image || 'img',
  TOCInline: TOCInline || (() => null),
  a: CustomLink || 'a',
  pre: Pre || 'pre',
  table: TableWrapper || 'table',
  BlogNewsletterForm: BlogNewsletterForm || (() => null),
  AudioPlayer: AudioPlayer || (() => null),
  AppLogo: AppLogo || (() => null),
}
