'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// April 24, 2026 at 8:00 PM Colombia (UTC-5)
const EVENT_DATE = new Date('2026-04-24T20:00:00-05:00')

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(): TimeLeft {
  const diff = EVENT_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

interface CountdownTimerProps {
  compact?: boolean
}

export function CountdownTimer({ compact = false }: CountdownTimerProps) {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  const isOver =
    time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0

  if (!mounted) return null

  if (isOver) {
    return (
      <p className="text-center font-serif text-base" style={{ color: '#7D2B4A' }}>
        ¡Ya es hora de celebrar!
      </p>
    )
  }

  const units = [
    { label: 'Días', value: time.days },
    { label: 'Hrs', value: time.hours },
    { label: 'Min', value: time.minutes },
    { label: 'Seg', value: time.seconds },
  ]

  return (
    <div className="grid grid-cols-4 gap-1.5 w-full">
      {units.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center justify-center rounded-xl py-2"
          style={{
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(242,184,207,0.65)',
          }}
        >
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="font-serif font-bold leading-none tabular-nums"
            style={{
              fontSize: compact ? '1.3rem' : '1.6rem',
              color: '#7D2B4A',
            }}
          >
            {String(value).padStart(2, '0')}
          </motion.span>
          <span
            className="font-sans tracking-widest uppercase mt-0.5"
            style={{ fontSize: compact ? '8px' : '9px', color: '#B0708A' }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
