import Link from '@/components/Link'
import FooterPaymentIcons from '@/components/FooterPaymentIcons'
import { footerColumns, footerPolicies, shopStoreUrl } from '@/data/footerContent'

const linkColumn =
  'block py-[0.45rem] text-[1.35rem] leading-[1.45] text-[rgba(255,255,255,0.88)] no-underline transition-colors hover:text-white md:hover:underline md:hover:underline-offset-[0.25rem]'

const linkMuted =
  'text-[rgba(255,255,255,0.88)] no-underline transition-colors hover:text-white hover:underline'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="sg-footer mt-16 w-full rounded-t-[2.5rem] bg-[#2c9ab4] text-[rgba(255,255,255,0.92)]">
      <div className="mx-auto max-w-[120rem] px-4 pt-10 pb-[60px] sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 pb-16 md:grid-cols-3 md:gap-x-[clamp(2rem,4vw,3.5rem)] md:gap-y-12">
          {footerColumns.map((col) => (
            <div key={col.title} className="min-w-0 text-left">
              <h2 className="font-heading mb-3 text-[1.1rem] font-semibold tracking-[0.08em] text-white uppercase md:text-[1.15rem]">
                <Link
                  href={col.titleHref}
                  className="text-white no-underline hover:text-white md:hover:underline md:hover:underline-offset-[0.25rem]"
                  target={col.titleTargetBlank ? '_blank' : undefined}
                  rel={col.titleTargetBlank ? 'noopener noreferrer' : undefined}
                >
                  {col.title}
                </Link>
              </h2>
              <ul className="list-none space-y-0 p-0">
                {col.links.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkColumn}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-b border-white/15 pb-6">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-end">
            <FooterPaymentIcons />
          </div>
        </div>

        <div className="mt-5 flex w-full max-w-full flex-col flex-wrap items-start gap-x-6 gap-y-3 text-left text-sm md:flex-row md:items-center md:justify-between">
          <ul className="m-0 flex flex-1 list-none flex-wrap gap-x-4 gap-y-2 p-0">
            {footerPolicies.map((p) => (
              <li key={p.href}>
                <small className="text-[rgba(255,255,255,0.88)]">
                  <Link
                    href={p.href}
                    className={linkMuted}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {p.label}
                  </Link>
                </small>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1 text-left md:text-right">
            <small className="text-[rgba(255,255,255,0.88)]">
              © {year},{' '}
              <Link href={shopStoreUrl} className={linkMuted}>
                ShopGuide
              </Link>
            </small>
            <small className="text-[rgba(255,255,255,0.88)]">
              <Link
                href="https://www.shopify.com?utm_campaign=poweredby&utm_medium=shopify&utm_source=onlinestore"
                className={linkMuted}
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                Powered by Shopify
              </Link>
            </small>
          </div>
        </div>
      </div>
    </footer>
  )
}
