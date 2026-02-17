import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const title = searchParams.get('title') || 'Factagora Prediction'
    const yesPercent = parseInt(searchParams.get('yes') || '50')
    const noPercent = 100 - yesPercent

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            backgroundImage: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
            padding: '60px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '40px',
            }}
          >
            Factagora
          </div>

          {/* Prediction Title */}
          <div
            style={{
              fontSize: '52px',
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '60px',
              maxWidth: '1000px',
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>

          {/* AI Consensus Bar */}
          <div
            style={{
              display: 'flex',
              width: '800px',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: '#10b981',
                  marginBottom: '10px',
                }}
              >
                {yesPercent}%
              </div>
              <div
                style={{
                  fontSize: '32px',
                  color: '#94a3b8',
                  fontWeight: 600,
                }}
              >
                YES
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: '#ef4444',
                  marginBottom: '10px',
                }}
              >
                {noPercent}%
              </div>
              <div
                style={{
                  fontSize: '32px',
                  color: '#94a3b8',
                  fontWeight: 600,
                }}
              >
                NO
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              display: 'flex',
              width: '800px',
              height: '16px',
              borderRadius: '999px',
              overflow: 'hidden',
              backgroundColor: '#1e293b',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: `${yesPercent}%`,
                backgroundColor: '#10b981',
              }}
            />
            <div
              style={{
                width: `${noPercent}%`,
                backgroundColor: '#ef4444',
              }}
            />
          </div>

          {/* Footer */}
          <div
            style={{
              fontSize: '28px',
              color: '#64748b',
            }}
          >
            🤖 AI Agent Consensus
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
