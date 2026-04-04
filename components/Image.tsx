import NextImage, { ImageProps } from 'next/image'

const basePath = process.env.BASE_PATH || ''

function resolveSrc(src: ImageProps['src']): ImageProps['src'] {
  if (typeof src !== 'string') {
    return src
  }
  if (src.startsWith('https://') || src.startsWith('http://') || src.startsWith('data:')) {
    return src
  }
  return `${basePath}${src}`
}

const Image = ({ src, ...rest }: ImageProps) => <NextImage src={resolveSrc(src)} {...rest} />

export default Image
