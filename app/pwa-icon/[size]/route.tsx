import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const TAMANOS_PERMITIDOS = [192, 512]

/**
 * GET /pwa-icon/192 | /pwa-icon/512
 * Íconos PNG para el manifest de la PWA, con la misma identidad del apple-icon.
 * Con ?maskable=1 el ícono ocupa todo el lienzo con margen de seguridad (Android adaptativo).
 */
export async function GET(request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params
  const lado = TAMANOS_PERMITIDOS.includes(Number(size)) ? Number(size) : 512
  const maskable = new URL(request.url).searchParams.get('maskable') === '1'
  const escala = lado / 180

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B0F19',
          borderRadius: maskable ? 0 : `${40 * escala}px`,
          border: maskable ? 'none' : `${4 * escala}px solid #D4AF37`,
          padding: `${(maskable ? 36 : 24) * escala}px`,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0F172A',
            borderRadius: `${24 * escala}px`,
            border: `${2 * escala}px dashed rgba(212, 175, 55, 0.8)`,
          }}
        >
          <span
            style={{
              fontSize: `${11 * escala}px`,
              letterSpacing: '0.2em',
              color: '#D4AF37',
              textTransform: 'uppercase',
              marginBottom: `${4 * escala}px`,
              fontWeight: 600,
            }}
          >
            TARJETÓN
          </span>
          <span
            style={{
              fontSize: `${84 * escala}px`,
              fontWeight: 800,
              fontFamily: 'serif',
              color: '#FDE68A',
              lineHeight: 1,
            }}
          >
            T
          </span>
        </div>
      </div>
    ),
    {
      width: lado,
      height: lado,
      headers: { 'Cache-Control': 'public, max-age=86400, immutable' },
    }
  )
}
