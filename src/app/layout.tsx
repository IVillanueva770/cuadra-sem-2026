import type {Metadata, Viewport} from 'next';
import {DM_Sans, DM_Mono} from 'next/font/google';
import './globals.css';
import SplashScreen from '@/components/cuadra/SplashScreen';
// DEMO ONLY — quitar para producción (ver nota en el archivo)
import DemoNav from '@/components/demo/DemoNav';

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Cuadra — Estacionamiento Medido Salta',
    template: '%s · Cuadra',
  },
  description: 'Cuadra. El estacionamiento medido de Salta, simple y digital.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cuadra',
  },
  formatDetection: {telephone: false},
  icons: {
    icon: [{url: '/icons/cuadra-icon-192.png', sizes: '192x192', type: 'image/png'}],
    apple: '/icons/cuadra-icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#145FB0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es-AR" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <SplashScreen />
        {children}
        {/* DEMO ONLY — navegador flotante para el pitch. Borrar esta línea + el archivo para producción. */}
        <DemoNav />
      </body>
    </html>
  );
}
