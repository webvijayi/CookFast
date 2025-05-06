import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeContext";
import MainLayout from "@/components/layout/MainLayout";
import Script from "next/script";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e.detail;
      (window as any).umami?.trackEvent('docsGenerated', detail);
    };
    document.addEventListener('cookfast:generationSuccess', handler);
    return () => document.removeEventListener('cookfast:generationSuccess', handler);
  }, []);
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js'}
        data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || 'e6fa2f91-241c-4566-9e26-4365d5c435bc'}
      />
      {/* Umami analytics */}
      <ThemeProvider>
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </ThemeProvider>
    </>
  );
}
