/* eslint-disable jsx-a11y/anchor-has-content */
import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { AnchorHTMLAttributes } from 'react'

const CustomLink = ({
  href,
  target,
  ...rest
}: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')

  if (isInternalLink) {
    // Explicitly remove target for internal links to ensure same-tab navigation
    // target is already extracted from props, so rest doesn't contain it
    return <Link className="break-words" href={href} {...rest} />
  }

  if (isAnchorLink) {
    return <a className="break-words" href={href} {...rest} />
  }

  // Use provided target, or default to same tab for external links (for seamless experience)
  const linkTarget = target // Use explicitly provided target, or undefined (same tab)
  const linkRel = target === '_blank' ? 'noopener noreferrer' : undefined

  return <a className="break-words" target={linkTarget} rel={linkRel} href={href} {...rest} />
}

export default CustomLink
