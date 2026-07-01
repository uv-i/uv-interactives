import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'UV Interactives — Game Studio & Free Learning';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0d0820',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
        }}
      >
        <div style={{ fontSize: 18, color: '#f5a623', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24 }}>
          UV Interactives
        </div>
        <div style={{ fontSize: 64, color: '#f0f0ff', fontWeight: 900, textAlign: 'center', lineHeight: 1.1 }}>
          Lets build games TOGETHER
        </div>
        <div style={{ fontSize: 22, color: '#f0f0ff', marginTop: 28, opacity: 0.55, textAlign: 'center' }}>
          Game studio &amp; free Unity learning — Chennai, India
        </div>
        <div style={{ fontSize: 16, color: '#f5a623', marginTop: 20, opacity: 0.7, fontStyle: 'italic' }}>
          “A rising tide lifts all boats.”
        </div>
      </div>
    ),
    size,
  );
}
