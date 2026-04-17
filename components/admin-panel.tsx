'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { encodeName } from './invitation-card'

const SECRET_PIN = '1234'

export function AdminPanel() {
  const [pinOpen, setPinOpen] = useState(false)
  const [pinValue, setPinValue] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [guestInput, setGuestInput] = useState('')
  const [copied, setCopied] = useState(false)

  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://midominio.com/'

  // Encode name with Base64 so the URL param is not human-readable
  const generatedLink = guestInput.trim()
    ? `${baseUrl}?g=${encodeName(guestInput.trim())}`
    : ''

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pinValue === SECRET_PIN) {
      setUnlocked(true)
      setPinError(false)
    } else {
      setPinError(true)
      setPinValue('')
    }
  }

  async function handleCopy() {
    if (!generatedLink) return
    await navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const cardStyle = {
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-14 pt-2">
      {!pinOpen && !unlocked && (
        <div className="flex justify-center">
          <button
            onClick={() => setPinOpen(true)}
            className="text-xs font-sans tracking-widest uppercase rounded-full px-5 py-2 transition-colors"
            style={{ color: '#B0708A', border: '1px solid #F2B8CF' }}
          >
            Panel de control
          </button>
        </div>
      )}

      <AnimatePresence>
        {pinOpen && !unlocked && (
          <motion.div
            key="pin"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl p-px mt-4"
            style={{ background: 'linear-gradient(135deg, #F2B8CF, #C2547A44)' }}
          >
            <div className="rounded-3xl px-6 py-6" style={cardStyle}>
              <p className="font-serif text-center text-lg mb-4" style={{ color: '#7D2B4A' }}>
                Ingresa el PIN
              </p>
              <form onSubmit={handlePinSubmit} className="flex flex-col gap-3">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={pinValue}
                  onChange={(e) => { setPinValue(e.target.value); setPinError(false) }}
                  placeholder="••••"
                  className="w-full rounded-xl px-4 py-3 text-center font-sans tracking-[0.4em] text-lg border outline-none focus:border-primary transition-colors"
                  style={{
                    borderColor: pinError ? '#C2547A' : '#F2B8CF',
                    background: 'rgba(248,215,227,0.4)',
                    color: '#7D2B4A',
                  }}
                />
                {pinError && (
                  <p className="text-xs text-center font-sans" style={{ color: '#C2547A' }}>
                    PIN incorrecto. Inténtalo de nuevo.
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-sans font-semibold text-white text-sm tracking-wide transition-transform active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #C2547A, #A03860)' }}
                >
                  Entrar
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {unlocked && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl p-px mt-4"
            style={{ background: 'linear-gradient(135deg, #F2B8CF, #C2547A44)' }}
          >
            <div className="rounded-3xl px-6 py-6" style={cardStyle}>
              <p className="font-serif text-xl text-center mb-1" style={{ color: '#7D2B4A' }}>
                Generador de links
              </p>
              <p className="text-xs font-sans text-center mb-5" style={{ color: '#B0708A' }}>
                El nombre queda codificado en la URL — nadie puede editarlo a mano
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="guest-name"
                    className="text-xs font-sans tracking-widest uppercase block mb-1.5" style={{ color: '#B0708A' }}
                  >
                    Nombre del invitado
                  </label>
                  <input
                    id="guest-name"
                    type="text"
                    value={guestInput}
                    onChange={(e) => setGuestInput(e.target.value)}
                    placeholder="Ej: María García"
                    className="w-full rounded-xl px-4 py-3 font-sans text-sm border outline-none focus:border-primary transition-colors"
                    style={{ borderColor: '#F2B8CF', background: 'rgba(248,215,227,0.4)', color: '#7D2B4A' }}
                  />
                </div>

                {generatedLink && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl px-4 py-3"
                    style={{ background: '#FCE8EF', border: '1px solid #F2B8CF' }}
                  >
                    <p className="text-[10px] font-sans tracking-widest uppercase mb-1" style={{ color: '#B0708A' }}>
                      Link codificado
                    </p>
                    <p className="text-xs font-sans break-all leading-relaxed" style={{ color: '#A03860' }}>
                      {generatedLink}
                    </p>
                  </motion.div>
                )}

                <button
                  onClick={handleCopy}
                  disabled={!generatedLink}
                  className="w-full py-3 rounded-xl font-sans font-semibold text-sm tracking-wide transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
                  style={{
                    background: generatedLink ? 'linear-gradient(135deg, #C2547A, #A03860)' : '#F2B8CF',
                    boxShadow: generatedLink ? '0 4px 16px rgba(194,84,122,0.3)' : 'none',
                  }}
                >
                  {copied ? <><CheckIcon /> Link copiado</> : <><CopyIcon /> Copiar link</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
