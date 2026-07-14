import { ImageResponse } from 'next/og'

export const alt = 'MajorHub — Marketing, Performance e Criatividade'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #0a2540 0%, #001a2e 100%)',
          position: 'relative',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: 300,
            width: 600,
            height: 500,
            borderRadius: 9999,
            background: 'rgba(0,153,255,0.25)',
            filter: 'blur(120px)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          <span style={{ color: '#ffffff' }}>MAJOR</span>
          <span style={{ color: '#00e5ff' }}>HUB</span>
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 34,
            color: '#bae6fd',
            textAlign: 'center',
            maxWidth: 820,
          }}
        >
          Sua empresa merece uma marca que vende.
        </div>

        <div
          style={{
            marginTop: 48,
            display: 'flex',
            gap: 16,
            fontSize: 22,
            color: '#7dd3fc',
          }}
        >
          <span>Estruturação Comercial</span>
          <span style={{ color: '#00e5ff' }}>•</span>
          <span>Sites Profissionais</span>
          <span style={{ color: '#00e5ff' }}>•</span>
          <span>Identidade Visual</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
