import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://3dstudio.prigenix.com'),
  title: 'DecoForge 3D — Professional 2D Floor Plans & Real-Time 3D Studio',
  description:
    'Design precision 2D CAD floor plans, customize parametric furniture, and walk through architectural spaces in real-time 3D WebGL.',
  keywords: [
    '3D interior design',
    'floor plan maker',
    'web CAD',
    'architectural visualization',
    'Sweet Home 3D online',
    '3D walking tour',
  ],
  authors: [{ name: 'DecoForge 3D Architecture' }],
  openGraph: {
    title: 'DecoForge 3D — Professional 2D Floor Plans & Real-Time 3D Studio',
    description:
      'Design precision 2D CAD floor plans, customize parametric furniture, and walk through architectural spaces in real-time 3D WebGL.',
    url: 'https://3dstudio.prigenix.com',
    siteName: 'DecoForge 3D Studio',
    images: [
      {
        url: '/templates/villa.jpg',
        width: 1200,
        height: 630,
        alt: 'DecoForge 3D Architectural Visualization Studio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DecoForge 3D — Professional 2D Floor Plans & Real-Time 3D Studio',
    description:
      'Design precision 2D CAD floor plans, customize parametric furniture, and walk through architectural spaces in real-time 3D WebGL.',
    images: ['/templates/villa.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-900 text-slate-100 min-h-screen">
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </body>
    </html>
  );
}

