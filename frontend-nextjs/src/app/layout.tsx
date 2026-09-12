import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sweet Home 3D - Web CAD Studio & 3D Interactive Client Tour',
  description: 'Full-featured architectural CAD studio & 3D WebGL presentation platform powered by Next.js and Spring Boot.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
