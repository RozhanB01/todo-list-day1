import { useId } from 'react'
import { MascotFigure } from './WitchMascot'

/**
 * The enchanted library window: arched glass, full moon, distant castle,
 * hanging lantern, sleeping cat, book stacks and the mascot herself.
 * Everything is vector art inside real HTML, so it stays crisp at any size.
 */
export function HeroScene({ className = '' }: { className?: string }) {
  const uid = useId().replace(/[:]/g, '')
  const sky = `sky-${uid}`
  const moonGlow = `moon-glow-${uid}`
  const floor = `floor-${uid}`
  const arch = 'M18 622 L18 214 C18 104 128 18 280 18 C432 18 542 104 542 214 L542 622 Z'

  return (
    <svg viewBox="0 0 560 640" className={className} role="img" aria-label="کتابخانهٔ جادویی مون‌بری در شب مهتابی: جادوگر کوچک با فانوس، ماه کامل، قلعهٔ دور و گربهٔ خوابیده">
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#4a3d78" />
          <stop offset="0.42" stopColor="#2c2455" />
          <stop offset="1" stopColor="#171129" />
        </linearGradient>
        <radialGradient id={moonGlow}>
          <stop offset="0" stopColor="#FFF6DF" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#F6E2B8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#D6AC69" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={floor} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2b4f" stopOpacity="0.2" />
          <stop offset="1" stopColor="#1a1230" stopOpacity="0.85" />
        </linearGradient>
        <clipPath id={`clip-${uid}`}>
          <path d={arch} />
        </clipPath>
        <filter id={`blur-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <g clipPath={`url(#clip-${uid})`}>
        <rect width="560" height="640" fill={`url(#${sky})`} />

        {/* stars */}
        <g fill="#FFF8EC">
          {[
            [72, 92, 1.6],
            [124, 150, 1.1],
            [186, 74, 1.3],
            [232, 128, 1],
            [96, 220, 1.2],
            [330, 64, 1.4],
            [402, 96, 1],
            [468, 78, 1.5],
            [494, 176, 1.1],
            [150, 268, 0.9],
            [58, 300, 1.2],
            [446, 250, 1],
            [372, 196, 1.1],
            [268, 58, 0.9],
            [512, 128, 1.2],
          ].map(([cx, cy, r], index) => (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r={r}
              className={index % 3 === 0 ? 'animate-twinkle' : undefined}
              style={{ animationDelay: `${index * 0.6}s`, animationDuration: `${4 + (index % 4)}s` }}
              opacity={0.85}
            />
          ))}
        </g>

        {/* moon */}
        <circle cx="356" cy="154" r="122" fill={`url(#${moonGlow})`} />
        <circle cx="356" cy="154" r="58" fill="#FBEED6" />
        <circle cx="356" cy="154" r="58" fill="#F6E2B8" opacity="0.55" />
        <g fill="#E7D2AC" opacity="0.65">
          <circle cx="336" cy="136" r="9" />
          <circle cx="374" cy="170" r="12" />
          <circle cx="342" cy="176" r="5" />
          <circle cx="376" cy="134" r="4" />
        </g>

        {/* far hills */}
        <path d="M-10 452 C60 400 120 410 172 438 C218 462 258 448 306 420 C356 390 420 400 570 452 L570 640 L-10 640 Z" fill="#241d40" />
        <path d="M-10 500 C56 468 118 474 172 496 C232 520 286 512 336 492 C392 470 460 486 570 512 L570 640 L-10 640 Z" fill="#1b1633" />

        {/* distant fairy castle */}
        <g transform="translate(112 356)" opacity="0.9">
          <path d="M0 96V40l16-18 16 18v56Z" fill="#1b1533" />
          <path d="M44 96V22l20-20 20 20v74Z" fill="#221a3d" />
          <path d="M96 96V52l14-16 14 16v44Z" fill="#1b1533" />
          <path d="M64 2v-14" stroke="#D6AC69" strokeWidth="1.4" />
          <path d="M64 -16l10 5-10 5z" fill="#D6AC69" />
          <g fill="#F7D9A2">
            <rect x="58" y="44" width="5" height="9" rx="2.5" />
            <rect x="70" y="58" width="5" height="9" rx="2.5" />
            <rect x="12" y="58" width="4" height="7" rx="2" opacity="0.75" />
            <rect x="104" y="66" width="4" height="7" rx="2" opacity="0.75" />
          </g>
          <circle cx="58" cy="46" r="8" fill="#F7D9A2" opacity="0.16" />
        </g>

        {/* window mullions */}
        <g fill="#2a2148">
          <rect x="274" y="18" width="10" height="604" opacity="0.92" />
          <rect x="18" y="298" width="524" height="9" opacity="0.92" />
          <rect x="18" y="452" width="524" height="7" opacity="0.8" />
        </g>
        <g stroke="#D6AC69" strokeOpacity="0.28" strokeWidth="1">
          <path d="M274 18v604M284 18v604M18 298h524M18 452h524" />
        </g>

        {/* window sill */}
        <path d="M6 566 C120 552 440 552 554 566 L554 592 C440 578 120 578 6 592 Z" fill="#33264c" />
        <path d="M6 566 C120 552 440 552 554 566" stroke="#D6AC69" strokeOpacity="0.5" strokeWidth="1.4" fill="none" />

        {/* book stack */}
        <g transform="translate(52 508)">
          <rect x="0" y="44" width="86" height="13" rx="3" fill="#8a5f45" />
          <rect x="6" y="44" width="86" height="13" rx="3" fill="#e0b6c3" transform="translate(2 -14) rotate(-2)" />
          <rect x="10" y="44" width="80" height="12" rx="3" fill="#5d6fa8" transform="translate(-2 -27) rotate(1.5)" />
          <rect x="4" y="44" width="88" height="12" rx="3" fill="#d6ac69" transform="translate(4 -40) rotate(-1)" />
          <g stroke="#3b2a24" strokeOpacity="0.5" strokeWidth="1">
            <path d="M14 47h62M20 34h58M16 20h66" />
          </g>
          <circle cx="92" cy="54" r="10" fill="#2f2547" />
          <path d="M92 44v20M82 54h20" stroke="#D6AC69" strokeWidth="1.2" opacity="0.6" />
        </g>

        {/* berry branch */}
        <g transform="translate(14 430)" stroke="#5f7d66" fill="none">
          <path d="M6 170 C26 120 20 70 58 30" strokeWidth="3" strokeLinecap="round" />
          <path d="M22 128c16-16 30-14 38 0-16 12-30 10-38 0ZM30 86c-14-10-16-26-4-34 10 12 10 26 4 34Z" fill="#506A55" stroke="none" />
          <path d="M44 52c14-8 26-2 28 10-14 6-24 0-28-10Z" fill="#5f7d66" stroke="none" />
          <circle cx="46" cy="112" r="6" fill="#E8A1B5" stroke="none" />
          <circle cx="34" cy="132" r="4.5" fill="#C7B7DF" stroke="none" />
          <circle cx="58" cy="88" r="5" fill="#E8A1B5" stroke="none" />
          <circle cx="20" cy="158" r="4" fill="#E8A1B5" stroke="none" />
        </g>

        {/* hanging lantern */}
        <g transform="translate(448 22)">
          <path d="M0 0v52" stroke="#D6AC69" strokeWidth="2" opacity="0.7" />
          <circle cx="0" cy="96" r="66" fill={`url(#${moonGlow})`} opacity="0.7" />
          <path d="M-18 52h36l-5 10h-26z" fill="#D6AC69" />
          <path d="M-24 62h48l7 58h-62z" fill="#2b2450" stroke="#D6AC69" strokeWidth="1.6" />
          <path d="M-16 72h32l5 38h-42z" fill="#FFD79B" opacity="0.9" />
          <circle cx="0" cy="90" r="6" fill="#FFF6DE" />
          <path d="M-31 120h62l-4 8h-54z" fill="#D6AC69" />
          <circle cx="0" cy="134" r="4" fill="#D6AC69" />
        </g>

        {/* floor wash */}
        <rect y="560" width="560" height="80" fill={`url(#${floor})`} />
      </g>

      {/* sleeping cat */}
      <g transform="translate(408 540)">
        <ellipse cx="0" cy="34" rx="62" ry="14" fill="#120d22" opacity="0.4" />
        <ellipse cx="0" cy="20" rx="56" ry="26" fill="#413a52" />
        <path d="M-44 22c-30-2-40-20-28-32 0 14 10 20 28 20Z" fill="#413a52" />
        <circle cx="-32" cy="4" r="21" fill="#4a4159" />
        <path d="M-49 -12l-5-19 19 9zM-16 -14l9-17 7 19z" fill="#4a4159" />
        <path d="M-40 4q5 5 10 0M-24 4q5 5 10 0" stroke="#F0D9C0" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M-32 11q3 3 6 0" stroke="#E8A1B5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M-32 11v6M-39 15h-7M-39 19h-7" stroke="#F0D9C0" strokeWidth="1.1" opacity="0.7" />
        <path d="M30 18q16-2 16 10t-16 8" stroke="#413a52" strokeWidth="8" fill="none" strokeLinecap="round" />
      </g>

      {/* the little witch */}
      <g transform="translate(96 300) scale(0.98)">
        <MascotFigure pose="lantern" uid={uid} />
      </g>

      {/* fireflies */}
      {[
        [128, 268, 2.4, 0],
        [432, 320, 1.8, 1.2],
        [486, 404, 2.1, 2.1],
        [72, 372, 1.6, 0.7],
        [330, 286, 1.4, 1.6],
      ].map(([cx, cy, r, delay], index) => (
        <g key={index} className="animate-floaty" style={{ animationDelay: `${delay}s`, animationDuration: `${6 + index}s` }}>
          <circle cx={cx} cy={cy} r={Number(r) * 3} fill="#FFD79B" opacity="0.14" />
          <circle cx={cx} cy={cy} r={r} fill="#FFE9BC" opacity="0.9" />
        </g>
      ))}

      {/* arch frame */}
      <path d={arch} fill="none" stroke="#D6AC69" strokeWidth="2" strokeOpacity="0.65" />
      <path d="M28 622 L28 214 C28 112 132 30 280 30 C428 30 532 112 532 214 L532 622" fill="none" stroke="#D6AC69" strokeWidth="1" strokeOpacity="0.28" />
      <circle cx="280" cy="18" r="5" fill="#D6AC69" opacity="0.75" />
      <path d="M280 8l2 4.6 4.6 2-4.6 2-2 4.6-2-4.6-4.6-2 4.6-2z" fill="#F6DDE2" opacity="0.85" />
    </svg>
  )
}
