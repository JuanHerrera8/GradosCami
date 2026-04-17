'use client'

import { useSearchParams } from 'next/navigation'
import { InvitationCard } from './invitation-card'
import { AdminPanel } from './admin-panel'

export function InvitationPageContent() {
  const searchParams = useSearchParams()
  // ?g= holds a Base64-encoded guest name
  const encoded = searchParams.get('g')
  const plural = searchParams.get('p') === '1'

  return (
    <main className="min-h-screen flex flex-col items-center">
      <InvitationCard encoded={encoded} plural={plural} />
      <AdminPanel />
    </main>
  )
}
