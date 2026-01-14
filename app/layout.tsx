"use client"

import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { RouteGuard } from '@/components/features/auth/RouteGuard';
import Script from 'next/script';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { GoogleAnalytics } from '@next/third-parties/google'
import { VideoGenerationService } from '@/components/features/video/VideoGenerationService';

const inter = Inter({ subsets: ['latin'] });

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_12345');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="build-version" content="13176820244523" />
        <Script src="/js/jquery.js?ver=1.0.0" strategy="beforeInteractive" />
        {/* <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-PwKSDbHqmd1Rx5IcC9mJYgHSrN0g5JRkQe6v2sxWUP1bK7oYz1G/2R4pBlbQ6g3U"
          crossOrigin="anonymous"
        /> */}
        {/* Google Analytics + Google Ads */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-LFYE2GVHQG" 
          strategy="afterInteractive" 
        />
        
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Google Analytics
            gtag('config', 'G-LFYE2GVHQG');

            // Google Ads
            gtag('config', 'AW-17542282404');
          `}
        </Script>


        {/* Microsoft Clarity */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
        >
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "tqwgrmy23z");
          `}
        </Script>

      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RouteGuard>
            <AuthProvider>
                <ConnectionStatus />
                <Elements stripe={stripePromise}>
                  {children}
                  <VideoGenerationService />
                </Elements>
              <Toaster position="bottom-right" visibleToasts={3}/>
            </AuthProvider>
          </RouteGuard>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-4MEVHC95MQ" />
    </html>
  );
}
