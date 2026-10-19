import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';

export const metadata: Metadata = {
  title: 'DecoFrog 3D — Web CAD Studio & 3D Interactive Client Tour',
  description: 'Full-featured architectural CAD studio & 3D WebGL presentation platform with real-time synchronization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen overflow-hidden">
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </body>
    </html>
  );
}

