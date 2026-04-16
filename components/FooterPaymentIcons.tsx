import paymentHtml from './footer-payment-inner.html'

/** Shopify payment icon markup copied from the live storefront (see scripts/extract-footer-payment.mjs). Bundled at build time so serverless deployments include the markup. */
export default function FooterPaymentIcons() {
  return <div className="footer__payment" dangerouslySetInnerHTML={{ __html: paymentHtml }} />
}
