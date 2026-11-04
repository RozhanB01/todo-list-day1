import type { ReactNode } from 'react'
import clsx from 'clsx'
import { WitchMascot } from '../art/WitchMascot'
import { MagicalButton } from './MagicalButton'

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('rounded-[22px] border border-gold/20 bg-[#fffaf1] p-4', className)}>
      <div className="skeleton aspect-[2/3] w-full rounded-[14px]" />
      <div className="skeleton mt-4 h-3.5 w-16 rounded-full" />
      <div className="skeleton mt-3 h-5 w-3/4 rounded-full" />
      <div className="skeleton mt-2 h-3 w-full rounded-full" />
      <div className="skeleton mt-2 h-3 w-2/3 rounded-full" />
      <div className="skeleton mt-4 h-9 w-full rounded-full" />
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gold/20 bg-[#fffaf1] p-4">
      <div className="skeleton h-16 w-12 rounded-lg" />
      <div className="flex-1">
        <div className="skeleton h-4 w-1/2 rounded-full" />
        <div className="skeleton mt-2 h-3 w-1/3 rounded-full" />
      </div>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
  pose = 'reading',
  compact = false,
}: {
  title: string
  description: string
  action?: ReactNode
  pose?: 'greeting' | 'reading' | 'lantern' | 'cat'
  compact?: boolean
}) {
  return (
    <div
      className={clsx(
        'ornament-frame flex flex-col items-center gap-5 rounded-[24px] px-6 text-center',
        compact ? 'py-8' : 'py-12',
      )}
    >
      <WitchMascot pose={pose} className="h-32 w-auto opacity-95" decorative />
      <div>
        <h3 className="font-display text-lg font-bold text-plum">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-7 text-ink/60">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#b06a72]/35 bg-[#fbeeea] px-5 py-8 text-center">
      <p className="text-sm leading-7 text-[#7c4048]">{message}</p>
      {onRetry && (
        <MagicalButton variant="outline" size="sm" onClick={onRetry}>
          تلاش دوباره
        </MagicalButton>
      )}
    </div>
  )
}

export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'success' | 'error' }) {
  const tones = {
    info: 'border-lavender/50 bg-lavender/15 text-[#4a3a63]',
    success: 'border-forest/35 bg-forest/10 text-[#3d5142]',
    error: 'border-[#c07f88]/50 bg-[#fbeeea] text-[#7c4048]',
  }
  return <div className={clsx('rounded-xl border px-4 py-3 text-[13px] leading-6', tones[tone])}>{children}</div>
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <span
      className={clsx('inline-block animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      aria-hidden="true"
    />
  )
}
