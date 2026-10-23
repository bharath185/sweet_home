import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Clock, MapPin } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Support | DecoForge 3D Studio',
  description: 'Get in touch with the DecoForge 3D customer support, technical assistance, and architectural sales team.',
};

export default function ContactPage() {
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
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 text-[11px] font-mono text-sky-400 mb-3 border border-slate-700/60">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>HELP &amp; CUSTOMER CARE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Contact Our Team</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Have questions about 2D/3D architectural drafting, subscription passes, or enterprise multi-floor licensing? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Support Email */}
          <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">General &amp; Technical Support</h3>
              <p className="text-xs text-slate-400 mt-1.5">For app assistance, blueprint exports, and technical inquiries.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <a
                href="mailto:support@visualrendered.io"
                className="text-xs font-mono font-semibold text-sky-400 hover:underline"
              >
                support@visualrendered.io
              </a>
            </div>
          </div>

          {/* Card 2: Billing & Pass Inquiries */}
          <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Billing &amp; Invoices</h3>
              <p className="text-xs text-slate-400 mt-1.5">For corporate GST invoices, refunds, or payment receipt questions.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <a
                href="mailto:billing@visualrendered.io"
                className="text-xs font-mono font-semibold text-indigo-400 hover:underline"
              >
                billing@visualrendered.io
              </a>
            </div>
          </div>

          {/* Card 3: Business & Custom Architecture */}
          <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Enterprise &amp; Builders</h3>
              <p className="text-xs text-slate-400 mt-1.5">For real estate developers, custom 3D catalogs, and API access.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <span className="text-xs text-slate-300 font-medium">Monday &ndash; Friday (9:00 AM &ndash; 6:00 PM IST)</span>
            </div>
          </div>
        </div>

        {/* Support Note */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 text-center">
          <p>
            Typical email response time is under <strong>4 hours</strong> on business days.
          </p>
          <p className="mt-1 text-slate-500 text-[11px]">
            [REPLACE WITH FINAL TEXT: Insert physical business address and registered entity details here]
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <span>&copy; {new Date().getFullYear()} DecoForge 3D. All rights reserved.</span>
      </footer>
    </div>
  );
}
