import { ImageResponse } from 'next/og'

export const alt = 'Proposta de desenvolvimento de site para a HiperbaricaMT'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const nodeStyle = {
  position: 'absolute' as const,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 92,
  height: 92,
  borderRadius: 999,
  border: '1px solid rgba(140, 232, 240, 0.55)',
  background: '#09273a',
  color: '#f7fcfd',
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: 1,
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #061522 0%, #0a2b40 100%)',
          color: '#f7fcfd',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -100,
            width: 620,
            height: 620,
            borderRadius: 999,
            background: 'rgba(43, 209, 223, 0.08)',
          }}
        />

        <div
          style={{
            width: '58%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '68px 36px 68px 76px',
          }}
        >
          <div style={{ display: 'flex', color: '#8ce8f0', fontSize: 18, letterSpacing: 4 }}>
            MAJORHUB / PROPOSTA DIGITAL
          </div>
          <div style={{ display: 'flex', marginTop: 58, color: '#8ba7b6', fontSize: 19, letterSpacing: 3 }}>
            PROPOSTA PARA
          </div>
          <div style={{ display: 'flex', marginTop: 14, fontSize: 60, fontWeight: 800, letterSpacing: -3 }}>
            HIPERBARICA<span style={{ color: '#8ce8f0' }}>MT</span>
          </div>
          <div style={{ display: 'flex', marginTop: 20, color: '#c9e9ee', fontSize: 27 }}>
            Desenvolvimento de site
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 54, color: '#8ce8f0', fontSize: 18, letterSpacing: 2 }}>
            <span style={{ display: 'flex', width: 8, height: 8, borderRadius: 999, background: '#8ce8f0' }} />
            SITE RESPONSIVO / BUSCA POR IA
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            width: '42%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 360,
              height: 360,
              borderRadius: 999,
              border: '1px solid rgba(140, 232, 240, 0.24)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 120,
              height: 120,
              borderRadius: 999,
              border: '1px solid #8ce8f0',
              background: '#0d3449',
              boxShadow: '0 0 40px rgba(43, 209, 223, 0.25)',
              color: '#8ce8f0',
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: 3,
            }}
          >
            HMT
          </div>
          <div style={{ ...nodeStyle, top: 70, left: 206 }}>SITE</div>
          <div style={{ ...nodeStyle, top: 269, right: 34 }}>GOOGLE</div>
          <div style={{ ...nodeStyle, bottom: 70, left: 206 }}>IA</div>
          <div style={{ ...nodeStyle, top: 269, left: 18 }}>LEAD</div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 42,
            bottom: 32,
            display: 'flex',
            color: 'rgba(201, 233, 238, 0.58)',
            fontSize: 14,
            letterSpacing: 2,
          }}
        >
          majorhub.com.br/orc/hiperbaricaMT
        </div>
      </div>
    ),
    { ...size },
  )
}