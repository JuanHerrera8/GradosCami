'use client'

import { motion } from 'framer-motion'
import { CountdownTimer } from './countdown-timer'

// ── Constants ──────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '573205277631'
const MAPS_URL = 'https://maps.google.com/?q=Carrera+43A+1-50+Medellín'

// ── Encoding helpers ───────────────────────────────────────────────────────
export function encodeName(name: string): string {
  return btoa(encodeURIComponent(name))
}

function decodeName(encoded: string): string | null {
  try {
    return decodeURIComponent(atob(encoded))
  } catch {
    return null
  }
}

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
}

// ── Bell curve path helper ─────────────────────────────────────────────────
function bellPath(W: number, H: number) {
  const pts: string[] = []
  for (let i = 0; i <= 100; i++) {
    const x = (i / 100) * W
    const z = (i / 100) * 8 - 4
    const y = H - (Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)) * H * 2.5
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return 'M ' + pts.join(' L ')
}

// ── Decoration layer — inside the card ────────────────────────────────────
function CardDecoration() {
  // Bell curve
  const bw = 260, bh = 110
  const bp = bellPath(bw, bh)
  const bfill = bp + ` L ${bw},${bh} L 0,${bh} Z`
  const sigmaL = (2 / 8) * bw
  const sigmaR = (6 / 8) * bw
  const innerPts: string[] = []
  for (let i = 0; i <= 100; i++) {
    const x = (i / 100) * bw
    if (x < sigmaL || x > sigmaR) continue
    const z = (i / 100) * 8 - 4
    const y = bh - (Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)) * bh * 2.5
    innerPts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  const sfill = innerPts.length ? `M ${innerPts.join(' L ')} L ${sigmaR},${bh} L ${sigmaL},${bh} Z` : ''

  // CDF curve
  function cdfPath(W: number, H: number) {
    const pts: string[] = []
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * W
      const z = (i / 100) * 8 - 4
      // approx erf
      const t = 1 / (1 + 0.3275911 * Math.abs(z))
      const erf = 1 - (0.254829592 * t - 0.284496736 * t * t + 1.421413741 * t ** 3 - 1.453152027 * t ** 4 + 1.061405429 * t ** 5) * Math.exp(-z * z)
      const cdf = z >= 0 ? erf / 2 + 0.5 : 0.5 - erf / 2
      const y = H - cdf * H * 0.88
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
    }
    return 'M ' + pts.join(' L ')
  }

  // Residuals data
  const residuals: [number, number][] = [
    [10,40],[18,32],[26,48],[34,35],[42,43],[50,37],[58,44],[66,33],[74,41],[82,36],
  ]
  const residualMid = 38

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">

      {/* ── Dot grid ── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
        <defs>
          <pattern id="cardDots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.9" fill="#C2547A" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cardDots)" />
      </svg>

      {/* ── Bell curve — bottom center, large & prominent ── */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-[0.17]">
        <svg viewBox={`0 0 ${bw} ${bh}`} width={bw} height={bh}>
          <defs>
            <linearGradient id="bellFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C2547A" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#C2547A" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {sfill && <path d={sfill} fill="#C2547A" opacity="0.3" />}
          <path d={bfill} fill="url(#bellFill)" />
          <path d={bp} fill="none" stroke="#A03860" strokeWidth="2" />
          {/* axis */}
          <line x1="0" y1={bh} x2={bw} y2={bh} stroke="#C2547A" strokeWidth="0.8" opacity="0.6" />
          {/* mu line */}
          <line x1={bw / 2} y1="0" x2={bw / 2} y2={bh} stroke="#A03860" strokeWidth="1.2" strokeDasharray="5 3" opacity="0.7" />
          {/* sigma lines */}
          <line x1={sigmaL} y1="0" x2={sigmaL} y2={bh} stroke="#C2547A" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
          <line x1={sigmaR} y1="0" x2={sigmaR} y2={bh} stroke="#C2547A" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
          {/* labels */}
          <text x={bw / 2 + 4} y="13" fontSize="12" fill="#A03860" fontFamily="serif" opacity="0.9">μ</text>
          <text x={sigmaL - 16} y="13" fontSize="11" fill="#C2547A" fontFamily="serif" opacity="0.9">-σ</text>
          <text x={sigmaR + 4} y="13" fontSize="11" fill="#C2547A" fontFamily="serif" opacity="0.9">+σ</text>
          <text x={sigmaL + 4} y={bh - 6} fontSize="9" fill="#C2547A" fontFamily="serif" opacity="0.8">68%</text>
        </svg>
      </div>

      {/* ── Scatter + regression — top-right ── */}
      <div className="absolute top-2 right-2 opacity-[0.18]">
        <svg viewBox="0 0 118 88" width="118" height="88">
          {/* axes */}
          <line x1="12" y1="6" x2="12" y2="78" stroke="#C2547A" strokeWidth="1" />
          <line x1="12" y1="78" x2="112" y2="78" stroke="#C2547A" strokeWidth="1" />
          {/* tick marks */}
          {[0,1,2,3,4].map(i => (
            <line key={i} x1={12 + i * 25} y1="78" x2={12 + i * 25} y2="82" stroke="#C2547A" strokeWidth="0.7" />
          ))}
          {[0,1,2,3].map(i => (
            <line key={i} x1="8" y1={78 - i * 18} x2="12" y2={78 - i * 18} stroke="#C2547A" strokeWidth="0.7" />
          ))}
          {/* CI band */}
          <path d="M14,73 L30,64 L46,55 L62,46 L78,37 L94,28 L110,19 L110,25 L94,34 L78,43 L62,52 L46,61 L30,70 L14,79 Z"
            fill="#C2547A" opacity="0.12" />
          {/* regression line */}
          <line x1="14" y1="74" x2="110" y2="20" stroke="#A03860" strokeWidth="1.4" strokeDasharray="5 2" />
          {/* points */}
          {([[16,70],[24,63],[32,58],[40,51],[48,47],[56,40],[64,34],[72,28],[80,24],[88,18],[96,14],
             [20,67],[36,53],[52,44],[68,36],[84,22]] as [number,number][]).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2" fill="#C2547A" />
          ))}
          {/* label */}
          <text x="14" y="6" fontSize="8" fill="#A03860" fontFamily="serif">r²=0.94</text>
        </svg>
      </div>

      {/* ── Formula — top-left ── */}
      <div className="absolute top-3 left-3 opacity-[0.17]">
        <svg viewBox="0 0 170 44" width="145" height="38">
          <text x="2" y="30" fontSize="16" fill="#A03860" fontFamily="serif">f(x) =</text>
          <text x="56" y="18" fontSize="10" fill="#C2547A" fontFamily="serif">1</text>
          <line x1="52" y1="22" x2="98" y2="22" stroke="#C2547A" strokeWidth="1" />
          <text x="52" y="35" fontSize="10" fill="#C2547A" fontFamily="serif">σ√2π</text>
          <text x="101" y="30" fontSize="16" fill="#A03860" fontFamily="serif">e</text>
          <text x="115" y="19" fontSize="9" fill="#C2547A" fontFamily="serif">-(x-μ)²</text>
          <line x1="115" y1="22" x2="158" y2="22" stroke="#C2547A" strokeWidth="0.8" />
          <text x="122" y="34" fontSize="9" fill="#C2547A" fontFamily="serif">2σ²</text>
        </svg>
      </div>

      {/* ── CDF curve — left side ── */}
      <div className="absolute top-[38%] left-0 opacity-[0.16]">
        <svg viewBox="0 0 80 60" width="80" height="60">
          <line x1="6" y1="2" x2="6" y2="56" stroke="#C2547A" strokeWidth="0.8" />
          <line x1="6" y1="56" x2="78" y2="56" stroke="#C2547A" strokeWidth="0.8" />
          <path d={cdfPath(72, 52).replace('M ', 'M ')} fill="none" stroke="#A03860" strokeWidth="1.8"
            transform="translate(6,2)" />
          <text x="8" y="10" fontSize="8" fill="#A03860" fontFamily="serif">F(x)</text>
          {/* 50% mark */}
          <line x1="6" y1="30" x2="78" y2="30" stroke="#C2547A" strokeWidth="0.6" strokeDasharray="2 2" />
          <text x="64" y="28" fontSize="7" fill="#C2547A" fontFamily="serif">0.5</text>
        </svg>
      </div>

      {/* ── Histogram — bottom-left, visible ── */}
      <div className="absolute bottom-0 left-0 opacity-[0.17]">
        <svg viewBox="0 0 100 64" width="90" height="58">
          {([0.08,0.18,0.42,0.72,1,0.72,0.42,0.18,0.08] as number[]).map((v, i) => {
            const bw2 = 100 / 9
            const bh2 = v * 52
            return (
              <rect key={i} x={i * bw2 + 1} y={56 - bh2} width={bw2 - 2} height={bh2} rx="2"
                fill="#C2547A" opacity={0.55 + v * 0.3} />
            )
          })}
          <line x1="0" y1="57" x2="100" y2="57" stroke="#C2547A" strokeWidth="0.9" />
          <text x="36" y="62" fontSize="7" fill="#A03860" fontFamily="serif">n=247</text>
        </svg>
      </div>

      {/* ── Residuals plot — right-center ── */}
      <div className="absolute top-[55%] right-1 opacity-[0.15]">
        <svg viewBox="0 0 96 58" width="88" height="52">
          <line x1="8" y1="4" x2="8" y2="54" stroke="#C2547A" strokeWidth="0.8" />
          <line x1="8" y1="54" x2="92" y2="54" stroke="#C2547A" strokeWidth="0.8" />
          {/* zero line */}
          <line x1="8" y1={residualMid} x2="92" y2={residualMid} stroke="#A03860" strokeWidth="1" strokeDasharray="3 2" />
          {/* residual stems + points */}
          {residuals.map(([x, y], i) => (
            <g key={i}>
              <line x1={x} y1={residualMid} x2={x} y2={y} stroke="#C2547A" strokeWidth="1" />
              <circle cx={x} cy={y} r="2.2" fill="#A03860" />
            </g>
          ))}
          <text x="10" y="10" fontSize="8" fill="#A03860" fontFamily="serif">Residuos</text>
        </svg>
      </div>

      {/* ── Boxplot — bottom-right ── */}
      <div className="absolute bottom-10 right-2 opacity-[0.17]">
        <svg viewBox="0 0 120 36" width="108" height="32">
          {/* whiskers */}
          <line x1="8" y1="18" x2="32" y2="18" stroke="#C2547A" strokeWidth="1.2" />
          <line x1="88" y1="18" x2="112" y2="18" stroke="#C2547A" strokeWidth="1.2" />
          <line x1="8" y1="12" x2="8" y2="24" stroke="#C2547A" strokeWidth="1.2" />
          <line x1="112" y1="12" x2="112" y2="24" stroke="#C2547A" strokeWidth="1.2" />
          {/* box */}
          <rect x="32" y="8" width="56" height="20" rx="2" fill="rgba(194,84,122,0.18)" stroke="#C2547A" strokeWidth="1.2" />
          {/* median */}
          <line x1="60" y1="8" x2="60" y2="28" stroke="#7D2B4A" strokeWidth="2" />
          {/* mean dot */}
          <circle cx="64" cy="18" r="2.5" fill="#A03860" />
          {/* labels */}
          <text x="4" y="8" fontSize="7" fill="#C2547A" fontFamily="serif">Q1</text>
          <text x="56" y="6" fontSize="7" fill="#7D2B4A" fontFamily="serif">Med</text>
          <text x="88" y="8" fontSize="7" fill="#C2547A" fontFamily="serif">Q3</text>
        </svg>
      </div>

      {/* ── Greek symbols floating ── */}
      {(
        [
          { sym: 'σ', style: { top: '7%', left: '5%', fontSize: '18px' } },
          { sym: 'μ', style: { top: '22%', right: '3%', fontSize: '16px' } },
          { sym: 'χ²', style: { top: '48%', left: '3%', fontSize: '13px' } },
          { sym: 'β', style: { bottom: '30%', right: '2%', fontSize: '15px' } },
          { sym: 'α', style: { bottom: '18%', left: '42%', fontSize: '13px' } },
          { sym: 'ρ', style: { top: '34%', right: '2%', fontSize: '14px' } },
          { sym: 'H₀', style: { bottom: '42%', left: '2%', fontSize: '11px' } },
          { sym: 'p<.05', style: { top: '62%', right: '3%', fontSize: '9px', letterSpacing: '0.05em' } },
        ]
      ).map(({ sym, style }, i) => (
        <span
          key={i}
          className="absolute font-serif select-none"
          style={{ color: '#C2547A', opacity: 0.18, ...style }}
        >
          {sym}
        </span>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
interface InvitationCardProps {
  encoded: string | null
}

export function InvitationCard({ encoded }: InvitationCardProps) {
  const guestName = encoded ? decodeName(encoded) : null

  const whatsappMessage = encodeURIComponent(
    `¡Hola Cami! Soy ${guestName ?? 'yo'} y confirmo mi asistencia a tu comida de grado 🎓`
  )
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`

  return (
    <div
      className="w-full min-h-dvh flex items-center justify-center px-4 py-6"
      style={{ background: 'var(--color-background)' }}
    >
      {/* Outer glow border */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-full max-w-sm"
        style={{ filter: 'drop-shadow(0 16px 48px rgba(194,84,122,0.22))' }}
      >
        <div
          className="rounded-3xl p-px"
          style={{ background: 'linear-gradient(145deg, #F2B8CF 0%, #C2547A66 50%, #F8D7E3 100%)' }}
        >
          {/* Card */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
            }}
          >
            {/* Statistical decoration layer — inside the card */}
            <CardDecoration />

            {/* Content — above decoration */}
            <div className="relative z-10 flex flex-col">

              {/* ── Banner ── */}
              <div
                className="px-6 pt-5 pb-4 flex flex-col items-center gap-0.5"
                style={{ background: 'linear-gradient(160deg, #E8A0BB 0%, #C2547A 100%)' }}
              >
                <motion.p
                  custom={0} initial="hidden" animate="visible" variants={fadeUp}
                  className="text-[9px] tracking-[0.35em] uppercase font-sans text-white/80"
                >
                  Invitación para
                </motion.p>
                <motion.h2
                  custom={0.5} initial="hidden" animate="visible" variants={fadeUp}
                  className="font-serif text-xl text-white text-center leading-tight text-balance"
                >
                  {guestName ?? 'Un invitado especial'}
                </motion.h2>
                <motion.div
                  custom={1} initial="hidden" animate="visible" variants={fadeUp}
                  className="mt-2 flex items-center gap-2"
                >
                  <div className="h-px w-8 bg-white/40" />
                  <span className="font-serif text-white/70 text-base select-none">σ</span>
                  <div className="h-px w-8 bg-white/40" />
                </motion.div>
              </div>

              {/* ── Body ── */}
              <div className="px-6 pt-4 pb-5 flex flex-col items-center gap-3.5">

                {/* Celebrant */}
                <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="text-center">
                  <p className="text-[9px] font-sans tracking-[0.3em] uppercase" style={{ color: '#B0708A' }}>
                    Celebrando el grado de
                  </p>
                  <h1
                    className="font-serif leading-tight mt-0.5"
                    style={{ color: '#7D2B4A', fontSize: '2.6rem' }}
                  >
                    Cami
                  </h1>
                  <p className="font-sans text-[11px]" style={{ color: '#A03860' }}>
                    Estadistica &mdash; Clase 2025
                  </p>
                </motion.div>

                {/* Divider */}
                <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-px" style={{ background: '#F2B8CF' }} />
                  <span className="font-serif text-sm select-none" style={{ color: '#E8A0BB' }}>✦</span>
                  <div className="flex-1 h-px" style={{ background: '#F2B8CF' }} />
                </motion.div>

                {/* Invitation text */}
                <motion.p
                  custom={4} initial="hidden" animate="visible" variants={fadeUp}
                  className="text-center font-serif leading-relaxed text-balance text-[0.92rem]"
                  style={{ color: '#7D2B4A' }}
                >
                  {guestName
                    ? `${guestName}, te esperamos para celebrar este momento tan especial.`
                    : 'Te esperamos para celebrar este momento tan especial.'}
                </motion.p>

                {/* Event details — two columns */}
                <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-2 w-full">
                  <DetailChip icon={<CalendarIcon />} label="Fecha" value="Vie 24 abr, 2026" />
                  <DetailChip icon={<ClockIcon />} label="Hora" value="7:00 p.m." />
                </motion.div>

                {/* Countdown */}
                <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp} className="w-full">
                  <p className="text-[9px] font-sans tracking-[0.3em] uppercase text-center mb-2" style={{ color: '#B0708A' }}>
                    Cuenta regresiva
                  </p>
                  <CountdownTimer compact />
                </motion.div>

                {/* Divider */}
                <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-px" style={{ background: '#F2B8CF' }} />
                  <span className="font-serif text-sm select-none" style={{ color: '#E8A0BB' }}>✦</span>
                  <div className="flex-1 h-px" style={{ background: '#F2B8CF' }} />
                </motion.div>

                {/* Buttons */}
                <motion.div custom={8} initial="hidden" animate="visible" variants={fadeUp} className="w-full flex flex-col gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-sans font-semibold text-white text-sm tracking-wide transition-transform active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #C2547A, #A03860)',
                      boxShadow: '0 4px 20px rgba(194,84,122,0.32)',
                    }}
                    aria-label="Confirmar asistencia por WhatsApp"
                  >
                    <WhatsAppIcon />
                    Confirmar asistencia
                  </a>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-sans font-semibold text-sm tracking-wide transition-transform active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.65)',
                      border: '1.5px solid #F2B8CF',
                      color: '#A03860',
                    }}
                    aria-label="Ver ubicacion del evento en Google Maps"
                  >
                    <MapPinIcon />
                    Ver ubicacion
                  </a>
                </motion.div>

                {/* Footer note */}
                <motion.p
                  custom={9} initial="hidden" animate="visible" variants={fadeUp}
                  className="text-[9px] font-sans text-center"
                  style={{ color: '#C8879E' }}
                >
                  Con amor, Cami &mdash; Estadistica 2025
                </motion.p>

              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Detail chip ────────────────────────────────────────────────────────────
function DetailChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2.5 text-center"
      style={{ background: 'rgba(248,215,227,0.45)', border: '1px solid rgba(242,184,207,0.6)' }}
    >
      <span style={{ color: '#C2547A' }}>{icon}</span>
      <span className="text-[8px] font-sans tracking-widest uppercase" style={{ color: '#B0708A' }}>{label}</span>
      <span className="text-[11px] font-serif leading-tight" style={{ color: '#7D2B4A' }}>{value}</span>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────
function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
