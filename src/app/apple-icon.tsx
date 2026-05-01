import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #F2C4CE 0%, #C4758A 50%, #8B3A52 100%)',
          borderRadius: '22%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 110,
        }}
      >
        💄
      </div>
    ),
    { ...size }
  )
}
