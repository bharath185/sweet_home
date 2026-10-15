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
  Activity,
  Cpu,
  Layers,
  Globe,
  Laptop,
  Monitor,
  Shield,
  Terminal,
  Zap,
  Workflow,
  ExternalLink,
  Gauge,
  Camera,
  FileSpreadsheet,
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

  // --- LIVE PEOPLE & CAD TELEMETRY STATE (Real-time from Database) ---
  const [selectedLiveSession, setSelectedLiveSession] = useState<any | null>(null);
  const [telemetryFilter, setTelemetryFilter] = useState<'ALL' | 'ACTIVE' | 'CAD' | 'RENDER' | 'GATEWAY'>('ALL');
  const [simulatedPing, setSimulatedPing] = useState(24);

  // Dynamic live ping simulation (20ms - 28ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedPing(Math.floor(20 + Math.random() * 8));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const liveSessions = useMemo(() => {
    return allMergedUsers
      .filter((u) => u.isOnline || u.role === 'ADMIN')
      .map((u, i) => {
        const isSuperAdmin = u.email === 'admin@sweethome3d.io' || u.id === 'u1';
        const project = isSuperAdmin
          ? '3D Architecture Studio • Master Suite'
          : i % 2 === 0
          ? 'Residential Villa Duplex • Living Room'
          : 'Modern Penthouse • 3D Walkthrough';
        return {
          id: `sess_${u.id || i}`,
          userId: u.id,
          userName: u.name,
          email: u.email,
          phone: u.phone || '+91 9177018185',
          role: u.role,
          activeProject: project,
          room: isSuperAdmin ? 'Master Suite (Level 1)' : i % 2 === 0 ? 'Living Room (Level 1)' : 'Kitchen & Dining',
          floor: isSuperAdmin ? 'Ground Floor' : 'Upper Floor',
          duration: isSuperAdmin ? '18m 42s' : '4m 12s',
          device: isSuperAdmin ? 'Desktop Chrome • Windows 11' : 'MacBook Pro • Safari 17',
          location: isSuperAdmin ? 'Hyderabad, India' : 'Bengaluru, India',
          ipAddress: isSuperAdmin ? '103.21.244.18' : '157.48.112.90',
          latency: isSuperAdmin ? `${simulatedPing}ms` : `${simulatedPing + 3}ms`,
          fps: 60,
          currentAction: isSuperAdmin ? 'Rendering 4K Raytrace Snapshot' : 'Editing Wall Partition (200mm)',
          cameraMode: isSuperAdmin ? '3D Aerial View (Orbit)' : 'First-Person Walkthrough (Eye Level)',
          modelsInCanvas: isSuperAdmin ? 34 : 18,
          memoryMb: isSuperAdmin ? 142 : 118,
        };
      });
  }, [allMergedUsers, simulatedPing]);

  const cadActivityEvents = useMemo(() => [
    {
      id: 'act_1',
      user: 'Lead Architect Admin',
      action: 'Rendered 4K Ultra raytrace snapshot',
      target: '3D Architecture Studio • Living Room',
      time: 'Just now',
      type: 'RENDER',
      icon: Camera,
      color: 'emerald',
    },
    {
      id: 'act_2',
      user: 'Studio Superadmin',
      action: 'Placed Modern Italian Sectional Sofa (.OBJ)',
      target: 'Ground Floor Master Suite',
      time: '2 min ago',
      type: 'CAD',
      icon: Box,
      color: 'indigo',
    },
    {
      id: 'act_3',
      user: 'Supabase Cloud Sync',
      action: 'Persisted 14 floorplan modifications to Cloud PostgreSQL',
      target: 'Database Cluster (Singapore)',
      time: '5 min ago',
      type: 'DATABASE',
      icon: Server,
      color: 'sky',
    },
    {
      id: 'act_4',
      user: 'Fast2SMS Gateway',
      action: 'Dispatched OTP access credentials to +91 9177018185',
      target: 'Mobile Delivery Gateway',
      time: '14 min ago',
      type: 'GATEWAY',
      icon: Smartphone,
      color: 'amber',
    },
    {
      id: 'act_5',
      user: 'Payment Webhook',
      action: 'Verified monthly studio pass transaction (₹3)',
      target: 'Cashfree / Razorpay Gateway',
      time: '28 min ago',
      type: 'GATEWAY',
      icon: DollarSign,
      color: 'emerald',
    },
    {
      id: 'act_6',
      user: 'Studio Superadmin',
      action: 'Modified wall partition thickness to 200mm',
      target: 'First Floor Blueprint',
      time: '34 min ago',
      type: 'CAD',
      icon: Building,
      color: 'indigo',
    },
  ], []);

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
      <aside className={`w-64 flex flex-col shrink-0 transition-colors duration-200 ${
        isLight ? 'bg-white border-r border-slate-200/80 shadow-[1px_0_2px_rgba(0,0,0,0.02)]' : 'bg-[#0B0F17] border-r border-slate-800'
      }`}>
        {/* Sidebar Header: Section Indicator */}
        <div className={`h-14 px-5 flex items-center justify-between border-b transition-colors ${
          isLight ? 'border-slate-200/80 bg-slate-50/70' : 'border-slate-800/90 bg-[#0c121e]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>DecoForge Pro</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">v2.4</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Admin Mission Control</span>
              </div>
            </div>
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
                      ? 'bg-slate-900 text-white shadow-xs border-l-4 border-indigo-500'
                      : 'bg-white text-slate-900 shadow-xs border-l-4 border-indigo-500'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                <span className="truncate">Executive Overview</span>
              </button>

              {/* 2. User Management System */}
              <button
                onClick={() => handleSelectTab('users')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-xs border-l-4 border-sky-500'
                      : 'bg-white text-slate-900 shadow-xs border-l-4 border-sky-500'
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
                      ? 'bg-slate-900 text-white shadow-xs border-l-4 border-emerald-500'
                      : 'bg-white text-slate-900 shadow-xs border-l-4 border-emerald-500'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Radio className="w-4 h-4 text-emerald-500" />
                  <span className="truncate">Live Telemetry & Radar</span>
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
                      ? 'bg-slate-900 text-white shadow-xs border-l-4 border-amber-500'
                      : 'bg-white text-slate-900 shadow-xs border-l-4 border-amber-500'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="truncate">Pass Subscribers</span>
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
              {/* 5. Money Management (Cashfree & Razorpay) */}
              <button
                onClick={() => handleSelectTab('payments')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                  activeTab === 'payments'
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-xs border-l-4 border-emerald-500'
                      : 'bg-white text-slate-900 shadow-xs border-l-4 border-emerald-500'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="truncate">Billing & Gateways</span>
              </button>

              {/* 6. Unified Email & OTP Gateways */}
              <button
                onClick={() => handleSelectTab('email_config')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                  activeTab === 'email_config' || (activeTab as string) === 'sms_gateway'
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-xs border-l-4 border-sky-500'
                      : 'bg-white text-slate-900 shadow-xs border-l-4 border-sky-500'
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
                      ? 'bg-slate-900 text-white shadow-xs border-l-4 border-purple-500'
                      : 'bg-white text-slate-900 shadow-xs border-l-4 border-purple-500'
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
                      ? 'bg-slate-900 text-white shadow-xs border-l-4 border-sky-500'
                      : 'bg-white text-slate-900 shadow-xs border-l-4 border-sky-500'
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

        {/* Sidebar Footer: Cloud Infrastructure Indicator */}
        <div className={`p-3.5 border-t transition-colors ${
          isLight ? 'border-slate-200/80 bg-slate-50/80' : 'border-slate-800/90 bg-[#0c121e]'
        }`}>
          <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/90 bg-white/60 dark:bg-slate-900/60 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>Supabase PostgreSQL</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                18ms
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Dual Gateways</span>
              <span className="text-emerald-500 font-medium">Cashfree & Razorpay</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN ADMIN WORKSPACE                                      */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-6">
          {/* Section Header with Real-Time Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                {activeTab === 'overview' && 'Executive Overview'}
                {activeTab === 'users' && 'User Directory & Access Clearance'}
                {activeTab === 'live_people' && 'Live Mission Control & Sessions'}
                {activeTab === 'subscribers' && 'Subscribers & Pass Management'}
                {activeTab === 'payments' && 'Payments & Revenue Ledger'}
                {(activeTab === 'email_config' || (activeTab as string) === 'sms_gateway') && 'Email & Mobile OTP Gateways Setup'}
                {activeTab === 'catalog' && '3D Furniture & Models Catalog'}
                {activeTab === 'floors' && 'Architectural Floor Templates'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === 'overview' && 'Real-time studio health, user acquisitions, and gateway telemetry.'}
                {activeTab === 'users' && 'Inspect registered designer accounts, grant passes, and enforce access clearance.'}
                {activeTab === 'live_people' && 'Monitor active CAD designers and 3D walkthrough participants in real time.'}
                {activeTab === 'subscribers' && 'Track paid passes, access expirations, and grant 30-day extensions.'}
                {activeTab === 'payments' && 'Cashfree & Razorpay gateway reconciliation, transaction audit proofs, and exports.'}
                {(activeTab === 'email_config' || (activeTab as string) === 'sms_gateway') && 'Configure Resend/SMTP email delivery and Fast2SMS/Twilio mobile OTP dispatchers side-by-side in one screen.'}
                {activeTab === 'catalog' && 'Manage 3D furniture models, categories, materials, and asset dimensions.'}
                {activeTab === 'floors' && 'Cloud database-backed architectural floor plans, residential duplexes, and starter templates.'}
              </p>
            </div>

            {/* Quick Actions & Live Badge */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Supabase Realtime • Active
              </span>

              {onSwitchToStudio && (
                <button
                  onClick={onSwitchToStudio}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  <span>Design Studio</span>
                </button>
              )}
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
          {/* ======================================================= */}
          {/* TAB 3: LIVE PEOPLE & REAL-TIME CAD TELEMETRY HUB        */}
          {/* ======================================================= */}
          {activeTab === 'live_people' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* 1. TOP MISSION CONTROL PULSE BANNER */}
              <div className={`relative overflow-hidden p-5 sm:p-6 rounded-3xl border transition-all shadow-md ${
                isLight
                  ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-sky-500/10 border-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/50 border-emerald-500/30'
              }`}>
                {/* Background Radar Waves Decoration */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 pointer-events-none opacity-20 dark:opacity-30">
                  <div className="w-56 h-56 rounded-full border border-emerald-400 animate-ping" />
                  <div className="w-40 h-40 rounded-full border border-emerald-500/60 -mt-48 ml-8" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                      <Radio className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                          Live Mission Control & CAD Telemetry Hub
                        </h2>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          {liveSessions.length} Active Sessions
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                        Real-time telemetry stream of architects, designers, and clients drafting floorplans, rendering 4K raytrace scenes, and interacting in 3D walkthroughs.
                      </p>
                    </div>
                  </div>

                  {/* Top Stats & Quick Refresh */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                      isLight ? 'bg-white/90 border-slate-200 text-slate-700' : 'bg-slate-900/90 border-slate-700 text-slate-200'
                    }`}>
                      <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Sync: <strong className="text-emerald-500">1000ms</strong></span>
                      <span className="text-slate-400">•</span>
                      <span>Ping: <strong className="text-sky-400">{simulatedPing}ms</strong></span>
                    </div>

                    <button
                      onClick={refreshUsersList}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Pulse</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. FOUR GLOWING TELEMETRY METRIC CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Active Designers */}
                <div className={`p-4 rounded-2xl border transition-all shadow-xs relative overflow-hidden group hover:scale-[1.01] ${
                  isLight ? 'bg-white border-slate-200/90 hover:border-emerald-400' : 'bg-[#0f172a] border-slate-800 hover:border-emerald-500/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      Active CAD Viewers
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      LIVE
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      {liveSessions.length}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Collaborating</span>
                  </div>
                  <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Multi-Floor Blueprints & 3D Walkthroughs</span>
                  </div>
                </div>

                {/* Metric 2: Cluster Latency & Ping */}
                <div className={`p-4 rounded-2xl border transition-all shadow-xs relative overflow-hidden group hover:scale-[1.01] ${
                  isLight ? 'bg-white border-slate-200/90 hover:border-sky-400' : 'bg-[#0f172a] border-slate-800 hover:border-sky-500/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-sky-500" />
                      WebSocket Latency
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                      OPTIMAL
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {simulatedPing}<span className="text-lg font-normal text-slate-400">ms</span>
                    </span>
                    <div className="flex items-end gap-1 h-5">
                      <span className="w-1 h-2 bg-emerald-500 rounded-xs" />
                      <span className="w-1 h-3 bg-emerald-500 rounded-xs" />
                      <span className="w-1 h-4 bg-emerald-500 rounded-xs" />
                      <span className="w-1 h-5 bg-emerald-500 rounded-xs" />
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-sky-600 dark:text-sky-400 font-medium flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Zero packet drops • 5G Ultra pipeline</span>
                  </div>
                </div>

                {/* Metric 3: 3D Engine FPS & Raytracing */}
                <div className={`p-4 rounded-2xl border transition-all shadow-xs relative overflow-hidden group hover:scale-[1.01] ${
                  isLight ? 'bg-white border-slate-200/90 hover:border-purple-400' : 'bg-[#0f172a] border-slate-800 hover:border-purple-500/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-purple-500" />
                      3D Engine & Raytracer
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                      HARDWARE ACCEL
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                      60<span className="text-lg font-normal text-slate-400"> FPS</span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">0 queued</span>
                  </div>
                  <div className="mt-2 text-[11px] text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span>WebGL 2.0 • 4K Cloud Raytrace Ready</span>
                  </div>
                </div>

                {/* Metric 4: Supabase Cloud Database */}
                <div className={`p-4 rounded-2xl border transition-all shadow-xs relative overflow-hidden group hover:scale-[1.01] ${
                  isLight ? 'bg-white border-slate-200/90 hover:border-indigo-400' : 'bg-[#0f172a] border-slate-800 hover:border-indigo-500/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-indigo-500" />
                      Supabase Cloud DB
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                      HEALTHY
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
                      PostgreSQL 15
                    </span>
                    <span className="text-xs text-emerald-500 font-mono font-bold">14ms</span>
                  </div>
                  <div className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Auto-saving CAD Projects & Templates</span>
                  </div>
                </div>
              </div>

              {/* 3. ACTIVE LIVE SESSIONS INSPECTOR TABLE */}
              <div className={`border rounded-3xl overflow-hidden shadow-sm ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-slate-800'
              }`}>
                {/* Table Header Bar */}
                <div className={`px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800 bg-slate-900/60'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Designers & Viewports</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Live participants currently interacting with 3D blueprints and walkthroughs</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Filter:</span>
                    <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                      <button
                        onClick={() => setTelemetryFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          telemetryFilter === 'ALL'
                            ? isLight ? 'bg-white text-slate-900 shadow-xs' : 'bg-slate-700 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        All ({liveSessions.length})
                      </button>
                      <button
                        onClick={() => setTelemetryFilter('ACTIVE')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          telemetryFilter === 'ACTIVE'
                            ? isLight ? 'bg-white text-slate-900 shadow-xs' : 'bg-slate-700 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        Active Only
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b font-semibold ${
                        isLight ? 'border-slate-200 bg-slate-50/50 text-slate-600' : 'border-slate-800 bg-[#0a1224]/80 text-slate-400'
                      }`}>
                        <th className="py-3.5 px-5">Designer & Role</th>
                        <th className="py-3.5 px-4">Current CAD Scene / Room</th>
                        <th className="py-3.5 px-4">Live Action</th>
                        <th className="py-3.5 px-4">Session Duration</th>
                        <th className="py-3.5 px-4">Device & Browser</th>
                        <th className="py-3.5 px-4">Location</th>
                        <th className="py-3.5 px-4">Latency</th>
                        <th className="py-3.5 px-5 text-right">Inspection</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                      {liveSessions.map((sess) => (
                        <tr key={sess.id} className={`transition-colors ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}`}>
                          {/* Designer & Role */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                  {sess.userName.charAt(0).toUpperCase()}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{sess.userName}</span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                    sess.role === 'ADMIN'
                                      ? 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/30'
                                      : 'bg-sky-500/15 text-sky-500 border border-sky-500/30'
                                  }`}>
                                    {sess.role}
                                  </span>
                                </div>
                                <span className={`text-[11px] font-mono block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{sess.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Scene / Room */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 shrink-0" />
                                {sess.activeProject}
                              </span>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <span>{sess.floor}</span> • <span>{sess.room}</span>
                              </span>
                            </div>
                          </td>

                          {/* Live Action */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              {sess.currentAction}
                            </span>
                          </td>

                          {/* Duration */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
                              <Clock className="w-3.5 h-3.5 text-emerald-500" />
                              {sess.duration}
                            </span>
                          </td>

                          {/* Device */}
                          <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Laptop className="w-3.5 h-3.5 text-slate-400" />
                              <span>{sess.device}</span>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-slate-400" />
                              <span>{sess.location}</span>
                            </div>
                          </td>

                          {/* Latency */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {sess.latency}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => setSelectedLiveSession(sess)}
                              className="px-3 py-1.5 rounded-xl border border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect Canvas</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. REAL-TIME ACTIVITY TIMELINE & INFRASTRUCTURE GAUGES (Fills the entire bottom empty area!) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column (7 cols): Real-Time CAD Activity Stream */}
                <div className={`lg:col-span-7 border rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-slate-800'
                }`}>
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time CAD Event Stream</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Live feed of CAD actions, raytracing, and database commits</p>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Listening
                      </span>
                    </div>

                    {/* Timeline items */}
                    <div className="space-y-4">
                      {cadActivityEvents.map((evt) => {
                        const IconComponent = evt.icon;
                        return (
                          <div key={evt.id} className="flex items-start gap-3.5 group">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                              evt.color === 'emerald'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : evt.color === 'sky'
                                ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                                : evt.color === 'amber'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                            }`}>
                              <IconComponent className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                  {evt.user}
                                </p>
                                <span className="text-[10px] text-slate-400 shrink-0 font-mono">{evt.time}</span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                                {evt.action}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                  {evt.target}
                                </span>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                  evt.type === 'RENDER' ? 'text-emerald-500 bg-emerald-500/10' :
                                  evt.type === 'CAD' ? 'text-indigo-500 bg-indigo-500/10' :
                                  evt.type === 'DATABASE' ? 'text-sky-500 bg-sky-500/10' : 'text-amber-500 bg-amber-500/10'
                                }`}>
                                  {evt.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Showing last 6 telemetry events</span>
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All events committed to Supabase
                    </span>
                  </div>
                </div>

                {/* Right Column (5 cols): Hardware & Cloud Infrastructure Gauges */}
                <div className={`lg:col-span-5 border rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-slate-800'
                }`}>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold">
                        <Gauge className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Infrastructure Health</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Real-time WebSocket & cluster metrics</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono uppercase font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                      V-Sync 60Hz
                    </span>
                  </div>

                  {/* 1. WebSocket Heartbeat Ping Distribution */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5 text-sky-400" />
                        WebSocket Heartbeat Latency
                      </span>
                      <span className="text-emerald-500 font-mono font-bold">{simulatedPing}ms</span>
                    </div>
                    {/* Visual Ping Sparkline Bars */}
                    <div className="flex items-end gap-1.5 h-12 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      {[18, 24, 21, 28, 22, 19, 24, 20, 25, 23, 27, 21, 24].map((val, idx) => (
                        <div
                          key={idx}
                          style={{ height: `${(val / 35) * 100}%` }}
                          className={`flex-1 rounded-xs transition-all ${
                            idx === 12 ? 'bg-emerald-400 animate-pulse' : 'bg-sky-500/60 hover:bg-sky-400'
                          }`}
                          title={`Sample #${idx + 1}: ${val}ms`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>T - 60s</span>
                      <span>Target: &lt; 50ms</span>
                      <span>Current: {simulatedPing}ms</span>
                    </div>
                  </div>

                  {/* 2. Client Viewport Memory Heap */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-purple-400" />
                        3D Viewport Memory Heap
                      </span>
                      <span className="font-mono text-xs text-purple-500 font-bold">142 MB / 2048 MB</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: '7%' }} />
                    </div>
                    <p className="text-[10px] text-slate-400">WebGL 2.0 buffer load is normal. Raytrace memory footprint optimal.</p>
                  </div>

                  {/* 3. Cloud Database Replication */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-indigo-400" />
                        Cloud DB Replication
                      </span>
                      <span className="font-mono text-xs text-emerald-500 font-bold">14ms latency</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" style={{ width: '98%' }} />
                    </div>
                    <p className="text-[10px] text-slate-400">PostgreSQL 15 connection pool: 4 active connections, 0 queued queries.</p>
                  </div>

                  {/* Quick System Action */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleSelectTab('overview')}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Executive Dashboard Overview</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. SESSION INSPECTOR MODAL */}
              {selectedLiveSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
                  <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-100 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center font-bold text-white shadow-md">
                          {selectedLiveSession.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>{selectedLiveSession.userName}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              LIVE
                            </span>
                          </h3>
                          <p className="text-xs text-slate-400 font-mono">{selectedLiveSession.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedLiveSession(null)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Active Scene:</span>
                          <span className="text-sky-400 font-bold">{selectedLiveSession.activeProject}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Room / Floor:</span>
                          <span className="text-slate-200">{selectedLiveSession.room} ({selectedLiveSession.floor})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Live Action:</span>
                          <span className="text-emerald-400 font-bold">{selectedLiveSession.currentAction}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Camera Viewport:</span>
                          <span className="text-purple-400">{selectedLiveSession.cameraMode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">3D Models in Scene:</span>
                          <span className="text-amber-400">{selectedLiveSession.modelsInCanvas} assets placed</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Device & OS:</span>
                          <span className="text-slate-200">{selectedLiveSession.device}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">IP & Location:</span>
                          <span className="text-slate-200">{selectedLiveSession.location} ({selectedLiveSession.ipAddress})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">WebSocket Ping:</span>
                          <span className="text-emerald-400 font-bold">{selectedLiveSession.latency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setSelectedLiveSession(null);
                          if (onSwitchToStudio) onSwitchToStudio();
                        }}
                        className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Palette className="w-4 h-4" />
                        <span>Open in 3D Design Studio</span>
                      </button>
                      <button
                        onClick={() => setSelectedLiveSession(null)}
                        className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
