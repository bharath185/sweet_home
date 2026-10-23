import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | DecoForge 3D Studio',
  description: 'Privacy Policy and Data Protection Practices for DecoForge 3D Architecture and Interior Design Platform.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans selection:bg-sky-500 selection:text-white">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-[#070b14]/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <span className="text-xs font-bold text-slate-400">DecoForge 3D Studio</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8 pb-6 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 text-[11px] font-mono text-emerald-400 mb-3 border border-slate-700/60">
            <Lock className="w-3.5 h-3.5" />
            <span>DATA PROTECTION & PRIVACY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400 mt-2">
            Last Updated: October 2026 &bull; Effective Date: October 2026
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">1. Overview</h2>
            <p>
              DecoForge 3D (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy and personal data. This Privacy Policy outlines what information we collect, how it is used, and your rights regarding your personal information when using our web studio.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <strong>Account Information:</strong> Full name, email address, mobile phone number, and password credentials provided during registration.
              </li>
              <li>
                <strong>Architectural Project Data:</strong> 2D floor plans, wall coordinates, room dimensions, furniture selections, and custom 3D scene parameters created within the studio.
              </li>
              <li>
                <strong>Billing & Payment Information:</strong> Transaction identifiers, payment timestamps, and subscription statuses processed securely through authorized payment gateways (Cashfree / Razorpay). We do not store raw credit card numbers or UPI PINs on our servers.
              </li>
              <li>
                <strong>Technical Diagnostics:</strong> Browser user agent, WebGL graphics rendering profile, screen resolution, and session error logs to optimize 3D performance.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">3. How We Use Your Information</h2>
            <p>
              We use collected information solely to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
              <li>Provide, maintain, and render your 2D blueprints and 3D architectural models.</li>
              <li>Synchronize your projects across your authorized devices.</li>
              <li>Process subscription passes and provide invoice confirmations.</li>
              <li>Send critical service notifications (e.g., account recovery, scheduled maintenance).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">4. Third-Party Service Providers</h2>
            <p>
              We collaborate with trusted third-party providers to deliver essential cloud services:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
              <li><strong>Hosting & Edge Delivery:</strong> Vercel Inc.</li>
              <li><strong>Cloud Database:</strong> Supabase PostgreSQL.</li>
              <li><strong>Payment Processing:</strong> Cashfree Payments India Pvt. Ltd. and Razorpay Software Pvt. Ltd.</li>
            </ul>
            <p className="mt-2 text-slate-400 italic">
              [REPLACE WITH FINAL TEXT: Detail any analytics providers such as Google Analytics, PostHog, or Sentry if applicable.]
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">5. Data Retention & Deletion</h2>
            <p>
              Your design blueprints and account records are retained as long as your account remains active. You may request permanent deletion of your account and associated design files at any time by contacting our support team.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">6. Contact & Data Protection Officer</h2>
            <p>
              If you have questions regarding this Privacy Policy or wish to exercise your data protection rights, please contact us at:
            </p>
            <p className="mt-1 font-mono text-sky-400">
              privacy@visualrendered.io &bull; support@visualrendered.io
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <span>&copy; {new Date().getFullYear()} DecoForge 3D. All rights reserved.</span>
      </footer>
    </div>
  );
}
