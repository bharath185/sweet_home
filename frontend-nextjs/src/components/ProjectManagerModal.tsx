'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  FolderOpen,
  Download,
  Upload,
  Trash2,
  Check,
  Building,
  Layers,
  Sparkles,
  Calendar,
  Box,
  ArrowRight,
  FileCode2,
  Search,
} from 'lucide-react';
import { HomePlan, User } from '../types/plan';
import {
  UserProjectSummary,
  StarterTemplateOption,
  STARTER_TEMPLATES,
  createNewProjectFromTemplate,
  exportPlanAsJson,
  parseAndValidateProjectJson,
} from '../services/projectService';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  currentPlan: HomePlan;
  userProjects: UserProjectSummary[];
  onOpenProject: (plan: HomePlan) => void;
  onSaveNewProject: (plan: HomePlan) => void;
  onDeleteProject: (projectId: string) => void;
  theme?: 'dark' | 'light';
  defaultTab?: 'projects' | 'new' | 'import';
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentPlan,
  userProjects,
  onOpenProject,
  onSaveNewProject,
  onDeleteProject,
  theme = 'light',
  defaultTab = 'projects',
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'new' | 'import'>(defaultTab);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(STARTER_TEMPLATES[0].id);
  const [projectNameInput, setProjectNameInput] = useState<string>('');
  const [projectSearch, setProjectSearch] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const selectedTemplate = STARTER_TEMPLATES.find((t) => t.id === selectedTemplateId) || STARTER_TEMPLATES[0];

  const handleCreateFromTemplate = () => {
    if (!currentUser) return;
    const newPlan = createNewProjectFromTemplate(
      currentUser.id,
      selectedTemplate,
      projectNameInput.trim() || undefined
    );
    onSaveNewProject(newPlan);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const validatedPlan = parseAndValidateProjectJson(text);
        if (currentUser) {
          validatedPlan.id = `plan_${currentUser.id}_${Date.now()}`;
        }
        onSaveNewProject(validatedPlan);
        setImportSuccessMsg(`Successfully imported "${validatedPlan.name}"! Loading into Studio...`);
        setTimeout(() => {
          onClose();
        }, 1000);
      } catch (err: any) {
        setImportError(err.message || 'Failed to read project JSON. Ensure it is a valid .sweethome.json file.');
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read the selected file.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredProjects = userProjects.filter((p) =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#0f172a] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Top Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark
              ? 'bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-slate-800'
              : 'bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/80 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">DecoForge Project Center</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {currentUser?.name ? `Signed in as ${currentUser.name}` : 'Saved Architectural Projects'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Export Current Button */}
            <button
              onClick={() => exportPlanAsJson(currentPlan, currentUser)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-sky-500/30'
                  : 'bg-white hover:bg-slate-50 text-sky-700 border-sky-300 shadow-2xs'
              }`}
              title="Download current project as .sweethome.json file"
            >
              <Download className="w-3.5 h-3.5 text-sky-500" />
              <span>Download Active (.json)</span>
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`px-6 py-2.5 border-b flex items-center gap-2 shrink-0 ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/80'}`}>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>My Saved Projects ({userProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('new')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'new'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Project (Starter Houses)</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'import'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Project (.json)</span>
          </button>
        </div>

        {/* Body Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* TAB 1: MY SAVED PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search projects..."
                    className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('new')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Project</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import File</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.sweethome"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                <div className={`p-10 rounded-2xl border text-center space-y-3 ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">No saved projects found</h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Choose one of our pre-defined starter houses to begin your 3D design journey!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Choose Starter House</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredProjects.map((proj) => {
                    const isCurrent = proj.id === currentPlan.id;
                    return (
                      <div
                        key={proj.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isCurrent
                            ? isDark
                              ? 'bg-indigo-950/30 border-indigo-500/50 ring-1 ring-indigo-500/30'
                              : 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300'
                            : isDark
                            ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold truncate max-w-[220px]">{proj.name}</h4>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(proj.updatedAt).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span>{proj.floorsCount} Floor{proj.floorsCount > 1 ? 's' : ''}</span>
                              <span>•</span>
                              <span>{proj.roomsCount} Rooms</span>
                              <span>•</span>
                              <span>{proj.furnitureCount} Items</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => exportPlanAsJson(proj.plan, currentUser)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                isDark
                                  ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
                                  : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                              }`}
                              title="Download project as .sweethome.json"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${proj.name}"?`)) {
                                  onDeleteProject(proj.id);
                                }
                              }}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                isDark
                                  ? 'border-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400'
                                  : 'border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600'
                              }`}
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-inherit flex items-center justify-between">
                          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            ID: {proj.id.slice(-8)}
                          </span>

                          <button
                            onClick={() => {
                              onOpenProject(proj.plan);
                              onClose();
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              isCurrent
                                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                            }`}
                          >
                            <span>{isCurrent ? 'Continue Designing' : 'Open Project'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE NEW PROJECT (STARTER PRE-DEFINED HOUSES) */}
          {activeTab === 'new' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold">Select a Pre-defined Starter House or Blank Canvas</h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Kickstart your design instantly with realistic furnished floor plans or start from scratch.
                </p>
              </div>

              {/* Starter Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STARTER_TEMPLATES.map((tpl) => {
                  const isSelected = tpl.id === selectedTemplateId;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? isDark
                            ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg'
                            : 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/30 shadow-md'
                          : isDark
                          ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{tpl.icon}</span>
                            <div>
                              <h4 className="text-sm font-bold">{tpl.name}</h4>
                              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {tpl.subtitle}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : isDark
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {tpl.badge}
                          </span>
                        </div>

                        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {tpl.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-inherit flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Layers className="w-3.5 h-3.5" />
                            {tpl.floors} Floor{tpl.floors > 1 ? 's' : ''}
                          </span>
                          <span className="text-slate-400">Area: {tpl.area}</span>
                        </div>

                        <div className="flex items-center gap-1 text-indigo-500 font-bold">
                          {isSelected ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-4 h-4" /> Selected
                            </span>
                          ) : (
                            <span>Select</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Name Project Input & Action */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex-1 w-full space-y-1">
                  <label className="text-xs font-bold block">Project Name (Optional)</label>
                  <input
                    type="text"
                    value={projectNameInput}
                    onChange={(e) => setProjectNameInput(e.target.value)}
                    placeholder={`e.g. ${selectedTemplate.name}`}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-4">
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreateFromTemplate}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Create & Launch Studio</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMPORT PROJECT (.JSON / .SWEETHOME) */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold">Import Existing Architectural Project File</h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Upload your saved <code className="font-mono text-indigo-400">.sweethome.json</code> or standard project JSON file to continue designing seamlessly from where you left off.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-10 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDark
                    ? 'border-slate-700 hover:border-indigo-500 bg-slate-900/40 hover:bg-indigo-950/20'
                    : 'border-slate-300 hover:border-indigo-600 bg-slate-50/60 hover:bg-indigo-50/50'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                  <FileCode2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold">Click to Browse or Drop Project JSON Here</h4>
                <p className={`text-xs mt-1 max-w-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Supports all DecoForge exported projects, floor levels, walls, doors, windows, and custom furniture.
                </p>

                <div className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs inline-flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select .sweethome.json File</span>
                </div>
              </div>

              {/* Status alerts */}
              {importError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{importError}</span>
                </div>
              )}

              {importSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
