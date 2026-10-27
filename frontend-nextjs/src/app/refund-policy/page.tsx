import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | DecoForge 3D Studio',
  description: 'Refund, cancellation, and billing policies for DecoForge 3D subscription passes.',
};

export default function RefundPolicyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 text-[11px] font-mono text-amber-400 mb-3 border border-slate-700/60">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>BILLING & REFUNDS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Last Updated: October 2026 &bull; Effective Date: October 2026
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">1. 24-Hour Free Trial</h2>
            <p>
              We provide an unrestricted 24-Hour Free Trial on all new accounts so users can evaluate the 2D CAD drafting, 3D WebGL rendering, and furniture customization tools with zero upfront payment and no credit card required.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">2. Subscription Cancellation</h2>
            <p>
              You may cancel your monthly or annual subscription pass at any time directly through your account settings or by emailing our billing support team. Upon cancellation, your subscription will remain active until the conclusion of your current paid billing period, and no further renewal charges will be applied.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">3. Refund Eligibility</h2>
            <p>
              Because our digital architectural tools are delivered immediately upon subscription activation, refund requests are assessed under the following conditions:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-300">
              <li>
                <strong>Duplicate Charges / Technical Errors:</strong> If you were accidentally charged more than once for the same subscription period due to a payment gateway glitch, you are eligible for a 100% immediate refund.
              </li>
              <li>
                <strong>Service Inaccessibility:</strong> If verifiable technical errors on our platform prevent you from using the studio for more than 48 consecutive hours during your paid billing cycle, a pro-rated refund will be granted.
              </li>
              <li>
                <strong>Change of Mind:</strong> Refund requests made within 7 days of an initial annual plan purchase are eligible for consideration, minus payment gateway transaction processing fees.
              </li>
            </ul>
            <p className="mt-2 text-slate-400 italic">
              [REPLACE WITH FINAL TEXT: Insert standard refund timelines (e.g., 5-7 business days back to original payment method via Cashfree/Razorpay).]
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">4. How to Request a Refund</h2>
            <p>
              To initiate a refund request, please email our support team with your registered email, transaction/order ID, and reason for the request:
            </p>
            <p className="mt-2 font-mono text-sky-400">
              billing@visualrendered.io &bull; support@visualrendered.io
            </p>
            <p className="mt-2 text-slate-400 text-xs">
              Approved refunds are processed back to the original payment source (UPI, NetBanking, Debit/Credit Card) within 5–7 business days in accordance with banking guidelines.
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
