import { readFileSync } from 'fs'
import path from 'path'

const paymentHtml = readFileSync(
  path.join(process.cwd(), 'components/footer-payment-inner.html'),
  'utf8'
)

/** Shopify payment icon markup copied from the live storefront (see scripts/extract-footer-payment.mjs). */
export default function FooterPaymentIcons() {
  return (
    <div
      className="footer__payment"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: paymentHtml }}
    />
  )
}
