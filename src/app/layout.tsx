import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { SubscriptionProvider } from "@/components/SubscriptionProvider";
import { KeepAlive } from "@/components/KeepAlive";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scholar Atlas — Your Academic Command Center",
  description: "All in one platform designed to help you balance your procrastination and progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${playfair.variable} h-full antialiased overflow-x-hidden`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var stored = localStorage.getItem('scholar-atlas-theme');
              if (!stored) {
                var match = document.cookie.match(/(?:^|; )scholar-atlas-theme=([^;]*)/);
                stored = match ? decodeURIComponent(match[1]) : null;
              }
              if (stored === 'dark') {
                document.documentElement.classList.add('dark');
              }
              document.documentElement.classList.add('no-transition');
              document.addEventListener('DOMContentLoaded', function() {
                document.documentElement.classList.remove('no-transition');
              });
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
          <defs>
            <linearGradient id="insta-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#833AB4" />
              <stop offset="50%" stopColor="#FD1D1D" />
              <stop offset="100%" stopColor="#F77737" />
            </linearGradient>
          </defs>
        </svg>
        <SubscriptionProvider>
          <KeepAlive />
          {children}
        </SubscriptionProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
