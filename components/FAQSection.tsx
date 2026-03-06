import type { ReactNode } from 'react'

export interface FAQItem {
  question: string
  answer: ReactNode
}

interface FAQSectionProps {
  items: FAQItem[]
  /** Optional title (default: "Frequently Asked Questions") */
  title?: string
}

export default function FAQSection({ items, title = 'Frequently Asked Questions' }: FAQSectionProps) {
  if (!items?.length) return null

  return (
    <section className="faq-accordion mt-10" aria-label={title}>
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      {items.map((item, i) => (
        <details key={i} className="faq-item" open={false}>
          <summary className="faq-question">{item.question}</summary>
          <div className="faq-answer">
            {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
          </div>
        </details>
      ))}
    </section>
  )
}
