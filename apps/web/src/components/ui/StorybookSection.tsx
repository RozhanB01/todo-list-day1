import type { ReactNode } from 'react'
import clsx from 'clsx'
import { FloralDivider } from '../art/Ornaments'

export function StorybookSection({
  id,
  eyebrow,
  title,
  description,
  action,
  children,
  tone = 'parchment',
  className,
  align = 'start',
}: {
  id?: string
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  tone?: 'parchment' | 'cream' | 'night' | 'plain'
  className?: string
  align?: 'start' | 'center'
}) {
  const dark = tone === 'night'
  return (
    <section
      id={id}
      className={clsx(
        'relative scroll-mt-24',
        tone === 'parchment' && 'bg-parchment',
        tone === 'cream' && 'bg-vanilla/70',
        tone === 'night' && 'bg-night-sky text-parchment',
        className,
      )}
    >
      <div className="container-page py-14 sm:py-16 lg:py-20">
        <div
          className={clsx(
            'mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between',
            align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
          )}
        >
          <div className={clsx('max-w-2xl', align === 'center' && 'mx-auto')}>
            {eyebrow && <p className={clsx('eyebrow mb-3', dark && 'text-gold')}>{eyebrow}</p>}
            <h2 className={clsx('section-title', dark && 'text-parchment')}>{title}</h2>
            {description && (
              <p className={clsx('mt-3 text-sm leading-7 sm:text-[15px]', dark ? 'text-lavender/80' : 'muted')}>
                {description}
              </p>
            )}
            <div className={clsx('mt-5 w-40', align === 'center' && 'mx-auto')}>
              <FloralDivider className="w-full" tone={dark ? 'light' : 'gold'} />
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {children}
      </div>
    </section>
  )
}
