import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Image from './Image'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import NextImage from 'next/image'

// Header component with navigation and theme switching
const Header = () => {
  let headerClass = 'flex items-center w-full justify-between py-10'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50'
  }

  return (
    <header className={headerClass}>
      <div className="-ml-4 flex items-center sm:-ml-6 xl:ml-0">
        <Link href="https://yourshopguide.com" aria-label={siteMetadata.headerTitle}>
          <div className="flex items-center">
            <div className="mr-5 flex-shrink-0">
              <NextImage
                src="/static/images/shopguide-logo-new.png"
                alt="ShopGuide Logo"
                width={54}
                height={44}
                className="block"
                priority
              />
            </div>
            {typeof siteMetadata.headerTitle === 'string' ? (
              <div className="hidden h-6 text-2xl font-semibold whitespace-nowrap sm:block">
                {siteMetadata.headerTitle}
              </div>
            ) : (
              siteMetadata.headerTitle
            )}
          </div>
        </Link>
      </div>
      <div className="ml-12 flex items-center space-x-6 leading-5 sm:ml-16 md:ml-20">
        <div className="no-scrollbar hidden items-center gap-x-6 overflow-x-auto sm:flex md:gap-x-8">
          <Link
            href="/"
            className="hover:text-primary-500 dark:hover:text-primary-400 font-medium whitespace-nowrap text-gray-900 dark:text-gray-100"
          >
            Home
          </Link>
          {headerNavLinks
            .filter((link) => link.href !== '/' && link.href !== '/tags')
            .map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="hover:text-primary-500 dark:hover:text-primary-400 font-medium whitespace-nowrap text-gray-900 dark:text-gray-100"
              >
                {link.title}
              </Link>
            ))}
        </div>
        <div className="flex items-center space-x-4 sm:space-x-6">
          <SearchButton />
          <ThemeSwitch />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

export default Header
