import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Get optional customization parameters
    const title = searchParams.get('title') || '🍳🚀 CookFast';
    const subtitle = searchParams.get('subtitle') || 'AI-Powered Documentation Generator';
    const theme = searchParams.get('theme') || 'light';
    
    // Define colors based on theme
    const bgColor = theme === 'dark' ? '#09090B' : '#FFFFFF';
    const textColor = theme === 'dark' ? '#FFFFFF' : '#09090B';
    const accentColor = '#FB7A09'; // Orange accent color
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: bgColor,
            fontSize: 80,
            fontWeight: 'bold',
            color: textColor,
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Gradient Background */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 
                theme === 'dark' 
                  ? 'linear-gradient(135deg, rgba(251,122,9,0.2) 0%, rgba(9,9,11,0.1) 50%)'
                  : 'linear-gradient(135deg, rgba(251,122,9,0.1) 0%, rgba(255,255,255,0.05) 50%)',
              zIndex: 0,
            }}
          />
          
          {/* Subtle Grid Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 
                'radial-gradient(circle, rgba(251,122,9,0.1) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              zIndex: 1,
            }}
          />
          
          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              padding: '40px',
              borderRadius: '24px',
              background: theme === 'dark' 
                ? 'rgba(9,9,11,0.7)' 
                : 'rgba(255,255,255,0.7)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Logo Text */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: 120 }}>🍳</span>
              <span style={{ fontSize: 120, marginLeft: '10px', marginRight: '10px' }}>🚀</span>
              <span 
                style={{ 
                  background: 'linear-gradient(90deg, #FB7A09, #F43F5E)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                }}
              >
                CookFast
              </span>
            </div>
            
            {/* Subtitle */}
            <div 
              style={{ 
                fontSize: 36, 
                fontWeight: 'normal', 
                textAlign: 'center',
                marginTop: '8px',
                color: theme === 'dark' ? '#FAFAFA' : '#18181B',
              }}
            >
              {subtitle}
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              left: 40,
              fontSize: 24,
              opacity: 0.7,
            }}
          >
            cook-fast.webvijayi.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.error(`Error generating OG image: ${e.message}`);
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    });
  }
} 