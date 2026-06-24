import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Anton } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const anton = Anton({
  variable: '--font-anton',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Urban Amenity Analyzer | Neighborhood Access Report',
  description:
    'Analyze neighborhood access to schools, healthcare, parks, transit, groceries, and pharmacies with OpenStreetMap data and a 15-minute city lens.',
  keywords: [
    'urban accessibility',
    '15-minute city',
    'walkability score',
    'neighborhood analysis',
    'OpenStreetMap',
    'urban planning',
    'amenity access',
  ],
  authors: [{ name: 'Urban Amenity Analyzer' }],
  openGraph: {
    title: 'Urban Amenity Analyzer',
    description:
      'Generate a neighborhood access report for essential urban amenities.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
