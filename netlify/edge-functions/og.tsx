/// <reference types="react" />

// Disable TypeScript checking for dynamic URL imports in Edge Functions
// @ts-nocheck

// For production stability, pin to specific versions
const REACT_VERSION = "18.2.0";

// We need to use dynamic import for ESM modules in Edge Functions
import React from 'https://esm.sh/react@18.2.0?dts';
import { ImageResponse } from "https://deno.land/x/og_edge/mod.ts";

// Define the URL for the fallback image - using a local file instead of external URL
// Removed space from filename for better URL compatibility
const FALLBACK_IMAGE_URL = "/cookfast-og.png";

// Cache settings - use shorter cache to help with debugging
const CACHE_CONTROL_HEADER = "public, max-age=300, s-maxage=3600"; // 5 min browser cache, 1 hour CDN cache

/**
 * Netlify Edge Function handler for generating OpenGraph images
 * This function generates dynamic OG images for social media with appropriate caching
 * @param {Request} req - The incoming request object
 * @returns {Response} - The generated image or fallback
 */
export default async function handler(req: Request) {
  try {
    // Check for Accept-Encoding header to determine if client supports compression
    const acceptEncoding = req.headers.get('Accept-Encoding') || '';
    const supportsCompression = acceptEncoding.includes('gzip') || acceptEncoding.includes('deflate');
    
    const url = new URL(req.url);
    
    // Get optional customization parameters
    const title = url.searchParams.get("title") || "🍳🚀 CookFast";
    const subtitle = url.searchParams.get("subtitle") || "AI-Powered Documentation Generator";
    const theme = url.searchParams.get("theme") || "light";
    
    // Define colors based on theme
    const bgColor = theme === "dark" ? "#09090B" : "#FFFFFF";
    const textColor = theme === "dark" ? "#FFFFFF" : "#09090B";
    
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
          {/* Simple Background */}
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
          
          {/* Content Container - Simplified for better compatibility */}
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
                  fontSize: 120,
                  color: "#FB7A09",
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
        // Optimize for better compatibility
        emoji: "twemoji",
        debug: false,
      },
    );
    
    // Get the image data as an array buffer
    const imageData = await imageResponse.arrayBuffer();
    
    // Create a properly formatted response with explicit content-type and length
    return new Response(imageData, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": imageData.byteLength.toString(),
        "Cache-Control": CACHE_CONTROL_HEADER,
        "Accept-Encoding": "gzip, deflate", // Tell proxies what we accept
        "Vary": "Accept-Encoding", // Indicate that response varies based on Accept-Encoding
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
        "X-Netlify-Og": "edge-function" // Debugging header
      },
    });
  } catch (e: any) {
    console.error(`Error generating OG image: ${e.message}. Attempting to serve fallback.`);
    
    try {
      // Get the origin from the request URL to build the absolute fallback URL
      const { origin } = new URL(req.url);
      // Fetch the static fallback image from our own domain
      const fallbackResponse = await fetch(`${origin}${FALLBACK_IMAGE_URL}`);

      if (!fallbackResponse.ok) {
        // Log if fallback fetch fails
        console.error(`Failed to fetch fallback image: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
        // Return a simple error response with proper headers
        return new Response("Failed to generate image", { 
          status: 500,
          headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "no-cache"
          }
        });
      }

      // Get the fallback image data
      const imageBuffer = await fallbackResponse.arrayBuffer();
      
      // Return the fallback image with proper headers
      return new Response(imageBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Length": imageBuffer.byteLength.toString(),
          "Cache-Control": CACHE_CONTROL_HEADER,
          "Accept-Encoding": "gzip, deflate", // Tell proxies what we accept
          "Vary": "Accept-Encoding", // Indicate that response varies based on Accept-Encoding
          "Access-Control-Allow-Origin": "*",
          "X-Content-Type-Options": "nosniff",
          "X-Fallback-Image": "true" // Debugging header to indicate fallback was used
        },
      });
    } catch (fallbackError: any) {
      // Log if there's an error during the fallback fetch process
      console.error(`Error fetching fallback image: ${fallbackError.message}`);
      // Return a simple error response
      return new Response("Failed to generate image", { 
        status: 500,
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache"
        }
      });
    }
  }
} 