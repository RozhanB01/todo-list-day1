import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'night'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-l from-[#3a2c5c] via-[#5b4276] to-[#7d4f6b] text-parchment border border-gold/45 shadow-[0_16px_34px_-16px_rgba(39,26,59,0.9)] hover:from-[#473466] hover:via-[#6b4d88] hover:to-[#8f5a79]',
  gold: 'bg-gradient-to-b from-[#e8c58c] to-[#c79b58] text-[#2c2140] border border-[#f2dcb2]/60 shadow-[0_14px_30px_-14px_rgba(214,172,105,0.8)] hover:brightness-[1.04]',
  outline: 'border border-plum/25 bg-white/40 text-plum hover:border-gold/70 hover:bg-vanilla/70',
  ghost: 'border border-transparent text-plum/80 hover:text-plum hover:bg-plum/5',
  night: 'border border-lavender/35 bg-white/5 text-parchment hover:bg-white/12 hover:border-gold/60',
}

const SIZES: Record<Size, string> = {
  sm: 'gap-2 px-4 py-2 text-[13px]',
  md: 'gap-2.5 px-5 py-2.5 text-sm',
  lg: 'gap-3 px-6 py-3 text-[15px]',
}

interface MagicalButtonProps {
  children: ReactNode
  to?: string
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: Variant
  size?: Size
  disabled?: boolean
  className?: string
  icon?: ReactNode
  iconEnd?: ReactNode
  ariaLabel?: string
}

export function MagicalButton({
  children,
  to,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  icon,
  iconEnd,
  ariaLabel,
}: MagicalButtonProps) {
  const classes = clsx(
    'group inline-flex select-none items-center justify-center rounded-full font-body font-medium transition-all duration-300',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    VARIANTS[variant],
    SIZES[size],
    disabled && 'pointer-events-none opacity-50',
    className,
  )

  const content = (
    <>
      {icon}
      <span>{children}</span>
      {iconEnd}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} aria-label={ariaLabel}>
      {content}
    </button>
  )
}
