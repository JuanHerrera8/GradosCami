import { Suspense } from 'react'
import { InvitationPageContent } from '@/components/invitation-page-content'

export default function Page() {
  return (
    <Suspense>
      <InvitationPageContent />
    </Suspense>
  )
}
