import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | DecoForge 3D Studio',
  description: 'Terms of Service and User Agreement for DecoForge 3D Architecture and Interior Design Platform.',
};

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 text-[11px] font-mono text-sky-400 mb-3 border border-slate-700/60">
            <Shield className="w-3.5 h-3.5" />
            <span>LEGAL & COMPLIANCE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-400 mt-2">
            Last Updated: October 2026 &bull; Effective Date: October 2026
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the DecoForge 3D software platform, web application, and related services (collectively, the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
            <p className="mt-2 text-slate-400 italic">
              [REPLACE WITH FINAL TEXT: Insert company legal entity name, jurisdiction, and official registration details here.]
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">2. Description of Service</h2>
            <p>
              DecoForge 3D provides browser-based 2D architectural drafting, 3D WebGL computer-aided design (CAD), virtual walking simulation, furniture layout configuration, and preliminary cost estimation tools for interior designers, architects, contractors, and homeowners.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">3. Free Trial & Subscription Plans</h2>
            <p>
              Eligible new users receive an unrestricted 48-Hour Free Trial upon registration. Following the expiration of the trial period, access to advanced features (such as unlimited active projects, custom item creation, and continuous cloud synchronization) requires an active subscription pass (Monthly or Annual).
            </p>
            <p className="mt-2 text-slate-400 italic">
              [REPLACE WITH FINAL TEXT: Detail exact billing cycles, pricing tiers in INR, and auto-renewal policies.]
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">4. Intellectual Property & User Designs</h2>
            <p>
              You retain all ownership, copyright, and intellectual property rights to the architectural blueprints, 2D floor plans, and 3D interior design layouts created by you using the Service. DecoForge 3D retains all rights, title, and interest in and to the platform, CAD engine, procedural algorithms, and user interface.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">5. Architectural Disclaimer</h2>
            <p>
              The Service is designed as an interactive visualization and conceptual planning aid. Generated 2D dimensions, structural representations, and automated cost calculations are estimates only and must not be used as certified engineering or structural construction blueprints without independent verification by a licensed structural engineer or architect.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, DecoForge 3D and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
            </p>
            <p className="mt-2 text-slate-400 italic">
              [REPLACE WITH FINAL TEXT: Insert liability limits, statutory caps, and governing law according to local jurisdiction.]
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">7. Contact Information</h2>
            <p>
              For legal inquiries or notices regarding these Terms, please contact our support team at:
            </p>
            <p className="mt-1 font-mono text-sky-400">
              support@visualrendered.io &bull; [REPLACE WITH FINAL TEXT: Insert official registered business address]
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
