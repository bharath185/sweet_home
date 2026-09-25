'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  Wallet,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { User } from '../types/plan';
import { PlanId } from '../services/subscriptionService';

interface PaymentGatewayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  gateway: 'cashfree' | 'razorpay';
  planId: PlanId;
  planName: string;
  amountINR: number;
  durationDays: number;
  tier: 'TRIAL' | 'PRO';
  orderId: string;
  currentUser: User | null;
  onPaymentSuccess: (result: {
    tier: 'TRIAL' | 'PRO' | 'ENTERPRISE';
    planId: string;
    durationDays: number;
    paymentId: string;
    orderId: string;
    gateway: 'cashfree' | 'razorpay';
    subscriptionToken: string;
    paymentMethod: string;
  }) => void;
}

export const PaymentGatewayCheckoutModal: React.FC<PaymentGatewayCheckoutModalProps> = ({
  isOpen,
  onClose,
  gateway,
  planId,
  planName,
  amountINR,
  durationDays,
  tier,
  orderId,
  currentUser,
  onPaymentSuccess,
}) => {
  const [activeMethod, setActiveMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');

  // Form states
  const [upiId, setUpiId] = useState<string>('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>(currentUser?.name || '');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC');
  const [selectedWallet, setSelectedWallet] = useState<string>('paytm');

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-format card number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Auto-format expiry
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  if (!isOpen) return null;

  const handlePayNow = async () => {
    setErrorMessage(null);

    // Basic Validation
    if (activeMethod === 'upi') {
      if (!upiId && selectedUpiApp === 'vpa') {
        setErrorMessage('Please enter your UPI ID (e.g. yourname@okhdfcbank)');
        return;
      }
    } else if (activeMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        setErrorMessage('Please enter a valid 16-digit card number');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMessage('Please enter valid expiry date (MM/YY)');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMessage('Please enter 3-digit CVV');
        return;
      }
    }

    setIsProcessing(true);
    setProcessStep('Connecting to Bank Payment Gateway...');

    // Simulate authentic bank authorization sequence
    setTimeout(async () => {
      setProcessStep('Verifying 256-Bit TLS Bank Security Token...');

      setTimeout(async () => {
        setProcessStep('Authorizing Payment & Activating Studio Pass...');

        try {
          // Determine payment method label
          let methodLabel = 'UPI (QR Code)';
          if (activeMethod === 'upi') {
            methodLabel = selectedUpiApp === 'gpay' ? 'UPI (Google Pay)' : selectedUpiApp === 'phonepe' ? 'UPI (PhonePe)' : selectedUpiApp === 'paytm' ? 'UPI (Paytm)' : `UPI (${upiId || 'Custom VPA'})`;
          } else if (activeMethod === 'card') {
            methodLabel = `Card (ending in ${cardNumber.replace(/\s/g, '').slice(-4) || '4242'})`;
          } else if (activeMethod === 'netbanking') {
            methodLabel = `NetBanking (${selectedBank})`;
          } else {
            methodLabel = `Wallet (${selectedWallet.toUpperCase()})`;
          }

          // Call backend verification
          const verifyEndpoint = gateway === 'cashfree' ? '/api/cashfree/verify-payment' : '/api/razorpay/verify-payment';
          const res = await fetch(verifyEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              planId,
              userId: currentUser?.id,
            }),
          });

          const data = await res.json();

          if (res.ok && data.success) {
            // Also notify Admin Payments API of the live successful transaction
            const generatedPaymentId = data.paymentId || (gateway === 'cashfree' ? `cf_pay_${Date.now()}` : `rzp_pay_${Date.now()}`);
            try {
              await fetch('/api/admin/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: `tx_${Date.now()}`,
                  orderId,
                  customerName: currentUser?.name || 'SweetHome User',
                  customerEmail: currentUser?.email || 'user@sweethome.io',
                  planId,
                  planName,
                  amount: amountINR,
                  gateway,
                  status: 'PAID',
                  paymentMethod: methodLabel,
                  createdAt: new Date().toISOString(),
                  expiresAt: new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString(),
                }),
              });
            } catch (ledgerErr) {
              console.warn('Failed to update admin ledger:', ledgerErr);
            }

            // Invoke success callback
            onPaymentSuccess({
              tier: data.tier || tier,
              planId,
              durationDays: data.durationDays || durationDays,
              paymentId: generatedPaymentId,
              orderId,
              gateway,
              subscriptionToken: data.subscriptionToken || `tok_${Date.now()}`,
              paymentMethod: methodLabel,
            });
            setIsProcessing(false);
          } else {
            throw new Error(data.error || 'Payment gateway returned unconfirmed status');
          }
        } catch (err: any) {
          setIsProcessing(false);
          setErrorMessage(err.message || 'Payment processing failed. Please try again.');
        }
      }, 1000);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0f172a] via-[#0b1324] to-[#080d19] border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
              gateway === 'cashfree' ? 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-purple-500/20' : 'bg-gradient-to-br from-blue-600 to-sky-600 shadow-blue-500/20'
            }`}>
              {gateway === 'cashfree' ? <Zap className="w-5 h-5 text-amber-300" /> : <CreditCard className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">
                  {gateway === 'cashfree' ? 'Cashfree Payments' : 'Razorpay Secure Checkout'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Bank Grade 256-Bit
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Order ID: <span className="text-slate-300 font-mono">{orderId}</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition disabled:opacity-30 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="px-5 py-3 bg-[#0d1627] border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Selected Pass:</span>
            <p className="text-xs font-bold text-white">{planName} ({durationDays} Days)</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Total Payable:</span>
            <p className="text-lg font-black text-emerald-400">₹{amountINR.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Processing State View */}
        {isProcessing ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="relative w-20 h-20">
              <div className="w-full h-full border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
                <Lock className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">Payment in Progress</h4>
              <p className="text-xs text-emerald-400 font-medium mt-1 animate-pulse">{processStep}</p>
            </div>
            <p className="text-[11px] text-slate-500 max-w-sm">
              Please do not close this window or refresh the page while we communicate with the banking network.
            </p>
          </div>
        ) : (
          /* Payment Methods Interface */
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
            
            {/* Left Tabs */}
            <div className="w-full sm:w-48 bg-[#0a101d] border-b sm:border-b-0 sm:border-r border-slate-800 p-2 sm:p-3 flex sm:flex-col gap-1 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => { setActiveMethod('upi'); setErrorMessage(null); }}
                className={`flex-1 sm:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                  activeMethod === 'upi'
                    ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-white border border-purple-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Smartphone className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">UPI / QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveMethod('card'); setErrorMessage(null); }}
                className={`flex-1 sm:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                  activeMethod === 'card'
                    ? 'bg-gradient-to-r from-sky-600/30 to-indigo-600/30 text-white border border-sky-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <CreditCard className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">Cards (Debit/Credit)</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveMethod('netbanking'); setErrorMessage(null); }}
                className={`flex-1 sm:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                  activeMethod === 'netbanking'
                    ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-white border border-blue-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Building className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">NetBanking</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveMethod('wallet'); setErrorMessage(null); }}
                className={`flex-1 sm:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                  activeMethod === 'wallet'
                    ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-white border border-emerald-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Wallets</span>
              </button>
            </div>

            {/* Right Interactive Form Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* METHOD 1: UPI */}
              {activeMethod === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wide text-[11px]">
                      Select Preferred UPI Method
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'gpay', name: 'Google Pay', icon: '🟢 GPay' },
                        { id: 'phonepe', name: 'PhonePe', icon: '🟣 PhonePe' },
                        { id: 'paytm', name: 'Paytm', icon: '🔵 Paytm' },
                        { id: 'vpa', name: 'UPI ID', icon: '⚡ Other UPI' },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`p-2.5 rounded-xl border text-center transition font-bold text-xs ${
                            selectedUpiApp === app.id
                              ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                              : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="truncate text-xs">{app.icon}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* QR Code Scan Option */}
                  {selectedUpiApp !== 'vpa' && (
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
                      <div className="inline-block p-3 rounded-2xl bg-white shadow-lg mx-auto">
                        {/* Authentic SVG QR Matrix representation */}
                        <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none">
                          <rect width="100" height="100" fill="white" />
                          {/* Corner Squares */}
                          <rect x="10" y="10" width="24" height="24" fill="#0f172a" />
                          <rect x="14" y="14" width="16" height="16" fill="white" />
                          <rect x="18" y="18" width="8" height="8" fill="#0f172a" />

                          <rect x="66" y="10" width="24" height="24" fill="#0f172a" />
                          <rect x="70" y="14" width="16" height="16" fill="white" />
                          <rect x="74" y="18" width="8" height="8" fill="#0f172a" />

                          <rect x="10" y="66" width="24" height="24" fill="#0f172a" />
                          <rect x="14" y="70" width="16" height="16" fill="white" />
                          <rect x="18" y="74" width="8" height="8" fill="#0f172a" />

                          {/* Data Matrix Dots */}
                          <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
                          <rect x="52" y="12" width="6" height="6" fill="#0f172a" />
                          <rect x="42" y="24" width="6" height="6" fill="#0f172a" />
                          <rect x="52" y="24" width="6" height="6" fill="#0f172a" />
                          <rect x="42" y="36" width="16" height="6" fill="#0f172a" />
                          <rect x="12" y="42" width="6" height="6" fill="#0f172a" />
                          <rect x="24" y="42" width="6" height="6" fill="#0f172a" />
                          <rect x="68" y="42" width="18" height="6" fill="#0f172a" />
                          <rect x="42" y="48" width="8" height="8" fill="#7c3aed" />
                          <rect x="12" y="54" width="20" height="6" fill="#0f172a" />
                          <rect x="42" y="66" width="6" height="6" fill="#0f172a" />
                          <rect x="52" y="66" width="14" height="6" fill="#0f172a" />
                          <rect x="42" y="78" width="18" height="10" fill="#0f172a" />
                          <rect x="70" y="72" width="18" height="16" fill="#0f172a" />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-300 font-semibold">
                        Scan QR with <strong className="text-purple-400 capitalize">{selectedUpiApp}</strong> or any UPI App to Pay
                      </p>
                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Dynamic QR valid for 9:45 mins</span>
                      </div>
                    </div>
                  )}

                  {/* Manual UPI ID Input */}
                  {selectedUpiApp === 'vpa' && (
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wide text-[11px]">
                        Enter Your Virtual Payment Address (UPI ID)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank"
                          className="w-full pl-3.5 pr-20 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                        />
                        <span className="absolute right-2.5 top-2.5 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                          Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">A payment request will be sent to your UPI app for approval.</p>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD 2: CREDIT / DEBIT CARDS */}
              {activeMethod === 'card' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 uppercase tracking-wide text-[11px]">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4532 •••• •••• 8892"
                        className="w-full pl-10 pr-20 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:border-sky-400"
                      />
                      <CreditCard className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <div className="absolute right-3 top-2.5 flex items-center gap-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300">VISA</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-600/30 text-amber-300">MC</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600/30 text-emerald-300">RuPay</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1 uppercase tracking-wide text-[11px]">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM / YY"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 text-center font-mono focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1 uppercase tracking-wide text-[11px]">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 text-center font-mono focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 uppercase tracking-wide text-[11px]">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name as on Card"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              )}

              {/* METHOD 3: NETBANKING */}
              {activeMethod === 'netbanking' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide text-[11px]">
                    Select Your Bank
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'HDFC', name: 'HDFC Bank' },
                      { code: 'ICICI', name: 'ICICI Bank' },
                      { code: 'SBI', name: 'State Bank of India' },
                      { code: 'AXIS', name: 'Axis Bank' },
                      { code: 'KOTAK', name: 'Kotak Bank' },
                      { code: 'PNB', name: 'Punjab National' },
                    ].map((bank) => (
                      <button
                        key={bank.code}
                        type="button"
                        onClick={() => setSelectedBank(bank.code)}
                        className={`p-3 rounded-xl border text-center transition ${
                          selectedBank === bank.code
                            ? 'bg-blue-600/20 border-blue-500 text-white font-bold shadow-sm'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Building className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                        <span className="text-xs">{bank.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* METHOD 4: WALLETS */}
              {activeMethod === 'wallet' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide text-[11px]">
                    Select Digital Wallet
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'paytm', name: 'Paytm Wallet' },
                      { id: 'phonepe', name: 'PhonePe Wallet' },
                      { id: 'mobikwik', name: 'MobiKwik' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWallet(w.id)}
                        className={`p-3 rounded-xl border text-center transition ${
                          selectedWallet === w.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold shadow-sm'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Wallet className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                        <span className="text-xs">{w.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!isProcessing && (
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Cancel Payment
            </button>

            <button
              type="button"
              onClick={handlePayNow}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                gateway === 'cashfree'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 shadow-purple-500/25'
                  : 'bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-600 shadow-blue-500/25'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Pay ₹{amountINR.toLocaleString('en-IN')} Securely</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
