import { ImageResponse } from 'next/og';

export const alt = 'Food Vans Near Me - Tasmania\'s food van map';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Share image shown when the site is posted on Facebook, Messenger, LinkedIn etc.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #F8F6F1 0%, #F2E3CC 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            background: '#E07B00',
            border: '10px solid white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            marginBottom: 36,
          }}
        />
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, color: '#2A2520', lineHeight: 1.1 }}>
          <span style={{ color: '#C56A00', marginRight: 18 }}>Food Vans</span>
          <span>Near Me</span>
        </div>
        <div style={{ fontSize: 40, color: '#5A564F', marginTop: 24 }}>
          {"Tasmania's food van map"}
        </div>
        <div style={{ fontSize: 28, color: '#01696F', marginTop: 40, fontWeight: 700 }}>
          foodvansnear.me
        </div>
      </div>
    ),
    size
  );
}
