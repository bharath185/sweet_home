'use client';

import React, { useState } from 'react';
import { X, Users, Check, Shield } from 'lucide-react';
import { User, UserRole } from '../types/plan';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userData: Partial<User>, templateType?: string) => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onAddUser,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('CLIENT');
  const [planType, setPlanType] = useState('blank');
  const [customPlanName, setCustomPlanName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const projectTitle = customPlanName.trim() || `${name}'s Custom Design`;

    onAddUser(
      {
        name,
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        role,
        assignedPlan: projectTitle,
        isOnline: true,
      },
      planType
    );

    setName('');
    setEmail('');
    setCustomPlanName('');
    setPlanType('blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Onboard New Client / User</h3>
              <p className="text-[11px] text-slate-500">Creates a dedicated, isolated design project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name / Client Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g. alex.morgan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Workspace Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white cursor-pointer"
              >
                <option value="CLIENT" className="bg-white text-slate-900">Client</option>
                <option value="DESIGNER" className="bg-white text-slate-900">Designer</option>
                <option value="ADMIN" className="bg-white text-slate-900">Admin</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Design Initial Base</label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white cursor-pointer font-medium text-sky-700"
              >
                <option value="blank" className="bg-white text-slate-900">✨ Fresh Blank Canvas</option>
                <option value="plan-sarah-suite" className="bg-white text-slate-900">Modern 2-Bedroom Suite</option>
                <option value="plan-david-villa" className="bg-white text-slate-900">Luxury Multi-Story Villa</option>
                <option value="plan-emma-studio" className="bg-white text-slate-900">Urban Studio Loft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Project Name (Optional)</label>
            <input
              type="text"
              placeholder={name ? `${name}'s Custom Design` : 'e.g. Alex Morgan Penthouse Suite'}
              value={customPlanName}
              onChange={(e) => setCustomPlanName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-sky-500/20 border border-transparent transition flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Onboard & Launch Design</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
