'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  QrCode,
  Globe,
  Sparkles,
  Code
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HomePlan } from '../types/plan';
import { encodePlanToShareUrl } from '../services/api';

interface ShareModalProps {
  plan: HomePlan;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  plan,
  isOpen,
  onClose,
}) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'link' | 'embed'>('link');

  useEffect(() => {
    if (isOpen) {
      const url = encodePlanToShareUrl(plan);
      setShareUrl(url);
      setCopied(false);
    }
  }, [isOpen, plan]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setTimeout(() => setCopied(false), 3000);
  };

  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0" allow="fullscreen"></iframe>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Share 3D Client Presentation</h3>
              <p className="text-xs text-slate-500">
                1-Click Instant Sharable Link for Customers & Clients
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'link'
                ? 'border-sky-600 text-sky-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Interactive URL Link</span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'embed'
                ? 'border-sky-600 text-sky-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Website Embed Snippet</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {activeTab === 'link' ? (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Client Shareable WebGL URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono select-all focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Feature points */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>No login or app installation required for customer</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Customers can open this link on any mobile phone, iPad, laptop, or browser to interact with full 3D PBR WebGL lighting, inspect room dimensions, and explore their dream home.
                </p>
              </div>

              {/* Open in new tab button */}
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>Preview Client View in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Responsive HTML Embed Code
                </label>
                <textarea
                  readOnly
                  rows={4}
                  value={embedCode}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500 shadow-2xs select-all resize-none"
                />
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(embedCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Embed Code Copied!' : 'Copy Embed Code'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
