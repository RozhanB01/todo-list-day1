import { useId } from 'react'

export type MascotPose = 'greeting' | 'reading' | 'lantern' | 'cat'

const PALETTE = {
  hatDark: '#222752',
  hatLight: '#3d4685',
  hatShade: '#2b3167',
  band: '#a4647f',
  bandLight: '#c07f97',
  gold: '#e2bb7c',
  goldDeep: '#c69a55',
  hair: '#efc987',
  hairShade: '#d5a75f',
  skin: '#fae7d3',
  skinShade: '#f0d3b9',
  cheek: '#e79aa5',
  cape: '#7f8cbe',
  capeDeep: '#5a678f',
  dress: '#f9edda',
  dressShade: '#ecd7b8',
  boot: '#6f4a37',
  bootDark: '#57392b',
  ink: '#3b2a3a',
  berry: '#e8a1b5',
  paper: '#fffaf0',
}

const POSE_LABEL: Record<MascotPose, string> = {
  greeting: 'جادوگر کوچک مون‌بری که به مهمان‌ها خوش‌آمد می‌گوید',
  reading: 'جادوگر کوچک مون‌بری که کتاب می‌خواند',
  lantern: 'جادوگر کوچک مون‌بری با فانوس روشن',
  cat: 'جادوگر کوچک مون‌بری کنار گربهٔ خوابیده',
}

/**
 * The Moonberry mascot: a small blonde witch in an oversized midnight-blue hat,
 * dusty blue cape, cream dress and brown vintage boots. Drawn from scratch,
 * shared by every instance so the character stays identical across the site.
 */
export function MascotFigure({ pose = 'greeting', uid }: { pose?: MascotPose; uid: string }) {
  const hatGradient = `hat-${uid}`
  const hairGradient = `hair-${uid}`
  const capeGradient = `cape-${uid}`
  const glowGradient = `glow-${uid}`
  const cheekBlur = `cheek-${uid}`

  const closedEyes = pose === 'reading' || pose === 'cat'
  const tilt = pose === 'reading' ? -5 : pose === 'cat' ? -7 : 0

  return (
    <g>
      <defs>
        <linearGradient id={hatGradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={PALETTE.hatLight} />
          <stop offset="0.55" stopColor={PALETTE.hatShade} />
          <stop offset="1" stopColor={PALETTE.hatDark} />
        </linearGradient>
        <linearGradient id={hairGradient} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={PALETTE.hair} />
          <stop offset="1" stopColor={PALETTE.hairShade} />
        </linearGradient>
        <linearGradient id={capeGradient} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={PALETTE.cape} />
          <stop offset="1" stopColor={PALETTE.capeDeep} />
        </linearGradient>
        <radialGradient id={glowGradient}>
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#f5b98a" stopOpacity="0.28" />
          <stop offset="1" stopColor="#f5b98a" stopOpacity="0" />
        </radialGradient>
        <filter id={cheekBlur} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      {/* soft ground shadow */}
      <ellipse cx="120" cy="292" rx="58" ry="9" fill="#241a3b" opacity="0.16" />

      {pose === 'lantern' && <circle cx="188" cy="168" r="62" fill={`url(#${glowGradient})`} />}

      {/* cape */}
      <path
        d="M80 170 C64 198 57 236 51 272 C84 286 156 286 189 272 C183 236 176 198 160 170 Z"
        fill={`url(#${capeGradient})`}
      />
      <path
        d="M80 170 C73 196 69 228 66 260 M160 170 C167 196 171 228 174 260"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="2"
        fill="none"
      />

      {/* legs & boots */}
      <g>
        <rect x="101" y="234" width="13" height="30" rx="6" fill={PALETTE.dressShade} />
        <rect x="126" y="234" width="13" height="30" rx="6" fill={PALETTE.dressShade} />
        {pose === 'reading' || pose === 'cat' ? (
          <>
            <ellipse cx="96" cy="266" rx="16" ry="8" fill={PALETTE.boot} />
            <ellipse cx="144" cy="266" rx="16" ry="8" fill={PALETTE.bootDark} />
          </>
        ) : (
          <>
            <rect x="96" y="260" width="22" height="16" rx="7" fill={PALETTE.boot} />
            <rect x="122" y="260" width="22" height="16" rx="7" fill={PALETTE.bootDark} />
            <rect x="94" y="271" width="26" height="6" rx="3" fill={PALETTE.bootDark} opacity="0.75" />
            <rect x="120" y="271" width="26" height="6" rx="3" fill={PALETTE.bootDark} opacity="0.75" />
          </>
        )}
      </g>

      {/* satchel strap */}
      <path d="M96 176 L152 214" stroke={PALETTE.boot} strokeWidth="5" strokeLinecap="round" opacity="0.9" />
      <rect x="142" y="206" width="26" height="24" rx="6" fill={PALETTE.boot} />
      <rect x="142" y="206" width="26" height="9" rx="4" fill={PALETTE.goldDeep} opacity="0.85" />
      <circle cx="155" cy="222" r="2.6" fill={PALETTE.gold} />

      {/* dress */}
      <path
        d="M91 166 C95 157 145 157 149 166 C155 196 158 220 158 236 C146 246 94 246 82 236 C82 220 85 196 91 166 Z"
        fill={PALETTE.dress}
      />
      <path d="M82 236 C94 246 146 246 158 236 L158 240 C146 250 94 250 82 240 Z" fill={PALETTE.dressShade} />
      <path d="M104 166 C110 174 110 186 106 196" stroke="#e7d0ad" strokeWidth="1.9" fill="none" />
      <path d="M136 166 C130 174 130 186 134 196" stroke="#e7d0ad" strokeWidth="1.9" fill="none" />
      <circle cx="120" cy="190" r="3.4" fill={PALETTE.berry} opacity="0.85" />

      {/* arms */}
      {pose === 'greeting' && (
        <>
          <path d="M150 176 C166 170 174 158 176 146" stroke={PALETTE.capeDeep} strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="178" cy="140" r="7.5" fill={PALETTE.skin} />
          <path d="M174 134 l-1-6 M179 132 l1-6 M183 136 l4-4" stroke={PALETTE.skin} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M91 178 C82 190 80 202 82 212" stroke={PALETTE.capeDeep} strokeWidth="10" strokeLinecap="round" fill="none" />
          <circle cx="82" cy="216" r="6.6" fill={PALETTE.skin} />
          <circle cx="82" cy="214" r="3.2" fill={PALETTE.berry} />
          <g fill={PALETTE.gold} opacity="0.9">
            <path d="M196 120 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4 z" />
            <path d="M60 148 l1.8 4.4 4.4 1.8 -4.4 1.8 -1.8 4.4 -1.8 -4.4 -4.4 -1.8 4.4 -1.8 z" />
          </g>
        </>
      )}

      {pose === 'reading' && (
        <>
          <path d="M148 178 C158 188 156 200 148 208" stroke={PALETTE.capeDeep} strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M92 178 C82 188 84 200 92 208" stroke={PALETTE.capeDeep} strokeWidth="10" strokeLinecap="round" fill="none" />
          <g transform="translate(120 212)">
            <path d="M-36 -8 C-22 -18 -8 -16 0 -8 C8 -16 22 -18 36 -8 L36 18 C22 10 8 12 0 20 C-8 12 -22 10 -36 18 Z" fill={PALETTE.paper} stroke="#dcc09a" strokeWidth="1.6" />
            <path d="M0 -8 L0 20" stroke="#dcc09a" strokeWidth="1.4" />
            <path d="M-28 -2 h20 M-28 5 h20 M-28 12 h14 M8 -2 h20 M8 5 h20 M8 12 h14" stroke="#c9ab86" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
            <circle cx="-40" cy="2" r="7" fill={PALETTE.skin} />
            <circle cx="40" cy="2" r="7" fill={PALETTE.skin} />
          </g>
          <g fill={PALETTE.gold} opacity="0.85">
            <path d="M66 150 l1.8 4.4 4.4 1.8 -4.4 1.8 -1.8 4.4 -1.8 -4.4 -4.4 -1.8 4.4 -1.8 z" />
            <path d="M178 156 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
          </g>
        </>
      )}

      {pose === 'lantern' && (
        <>
          <path d="M152 176 C170 172 182 172 186 176" stroke={PALETTE.capeDeep} strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M90 178 C81 190 80 200 82 210" stroke={PALETTE.capeDeep} strokeWidth="10" strokeLinecap="round" fill="none" />
          <circle cx="82" cy="214" r="6.6" fill={PALETTE.skin} />
          <g transform="translate(188 186)">
            <path d="M0 -26 v6" stroke={PALETTE.goldDeep} strokeWidth="2.4" />
            <path d="M-11 -20 h22 l5 30 h-32 z" fill="#3a2f4f" stroke={PALETTE.goldDeep} strokeWidth="2" strokeLinejoin="round" />
            <path d="M-7 -14 h14 l3 20 h-20 z" fill="#ffd9a0" opacity="0.92" />
            <path d="M-11 10 h22" stroke={PALETTE.goldDeep} strokeWidth="2" />
            <circle cx="0" cy="-2" r="3.4" fill="#fff3d0" />
            <circle cx="0" cy="-20" r="7.5" fill={PALETTE.skin} />
            <path d="M0 -20 v-14" stroke={PALETTE.gold} strokeWidth="2" />
          </g>
          <g fill={PALETTE.gold} opacity="0.9">
            <circle cx="204" cy="146" r="2" />
            <circle cx="212" cy="160" r="1.4" />
            <circle cx="210" cy="132" r="1.2" />
          </g>
        </>
      )}

      {pose === 'cat' && (
        <>
          <path d="M148 176 C164 182 172 196 170 206" stroke={PALETTE.capeDeep} strokeWidth="10" strokeLinecap="round" fill="none" />
          <circle cx="168" cy="210" r="6.6" fill={PALETTE.skin} />
          <path d="M90 178 C82 190 82 200 86 208" stroke={PALETTE.capeDeep} strokeWidth="10" strokeLinecap="round" fill="none" />
          <g transform="translate(172 258)">
            <ellipse cx="0" cy="6" rx="36" ry="18" fill="#3a3446" />
            <path d="M-30 8 C-52 4 -54 -10 -44 -14 C-52 -6 -48 0 -34 0 Z" fill="#3a3446" />
            <circle cx="-24" cy="-2" r="15" fill="#423a52" />
            <path d="M-34 -14 l-2 -12 12 6 z" fill="#423a52" />
            <path d="M-16 -14 l4 -11 8 8 z" fill="#423a52" />
            <path d="M-31 -2 q4 4 8 0 M-20 -2 q4 4 8 0" stroke="#f0d9c0" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M-24 4 q3 3 6 0" stroke="#e8a1b5" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M-24 4 v6 M-30 8 h-6 M-30 11 h-6" stroke="#f0d9c0" strokeWidth="1.2" opacity="0.7" />
          </g>
          <g fill={PALETTE.berry} opacity="0.85">
            <circle cx="58" cy="264" r="3.4" />
            <circle cx="50" cy="258" r="2.4" />
          </g>
        </>
      )}

      {/* head */}
      <g transform={`rotate(${tilt} 120 140)`}>
        <rect x="112" y="160" width="16" height="14" rx="6" fill={PALETTE.skinShade} />
        <circle cx="120" cy="140" r="33" fill={PALETTE.skin} />

        {/* hair behind */}
        <g fill={`url(#${hairGradient})`}>
          <circle cx="88" cy="136" r="12" />
          <circle cx="152" cy="136" r="12" />
          <circle cx="88" cy="152" r="11" />
          <circle cx="152" cy="152" r="11" />
          <circle cx="92" cy="166" r="9" />
          <circle cx="148" cy="166" r="9" />
          <circle cx="100" cy="172" r="7" />
          <circle cx="140" cy="172" r="7" />
        </g>
        <g fill="none" stroke={PALETTE.hairShade} strokeWidth="1.4" opacity="0.55">
          <path d="M84 145 q5 3 9 0 M84 157 q5 3 9 0 M147 145 q5 3 9 0 M147 157 q5 3 9 0" />
        </g>

        {/* cheeks */}
        <circle cx="99" cy="152" r="7" fill={PALETTE.cheek} opacity="0.5" filter={`url(#${cheekBlur})`} />
        <circle cx="141" cy="152" r="7" fill={PALETTE.cheek} opacity="0.5" filter={`url(#${cheekBlur})`} />

        {/* brows */}
        <path d="M102 128 q7 -4 13 -1 M125 127 q7 -3 13 1" stroke={PALETTE.hairShade} strokeWidth="2.4" strokeLinecap="round" fill="none" />

        {/* eyes */}
        {closedEyes ? (
          <g stroke={PALETTE.ink} strokeWidth="2.6" fill="none" strokeLinecap="round">
            <path d="M104 142 q6 5 12 0" />
            <path d="M124 142 q6 5 12 0" />
            <path d="M104 142 l-3 -2 M136 142 l3 -2" strokeWidth="1.8" opacity="0.8" />
          </g>
        ) : (
          <g>
            <ellipse cx="109" cy="141" rx="4.2" ry="5.2" fill={PALETTE.ink} />
            <ellipse cx="131" cy="141" rx="4.2" ry="5.2" fill={PALETTE.ink} />
            <circle cx="110.4" cy="139.2" r="1.5" fill="#ffffff" />
            <circle cx="132.4" cy="139.2" r="1.5" fill="#ffffff" />
            <path d="M103 136 q-2 -3 0 -5 M137 136 q2 -3 0 -5" stroke={PALETTE.ink} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* nose & mouth */}
        <path d="M119 148 q2 3 3 0" stroke={PALETTE.skinShade} strokeWidth="2" fill="none" strokeLinecap="round" />
        {pose === 'greeting' ? (
          <path d="M113 155 q7 7 14 0 q-7 3 -14 0 Z" fill="#b0616d" />
        ) : (
          <path d="M114 155 q6 4 12 0" stroke="#b0616d" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        )}

        {/* hat */}
        <g>
          <ellipse cx="120" cy="113" rx="61" ry="15" fill={PALETTE.hatDark} />
          <ellipse cx="120" cy="110" rx="61" ry="14" fill={`url(#${hatGradient})`} />
          <path
            d="M85 108 C82 86 90 58 105 40 C113 31 124 25 136 23 C128 32 123 41 124 49 C126 62 138 77 151 92 C158 100 157 106 153 110 Z"
            fill={`url(#${hatGradient})`}
          />
          <path
            d="M104 40 C97 54 92 78 94 100 C100 104 106 106 112 107 C105 84 106 60 114 42 Z"
            fill="#ffffff"
            opacity="0.07"
          />
          <path d="M84 103 C104 94 136 94 156 103 L158 113 C136 104 104 104 82 113 Z" fill={PALETTE.band} />
          <path d="M84 103 C104 94 136 94 156 103" stroke={PALETTE.bandLight} strokeWidth="1.6" fill="none" opacity="0.8" />
          <rect x="112" y="96" width="16" height="13" rx="2.5" fill={PALETTE.gold} transform="rotate(-6 120 102)" />
          <rect x="116" y="100" width="8" height="5" rx="1.5" fill={PALETTE.hatShade} transform="rotate(-6 120 102)" />
          <circle cx="136" cy="23" r="4.6" fill={PALETTE.berry} />
          <g fill={PALETTE.gold} opacity="0.9">
            <path d="M110 74 l1.8 4.2 4.2 1.8 -4.2 1.8 -1.8 4.2 -1.8 -4.2 -4.2 -1.8 4.2 -1.8 z" />
            <path d="M131 86 l1.4 3.2 3.2 1.4 -3.2 1.4 -1.4 3.2 -1.4 -3.2 -3.2 -1.4 3.2 -1.4 z" />
            <path d="M96 92 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2 z" />
          </g>
        </g>
      </g>
    </g>
  )
}

export function WitchMascot({
  pose = 'greeting',
  className = '',
  decorative = false,
}: {
  pose?: MascotPose
  className?: string
  decorative?: boolean
}) {
  const uid = useId().replace(/[:]/g, '')
  return (
    <svg
      viewBox="0 0 240 320"
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : POSE_LABEL[pose]}
    >
      {!decorative && <title>{POSE_LABEL[pose]}</title>}
      <MascotFigure pose={pose} uid={uid} />
    </svg>
  )
}
