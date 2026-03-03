import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Main from './Main'

export default async function Page() {
  const isProduction = process.env.NODE_ENV === 'production'
  const publishedPosts = isProduction ? allBlogs.filter((post) => post.draft !== true) : allBlogs
  const sortedPosts = sortPosts([...publishedPosts])
  const posts = allCoreContent(sortedPosts)
  return <Main posts={posts} />
}
