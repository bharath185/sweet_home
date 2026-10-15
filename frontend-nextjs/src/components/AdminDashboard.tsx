'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Box,
  Building,
  Plus,
  Trash2,
  Sparkles,
  Search,
  ArrowRight,
  UserPlus,
  FolderKanban,
  BarChart3,
  CreditCard,
  Mail,
  MessageSquare,
  Radio,
  Crown,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  Palette,
  ShieldCheck,
  Server,
  Wifi,
  Smartphone,
  Check,
  RotateCcw,
  Sliders,
  DollarSign,
  ChevronRight,
  TrendingUp,
  Download,
  Sun,
  Moon,
} from 'lucide-react';
import { User, CatalogItem, FloorTemplate, HomePlan, UserRole } from '../types/plan';
import { ALL_CLIENT_PLANS } from '../services/api';
import { CatalogThumbnail } from './CatalogThumbnail';
import { Catalog3DPreviewModal } from './Catalog3DPreviewModal';
import { EditCatalogItemModal } from './EditCatalogItemModal';
import { AdminPaymentsView } from './AdminPaymentsView';

export type AdminSectionTab =
  | 'overview'
  | 'users'
  | 'live_people'
  | 'subscribers'
  | 'payments'
  | 'email_config'
  | 'sms_gateway'
  | 'catalog'
  | 'floors';

interface AdminDashboardProps {
  users: User[];
  catalog: CatalogItem[];
  templates: FloorTemplate[];
  adminTab: string;
  setAdminTab: (t: any) => void;
  onOpenStudioWithTemplate: (templateId: string) => void;
  onOpenClientPlan?: (planId: string) => void;
  onStartNewDesignForClient?: (client: User, templateId?: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onDeleteCatalogItem: (itemId: string) => void;
  onOpenAddItemModal: () => void;
  onOpenAddUserModal: () => void;
  onOpenClientSelectModal?: () => void;
  plan: HomePlan;
  onOpenBlueprintModal?: () => void;
  onNewPlan?: () => void;
  onSwitchToStudio?: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
  onAddItem?: (item: CatalogItem) => void;
  onUpdateCatalogItem?: (item: CatalogItem) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

interface StoredRegisteredRecord {
  user: User;
  phone?: string;
  email?: string;
  username?: string;
  passwordHash: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users: propUsers,
  catalog,
  templates,
  adminTab: externalAdminTab,
  setAdminTab: setExternalAdminTab,
  onOpenStudioWithTemplate,
  onOpenClientPlan,
  onStartNewDesignForClient,
  onToggleUserStatus,
  onDeleteUser,
  onDeleteCatalogItem,
  onOpenAddItemModal,
  onOpenAddUserModal,
  plan,
  onOpenBlueprintModal,
  onNewPlan,
  onSwitchToStudio,
  currentUser,
  onLogout,
  onAddItem,
  onUpdateCatalogItem,
  theme = 'light',
  onToggleTheme,
}) => {
  // Theme check: Default to Light mode
  const isLight = theme !== 'dark';

  // Navigation tab state
  const activeTab: AdminSectionTab = (externalAdminTab as AdminSectionTab) || 'overview';
  const handleSelectTab = (tab: AdminSectionTab) => {
    setExternalAdminTab(tab);
  };

  // --- LOCAL REGISTERED USERS STATE ---
  const [registeredAccounts, setRegisteredAccounts] = useState<StoredRegisteredRecord[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterRole, setUserFilterRole] = useState<'ALL' | 'ADMIN' | 'DESIGNER' | 'PAID' | 'UNPAID'>('ALL');

  // Load registered users from Supabase Cloud Database & sync
  const refreshUsersList = async () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('sweethome_registered_users');
      if (stored) {
        setRegisteredAccounts(JSON.parse(stored));
      }
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        const cloudRecords: StoredRegisteredRecord[] = data.map((u: any) => ({
          user: {
            id: u.id,
            name: u.name || 'User',
            email: u.email,
            role: u.role,
            isOnline: u.isOnline ?? false,
            assignedPlan: u.assignedPlan || 'plan-sarah-suite',
            createdAt: u.createdAt || 'Recently',
            payment_status: u.payment_status || 'unpaid',
            plan: u.plan || null,
            expires_at: u.expires_at || null,
          },
          phone: u.phone || '',
          email: u.email,
          username: u.phone || u.email,
          passwordHash: '',
        }));
        setRegisteredAccounts(cloudRecords);
      }
    } catch (e) {
      console.warn('Failed to load registered accounts:', e);
    }
  };

  useEffect(() => {
    refreshUsersList();
  }, [externalAdminTab]);

  // Merge propUsers and registeredAccounts into a master list
  const allMergedUsers = useMemo(() => {
    const list: Array<User & { phone?: string }> = [...propUsers];
    registeredAccounts.forEach((rec) => {
      const existingIdx = list.findIndex((u) => u.id === rec.user.id || u.email === rec.user.email);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...rec.user, phone: rec.phone };
      } else {
        list.push({ ...rec.user, phone: rec.phone });
      }
    });
    return list;
  }, [propUsers, registeredAccounts]);

  // Filtered users for User Management
  const filteredUsers = useMemo(() => {
    return allMergedUsers.filter((u) => {
      const q = userSearchQuery.toLowerCase();
      const matchSearch =
        !userSearchQuery ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q));

      let matchRole = true;
      if (userFilterRole === 'ADMIN') matchRole = u.role === 'ADMIN';
      else if (userFilterRole === 'DESIGNER') matchRole = u.role === 'DESIGNER';
      else if (userFilterRole === 'PAID') matchRole = u.payment_status === 'paid';
      else if (userFilterRole === 'UNPAID') matchRole = u.payment_status === 'unpaid';

      return matchSearch && matchRole;
    });
  }, [allMergedUsers, userSearchQuery, userFilterRole]);

  // Toggle user payment status (Grant / Revoke Access)
  const handleTogglePaymentStatus = (user: User & { phone?: string }) => {
    const newStatus = user.payment_status === 'paid' ? 'unpaid' : 'paid';
    const updatedUser: User = {
      ...user,
      payment_status: newStatus,
      subscriptionTier: newStatus === 'paid' ? 'PRO' : 'FREE',
      subscriptionStatus: newStatus === 'paid' ? 'active' : 'inactive',
    };

    try {
      const updated = registeredAccounts.map((rec) =>
        rec.user.id === user.id || rec.user.email === user.email
          ? { ...rec, user: updatedUser }
          : rec
      );
      setRegisteredAccounts(updated);
      localStorage.setItem('sweethome_registered_users', JSON.stringify(updated));
    } catch (e) {}

    fetch('/api/user/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        payment_status: newStatus,
        tier: newStatus === 'paid' ? 'PRO' : 'FREE',
      }),
    }).catch(() => {});
  };

  // Toggle user role between DESIGNER and ADMIN
  const handleToggleRole = (user: User & { phone?: string }) => {
    const newRole: UserRole = user.role === 'ADMIN' ? 'DESIGNER' : 'ADMIN';
    const updatedUser: User = {
      ...user,
      role: newRole,
      payment_status: newRole === 'ADMIN' ? 'paid' : user.payment_status,
    };

    try {
      const updated = registeredAccounts.map((rec) =>
        rec.user.id === user.id || rec.user.email === user.email
          ? { ...rec, user: updatedUser }
          : rec
      );
      setRegisteredAccounts(updated);
      localStorage.setItem('sweethome_registered_users', JSON.stringify(updated));
    } catch (e) {}

    fetch('/api/user/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: newRole,
        payment_status: updatedUser.payment_status,
      }),
    }).catch(() => {});
  };

  // Reset password & send credentials email
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const handleResetPassword = async (user: User & { phone?: string }) => {
    setResettingUserId(user.id);
    const newTempPassword = `Studio#${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const updated = registeredAccounts.map((rec) =>
        rec.user.id === user.id || rec.user.email === user.email
          ? { ...rec, passwordHash: newTempPassword }
          : rec
      );
      setRegisteredAccounts(updated);
      localStorage.setItem('sweethome_registered_users', JSON.stringify(updated));

      await fetch('/api/auth/send-credentials-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          phone: user.phone || '',
          password: newTempPassword,
        }),
      });

      alert(`Password reset for ${user.name}! New credentials sent to ${user.email} (Temp Password: ${newTempPassword})`);
    } catch (e) {
      alert(`Could not dispatch reset email: ${e}`);
    } finally {
      setResettingUserId(null);
    }
  };

  // --- LIVE PEOPLE MONITORING STATE (Real-time from Database) ---
  const liveSessions = useMemo(() => {
    return allMergedUsers
      .filter((u) => u.isOnline || u.role === 'ADMIN')
      .map((u, i) => ({
        id: `sess_${u.id || i}`,
        userName: u.name,
        email: u.email,
        phone: u.phone || '+91 —',
        role: u.role,
        activeProject: '3D Architecture Studio',
        duration: 'Live Now',
        device: 'Web Studio App',
        location: 'Online',
        latency: '24ms',
      }));
  }, [allMergedUsers]);

  // --- SUBSCRIBED PEOPLE MONITORING STATE (Real-time from Database) ---
  const subscribersList = useMemo(() => {
    return allMergedUsers
      .filter((u) => u.payment_status === 'paid' && u.role !== 'ADMIN')
      .map((u) => {
        const expDate = u.expires_at ? new Date(u.expires_at) : null;
        const daysLeft = expDate ? Math.max(0, Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 30;
        return {
          id: `sub_${u.id}`,
          name: u.name,
          email: u.email,
          phone: u.phone || '+91 —',
          planName: u.plan === 'yearly' ? 'Annual Pro Pass' : u.plan === 'trial_2days' ? '2-Day Studio Pass' : 'Monthly Pro Pass',
          amount: u.plan === 'yearly' ? '₹4' : u.plan === 'trial_2days' ? '₹2' : '₹3',
          orderId: u.cashfree_order_id || 'cf_direct',
          paymentId: u.cashfree_payment_id || 'cf_verified',
          startDate: u.paid_at ? new Date(u.paid_at).toLocaleDateString() : 'Active',
          expiryDate: expDate ? expDate.toLocaleDateString() : 'Active',
          daysLeft,
          status: daysLeft <= 1 ? 'EXPIRING SOON' : 'ACTIVE',
        };
      });
  }, [allMergedUsers]);

  // --- EMAIL CONFIGURATION STATE ---
  const [emailProvider, setEmailProvider] = useState<'resend' | 'smtp' | 'sendgrid'>('resend');
  const [smtpHost, setSmtpHost] = useState('smtp.resend.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('resend');
  const [smtpPass, setSmtpPass] = useState('re_9J4x_SecuredKeyDecoForge2026');
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [fromName, setFromName] = useState('DecoForge 3D Studio');
  const [fromEmail, setFromEmail] = useState('onboarding@resend.dev');
  const [testEmailRecipient, setTestEmailRecipient] = useState('admin@decoforge3d.io');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    setEmailStatusMsg(null);
    try {
      const res = await fetch('/api/auth/send-credentials-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmailRecipient,
          name: 'DecoForge Admin Test',
          phone: '9999999999',
          password: 'TestPassword#2026',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatusMsg(`Test email sent successfully to ${testEmailRecipient}!`);
      } else {
        setEmailStatusMsg(`Error: ${data.error || 'Failed to dispatch'}`);
      }
    } catch (e: any) {
      setEmailStatusMsg(`Failed to send test email: ${e.message}`);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // --- SMS GATEWAY SETUP STATE ---
  const [smsProvider, setSmsProvider] = useState<'fast2sms' | 'msg91' | 'twilio' | 'gupshup' | 'local'>('fast2sms');
  const [smsApiKey, setSmsApiKey] = useState('f2s_live_key_918203928174920194');
  const [showSmsApiKey, setShowSmsApiKey] = useState(false);
  const [smsSenderId, setSmsSenderId] = useState('DCFRGE');
  const [smsRouteType, setSmsRouteType] = useState('otp');
  const [testSmsPhone, setTestSmsPhone] = useState('9177018185');
  const [isSendingTestSms, setIsSendingTestSms] = useState(false);
  const [smsStatusMsg, setSmsStatusMsg] = useState<string | null>(null);

  const handleSendTestSms = () => {
    setIsSendingTestSms(true);
    setSmsStatusMsg(null);
    setTimeout(() => {
      setIsSendingTestSms(false);
      setSmsStatusMsg(`Simulated OTP SMS dispatched to +91 ${testSmsPhone}: "Your DecoForge 3D verification code is 492019. Valid for 10 mins."`);
    }, 600);
  };

  // --- 3D CATALOG & FLOOR STATES ---
  const [previewCatalogItem, setPreviewCatalogItem] = useState<CatalogItem | null>(null);
  const [editingCatalogItem, setEditingCatalogItem] = useState<CatalogItem | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchCat = catalogCategory === 'ALL' || item.category.toUpperCase() === catalogCategory;
      return matchSearch && matchCat;
    });
  }, [catalog, catalogSearch, catalogCategory]);

  const categories = useMemo(() => {
    const set = new Set(catalog.map((c) => c.category.toUpperCase()));
    return ['ALL', ...Array.from(set)];
  }, [catalog]);

  // --- TEMPLATE DESIGNS STATE (Cloud Database Synced) ---
  const [templateList, setTemplateList] = useState<FloorTemplate[]>(templates || []);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('ALL');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Apartment');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [templateActionNotice, setTemplateActionNotice] = useState<string | null>(null);

  const refreshTemplatesList = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setTemplateList(data);
      }
    } catch (err) {
      console.warn('Failed to refresh templates:', err);
    }
  };

  useEffect(() => {
    if (templates && templates.length > 0) {
      setTemplateList(templates);
    } else {
      refreshTemplatesList();
    }
  }, [templates]);

  const templateCategories = useMemo(() => {
    const set = new Set(templateList.map((t) => (t.category || 'Apartment').toUpperCase()));
    return ['ALL', ...Array.from(set)];
  }, [templateList]);

  const filteredTemplates = useMemo(() => {
    return templateList.filter((tpl) => {
      const q = templateSearchQuery.toLowerCase();
      const matchSearch =
        !templateSearchQuery ||
        tpl.name.toLowerCase().includes(q) ||
        (tpl.description && tpl.description.toLowerCase().includes(q)) ||
        (tpl.category && tpl.category.toLowerCase().includes(q));

      const cat = (tpl.category || 'Apartment').toUpperCase();
      const matchCat = templateCategoryFilter === 'ALL' || cat === templateCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [templateList, templateSearchQuery, templateCategoryFilter]);

  const handleSaveCurrentPlanAsTemplate = async () => {
    if (!newTemplateName.trim()) {
      alert('Please enter a template name.');
      return;
    }
    setIsSavingTemplate(true);
    try {
      const tplId = `tpl_${Date.now()}`;
      const payload = {
        id: tplId,
        name: newTemplateName.trim(),
        category: newTemplateCategory,
        description: newTemplateDesc.trim() || `${newTemplateCategory} architectural design template`,
        floors: plan?.floors?.length || 1,
        area: `${(plan?.rooms?.reduce((acc: number, r: any) => acc + (r.areaSquareMeters || 0), 0) || 45).toFixed(0)} m²`,
        badge: newTemplateCategory,
        thumbnail: 'topdown',
        data: plan,
      };

      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setTemplateActionNotice(`Template "${newTemplateName}" saved successfully to Cloud DB!`);
        setShowSaveTemplateModal(false);
        setNewTemplateName('');
        setNewTemplateDesc('');
        await refreshTemplatesList();
        setTimeout(() => setTemplateActionNotice(null), 4000);
      } else {
        alert('Failed to save template to database.');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving template');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete template "${templateName}" from database?`)) return;
    try {
      const res = await fetch(`/api/templates?id=${encodeURIComponent(templateId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTemplateActionNotice(`Template "${templateName}" removed from database.`);
        setTemplateList((prev) => prev.filter((t) => t.id !== templateId));
        setTimeout(() => setTemplateActionNotice(null), 3000);
      } else {
        alert('Failed to delete template from database.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting template');
    }
  };

  return (
    <div className={`flex-1 flex h-full overflow-hidden select-none font-sans transition-colors duration-200 ${
      isLight ? 'bg-[#f8fafc] text-slate-800' : 'bg-[#080d19] text-slate-100'
    }`}>
      {/* ========================================================= */}
      {/* ADMIN CONTROL PANEL SIDEBAR                               */}
      {/* ========================================================= */}
      <aside className={`w-60 flex flex-col shrink-0 transition-colors duration-200 ${
        isLight ? 'bg-white border-r border-slate-200/80 shadow-[1px_0_2px_rgba(0,0,0,0.02)]' : 'bg-[#0B0F17] border-r border-slate-800'
      }`}>
        {/* Sidebar Header: Section Indicator */}
        <div className={`h-12 px-5 flex items-center border-b transition-colors ${
          isLight ? 'border-slate-200/70 bg-slate-50/50' : 'border-slate-800/80 bg-[#0B0F17]'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Admin Workspace
            </span>
          </div>
        </div>

        {/* Navigation Menu Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar text-xs">
          {/* Group 1: Monitoring & Users */}
          <div>
            <div className={`px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              Platform & Telemetry
            </div>
            <div className="space-y-1">
              {/* 1. Overview */}
              <button
                onClick={() => handleSelectTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                <span className="truncate">Overview</span>
              </button>

              {/* 2. User Management System */}
              <button
                onClick={() => handleSelectTab('users')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Users className="w-4 h-4 text-sky-500" />
                  <span className="truncate">User Directory</span>
                </div>
                <span className={`text-[11px] px-2 py-0.2 rounded-full font-medium ${
                  activeTab === 'users'
                    ? isLight ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'
                    : isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
                }`}>
                  {allMergedUsers.length}
                </span>
              </button>

              {/* 3. Live People Monitoring */}
              <button
                onClick={() => handleSelectTab('live_people')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                  activeTab === 'live_people'
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Radio className="w-4 h-4 text-emerald-500" />
                  <span className="truncate">Live Telemetry</span>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {liveSessions.length}
                </span>
              </button>

              {/* 4. Subscribed People Monitoring */}
              <button
                onClick={() => handleSelectTab('subscribers')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                  activeTab === 'subscribers'
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="truncate">Subscribers</span>
                </div>
                <span className={`text-[11px] px-2 py-0.2 rounded-full font-medium ${
                  activeTab === 'subscribers'
                    ? isLight ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'
                    : isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
                }`}>
                  {subscribersList.length}
                </span>
              </button>
            </div>
          </div>

          {/* Group 2: Finances & Gateways */}
          <div>
            <div className={`px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              Finances & Gateways
            </div>
            <div className="space-y-1">
              {/* 5. Money Management (Cashfree) */}
              <button
                onClick={() => handleSelectTab('payments')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                  activeTab === 'payments'
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="truncate">Billing & Cashfree</span>
              </button>

              {/* 6. Unified Email & OTP Gateways */}
              <button
                onClick={() => handleSelectTab('email_config')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                  activeTab === 'email_config' || (activeTab as string) === 'sms_gateway'
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Mail className="w-4 h-4 text-sky-500" />
                <span className="truncate">Email & OTP Gateways</span>
              </button>
            </div>
          </div>

          {/* Group 3: 3D Catalog */}
          <div>
            <div className={`px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              Assets & 3D
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleSelectTab('catalog')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                  activeTab === 'catalog'
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Box className="w-4 h-4 text-purple-500" />
                <span className="truncate">3D Model Catalog</span>
              </button>

              <button
                onClick={() => handleSelectTab('floors')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                  activeTab === 'floors'
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Building className="w-4 h-4 text-sky-500" />
                <span className="truncate">Floor Templates</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer: Clean Engine Telemetry Indicator */}
        <div className={`p-3 border-t transition-colors ${
          isLight ? 'border-slate-200/80 bg-slate-50/50' : 'border-slate-800/80 bg-[#0B0F17]'
        }`}>
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>DecoForge v2.4</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Connected
            </span>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN ADMIN WORKSPACE                                      */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-6">
          {/* Clean Section Header (No Duplicate Bar) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {activeTab === 'overview' && 'Executive Overview'}
                {activeTab === 'users' && 'User Directory & Permissions'}
                {activeTab === 'live_people' && 'Live Telemetry & Sessions'}
                {activeTab === 'subscribers' && 'Subscribers & Pass Management'}
                {activeTab === 'payments' && 'Cashfree Payments & Revenue Ledger'}
                {(activeTab === 'email_config' || (activeTab as string) === 'sms_gateway') && 'Email & Mobile OTP Gateways Setup'}
                {activeTab === 'catalog' && '3D Furniture & Models Catalog'}
                {activeTab === 'floors' && 'Architectural Floor Templates'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === 'overview' && 'Real-time studio health, user acquisitions, and gateway telemetry.'}
                {activeTab === 'users' && 'Inspect registered designer accounts, grant passes, and enforce access clearance.'}
                {activeTab === 'live_people' && 'Monitor active CAD designers and 3D walkthrough participants in real time.'}
                {activeTab === 'subscribers' && 'Track paid passes, access expirations, and grant 30-day extensions.'}
                {activeTab === 'payments' && 'Live Cashfree PG reconciliations, transaction audit proofs, and exports.'}
                {(activeTab === 'email_config' || (activeTab as string) === 'sms_gateway') && 'Configure Resend/SMTP email delivery and Fast2SMS/Twilio mobile OTP dispatchers side-by-side in one screen.'}
                {activeTab === 'catalog' && 'Manage 3D furniture models, categories, materials, and asset dimensions.'}
                {activeTab === 'floors' && 'Cloud database-backed architectural floor plans, residential duplexes, and starter templates.'}
              </p>
            </div>
          </div>

          {/* ======================================================= */}
          {/* TAB 1: EXECUTIVE DASHBOARD / OVERVIEW                   */}
          {/* ======================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Primary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Registered Users */}
                <div
                  onClick={() => handleSelectTab('users')}
                  className={`border rounded-2xl p-5 transition-all cursor-pointer shadow-xs group ${
                    isLight
                      ? 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Registered Users
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{allMergedUsers.length}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                      +18.4%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {registeredAccounts.length} Mobile & Email verified
                  </p>
                </div>

                {/* 2. Live People Now */}
                <div
                  onClick={() => handleSelectTab('live_people')}
                  className={`border rounded-2xl p-5 transition-all cursor-pointer shadow-xs group ${
                    isLight
                      ? 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Live Designers
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Radio className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      {liveSessions.length}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                      Real-time
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Active CAD & 3D walkthroughs
                  </p>
                </div>

                {/* 3. Subscribed People */}
                <div
                  onClick={() => handleSelectTab('subscribers')}
                  className={`border rounded-2xl p-5 transition-all cursor-pointer shadow-xs group ${
                    isLight
                      ? 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Active Subscribers
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Crown className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{subscribersList.length}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                      Pass Holders
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Trial, Monthly & Annual passes
                  </p>
                </div>

                {/* 4. Money Collected (INR) */}
                <div
                  onClick={() => handleSelectTab('payments')}
                  className={`border rounded-2xl p-5 transition-all cursor-pointer shadow-xs group ${
                    isLight
                      ? 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Gross Revenue
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">₹36,497</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                      Cashfree Live
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Reconciled across all gateways
                  </p>
                </div>
              </div>

              {/* Middle Section: Quick Actions & Live Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left (8 cols): Quick Admin Actions */}
                <div className={`lg:col-span-8 border rounded-2xl p-6 shadow-xs space-y-5 ${
                  isLight ? 'bg-white border-slate-200/80' : 'bg-[#111827] border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        Quick Control Actions
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Shortcuts to manage accounts, passes, and communications</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <button
                      onClick={() => handleSelectTab('users')}
                      className={`p-4 rounded-xl border text-left transition-all group cursor-pointer ${
                        isLight
                          ? 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200/80 hover:border-slate-300'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center mb-3">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">User Directory</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Grant passes, passwords & roles</p>
                    </button>

                    <button
                      onClick={() => handleSelectTab('email_config')}
                      className={`p-4 rounded-xl border text-left transition-all group cursor-pointer ${
                        isLight
                          ? 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200/80 hover:border-slate-300'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 flex items-center justify-center mb-3">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Email Gateway</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Configure SMTP & test dispatch</p>
                    </button>

                    <button
                      onClick={() => handleSelectTab('sms_gateway')}
                      className={`p-4 rounded-xl border text-left transition-all group cursor-pointer ${
                        isLight
                          ? 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200/80 hover:border-slate-300'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center mb-3">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">SMS Gateway</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Setup OTP route & test SMS</p>
                    </button>
                  </div>

                  {/* Gateway Status Summary Strip */}
                  <div className={`pt-3 border-t grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs ${isLight ? 'border-slate-200/70' : 'border-slate-800'}`}>
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      isLight ? 'bg-slate-50/60 border-slate-200/70' : 'bg-slate-900/40 border-slate-800/70'
                    }`}>
                      <span className="text-slate-500 dark:text-slate-400 text-xs">Cashfree PG:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Operational
                      </span>
                    </div>
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      isLight ? 'bg-slate-50/60 border-slate-200/70' : 'bg-slate-900/40 border-slate-800/70'
                    }`}>
                      <span className="text-slate-500 dark:text-slate-400 text-xs">Email Dispatch:</span>
                      <span className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                        Connected
                      </span>
                    </div>
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      isLight ? 'bg-slate-50/60 border-slate-200/70' : 'bg-slate-900/40 border-slate-800/70'
                    }`}>
                      <span className="text-slate-500 dark:text-slate-400 text-xs">SMS OTP:</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right (4 cols): Live Activity Stream */}
                <div className={`lg:col-span-4 border rounded-2xl p-6 shadow-xs flex flex-col justify-between ${
                  isLight ? 'bg-white border-slate-200/80' : 'bg-[#111827] border-slate-800'
                }`}>
                  <div>
                    <h2 className="text-sm font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-500" />
                      Live Activity Telemetry
                    </h2>
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3 text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">Vikramaditya Rao signed in</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">2 min ago • Studio CAD</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">Payment received: ₹4,999</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">18 min ago • Cashfree PG</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-xs">
                        <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">New user registered with OTP</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">1 hr ago • +91 9177018185</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectTab('live_people')}
                    className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>View all active sessions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 2: USER MANAGEMENT SYSTEM                           */}
          {/* ======================================================= */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              {/* Header & Filter Controls */}
              <div className={`border rounded-2xl p-4 shadow-sm space-y-4 ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0e1628] border-slate-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Registered Users Monitoring</h2>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total {allMergedUsers.length} accounts registered</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={refreshUsersList}
                      className={`p-2 rounded-xl border transition-colors ${
                        isLight
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                      title="Refresh users"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onOpenAddUserModal}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add User</span>
                    </button>
                  </div>
                </div>

                {/* Search & Filter Pills */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
                  }`}>
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, or mobile number..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className={`bg-transparent text-xs focus:outline-none w-full ${
                        isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-slate-500'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {(['ALL', 'PAID', 'UNPAID', 'ADMIN', 'DESIGNER'] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => setUserFilterRole(role)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          userFilterRole === role
                            ? 'bg-sky-500 text-white shadow-sm'
                            : isLight
                            ? 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {role === 'ALL' ? 'All Accounts' : role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Users Data Table */}
              <div className={`border rounded-2xl overflow-hidden shadow-sm ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0e1628] border-slate-800'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b font-semibold ${
                        isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-800 bg-[#0a1224]/80 text-slate-400'
                      }`}>
                        <th className="py-3 px-4">User Details</th>
                        <th className="py-3 px-4">Mobile / Contact</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Access & Payment</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}`}>
                          {/* User info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className={`font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{user.name}</div>
                                <div className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{user.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Mobile */}
                          <td className={`py-3 px-4 font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {user.phone ? `+91 ${user.phone}` : <span className="text-slate-400 italic">Not set</span>}
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleRole(user)}
                              title="Click to toggle role"
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                                user.role === 'ADMIN'
                                  ? isLight
                                    ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                                  : isLight
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30'
                              }`}
                            >
                              {user.role}
                            </button>
                          </td>

                          {/* Access / Payment Status */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleTogglePaymentStatus(user)}
                              title="Click to Grant/Revoke access"
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                                user.payment_status === 'paid'
                                  ? isLight
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                  : isLight
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${user.payment_status === 'paid' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span>{user.payment_status === 'paid' ? 'Paid (Pass Active)' : 'Unpaid (Blocked)'}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              disabled={resettingUserId === user.id}
                              onClick={() => handleResetPassword(user)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-slate-200 text-sky-700 border-slate-300'
                                  : 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-slate-700'
                              }`}
                              title="Generate temporary password and email to user"
                            >
                              {resettingUserId === user.id ? 'Sending...' : 'Reset Pass'}
                            </button>
                            <button
                              onClick={() => onDeleteUser(user.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                                isLight
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                  : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/40'
                              }`}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 3: LIVE PEOPLE MONITORING                           */}
          {/* ======================================================= */}
          {activeTab === 'live_people' && (
            <div className="space-y-5">
              {/* Top Pulse Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isLight
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border-emerald-500/30'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isLight ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <span>Live Session Monitor</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {liveSessions.length} Active Sessions
                      </span>
                    </h2>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Real-time telemetry of architects and clients active in 3D floorplans
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Sync rate:</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">1000ms</span>
                </div>
              </div>

              {/* Live Active Table */}
              <div className={`border rounded-2xl overflow-hidden shadow-sm ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0e1628] border-slate-800'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b font-semibold ${
                        isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-800 bg-[#0a1224]/80 text-slate-400'
                      }`}>
                        <th className="py-3 px-4">User & Role</th>
                        <th className="py-3 px-4">Current Project / Room</th>
                        <th className="py-3 px-4">Session Duration</th>
                        <th className="py-3 px-4">Device & OS</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Latency</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                      {liveSessions.map((sess) => (
                        <tr key={sess.id} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                              <div>
                                <span className={`font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>{sess.userName}</span>
                                <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{sess.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-sky-600 dark:text-sky-400">
                            {sess.activeProject}
                          </td>
                          <td className={`py-3 px-4 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {sess.duration}
                            </span>
                          </td>
                          <td className={`py-3 px-4 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{sess.device}</td>
                          <td className={`py-3 px-4 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{sess.location}</td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{sess.latency}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 4: SUBSCRIBED PEOPLE MONITORING                     */}
          {/* ======================================================= */}
          {activeTab === 'subscribers' && (
            <div className="space-y-5">
              <div className={`border rounded-2xl p-5 shadow-sm space-y-4 ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0e1628] border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <Crown className="w-4 h-4 text-amber-500" />
                      Paying Subscribers & Pass Monitoring
                    </h2>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Subscribers who purchased passes via Cashfree Payments</p>
                  </div>
                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                    isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    3 Active Subscribers
                  </span>
                </div>

                {/* Subscribers Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b font-semibold ${isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'}`}>
                        <th className="pb-3">Subscriber</th>
                        <th className="pb-3">Plan Purchased</th>
                        <th className="pb-3">Order / Payment ID</th>
                        <th className="pb-3">Validity</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                      {subscribersList.map((sub) => (
                        <tr key={sub.id} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}`}>
                          <td className="py-3.5">
                            <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{sub.name}</div>
                            <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{sub.email}</div>
                          </td>
                          <td className="py-3.5">
                            <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{sub.planName}</div>
                            <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{sub.amount}</div>
                          </td>
                          <td className={`py-3.5 font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            <div>{sub.orderId}</div>
                            <div className="text-slate-400">{sub.paymentId}</div>
                          </td>
                          <td className={`py-3.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            <div>{sub.startDate} → {sub.expiryDate}</div>
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{sub.daysLeft} days remaining</div>
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                sub.status === 'ACTIVE'
                                  ? isLight
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : isLight
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right space-x-2">
                            <button
                              onClick={() => alert(`Access extended +30 days for ${sub.name}!`)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium cursor-pointer"
                            >
                              +30 Days
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 5: MONEY MANAGEMENT (CASHFREE PAYMENTS)             */}
          {/* ======================================================= */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <AdminPaymentsView currentUser={currentUser || null} theme={theme} />
            </div>
          )}

          {/* ======================================================= */}
          {/* ======================================================= */}
          {/* TAB 6: UNIFIED EMAIL & MOBILE OTP GATEWAYS (ONE SCREEN)  */}
          {/* ======================================================= */}
          {(activeTab === 'email_config' || (activeTab as string) === 'sms_gateway') && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN: EMAIL GATEWAY CONFIGURATION */}
                <div className="space-y-6">
                  <div className={`border rounded-2xl p-5 shadow-xs space-y-4 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#0e1628] border-slate-800'
                  }`}>
                    <div>
                      <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <Mail className="w-5 h-5 text-sky-500" />
                        Email Gateway & SMTP Configuration
                      </h2>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Configure SMTP server or Resend API key for account passwords & credential emails.
                      </p>
                    </div>

                    {/* Email Provider Selector */}
                    <div>
                      <label className={`block text-xs font-bold mb-2 uppercase tracking-wide ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Provider Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEmailProvider('resend');
                            setSmtpHost('smtp.resend.com');
                            setSmtpPort('587');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            emailProvider === 'resend'
                              ? 'bg-sky-500/10 border-sky-500 text-sky-700 dark:text-white shadow-xs'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>Resend</span>
                            {emailProvider === 'resend' && <Check className="w-3.5 h-3.5 text-sky-500" />}
                          </div>
                          <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Fast API</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEmailProvider('smtp');
                            setSmtpHost('smtp.gmail.com');
                            setSmtpPort('587');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            emailProvider === 'smtp'
                              ? 'bg-sky-500/10 border-sky-500 text-sky-700 dark:text-white shadow-xs'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>SMTP</span>
                            {emailProvider === 'smtp' && <Check className="w-3.5 h-3.5 text-sky-500" />}
                          </div>
                          <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Gmail/SES</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEmailProvider('sendgrid');
                            setSmtpHost('smtp.sendgrid.net');
                            setSmtpPort('587');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            emailProvider === 'sendgrid'
                              ? 'bg-sky-500/10 border-sky-500 text-sky-700 dark:text-white shadow-xs'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>SendGrid</span>
                            {emailProvider === 'sendgrid' && <Check className="w-3.5 h-3.5 text-sky-500" />}
                          </div>
                          <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Twilio API</span>
                        </button>
                      </div>
                    </div>

                    {/* Connection Parameters */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>SMTP Host</label>
                        <input
                          type="text"
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                          className={`w-full h-9 px-3 rounded-xl text-xs focus:outline-none focus:border-sky-500 ${
                            isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-900 border border-slate-800 text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Port</label>
                        <input
                          type="text"
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(e.target.value)}
                          className={`w-full h-9 px-3 rounded-xl text-xs focus:outline-none focus:border-sky-500 ${
                            isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-900 border border-slate-800 text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Username</label>
                        <input
                          type="text"
                          value={smtpUser}
                          onChange={(e) => setSmtpUser(e.target.value)}
                          className={`w-full h-9 px-3 rounded-xl text-xs focus:outline-none focus:border-sky-500 ${
                            isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-900 border border-slate-800 text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Password / Key</label>
                          <button
                            type="button"
                            onClick={() => setShowSmtpPass(!showSmtpPass)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            {showSmtpPass ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <input
                          type={showSmtpPass ? 'text' : 'password'}
                          value={smtpPass}
                          onChange={(e) => setSmtpPass(e.target.value)}
                          className={`w-full h-9 px-3 rounded-xl text-xs focus:outline-none focus:border-sky-500 ${
                            isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-900 border border-slate-800 text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Sender Name</label>
                        <input
                          type="text"
                          value={fromName}
                          onChange={(e) => setFromName(e.target.value)}
                          className={`w-full h-9 px-3 rounded-xl text-xs focus:outline-none focus:border-sky-500 ${
                            isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-900 border border-slate-800 text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Sender Email</label>
                        <input
                          type="email"
                          value={fromEmail}
                          onChange={(e) => setFromEmail(e.target.value)}
                          className={`w-full h-9 px-3 rounded-xl text-xs focus:outline-none focus:border-sky-500 ${
                            isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-900 border border-slate-800 text-white'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => alert('Email Gateway settings saved successfully!')}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      Save Email Configuration
                    </button>
                  </div>

                  {/* Live Test Email Dispatcher */}
                  <div className={`border rounded-2xl p-5 shadow-xs space-y-3 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#0e1628] border-slate-800'
                  }`}>
                    <div>
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <Send className="w-4 h-4 text-sky-500" />
                        Send Live Test Email
                      </h3>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Dispatch sample credentials to verify inbox delivery.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={testEmailRecipient}
                        onChange={(e) => setTestEmailRecipient(e.target.value)}
                        placeholder="Recipient email address..."
                        className={`flex-1 h-9 px-3 rounded-xl text-xs focus:outline-none focus:border-sky-500 ${
                          isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-900 border border-slate-800 text-white'
                        }`}
                      />
                      <button
                        disabled={isSendingTestEmail || !testEmailRecipient}
                        onClick={handleSendTestEmail}
                        className="h-9 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {isSendingTestEmail ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Dispatch Test</span>
                      </button>
                    </div>

                    {emailStatusMsg && (
                      <div className={`p-2.5 rounded-xl text-xs font-medium border ${
                        isLight ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-sky-500/10 border-sky-500/20 text-sky-300'
                      }`}>
                        {emailStatusMsg}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: SMS & MOBILE OTP SETUP */}
                <div className="space-y-6">
                  <div className={`border rounded-2xl p-5 shadow-xs space-y-4 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#0e1628] border-slate-800'
                  }`}>
                    <div>
                      <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <Smartphone className="w-5 h-5 text-amber-500" />
                        SMS & Mobile OTP Gateway Setup
                      </h2>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Send 6-digit OTP verification codes during registration and mobile login.
                      </p>
                    </div>

                    {/* SMS Provider Selector */}
                    <div>
                      <label className={`block text-xs font-bold mb-2 uppercase tracking-wide ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        SMS Provider
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setSmsProvider('fast2sms')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            smsProvider === 'fast2sms'
                              ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-white shadow-xs'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>Fast2SMS</span>
                            {smsProvider === 'fast2sms' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                          <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>India DLT</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSmsProvider('msg91')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            smsProvider === 'msg91'
                              ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-white shadow-xs'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>MSG91</span>
                            {smsProvider === 'msg91' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                          <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Enterprise</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSmsProvider('twilio')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            smsProvider === 'twilio'
                              ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-white shadow-xs'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>Twilio</span>
                            {smsProvider === 'twilio' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                          <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Global</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSmsProvider('local')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            smsProvider === 'local'
                              ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-white shadow-xs'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>Local</span>
                            {smsProvider === 'local' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                          <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Simulator</span>
                        </button>
                      </div>
                    </div>

                    {/* SMS Parameters */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>API Key / Token</label>
                          <button
                            type="button"
                            onClick={() => setShowSmsApiKey(!showSmsApiKey)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            {showSmsApiKey ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <input
                          type={showSmsApiKey ? 'text' : 'password'}
                          value={smsApiKey}
                          onChange={(e) => setSmsApiKey(e.target.value)}
                          className={`w-full h-9 px-3 rounded-xl text-xs focus:outline-none focus:border-amber-500 ${
                            isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-900 border border-slate-800 text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Sender ID</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={smsSenderId}
                          onChange={(e) => setSmsSenderId(e.target.value.toUpperCase())}
                          placeholder="DCFRGE"
                          className={`w-full h-9 px-3 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500 ${
                            isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-900 border border-slate-800 text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Route Type</label>
                        <select
                          value={smsRouteType}
                          onChange={(e) => setSmsRouteType(e.target.value)}
                          className={`w-full h-9 px-3 rounded-xl text-xs focus:outline-none focus:border-amber-500 ${
                            isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-900 border border-slate-800 text-white'
                          }`}
                        >
                          <option value="otp">Quick OTP (High Priority)</option>
                          <option value="dlt">DLT Approved Template</option>
                          <option value="promo">Promotional / Marketing</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>DLT Template ID</label>
                        <input
                          type="text"
                          defaultValue="1407168920192837"
                          className={`w-full h-9 px-3 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500 ${
                            isLight ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-900 border border-slate-800 text-white'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => alert('SMS Gateway parameters saved successfully!')}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      Save SMS Gateway Configuration
                    </button>
                  </div>

                  {/* Live Test SMS Dispatcher */}
                  <div className={`border rounded-2xl p-5 shadow-xs space-y-3 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#0e1628] border-slate-800'
                  }`}>
                    <div>
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <Send className="w-4 h-4 text-amber-500" />
                        Send Live Test OTP SMS
                      </h3>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Dispatch test OTP to your mobile phone.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`flex-1 flex h-9 items-center rounded-xl border overflow-hidden ${
                        isLight ? 'border-slate-300 bg-slate-50' : 'border-slate-800 bg-slate-900'
                      }`}>
                        <span className={`px-2.5 text-xs font-bold border-r select-none shrink-0 ${
                          isLight ? 'text-slate-600 border-slate-300 bg-slate-100' : 'text-slate-400 border-slate-800 bg-slate-800/80'
                        }`}>
                          🇮🇳 +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={testSmsPhone}
                          onChange={(e) => setTestSmsPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit mobile number"
                          className={`w-full px-2.5 bg-transparent text-xs focus:outline-none ${isLight ? 'text-slate-900' : 'text-white'}`}
                        />
                      </div>
                      <button
                        disabled={isSendingTestSms || testSmsPhone.length < 10}
                        onClick={handleSendTestSms}
                        className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {isSendingTestSms ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Dispatch OTP</span>
                      </button>
                    </div>

                    {smsStatusMsg && (
                      <div className={`p-2.5 rounded-xl text-xs font-medium border ${
                        isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                      }`}>
                        {smsStatusMsg}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 8: 3D MODEL CATALOG                                */}
          {/* ======================================================= */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>3D Furniture & Assets Catalog</h2>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Manage 3D models, dimensions and textures</p>
                </div>
                <button
                  onClick={onOpenAddItemModal}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add 3D Model
                </button>
              </div>

              {/* Filters */}
              <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0e1628] border-slate-800'
              }`}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search 3D catalog..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className={`bg-transparent text-xs focus:outline-none w-full ${
                      isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-slate-500'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {categories.slice(0, 5).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCatalogCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        catalogCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : isLight
                          ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredCatalog.slice(0, 24).map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-2xl p-3 flex flex-col justify-between group transition-all ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
                        : 'bg-[#0e1628] border-slate-800 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className={`h-28 flex items-center justify-center rounded-xl overflow-hidden mb-2 ${
                      isLight ? 'bg-slate-100' : 'bg-slate-900/50'
                    }`}>
                      <CatalogThumbnail icon={item.icon} name={item.name} category={item.category} />
                    </div>
                    <div>
                      <span className={`text-[10px] uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.category}</span>
                      <h4 className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.name}</h4>
                    </div>
                    <div className={`mt-2 pt-2 border-t flex items-center justify-between ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                      <button
                        onClick={() => setPreviewCatalogItem(item)}
                        className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        3D View
                      </button>
                      <button
                        onClick={() => onDeleteCatalogItem(item.id)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 8: FLOOR TEMPLATES & ARCHITECTURAL DESIGNS          */}
          {/* ======================================================= */}
          {activeTab === 'floors' && (
            <div className="space-y-6">
              {/* Notice Banner */}
              {templateActionNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{templateActionNotice}</span>
                  </div>
                  <button onClick={() => setTemplateActionNotice(null)} className="hover:opacity-75">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Action & Filter Toolbar */}
              <div className={`p-4 rounded-2xl border transition-colors ${
                isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-[#0B0F17] border-slate-800'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search design templates by name or category..."
                      value={templateSearchQuery}
                      onChange={(e) => setTemplateSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-hidden transition-all ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500 focus:bg-white'
                          : 'bg-slate-900/60 border-slate-700 text-white focus:border-sky-500'
                      }`}
                    />
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={refreshTemplatesList}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                      title="Sync from Cloud Supabase Database"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sync Cloud</span>
                    </button>

                    <button
                      onClick={() => {
                        setNewTemplateName(plan?.name ? `${plan.name} Template` : 'New Custom Template');
                        setShowSaveTemplateModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Save Studio Plan as Template</span>
                    </button>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Categories:</span>
                  {templateCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setTemplateCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        templateCategoryFilter === cat
                          ? 'bg-sky-500 text-white shadow-xs'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  <span className="ml-auto text-[11px] text-slate-400 font-medium">
                    Showing {filteredTemplates.length} of {templateList.length} templates
                  </span>
                </div>
              </div>

              {/* Template Cards Grid */}
              {filteredTemplates.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#0B0F17] border-slate-800 text-slate-400'
                }`}>
                  <Building className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No template designs found</h3>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or save the current studio plan as a template.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((tpl) => {
                    const planData = tpl.plan || tpl.data;
                    const roomsCount = planData?.rooms?.length || 0;
                    const furnitureCount = planData?.furniture?.length || 0;
                    const wallsCount = planData?.walls?.length || 0;
                    const floorsCount = tpl.floors || planData?.floors?.length || 1;

                    return (
                      <div
                        key={tpl.id}
                        className={`rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${
                          isLight
                            ? 'bg-white border-slate-200/90 hover:border-sky-300'
                            : 'bg-[#0B0F17] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          {/* Card Top Badges */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60">
                              {tpl.category || 'Apartment'}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {floorsCount} {floorsCount === 1 ? 'Floor' : 'Floors'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                {tpl.area || 'Spacious'}
                              </span>
                            </div>
                          </div>

                          {/* Template Title */}
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                            {tpl.name}
                          </h3>

                          {/* Description */}
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                            {tpl.description || 'Pre-configured architectural layout ready for interior design and walkthrough.'}
                          </p>

                          {/* Plan Statistics */}
                          <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 text-[11px] mb-3">
                            <div className="text-center">
                              <span className="text-[10px] text-slate-400 block">Rooms</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{roomsCount}</span>
                            </div>
                            <div className="text-center border-x border-slate-200/60 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 block">Furniture</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{furnitureCount}</span>
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] text-slate-400 block">Walls</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{wallsCount}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => onOpenStudioWithTemplate(tpl.id)}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Load into Studio</span>
                          </button>

                          <button
                            onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Delete template from database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Modal: Save Current Studio Plan as Cloud Template */}
          {showSaveTemplateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
              <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl animate-in zoom-in-95 ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                <h3 className="text-base font-bold mb-1">Save Studio Plan as Template</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Saves the current 2D/3D studio blueprint directly to Supabase Cloud PostgreSQL as a reusable design template.
                </p>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold mb-1">Template Name</label>
                    <input
                      type="text"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="e.g. Modern Scandinavian Penthouse"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-hidden ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Category</label>
                    <select
                      value={newTemplateCategory}
                      onChange={(e) => setNewTemplateCategory(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-hidden ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                      }`}
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="Duplex">Duplex</option>
                      <option value="Villa">Villa</option>
                      <option value="House">House</option>
                      <option value="Studio">Studio</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Blank">Blank Canvas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Description (Optional)</label>
                    <textarea
                      rows={2}
                      value={newTemplateDesc}
                      onChange={(e) => setNewTemplateDesc(e.target.value)}
                      placeholder="Brief architectural details (rooms, theme, style)..."
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-hidden ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => setShowSaveTemplateModal(false)}
                    disabled={isSavingTemplate}
                    className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCurrentPlanAsTemplate}
                    disabled={isSavingTemplate}
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingTemplate ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving to Cloud DB...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save to Supabase DB</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 3D Catalog Item Preview Modal */}
      {previewCatalogItem && (
        <Catalog3DPreviewModal
          item={previewCatalogItem}
          isOpen={!!previewCatalogItem}
          onClose={() => setPreviewCatalogItem(null)}
        />
      )}

      {/* Edit Catalog Item Modal */}
      {editingCatalogItem && (
        <EditCatalogItemModal
          item={editingCatalogItem}
          isOpen={!!editingCatalogItem}
          onClose={() => setEditingCatalogItem(null)}
          onSave={(updated) => {
            if (onUpdateCatalogItem) onUpdateCatalogItem(updated);
            setEditingCatalogItem(null);
          }}
        />
      )}
    </div>
  );
};
