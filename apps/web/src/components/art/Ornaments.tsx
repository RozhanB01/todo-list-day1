import { useMemo } from 'react'

export function MoonLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 56" className={className} role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id="moon-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF5E8" />
          <stop offset="0.6" stopColor="#F3DCAF" />
          <stop offset="1" stopColor="#D6AC69" />
        </linearGradient>
        <linearGradient id="leaf-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7d9a7f" />
          <stop offset="1" stopColor="#506A55" />
        </linearGradient>
      </defs>
      <path
        d="M35 7a20 20 0 1 0 12.6 31.4A17 17 0 0 1 35 7Z"
        fill="url(#moon-mark)"
        stroke="#D6AC69"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M20 34c-1-3 0-6 2-8" stroke="#506A55" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M22 28c3-3 7-3 9 0-3 3-7 3-9 0Z" fill="url(#leaf-mark)" />
      <circle cx="20" cy="40" r="5.2" fill="#E8A1B5" />
      <circle cx="28.5" cy="42" r="4.2" fill="#C7B7DF" />
      <circle cx="34" cy="37.5" r="3.1" fill="#E8A1B5" />
      <path d="M17 24l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#E8A1B5" opacity="0.9" />
      <circle cx="46" cy="12" r="1.7" fill="#FFF5E8" />
      <circle cx="12" cy="12" r="1.3" fill="#FFF5E8" opacity="0.8" />
      <circle cx="44" cy="46" r="1" fill="#D6AC69" />
    </svg>
  )
}

export function StarField({
  count = 40,
  className = '',
  seed = 7,
}: {
  count?: number
  className?: string
  seed?: number
}) {
  const stars = useMemo(() => {
    let state = seed
    const random = () => {
      state = (state * 9301 + 49297) % 233280
      return state / 233280
    }
    return Array.from({ length: count }, () => ({
      left: random() * 100,
      top: random() * 100,
      size: 1 + random() * 2.6,
      delay: random() * 7,
      duration: 3.5 + random() * 5,
      gold: random() > 0.72,
    }))
  }, [count, seed])

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {stars.map((star, index) => (
        <span
          key={index}
          className="absolute animate-twinkle rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            background: star.gold ? '#E8C98F' : '#FFF8EC',
            boxShadow: star.gold ? '0 0 8px 2px rgba(214,172,105,0.55)' : '0 0 6px 1px rgba(255,248,236,0.65)',
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

export function FloralDivider({ className = '', tone = 'gold' }: { className?: string; tone?: 'gold' | 'plum' | 'light' }) {
  const stroke = tone === 'light' ? '#F6DDE2' : tone === 'plum' ? '#7c6a84' : '#C39A5D'
  const berry = tone === 'light' ? '#E8A1B5' : '#A9667C'
  return (
    <svg viewBox="0 0 420 34" className={className} role="presentation" aria-hidden="true">
      <path
        d="M6 17 C52 17 74 8 104 14 C124 18 132 26 152 24 C168 22 176 12 192 12"
        fill="none"
        stroke={stroke}
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M414 17 C368 17 346 8 316 14 C296 18 288 26 268 24 C252 22 244 12 228 12"
        fill="none"
        stroke={stroke}
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path d="M96 12c6-5 12-4 15 1-6 5-12 4-15-1Z" fill={stroke} opacity="0.35" />
      <path d="M324 12c-6-5-12-4-15 1 6 5 12 4 15-1Z" fill={stroke} opacity="0.35" />
      <circle cx="200" cy="17" r="3.4" fill={berry} />
      <circle cx="210" cy="14" r="2.1" fill={stroke} opacity="0.75" />
      <circle cx="192" cy="22" r="1.8" fill={stroke} opacity="0.6" />
      <path d="M220 17l2 4.6 4.6 2-4.6 2-2 4.6-2-4.6-4.6-2 4.6-2z" fill={stroke} opacity="0.55" transform="translate(-22 -4)" />
      <circle cx="70" cy="24" r="1.5" fill={berry} opacity="0.8" />
      <circle cx="350" cy="24" r="1.5" fill={berry} opacity="0.8" />
    </svg>
  )
}

export function LanternDecoration({
  className = '',
  delay = 0,
}: {
  className?: string
  delay?: number
}) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true" style={{ animationDelay: `${delay}s` }}>
      <svg viewBox="0 0 80 200" className="h-full w-full">
        <defs>
          <radialGradient id="lantern-glow" cx="50%" cy="65%" r="50%">
            <stop offset="0" stopColor="#FFD9A0" stopOpacity="0.55" />
            <stop offset="0.7" stopColor="#E8A1B5" stopOpacity="0.14" />
            <stop offset="1" stopColor="#E8A1B5" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lantern-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E9C58D" />
            <stop offset="1" stopColor="#B98F4F" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="132" r="40" fill="url(#lantern-glow)" />
        <path d="M40 0v54" stroke="#D6AC69" strokeWidth="1.6" opacity="0.65" />
        <path d="M26 54h28l-4 8H30z" fill="url(#lantern-gold)" />
        <path d="M22 62h36l6 52H16z" fill="#2b2450" stroke="url(#lantern-gold)" strokeWidth="1.6" />
        <path d="M28 72h24l4 32H24z" fill="#FFD79B" opacity="0.85" />
        <circle cx="40" cy="88" r="4.5" fill="#FFF6DE" className="animate-glowPulse" />
        <path d="M16 114h48l-3 6H19z" fill="url(#lantern-gold)" />
        <path d="M38 120v10M42 120v10" stroke="#D6AC69" strokeWidth="1.2" opacity="0.7" />
        <circle cx="40" cy="134" r="3.2" fill="#D6AC69" />
      </svg>
    </div>
  )
}
