import type { Metadata } from 'next';
import './globals.css';
import { COMPANY_INFO } from '@/lib/constants';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthContext';

export const metadata: Metadata = {
  title: 'Circuit Serve Technologies | Concept to Hardware & Silicon Solutions',
  description:
    'Circuit Serve Technologies (CST) provides end-to-end electronics product development solutions: high-speed PCB design, embedded systems, IoT devices, hardware prototyping, testing & validation, manufacturing support, and ASIC semiconductor design in Surampalem, Andhra Pradesh.',
  keywords: [
    'Circuit Serve Technologies',
    'CST Surampalem',
    'Electronics Engineering Andhra Pradesh',
    'High Speed PCB Design',
    'Embedded Systems RTOS',
    'IoT Product Development',
    'Hardware Prototyping India',
    'Semiconductor ASIC Design',
    'Concept to Silicon'
  ],
  authors: [{ name: 'Circuit Serve Technologies' }],
  openGraph: {
    title: 'Circuit Serve Technologies | Engineering the Future of Hardware',
    description: 'From Concept to Silicon — Electronics Engineering & Hardware Solutions.',
    url: 'https://circuitserve.com',
    siteName: 'Circuit Serve Technologies',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-cyan-500 selection:text-white dark:selection:text-navy-950 transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
