'use client';

import React, { useState } from 'react';
import {
  X,
  Building,
  User,
  Sparkles,
  Plus,
  ArrowRight,
  Home,
  Layers,
  Check,
  UserPlus,
  Search,
  Eye,
  Edit3
} from 'lucide-react';
import { User as UserType, FloorTemplate, HomePlan } from '../types/plan';
import { ALL_CLIENT_PLANS } from '../services/api';

interface ClientProjectSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  templates: FloorTemplate[];
  currentPlanId: string;
  onSelectExistingPlan: (planId: string) => void;
  onStartNewDesignForClient: (client: UserType, templateId?: string) => void;
  onOpenAddClientModal: () => void;
}

export const ClientProjectSelectModal: React.FC<ClientProjectSelectModalProps> = ({
  isOpen,
  onClose,
  users,
  templates,
  currentPlanId,
  onSelectExistingPlan,
  onStartNewDesignForClient,
  onOpenAddClientModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter clients and users who have architectural projects
  const clientUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/30">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white">
                Which Client Project Are You Working On?
              </h2>
              <p className="text-xs text-sky-200/80">
                Select an existing client design to modify, or start a new architectural blueprint for that client.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Onboard Bar */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search client by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
            />
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenAddClientModal();
            }}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Onboard New Client</span>
          </button>
        </div>

        {/* Client Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {clientUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No clients found matching "{searchTerm}".
            </div>
          ) : (
            clientUsers.map((client) => {
              const assignedPlanId = client.assignedPlan || `plan_${client.id}`;
              const existingPlan: HomePlan | undefined = ALL_CLIENT_PLANS[assignedPlanId];
              const isSelected = selectedClientId === client.id;
              const isCurrentActive = currentPlanId === assignedPlanId;

              return (
                <div
                  key={client.id}
                  className={`border rounded-2xl p-4 transition-all bg-white shadow-2xs ${
                    isCurrentActive
                      ? 'border-sky-500 ring-2 ring-sky-100 bg-sky-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Client Header Info */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">{client.name}</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                              client.role === 'ADMIN'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : client.role === 'DESIGNER'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {client.role}
                          </span>
                          {isCurrentActive && (
                            <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-sky-600 text-white shadow-2xs">
                              Active in Studio
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{client.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          client.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400 font-medium">
                        {client.isOnline ? 'Online Now' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Existing Plan / Designs Options */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {/* Option 1: Existing Design Card */}
                    <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Existing Plan
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-100">
                            {existingPlan?.floors?.length || 2} Floors
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {existingPlan?.name || `${client.name}'s Custom Suite`}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {existingPlan?.rooms?.length || 3} Rooms • {existingPlan?.furniture?.length || 8} Furniture Pieces
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onSelectExistingPlan(assignedPlanId);
                            onClose();
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Open & Modify</span>
                        </button>
                      </div>
                    </div>

                    {/* Option 2: Start Fresh / Template for this Client */}
                    <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                            + Start New Design
                          </span>
                          <span className="text-[9px] font-semibold text-indigo-500">Pick Template</span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-tight">
                          Initialize a fresh architectural layout or luxury duplex for {client.name}.
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        <button
                          onClick={() => {
                            onStartNewDesignForClient(client, 'duplex_2floor');
                            onClose();
                          }}
                          className="flex-1 py-1 px-2 rounded-lg bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 text-[10px] font-bold transition shadow-2xs"
                          title="Start 2-Floor Luxury Duplex"
                        >
                          🏗️ 2-Floor Duplex
                        </button>
                        <button
                          onClick={() => {
                            onStartNewDesignForClient(client, 'studio_apt');
                            onClose();
                          }}
                          className="flex-1 py-1 px-2 rounded-lg bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 text-[10px] font-bold transition shadow-2xs"
                          title="Start Studio Loft"
                        >
                          🏢 Studio Loft
                        </button>
                        <button
                          onClick={() => {
                            onStartNewDesignForClient(client, undefined);
                            onClose();
                          }}
                          className="py-1 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold transition"
                          title="Start Blank Blueprint"
                        >
                          📐 Blank
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>All modifications auto-sync to Spring Boot server & local storage.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
