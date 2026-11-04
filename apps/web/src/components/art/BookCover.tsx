import { useId } from 'react'

export const COVER_PALETTES: Record<
  string,
  { from: string; to: string; accent: string; glow: string; ink: string }
> = {
  plum: { from: '#4b3568', to: '#241733', accent: '#E8A1B5', glow: '#C7B7DF', ink: '#FFF5E8' },
  navy: { from: '#354270', to: '#161c3a', accent: '#C7B7DF', glow: '#8793BC', ink: '#FFF5E8' },
  rose: { from: '#e6adba', to: '#8f5268', accent: '#FFF5E8', glow: '#F6DDE2', ink: '#FFF5E8' },
  forest: { from: '#5f7d66', to: '#22332a', accent: '#D6AC69', glow: '#9fbf9f', ink: '#FFF5E8' },
  gold: { from: '#c99f61', to: '#5e4222', accent: '#FFF5E8', glow: '#FAECD8', ink: '#FFF5E8' },
  lavender: { from: '#b9a9d6', to: '#544573', accent: '#D6AC69', glow: '#F6DDE2', ink: '#FFF5E8' },
}

function Motif({ motif, accent, glow, uid }: { motif: string; accent: string; glow: string; uid: string }) {
  const soft = `soft-${uid}`
  const halo = `halo-${uid}`
  const stroke = { fill: 'none', stroke: accent, strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  return (
    <g>
      <defs>
        <radialGradient id={halo}>
          <stop offset="0" stopColor={glow} stopOpacity="0.7" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <filter id={soft} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <circle cx="200" cy="170" r="120" fill={`url(#${halo})`} />
      <circle cx="200" cy="120" r="38" fill={glow} opacity="0.85" filter={`url(#${soft})`} />

      {motif === 'castle' && (
        <g>
          <path d="M120 250v-90l26-30 26 30v90Z" fill="#1d1730" opacity="0.75" />
          <path d="M228 250v-70l22-26 22 26v70Z" fill="#1d1730" opacity="0.75" />
          <path d="M160 250v-56l40-34 40 34v56Z" fill="#241a38" opacity="0.85" />
          <path d="M160 250v-56l40-34 40 34v56" {...stroke} />
          <path d="M120 250v-90l26-30 26 30v90" {...stroke} />
          <path d="M228 250v-70l22-26 22 26v70" {...stroke} />
          <path d="M188 250v-34a12 12 0 0 1 24 0v34Z" fill={accent} opacity="0.35" />
          <g fill={accent} opacity="0.85">
            <rect x="134" y="188" width="7" height="12" rx="3" />
            <rect x="242" y="206" width="7" height="12" rx="3" />
            <rect x="176" y="192" width="6" height="10" rx="3" />
            <rect x="218" y="192" width="6" height="10" rx="3" />
          </g>
          <path d="M96 250h212" stroke={accent} strokeWidth="1.2" opacity="0.4" />
          <g fill={accent} opacity="0.55">
            <circle cx="96" cy="96" r="1.6" />
            <circle cx="308" cy="120" r="1.2" />
            <circle cx="128" cy="70" r="1" />
          </g>
        </g>
      )}

      {motif === 'rose' && (
        <g transform="translate(200 178)">
          <path d="M-6 18c-26 10-34 34-30 58M6 18c26 10 34 34 30 58" stroke="#506A55" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M-24 46c-16-4-22-14-20-24 12-2 20 6 20 24ZM30 34c16-6 20-16 16-26-12 0-18 10-16 26Z" fill="#5c7a63" opacity="0.9" />
          <circle r="40" fill={accent} opacity="0.18" />
          <path d="M0 -40c22 0 40 18 40 40S22 40 0 40-40 22-40 0-22-40 0-40Z" {...stroke} />
          <path d="M0 -24c13 0 24 11 24 24S13 24 0 24-24 13-24 0-13-24 0-24Z" {...stroke} opacity="0.85" />
          <path d="M0 -9c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9Z" fill={accent} opacity="0.7" />
          <circle cx="-58" cy="34" r="4" fill={accent} opacity="0.8" />
          <circle cx="52" cy="46" r="3" fill={accent} opacity="0.6" />
        </g>
      )}

      {motif === 'forest' && (
        <g>
          <g fill="#1c2a22" opacity="0.9">
            <path d="M120 250l34-76 34 76Z" />
            <path d="M186 250l46-104 46 104Z" />
            <path d="M258 250l30-64 30 64Z" />
          </g>
          <g {...stroke} opacity="0.55">
            <path d="M120 250l34-76 34 76" />
            <path d="M186 250l46-104 46 104" />
            <path d="M258 250l30-64 30 64" />
          </g>
          <path d="M232 146l46 104M232 174l30 76M232 198l18 52" stroke={accent} strokeWidth="1" opacity="0.28" />
          <g fill={glow} opacity="0.75">
            <circle cx="140" cy="188" r="2" />
            <circle cx="176" cy="214" r="1.6" />
            <circle cx="284" cy="208" r="1.8" />
            <circle cx="262" cy="176" r="1.2" />
          </g>
        </g>
      )}

      {motif === 'moon' && (
        <g>
          <path d="M232 96a70 70 0 1 0 26 118 56 56 0 0 1-26-118Z" fill={glow} opacity="0.92" />
          <path d="M232 96a70 70 0 1 0 26 118 56 56 0 0 1-26-118Z" {...stroke} strokeWidth={1} opacity="0.5" />
          <path d="M92 250c30-22 58-20 78 0M212 250c22-26 48-26 68 0" stroke={accent} strokeWidth="1.2" opacity="0.5" fill="none" />
          <g fill={accent} opacity="0.7">
            <path d="M132 112l2.4 5.6 5.6 2.4-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.4z" />
            <path d="M300 168l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z" />
            <circle cx="160" cy="86" r="1.8" />
            <circle cx="286" cy="106" r="1.4" />
          </g>
        </g>
      )}

      {motif === 'lantern' && (
        <g>
          <path d="M200 78v18" stroke={accent} strokeWidth="1.6" />
          <path d="M176 96h48l-6 10h-36z" fill={accent} opacity="0.85" />
          <path d="M170 106h60l10 82h-80z" fill="#241a38" stroke={accent} strokeWidth="1.6" />
          <path d="M180 118h40l6 56h-52z" fill={glow} opacity="0.85" />
          <circle cx="200" cy="148" r="7" fill="#FFF6DE" />
          <path d="M162 188h76l-5 10h-66z" fill={accent} opacity="0.85" />
          <circle cx="200" cy="212" r="4" fill={accent} />
          <g fill={accent} opacity="0.6">
            <circle cx="140" cy="120" r="2" />
            <circle cx="264" cy="142" r="1.6" />
            <circle cx="252" cy="96" r="1.2" />
          </g>
        </g>
      )}

      {motif === 'cat' && (
        <g>
          <path d="M118 214h164" stroke={accent} strokeWidth="1.4" opacity="0.5" />
          <g transform="translate(200 190)">
            <ellipse cx="0" cy="18" rx="52" ry="24" fill="#1d1730" />
            <path d="M-42 20c-26-2-34-18-24-28 0 12 8 18 24 18Z" fill="#1d1730" />
            <circle cx="-28" cy="-6" r="20" fill="#251d3a" />
            <path d="M-44 -20l-4-18 18 8zM-14 -22l8-16 8 16z" fill="#251d3a" />
            <path d="M-36 -6q5 5 10 0M-20 -6q5 5 10 0" stroke={accent} strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M-28 2q4 4 8 0" stroke={accent} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </g>
          <path d="M232 116a38 38 0 1 0 18 66 30 30 0 0 1-18-66Z" fill={glow} opacity="0.7" />
          <g fill={accent} opacity="0.6">
            <circle cx="140" cy="96" r="1.6" />
            <circle cx="286" cy="140" r="1.4" />
          </g>
        </g>
      )}

      {motif === 'key' && (
        <g transform="translate(200 176)">
          <circle r="52" {...stroke} opacity="0.35" />
          <circle cx="-8" cy="-18" r="28" {...stroke} />
          <circle cx="-8" cy="-18" r="13" {...stroke} opacity="0.7" />
          <path d="M12 4l58 58M46 38l14-14M60 52l14-14" {...stroke} strokeWidth={2} />
          <path d="M-8 -46v-14M22 -18h14" stroke={accent} strokeWidth="1.2" opacity="0.4" />
          <circle cx="60" cy="-40" r="2" fill={accent} opacity="0.7" />
        </g>
      )}

      {motif === 'dragon' && (
        <g>
          <path d="M96 210c34-6 44-34 72-40 26-6 34 12 54 6 18-6 24-26 44-30 8-2 14 2 16 8-12 0-18 8-26 20-14 22-36 26-58 18-18-6-26-2-38 10-12 12-34 18-64 8Z" fill="#1d1730" opacity="0.9" />
          <path d="M96 210c34-6 44-34 72-40 26-6 34 12 54 6 18-6 24-26 44-30" {...stroke} opacity="0.7" />
          <path d="M176 164c-6-12-2-24 10-30-2 10 2 16 8 22" {...stroke} opacity="0.6" />
          <path d="M282 146c4-10 12-16 22-16-4 8-2 14 2 18" {...stroke} opacity="0.6" />
          <circle cx="292" cy="150" r="2.4" fill={accent} />
          <g fill={accent} opacity="0.55">
            <circle cx="120" cy="110" r="1.8" />
            <circle cx="306" cy="98" r="1.4" />
          </g>
        </g>
      )}
    </g>
  )
}

export function BookCover({
  title,
  author = 'مون‌بری',
  palette = 'plum',
  motif = 'moon',
  coverImageUrl,
  size = 'md',
  className = '',
}: {
  title: string
  author?: string
  palette?: string
  motif?: string
  coverImageUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const uid = useId().replace(/[:]/g, '')
  const colors = COVER_PALETTES[palette] ?? COVER_PALETTES.plum
  const gradientId = `cover-${uid}`
  const vignetteId = `vignette-${uid}`

  return (
    <div className={`relative isolate overflow-hidden rounded-[4px] shadow-book ${className}`}>
      {coverImageUrl ? (
        <>
          <img src={coverImageUrl} alt={`جلد ${title}`} loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/20" />
        </>
      ) : (
        <>
          <svg viewBox="0 0 400 600" className="h-full w-full" role="img" aria-label={`جلد کتاب ${title}`} preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0.7" y2="1">
                <stop offset="0" stopColor={colors.from} />
                <stop offset="1" stopColor={colors.to} />
              </linearGradient>
              <linearGradient id={vignetteId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0.45" stopColor="#000000" stopOpacity="0" />
                <stop offset="1" stopColor="#0d0918" stopOpacity="0.82" />
              </linearGradient>
            </defs>
            <rect width="400" height="600" fill={`url(#${gradientId})`} />
            <g opacity="0.16" fill={colors.accent}>
              {Array.from({ length: 40 }, (_, index) => (
                <circle key={index} cx={20 + ((index * 97) % 360)} cy={18 + ((index * 61) % 300)} r={index % 5 === 0 ? 1.6 : 0.9} />
              ))}
            </g>
            <rect x="14" y="14" width="372" height="572" fill="none" stroke={colors.accent} strokeOpacity="0.5" strokeWidth="1.2" />
            <rect x="22" y="22" width="356" height="556" fill="none" stroke={colors.accent} strokeOpacity="0.22" strokeWidth="1" />
            <g opacity="0.95" transform="translate(0 34)">
              <Motif motif={motif} accent={colors.accent} glow={colors.glow} uid={uid} />
            </g>
            <rect y="330" width="400" height="270" fill={`url(#${vignetteId})`} />
            <g transform="translate(200 470)">
              <path d="M-22 0h44" stroke={colors.accent} strokeWidth="1" opacity="0.55" />
              <path d="M0 -8l2 4.6 4.6 2-4.6 2L0 5.2l-2-4.6L-6.6 -1.4 2 -3.4z" fill={colors.accent} transform="translate(-5 3.6) scale(1.4)" opacity="0.7" />
            </g>
            {/* spine highlight */}
            <rect width="10" height="600" fill="#ffffff" opacity="0.07" />
            <rect x="8" width="3" height="600" fill="#000000" opacity="0.12" />
          </svg>

          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-5 pb-7 text-center" style={{ color: colors.ink }}>
            <h3
              className={`font-display font-bold leading-snug drop-shadow-[0_2px_8px_rgba(13,9,24,0.6)] ${
                size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl sm:text-3xl' : 'text-lg'
              }`}
            >
              {title}
            </h3>
            <span className={`mt-2 h-px w-12 ${size === 'lg' ? 'w-20' : ''}`} style={{ background: colors.accent, opacity: 0.6 }} />
            <span className={`mt-2 font-body tracking-wide opacity-85 ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
              {author}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
