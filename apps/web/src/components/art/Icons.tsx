type IconProps = { className?: string }

const base = 'h-5 w-5'

export function MoodIcon({ mood, className = 'h-9 w-9' }: { mood: string; className?: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (mood) {
    case 'mysterious':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M31 8a16 16 0 1 0 9 25 13 13 0 0 1-9-25Z" fill="currentColor" opacity="0.16" />
          <path d="M31 8a16 16 0 1 0 9 25 13 13 0 0 1-9-25Z" {...common} />
          <circle cx="36" cy="14" r="1.4" fill="currentColor" />
          <circle cx="40" cy="21" r="1" fill="currentColor" />
        </svg>
      )
    case 'tender':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M24 40c-8-5-13-10-13-16a7 7 0 0 1 13-4 7 7 0 0 1 13 4c0 6-5 11-13 16Z" fill="currentColor" opacity="0.15" />
          <path d="M24 39c-8-5-12-9-12-15a6 6 0 0 1 12-4 6 6 0 0 1 12 4c0 6-4 10-12 15Z" {...common} />
          <path d="M24 15c0-4 2-7 6-8" {...common} strokeWidth={1.3} />
          <path d="M24 15c0-3-2-6-5-7" {...common} strokeWidth={1.3} />
        </svg>
      )
    case 'fantasy':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M17 37 32 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M33 9l2.4 5 5 2.4-5 2.4-2.4 5-2.4-5-5-2.4 5-2.4z" fill="currentColor" opacity="0.35" />
          <path d="M33 9l2.4 5 5 2.4-5 2.4-2.4 5-2.4-5-5-2.4 5-2.4z" {...common} />
          <circle cx="16" cy="39" r="2" fill="currentColor" />
          <circle cx="12" cy="27" r="1.2" fill="currentColor" opacity="0.7" />
          <circle cx="40" cy="30" r="1.2" fill="currentColor" opacity="0.7" />
        </svg>
      )
    case 'dark':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="17" y="18" width="14" height="23" rx="3" fill="currentColor" opacity="0.15" />
          <rect x="17" y="18" width="14" height="23" rx="3" {...common} />
          <path d="M24 13c3 2 3 5 0 6-3-1-3-4 0-6Z" fill="currentColor" />
          <path d="M20 41h8" {...common} />
          <path d="M12 44h24" {...common} strokeWidth={1.2} opacity="0.6" />
        </svg>
      )
    case 'cozy':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M8 32c0-9 7-16 16-16s16 7 16 16Z" fill="currentColor" opacity="0.15" />
          <path d="M8 32c0-9 7-16 16-16s16 7 16 16Z" {...common} />
          <path d="M15 32v4a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-4" {...common} />
          <circle cx="20" cy="27" r="1.4" fill="currentColor" />
          <circle cx="28" cy="25" r="1.8" fill="currentColor" opacity="0.7" />
          <circle cx="24" cy="30" r="1.1" fill="currentColor" opacity="0.6" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M24 9l2.6 9.4L36 21l-9.4 2.6L24 33l-2.6-9.4L12 21l9.4-2.6z" fill="currentColor" opacity="0.2" />
          <path d="M24 9l2.6 9.4L36 21l-9.4 2.6L24 33l-2.6-9.4L12 21l9.4-2.6z" {...common} />
          <path d="M35 30l1.2 4 4 1.2-4 1.2L35 41l-1.2-4.6-4-1.2 4-1.2z" fill="currentColor" opacity="0.8" />
          <circle cx="12" cy="34" r="1.6" fill="currentColor" opacity="0.7" />
        </svg>
      )
  }
}

export function GenreIcon({ icon, className = 'h-6 w-6' }: { icon: string; className?: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (icon) {
    case 'wand':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <path d="M10 24 21 13" {...common} strokeWidth={2} />
          <path d="M23 8l1.6 4 4 1.6-4 1.6L23 19l-1.6-3.8-4-1.6 4-1.6z" {...common} />
          <path d="M8 8l.8 2 2 .8-2 .8L8 13.6l-.8-2-2-.8 2-.8z" fill="currentColor" opacity="0.6" />
        </svg>
      )
    case 'key':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="5.4" {...common} />
          <path d="M16 16l9 9M21 21l2.4-2.4M24 24l2.4-2.4" {...common} />
        </svg>
      )
    case 'heart':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <path d="M16 26c-6-4-10-7-10-11a4.6 4.6 0 0 1 10-3 4.6 4.6 0 0 1 10 3c0 4-4 7-10 11Z" {...common} />
        </svg>
      )
    case 'compass':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <circle cx="16" cy="16" r="10.5" {...common} />
          <path d="M20.5 11.5 18 18l-6.5 2.5L14 14z" {...common} />
        </svg>
      )
    case 'lantern':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <path d="M12 12h8v11h-8z" {...common} />
          <path d="M10 23h12M13 12V9h6v3M16 6v3" {...common} />
          <path d="M16 15v4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
        </svg>
      )
    case 'planet':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <circle cx="15" cy="16" r="6.5" {...common} />
          <path d="M5 20c4 3 12 2 18-3s6-9 3-9-5 2-8 6-8 7-13 6Z" {...common} strokeWidth={1.2} />
        </svg>
      )
    case 'feather':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <path d="M24 7c-8-1-14 4-15 12l-1 5 5-1c8-1 12-8 11-16Z" {...common} />
          <path d="M10 23 22 10" {...common} strokeWidth={1.2} />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <path d="M8 6h16v20H8z" {...common} />
          <path d="M8 11h16M12 16h8M12 20h8" {...common} strokeWidth={1.2} />
        </svg>
      )
  }
}

export function IconSearch({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.4" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  )
}

export function IconHeart({ className = base, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20c-5-3.2-8-6-8-9.3A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 8 2.7c0 3.3-3 6.1-8 9.3Z" />
    </svg>
  )
}

export function IconBookmark({ className = base, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" aria-hidden="true">
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

export function IconArrow({
  className = base,
  direction = 'left',
  style,
}: IconProps & { direction?: 'left' | 'right'; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === 'left' ? <path d="M14 6l-6 6 6 6" /> : <path d="M10 6l6 6-6 6" />}
    </svg>
  )
}

export function IconMenu({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  )
}

export function IconClose({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function IconUser({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8.4" r="3.6" />
      <path d="M5 20c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4" />
    </svg>
  )
}

export function IconSettings({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2.2" />
      <circle cx="9" cy="17" r="2.2" />
    </svg>
  )
}

export function IconMoon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4a8 8 0 1 0 4 12 6.4 6.4 0 0 1-4-12Z" />
    </svg>
  )
}

export function IconSparkle({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 3l1.7 5.6L19 10.3l-5.3 1.7L12 17.6l-1.7-5.6L5 10.3l5.3-1.7z" opacity="0.85" />
    </svg>
  )
}

export function IconClock({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}
