/// <reference types="react" />

// Disable TypeScript checking for dynamic URL imports in Edge Functions
// @ts-nocheck

// For production stability, pin to specific versions
const REACT_VERSION = "18.2.0";

import React from `https://esm.sh/react@${REACT_VERSION}?dts`;
import { ImageResponse } from "https://deno.land/x/og_edge/mod.ts";

// Define the absolute URL for the fallback image
const FALLBACK_IMAGE_URL = "https://cook-fast.webvijayi.com/cookfast%20og.png";

// Cache settings
const CACHE_CONTROL_HEADER = "public, max-age=3600, s-maxage=86400"; // 1 hour browser cache, 24 hour CDN cache

/**
 * Netlify Edge Function handler for generating OpenGraph images
 * This function generates dynamic OG images for social media with appropriate caching
 * @param {Request} req - The incoming request object
 * @returns {Response} - The generated image or fallback
 */
export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    
    // Get optional customization parameters
    const title = url.searchParams.get("title") || "🍳🚀 CookFast";
    const subtitle = url.searchParams.get("subtitle") || "AI-Powered Documentation Generator";
    const theme = url.searchParams.get("theme") || "light";
    
    // Define colors based on theme
    const bgColor = theme === "dark" ? "#09090B" : "#FFFFFF";
    const textColor = theme === "dark" ? "#FFFFFF" : "#09090B";
    const accentColor = "#FB7A09"; // Orange accent color
    
    // Generate the dynamic image with optimized response headers
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: bgColor,
            fontSize: 80,
            fontWeight: "bold",
            color: textColor,
            padding: "40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Gradient Background */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 
                theme === "dark" 
                  ? "linear-gradient(135deg, rgba(251,122,9,0.2) 0%, rgba(9,9,11,0.1) 50%)"
                  : "linear-gradient(135deg, rgba(251,122,9,0.1) 0%, rgba(255,255,255,0.05) 50%)",
              zIndex: 0,
            }}
          />
          
          {/* Subtle Grid Pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 
                "radial-gradient(circle, rgba(251,122,9,0.1) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              zIndex: 1,
            }}
          />
          
          {/* Content Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              padding: "40px",
              borderRadius: "24px",
              background: theme === "dark" 
                ? "rgba(9,9,11,0.7)" 
                : "rgba(255,255,255,0.7)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Logo Text */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <span style={{ fontSize: 120 }}>🍳</span>
              <span style={{ fontSize: 120, marginLeft: "10px", marginRight: "10px" }}>🚀</span>
              <span 
                style={{ 
                  background: "linear-gradient(90deg, #FB7A09, #F43F5E)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                }}
              >
                CookFast
              </span>
            </div>
            
            {/* Subtitle */}
            <div 
              style={{ 
                fontSize: 36, 
                fontWeight: "normal", 
                textAlign: "center",
                marginTop: "8px",
                color: theme === "dark" ? "#FAFAFA" : "#18181B",
              }}
            >
              {subtitle}
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div
            style={{
              position: "absolute",
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
    
    // Add appropriate caching headers to the response
    const response = new Response(imageResponse.body, imageResponse);
    response.headers.set("Cache-Control", CACHE_CONTROL_HEADER);
    
    return response;
  } catch (e: any) {
    console.error(`Error generating OG image: ${e.message}. Attempting to serve fallback.`);
    
    try {
      // Fetch the static fallback image
      const fallbackResponse = await fetch(FALLBACK_IMAGE_URL);

      if (!fallbackResponse.ok) {
        // Log if fallback fetch fails
        console.error(`Failed to fetch fallback image: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
        // Return the original error response if fallback fails
        return new Response(`Failed to generate dynamic image and failed to fetch fallback: ${e.message}`, { status: 500 });
      }

      // Return the fallback image content with appropriate headers
      const imageBuffer = await fallbackResponse.arrayBuffer();
      // Return the fallback image with proper headers for production
      return new Response(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': fallbackResponse.headers.get('Content-Type') || 'image/png', // Use actual content type or default to png
          'Cache-Control': CACHE_CONTROL_HEADER, // Consistent caching policy
          'X-Fallback-Image': 'true' // Debugging header to indicate fallback was used
        },
      });
    } catch (fallbackError: any) {
      // Log if there's an error during the fallback fetch process
      console.error(`Error fetching fallback image: ${fallbackError.message}`);
      // Return the original error response if fallback fetch throws an error
      return new Response(`Failed to generate dynamic image and fallback fetch error: ${e.message}`, { status: 500 });
    }
  }
} 