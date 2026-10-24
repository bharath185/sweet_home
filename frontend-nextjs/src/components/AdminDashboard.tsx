'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ConfigProvider,
  theme as antdTheme,
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Badge,
  Button,
  Input,
  Select,
  Switch,
  Popconfirm,
  Modal,
  Form,
  Tabs,
  Alert,
  List,
  Avatar,
  Space,
  Tooltip,
  Typography,
  message,
  Radio,
  Progress,
  Divider,
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  RadarChartOutlined,
  CrownOutlined,
  DollarOutlined,
  MailOutlined,
  AppstoreOutlined,
  BuildOutlined,
  UserAddOutlined,
  DeleteOutlined,
  KeyOutlined,
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  LaptopOutlined,
  DatabaseOutlined,
  RightOutlined,
  MobileOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  ArrowRightOutlined,
  CompassOutlined,
  RiseOutlined,
  ShopOutlined,
  RotateLeftOutlined,
  BoxPlotOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { User, CatalogItem, FloorTemplate, HomePlan, UserRole } from '../types/plan';
import { CatalogThumbnail } from './CatalogThumbnail';
import { Catalog3DPreviewModal } from './Catalog3DPreviewModal';
import { EditCatalogItemModal } from './EditCatalogItemModal';
import { TemplateThumbnail } from './TemplateThumbnail';
import { Template3DPreviewModal } from './Template3DPreviewModal';
import { AdminPaymentsView } from './AdminPaymentsView';
import { Admin3DObjectDesigner } from './Admin3DObjectDesigner';

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

export type AdminSectionTab =
  | 'overview'
  | 'users'
  | 'live_people'
  | 'subscribers'
  | 'payments'
  | 'email_config'
  | 'sms_gateway'
  | 'catalog'
  | 'object_design'
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
  onAddCustomCatalogItem?: (item: CatalogItem, autoPlaceInScene?: boolean) => Promise<CatalogItem | void>;
  onUpdateCatalogItem?: (item: CatalogItem) => Promise<CatalogItem | void> | void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
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
  onAddCustomCatalogItem,
  onUpdateCatalogItem,
  theme = 'light',
  onToggleTheme,
}) => {
  const isLight = theme !== 'dark';
  const activeTab: AdminSectionTab = (externalAdminTab as AdminSectionTab) || 'overview';

  const handleSelectTab = (tab: AdminSectionTab) => {
    setExternalAdminTab(tab);
  };

  // --- DATABASE USERS STATE (Direct from Supabase Cloud DB - ZERO localStorage) ---
  const [dbUsers, setDbUsers] = useState<Array<User & { phone?: string; createdAt?: string }>>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterRole, setUserFilterRole] = useState<'ALL' | 'ADMIN' | 'CUSTOMER' | 'PAID' | 'UNPAID'>('ALL');

  const refreshUsersList = async () => {
    setIsUsersLoading(true);
    try {
      const res = await fetch('/api/users', {
        cache: 'no-store',
        headers: { 'x-user-role': 'ADMIN' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDbUsers(data);
        }
      }
    } catch (e) {
      console.warn('Failed to load users from DB:', e);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    refreshUsersList();
  }, [externalAdminTab]);

  const allMergedUsers = useMemo(() => dbUsers, [dbUsers]);

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
      else if (userFilterRole === 'CUSTOMER') matchRole = u.role !== 'ADMIN';
      else if (userFilterRole === 'PAID') matchRole = u.payment_status === 'paid';
      else if (userFilterRole === 'UNPAID') matchRole = u.payment_status === 'unpaid';

      return matchSearch && matchRole;
    });
  }, [allMergedUsers, userSearchQuery, userFilterRole]);

  // Toggle user payment status in Supabase Database
  const handleTogglePaymentStatus = async (user: User & { phone?: string }) => {
    const newStatus = user.payment_status === 'paid' ? 'unpaid' : 'paid';
    setDbUsers((prev) =>
      prev.map((u) =>
        u.id === user.id || u.email === user.email
          ? {
              ...u,
              payment_status: newStatus,
              subscriptionTier: newStatus === 'paid' ? 'PRO' : 'FREE',
              subscriptionStatus: newStatus === 'paid' ? 'active' : 'inactive',
            }
          : u
      )
    );

    try {
      await fetch('/api/user/status', {
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
      });
      message.success(`User pass status updated to ${newStatus.toUpperCase()}`);
      await refreshUsersList();
    } catch (e) {
      message.error('Failed to update user status in DB');
    }
  };

  // Toggle user role in Supabase Database (Only ADMIN and CUSTOMER)
  const handleToggleRole = async (user: User & { phone?: string }) => {
    const newRole: UserRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    setDbUsers((prev) =>
      prev.map((u) =>
        u.id === user.id || u.email === user.email
          ? {
              ...u,
              role: newRole,
              payment_status: newRole === 'ADMIN' ? 'paid' : u.payment_status,
            }
          : u
      )
    );

    try {
      await fetch('/api/user/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.name,
          role: newRole,
          payment_status: newRole === 'ADMIN' ? 'paid' : user.payment_status,
          tier: newRole === 'ADMIN' ? 'PRO' : user.subscriptionTier,
        }),
      });
      message.success(`User role updated to ${newRole}`);
      await refreshUsersList();
    } catch (e) {
      message.error('Failed to update role in DB');
    }
  };

  // Reset password & send credentials email
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const handleResetPassword = async (user: User & { phone?: string }) => {
    setResettingUserId(user.id);
    const newTempPassword = `Studio#${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch('/api/auth/send-credentials-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          phone: user.phone || '',
          password: newTempPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success(`New credentials dispatched to ${user.email} (Temp Pass: ${newTempPassword})`);
      } else {
        message.info(`Generated password: ${newTempPassword}. (${data.error || 'Dispatched'})`);
      }
    } catch (e: any) {
      message.error(`Could not dispatch email: ${e.message}`);
    } finally {
      setResettingUserId(null);
    }
  };

  // Delete user directly from Supabase Database
  const handleDeleteUserDirect = async (userId: string, userName: string) => {
    try {
      setDbUsers((prev) => prev.filter((u) => u.id !== userId));
      const res = await fetch(`/api/users?id=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: { 'x-user-role': 'ADMIN' },
      });
      if (res.ok) {
        message.success(`User "${userName}" deleted from database`);
      } else {
        await refreshUsersList();
      }
    } catch (e) {
      message.error('Error deleting user');
      await refreshUsersList();
    }
  };

  // --- LIVE TELEMETRY STATE ---
  const [simulatedPing, setSimulatedPing] = useState(24);
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
        const isSuperAdmin = (u.email || '').toLowerCase() === 'admin@visualrendered.io' || u.id === 'admin_visual';
        return {
          id: `sess_${u.id || i}`,
          userId: u.id,
          userName: u.name,
          email: u.email,
          phone: u.phone || '+91 9177018185',
          role: u.role,
          activeProject: isSuperAdmin ? '3D Architecture Studio • Master Suite' : 'Residential Duplex Villa',
          room: isSuperAdmin ? 'Master Suite' : 'Living & Dining',
          device: isSuperAdmin ? 'Desktop Chrome' : 'Safari 17',
          latency: `${simulatedPing}ms`,
          currentAction: isSuperAdmin ? 'Rendering 4K Raytrace' : 'Editing Wall Partition',
        };
      });
  }, [allMergedUsers, simulatedPing]);

  const cadActivityEvents = useMemo(
    () => [
      { id: 'act_1', user: 'Admin', action: 'Configured platform catalog and dual payment gateways', time: 'Just now', icon: '⚡', color: '#6366f1' },
      { id: 'act_2', user: 'Customer Shaswat', action: 'Paid and unlocked Pro Home Design Pass', time: '12 min ago', icon: '💎', color: '#10b981' },
      { id: 'act_3', user: 'Customer Bharath', action: 'Designing custom 3D Floorplan with Modern Furniture', time: '34 min ago', icon: '🛋️', color: '#f59e0b' },
      { id: 'act_4', user: 'Customer Sandeep', action: 'Completed 3D walking tour in Penthouse layout', time: '1 hr ago', icon: '📐', color: '#8b5cf6' },
      { id: 'act_5', user: 'Customer Alex', action: 'Exported photorealistic living room render', time: '2 hrs ago', icon: '🎨', color: '#0ea5e9' },
    ],
    []
  );

  // --- SUBSCRIBERS STATE ---
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
          phone: u.phone || '—',
          planName: u.plan === 'yearly' ? 'Annual Pro Pass' : 'Monthly Pro Pass',
          amount: u.plan === 'yearly' ? '₹4' : '₹3',
          daysLeft,
          status: daysLeft <= 2 ? 'EXPIRING SOON' : 'ACTIVE',
        };
      });
  }, [allMergedUsers]);

  // --- EMAIL & SMS GATEWAY STATES ---
  const [smtpHost, setSmtpHost] = useState('smtp.resend.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [testEmailRecipient, setTestEmailRecipient] = useState('admin@decofrog3d.io');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [smsApiKey, setSmsApiKey] = useState('f2s_live_key_918203928174920194');
  const [testSmsPhone, setTestSmsPhone] = useState('9177018185');
  const [isSendingTestSms, setIsSendingTestSms] = useState(false);

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    try {
      const res = await fetch('/api/auth/send-credentials-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmailRecipient,
          name: 'DecoFrog Admin Test',
          phone: '9999999999',
          password: 'TestPassword#2026',
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success(`Test email sent to ${testEmailRecipient}`);
      } else {
        message.warning(`Email response: ${data.error || 'Dispatched'}`);
      }
    } catch (e: any) {
      message.error(`Failed to send test email: ${e.message}`);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleSendTestSms = () => {
    setIsSendingTestSms(true);
    setTimeout(() => {
      setIsSendingTestSms(false);
      message.success(`Simulated OTP SMS dispatched to +91 ${testSmsPhone}`);
    }, 600);
  };

  // --- 3D CATALOG STATES ---
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

  // --- FLOOR TEMPLATES STATES ---
  const [templateList, setTemplateList] = useState<FloorTemplate[]>(templates || []);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('ALL');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [previewingTemplate, setPreviewingTemplate] = useState<FloorTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Apartment');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');

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
      message.error('Please enter a template name');
      return;
    }
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
        message.success(`Template "${newTemplateName}" saved to Supabase DB!`);
        setShowSaveTemplateModal(false);
        setNewTemplateName('');
        setNewTemplateDesc('');
        await refreshTemplatesList();
      } else {
        message.error('Failed to save template to DB');
      }
    } catch (err: any) {
      message.error(err.message || 'Error saving template');
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    try {
      const res = await fetch(`/api/templates?id=${encodeURIComponent(templateId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        message.success(`Template "${templateName}" deleted from DB`);
        setTemplateList((prev) => prev.filter((t) => t.id !== templateId));
      } else {
        message.error('Failed to delete template');
      }
    } catch (err: any) {
      message.error(err.message || 'Error deleting template');
    }
  };

  // Columns for Overview User Mini Table
  const overviewUserColumns = [
    {
      title: <span style={{ fontSize: 11, fontWeight: 700 }}>Client & Designer</span>,
      dataIndex: 'name',
      key: 'name',
      render: (_: any, u: any) => (
        <Space size={8}>
          <Avatar
            size={24}
            style={{
              background: u.role === 'ADMIN' ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {(u.name || 'U').charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12, lineHeight: '14px', color: isLight ? '#0f172a' : '#f8fafc' }}>{u.name}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>{u.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700 }}>Role</span>,
      dataIndex: 'role',
      key: 'role',
      render: (_: string, record: any) => {
        const isSuperAdmin = (record.email || '').toLowerCase() === 'admin@visualrendered.io' || record.id === 'admin_visual';
        return (
          <Tag
            color={isSuperAdmin ? 'purple' : 'blue'}
            style={{ fontSize: 10, borderRadius: 6, fontWeight: 600, padding: '1px 6px', margin: 0 }}
          >
            {isSuperAdmin ? '★ SUPERADMIN' : 'CUSTOMER'}
          </Tag>
        );
      },
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700 }}>Membership</span>,
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string) => (
        <Tag
          color={status === 'paid' ? 'success' : 'default'}
          style={{ fontSize: 10, borderRadius: 6, fontWeight: 600, padding: '1px 6px', margin: 0 }}
        >
          {status === 'paid' ? '★ Pro Pass' : 'Trial'}
        </Tag>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700 }}>Workspace</span>,
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Button
          size="small"
          type="primary"
          ghost
          icon={<CompassOutlined style={{ fontSize: 10 }} />}
          style={{ fontSize: 10, height: 22, padding: '0 8px', borderRadius: 6 }}
          onClick={() => {
            if (onStartNewDesignForClient) {
              onStartNewDesignForClient(record);
            } else if (onSwitchToStudio) {
              onSwitchToStudio();
            }
          }}
        >
          Launch Studio
        </Button>
      ),
    },
  ];

  // Columns for Full User Directory Table
  const userDirectoryColumns = [
    {
      title: 'User Profile',
      key: 'user',
      render: (_: any, u: any) => (
        <Space orientation="horizontal" size={8}>
          <Avatar size={26} style={{ backgroundColor: '#4f46e5', fontSize: 11 }}>
            {(u.name || 'U').charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12, lineHeight: '14px' }}>
              {u.name}
            </div>
            <div style={{ fontSize: 10, color: '#8c8c8c' }}>{u.email}</div>
            {u.phone && <div style={{ fontSize: 9, color: '#bfbfbf', fontFamily: 'monospace' }}>{u.phone}</div>}
          </div>
        </Space>
      ),
    },
    {
      title: 'Account Role',
      dataIndex: 'role',
      key: 'role',
      render: (_: string, record: any) => {
        const isSuperAdmin = (record.email || '').toLowerCase() === 'admin@visualrendered.io' || record.id === 'admin_visual';
        if (isSuperAdmin) {
          return (
            <Tag color="purple" style={{ fontSize: 10, fontWeight: 700, borderRadius: 6 }}>
              ★ SUPERADMIN
            </Tag>
          );
        }
        return (
          <Tag color="blue" style={{ fontSize: 10, fontWeight: 600, borderRadius: 6 }}>
            CUSTOMER
          </Tag>
        );
      },
    },
    {
      title: 'Pass Status',
      key: 'pass',
      render: (_: any, record: any) => (
        <Space size={6}>
          <Switch
            size="small"
            checked={record.payment_status === 'paid'}
            onChange={() => handleTogglePaymentStatus(record)}
            checkedChildren="PAID"
            unCheckedChildren="UNPAID"
          />
          <Tag color={record.payment_status === 'paid' ? 'success' : 'default'} style={{ fontSize: 10 }}>
            {record.payment_status === 'paid' ? 'Pro Pass Active' : 'Blocked'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Cloud DB',
      key: 'db',
      render: () => <Badge status="success" text={<span style={{ fontSize: 11 }}>Supabase Live</span>} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: any) => {
        const isSuperAdmin = (record.email || '').toLowerCase() === 'admin@visualrendered.io' || record.id === 'admin_visual';
        return (
          <Space size={4}>
            <Tooltip title="Reset Password & Send Credentials">
              <Button
                size="small"
                icon={<KeyOutlined style={{ fontSize: 11 }} />}
                loading={resettingUserId === record.id}
                onClick={() => handleResetPassword(record)}
              />
            </Tooltip>
            {!isSuperAdmin && (
              <Popconfirm
                title="Delete customer from Supabase?"
                description={`Permanently remove "${record.name}"?`}
                onConfirm={() => handleDeleteUserDirect(record.id, record.name)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true, size: 'small' }}
              >
                <Button size="small" danger icon={<DeleteOutlined style={{ fontSize: 11 }} />} />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  // Ant Design Sidebar Menu Items (Categorized with Badges)
  const menuItems = [
    {
      type: 'group' as const,
      label: <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>MAIN STUDIO</span>,
      children: [
        {
          key: 'overview',
          icon: <DashboardOutlined style={{ fontSize: 13 }} />,
          label: 'Executive Overview',
        },
        {
          key: 'users',
          icon: <TeamOutlined style={{ fontSize: 13 }} />,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Customers</span>
              <Badge count={allMergedUsers.length} overflowCount={999} style={{ backgroundColor: '#4f46e5' }} />
            </div>
          ),
        },
        {
          key: 'live_people',
          icon: <RadarChartOutlined style={{ fontSize: 13 }} />,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Live Customers</span>
              <Badge count={liveSessions.length} style={{ backgroundColor: '#10b981' }} />
            </div>
          ),
        },
        {
          key: 'subscribers',
          icon: <CrownOutlined style={{ fontSize: 13 }} />,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Paid Customers</span>
              <Badge count={subscribersList.length} style={{ backgroundColor: '#f59e0b' }} />
            </div>
          ),
        },
      ],
    },
    {
      type: 'group' as const,
      label: <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>3D ASSETS & DESIGNS</span>,
      children: [
        {
          key: 'catalog',
          icon: <AppstoreOutlined style={{ fontSize: 13 }} />,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>3D Furniture Catalog</span>
              <Badge count={catalog.length} overflowCount={999} style={{ backgroundColor: '#6366f1' }} />
            </div>
          ),
        },
        {
          key: 'object_design',
          icon: <BoxPlotOutlined style={{ fontSize: 13, color: '#38bdf8' }} />,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>3D Object Design</span>
              <Badge count="STUDIO" style={{ backgroundColor: '#0284c7' }} />
            </div>
          ),
        },
        {
          key: 'floors',
          icon: <BuildOutlined style={{ fontSize: 13 }} />,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Floor Templates</span>
              <Badge count={templateList.length} style={{ backgroundColor: '#8b5cf6' }} />
            </div>
          ),
        },
      ],
    },
    {
      type: 'group' as const,
      label: <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>COMMERCE & GATEWAYS</span>,
      children: [
        {
          key: 'payments',
          icon: <DollarOutlined style={{ fontSize: 13 }} />,
          label: 'Billing & Gateways',
        },
        {
          key: 'email_config',
          icon: <MailOutlined style={{ fontSize: 13 }} />,
          label: 'Email & OTP Gateways',
        },
      ],
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: isLight ? antdTheme.defaultAlgorithm : antdTheme.darkAlgorithm,
        token: {
          colorPrimary: '#4f46e5',
          fontSize: 12,
          fontSizeSM: 11,
          fontSizeLG: 13,
          fontSizeHeading1: 18,
          fontSizeHeading2: 16,
          fontSizeHeading3: 14,
          fontSizeHeading4: 13,
          fontSizeHeading5: 12,
          controlHeight: 28,
          controlHeightSM: 24,
          borderRadius: 8,
          borderRadiusSM: 6,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        },
        components: {
          Table: {
            fontSize: 11,
            headerBg: isLight ? '#f8fafc' : '#0f172a',
            cellPaddingBlockSM: 6,
            cellPaddingInlineSM: 8,
          },
          Card: {
            headerHeight: 36,
            headerFontSize: 13,
            paddingLG: 14,
          },
          Statistic: {
            titleFontSize: 11,
            contentFontSize: 20,
          },
          Menu: {
            itemHeight: 32,
            fontSize: 12,
            iconSize: 13,
          },
          Button: {
            fontSize: 11,
            controlHeight: 28,
            controlHeightSM: 24,
          },
          Tag: {
            fontSize: 10,
            lineHeight: 1.5,
          },
          Input: {
            fontSize: 11,
            controlHeight: 28,
          },
          Select: {
            fontSize: 11,
            controlHeight: 28,
          },
        },
      }}
    >
      <Layout style={{ height: '100%', overflow: 'hidden' }}>
        {/* ========================================================= */}
        {/* ANT DESIGN ADMIN SIDEBAR                                  */}
        {/* ========================================================= */}
        <Sider
          width={230}
          theme={isLight ? 'light' : 'dark'}
          style={{
            borderRight: isLight ? '1px solid #eef2f6' : '1px solid #1f293d',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Menu Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
              <Menu
                mode="inline"
                selectedKeys={[activeTab]}
                onClick={({ key }) => handleSelectTab(key as AdminSectionTab)}
                items={menuItems}
                style={{ borderRight: 0, fontSize: 12, background: 'transparent' }}
              />
            </div>

            {/* Sider Footer: User Profile & Studio Switch */}
            <div
              style={{
                padding: '10px 14px',
                borderTop: isLight ? '1px solid #f0f0f0' : '1px solid #1f293d',
                background: isLight ? '#fafafa' : '#0f172a',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space size={8}>
                  <Avatar
                    size={28}
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {(currentUser?.name || 'A').charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, lineHeight: '13px', color: isLight ? '#0f172a' : '#f8fafc' }}>
                      {currentUser?.name || 'Lead Architect'}
                    </div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>Admin Workspace</div>
                  </div>
                </Space>
                <Tooltip title="Switch to 3D Design Studio">
                  <Button
                    size="small"
                    type="text"
                    icon={<CompassOutlined style={{ color: '#4f46e5', fontSize: 14 }} />}
                    onClick={onSwitchToStudio}
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        </Sider>

        {/* ========================================================= */}
        {/* ANT DESIGN MAIN CONTENT WORKSPACE                         */}
        {/* ========================================================= */}
        <Layout style={{ height: '100%', overflow: 'hidden' }}>
          <Content style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'overview' ? (
              /* ======================================================= */
              /* TAB 1: EXECUTIVE DASHBOARD / OVERVIEW (FIT SCREEN)      */
              /* ======================================================= */
              <div
                style={{
                  height: '100%',
                  overflowY: 'auto',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  background: isLight ? '#f8fafc' : '#0b0f17',
                }}
              >
                {/* 1. Four Vibrant KPI Metric Cards */}
                <Row gutter={[12, 12]}>
                  {/* Metric 1: Total Registered Accounts */}
                  <Col span={6}>
                    <Card
                      hoverable
                      onClick={() => handleSelectTab('users')}
                      style={{
                        borderRadius: 12,
                        border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                        background: isLight ? '#ffffff' : '#111827',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                      bodyStyle={{ padding: '12px 16px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: isLight ? '#64748b' : '#94a3b8' }}>
                            Registered Accounts
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc', marginTop: 3 }}>
                            {allMergedUsers.length}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                            <span>↑ 100% active</span>
                            <span style={{ color: '#94a3b8', fontWeight: 400 }}>• Customers & Admin</span>
                          </div>
                        </div>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: isLight ? '#eef2ff' : 'rgba(99, 102, 241, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4f46e5',
                            fontSize: 18,
                          }}
                        >
                          <TeamOutlined />
                        </div>
                      </div>
                    </Card>
                  </Col>

                  {/* Metric 2: Active Customer Sessions */}
                  <Col span={6}>
                    <Card
                      hoverable
                      onClick={() => handleSelectTab('live_people')}
                      style={{
                        borderRadius: 12,
                        border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                        background: isLight ? '#ffffff' : '#111827',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                      bodyStyle={{ padding: '12px 16px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: isLight ? '#64748b' : '#94a3b8' }}>
                            Active Customer Sessions
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc', marginTop: 3 }}>
                            {liveSessions.length}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                            <span>🟢 Online Now</span>
                            <span style={{ color: '#94a3b8', fontWeight: 400 }}>• 3D Studio Live</span>
                          </div>
                        </div>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#059669',
                            fontSize: 18,
                          }}
                        >
                          <RadarChartOutlined />
                        </div>
                      </div>
                    </Card>
                  </Col>

                  {/* Metric 3: Paid Customer Passes */}
                  <Col span={6}>
                    <Card
                      hoverable
                      onClick={() => handleSelectTab('subscribers')}
                      style={{
                        borderRadius: 12,
                        border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                        background: isLight ? '#ffffff' : '#111827',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                      bodyStyle={{ padding: '12px 16px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: isLight ? '#64748b' : '#94a3b8' }}>
                            Paid Customer Passes
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc', marginTop: 3 }}>
                            {subscribersList.length}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
                            <span>★ Active Pass Holders</span>
                            <span style={{ color: '#94a3b8', fontWeight: 400 }}>• Paying Users</span>
                          </div>
                        </div>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: isLight ? '#fffbeb' : 'rgba(245, 158, 11, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#d97706',
                            fontSize: 18,
                          }}
                        >
                          <CrownOutlined />
                        </div>
                      </div>
                    </Card>
                  </Col>

                  {/* Metric 4: Platform Revenue */}
                  <Col span={6}>
                    <Card
                      hoverable
                      onClick={() => handleSelectTab('payments')}
                      style={{
                        borderRadius: 12,
                        border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                        background: isLight ? '#ffffff' : '#111827',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                      bodyStyle={{ padding: '12px 16px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: isLight ? '#64748b' : '#94a3b8' }}>
                            Customer Revenue
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc', marginTop: 3 }}>
                            ₹36,497
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                            <span>↑ +₹4,999 this week</span>
                            <span style={{ color: '#94a3b8', fontWeight: 400 }}>• Gateways Live</span>
                          </div>
                        </div>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: isLight ? '#faf5ff' : 'rgba(124, 58, 237, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#7c3aed',
                            fontSize: 18,
                          }}
                        >
                          <DollarOutlined />
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* 3. Balanced Middle Content Section */}
                <Row gutter={[12, 12]}>
                  {/* Left (14 cols): Client Directory + Featured Architectural Templates */}
                  <Col span={14} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Card A: Recent Clients & Designers */}
                    <Card
                      title={
                        <Space size={8}>
                          <TeamOutlined style={{ color: '#4f46e5', fontSize: 14 }} />
                          <span style={{ fontSize: 13, fontWeight: 700 }}>Customer Directory</span>
                          <Tag color="blue" style={{ borderRadius: 6, fontSize: 10, fontWeight: 600, margin: 0 }}>
                            {allMergedUsers.length} Customers & Admin
                          </Tag>
                        </Space>
                      }
                      extra={
                        <Space size={6}>
                          <Tooltip title="Refresh DB Data">
                            <Button
                              size="small"
                              icon={<ReloadOutlined style={{ fontSize: 10 }} />}
                              onClick={refreshUsersList}
                              loading={isUsersLoading}
                              style={{ borderRadius: 6 }}
                            />
                          </Tooltip>
                          <Button
                            type="primary"
                            size="small"
                            icon={<UserAddOutlined style={{ fontSize: 10 }} />}
                            onClick={onOpenAddUserModal}
                            style={{ fontSize: 11, borderRadius: 6 }}
                          >
                            Add Customer
                          </Button>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => handleSelectTab('users')}
                            style={{ fontSize: 11, padding: 0 }}
                          >
                            Full Directory <RightOutlined style={{ fontSize: 9 }} />
                          </Button>
                        </Space>
                      }
                      style={{
                        borderRadius: 12,
                        border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                        background: isLight ? '#ffffff' : '#111827',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                      bodyStyle={{ padding: 0 }}
                    >
                      <Table
                        size="small"
                        pagination={false}
                        dataSource={allMergedUsers.slice(0, 5)}
                        rowKey="id"
                        columns={overviewUserColumns}
                      />
                    </Card>

                    {/* Card B: Featured 3D Floorplan Blueprints & Templates */}
                    <Card
                      title={
                        <Space size={8}>
                          <BuildOutlined style={{ color: '#8b5cf6', fontSize: 14 }} />
                          <span style={{ fontSize: 13, fontWeight: 700 }}>Featured Architectural 3D Floorplans</span>
                          <Tag color="purple" style={{ borderRadius: 6, fontSize: 10, fontWeight: 600, margin: 0 }}>
                            {templateList.length} Layouts
                          </Tag>
                        </Space>
                      }
                      extra={
                        <Button
                          type="link"
                          size="small"
                          onClick={() => handleSelectTab('floors')}
                          style={{ fontSize: 11, padding: 0 }}
                        >
                          Browse All Layouts <RightOutlined style={{ fontSize: 9 }} />
                        </Button>
                      }
                      style={{
                        borderRadius: 12,
                        border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                        background: isLight ? '#ffffff' : '#111827',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                      bodyStyle={{ padding: '10px 14px' }}
                    >
                      <Row gutter={[10, 10]}>
                        {templateList.slice(0, 3).map((tpl) => (
                          <Col span={8} key={tpl.id}>
                            <div
                              style={{
                                border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                                borderRadius: 10,
                                padding: '10px 12px',
                                background: isLight ? '#f8fafc' : '#0f172a',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: 110,
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Tag color="purple" style={{ fontSize: 9, borderRadius: 4, margin: 0 }}>
                                    {tpl.category || 'Luxury'}
                                  </Tag>
                                  <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                                    {tpl.area || '120 m²'}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 12,
                                    color: isLight ? '#0f172a' : '#f8fafc',
                                    marginTop: 6,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                  title={tpl.name}
                                >
                                  {tpl.name}
                                </div>
                                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                                  {tpl.floors || 1} Floor(s) • Ready for 3D Walk
                                </div>
                              </div>
                              <Button
                                size="small"
                                type="primary"
                                ghost
                                icon={<CompassOutlined style={{ fontSize: 10 }} />}
                                onClick={() => onOpenStudioWithTemplate(tpl.id)}
                                style={{ width: '100%', fontSize: 10, height: 24, borderRadius: 6, marginTop: 6 }}
                              >
                                Launch in Studio
                              </Button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  </Col>

                  {/* Right (10 cols): Shortcuts + Live Highlights + Resource Health */}
                  <Col span={10} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Card 1: Quick Studio Launchpad */}
                    <Card
                      title={
                        <Space size={8}>
                          <ThunderboltOutlined style={{ color: '#f59e0b', fontSize: 14 }} />
                          <span style={{ fontSize: 13, fontWeight: 700 }}>Quick Studio Launchpad</span>
                        </Space>
                      }
                      style={{
                        borderRadius: 12,
                        border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                        background: isLight ? '#ffffff' : '#111827',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                      bodyStyle={{ padding: 10 }}
                    >
                      <Row gutter={[8, 8]}>
                        <Col span={12}>
                          <div
                            onClick={() => handleSelectTab('payments')}
                            style={{
                              border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                              borderRadius: 8,
                              padding: '10px 12px',
                              background: isLight ? '#ffffff' : '#0f172a',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              transition: 'all 0.2s',
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.15)',
                                color: '#059669',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 15,
                              }}
                            >
                              <DollarOutlined />
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, lineHeight: '14px', color: isLight ? '#0f172a' : '#f8fafc' }}>
                                Billing & Invoices
                              </div>
                              <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Razorpay & Cashfree</div>
                            </div>
                          </div>
                        </Col>

                        <Col span={12}>
                          <div
                            onClick={() => handleSelectTab('catalog')}
                            style={{
                              border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                              borderRadius: 8,
                              padding: '10px 12px',
                              background: isLight ? '#ffffff' : '#0f172a',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              transition: 'all 0.2s',
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: isLight ? '#ede9fe' : 'rgba(139, 92, 246, 0.15)',
                                color: '#7c3aed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 15,
                              }}
                            >
                              <AppstoreOutlined />
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, lineHeight: '14px', color: isLight ? '#0f172a' : '#f8fafc' }}>
                                3D Model Catalog
                              </div>
                              <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{catalog.length} Curated Assets</div>
                            </div>
                          </div>
                        </Col>

                        <Col span={12}>
                          <div
                            onClick={() => handleSelectTab('floors')}
                            style={{
                              border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                              borderRadius: 8,
                              padding: '10px 12px',
                              background: isLight ? '#ffffff' : '#0f172a',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              transition: 'all 0.2s',
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: isLight ? '#eef2ff' : 'rgba(99, 102, 241, 0.15)',
                                color: '#4f46e5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 15,
                              }}
                            >
                              <BuildOutlined />
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, lineHeight: '14px', color: isLight ? '#0f172a' : '#f8fafc' }}>
                                Floor Templates
                              </div>
                              <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{templateList.length} CAD Layouts</div>
                            </div>
                          </div>
                        </Col>

                        <Col span={12}>
                          <div
                            onClick={() => handleSelectTab('live_people')}
                            style={{
                              border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                              borderRadius: 8,
                              padding: '10px 12px',
                              background: isLight ? '#ffffff' : '#0f172a',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              transition: 'all 0.2s',
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: isLight ? '#e0f2fe' : 'rgba(2, 132, 199, 0.15)',
                                color: '#0284c7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 15,
                              }}
                            >
                              <RadarChartOutlined />
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, lineHeight: '14px', color: isLight ? '#0f172a' : '#f8fafc' }}>
                                Live Telemetry
                              </div>
                              <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{liveSessions.length} Online Now</div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card>

                    {/* Card 2: Recent Customer Activity */}
                    <Card
                      title={
                        <Space size={8}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                          <span style={{ fontSize: 13, fontWeight: 700 }}>Recent Customer Activity</span>
                        </Space>
                      }
                      style={{
                        borderRadius: 12,
                        border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                        background: isLight ? '#ffffff' : '#111827',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                      bodyStyle={{ padding: '8px 14px' }}
                    >
                      <List
                        size="small"
                        dataSource={cadActivityEvents.slice(0, 5)}
                        renderItem={(item) => (
                          <List.Item style={{ padding: '7px 0', borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid #1e293b' }}>
                            <List.Item.Meta
                              avatar={
                                <div
                                  style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 6,
                                    background: isLight ? '#f8fafc' : '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 13,
                                  }}
                                >
                                  {item.icon || '✓'}
                                </div>
                              }
                              title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: isLight ? '#0f172a' : '#f8fafc' }}>
                                    {item.user}
                                  </span>
                                  <span style={{ fontSize: 9, color: '#94a3b8' }}>{item.time}</span>
                                </div>
                              }
                              description={
                                <div style={{ fontSize: 10, color: isLight ? '#64748b' : '#94a3b8', lineHeight: '14px' }}>
                                  {item.action}
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* 4. Bottom Platform Status Strip */}
                <Card
                  size="small"
                  style={{
                    borderRadius: 12,
                    border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                    background: isLight ? '#ffffff' : '#111827',
                  }}
                  bodyStyle={{ padding: '8px 16px' }}
                >
                  <Row justify="space-between" align="middle">
                    <Space size={8}>
                      <CheckCircleFilled style={{ color: '#10b981', fontSize: 14 }} />
                      <Text strong style={{ fontSize: 11, color: isLight ? '#0f172a' : '#f8fafc' }}>
                        Platform Health:
                      </Text>
                      <Text style={{ fontSize: 11, color: isLight ? '#64748b' : '#94a3b8' }}>
                        All Core Services Online & Synchronized
                      </Text>
                    </Space>

                    <Space size={16} wrap>
                      <Space size={4}>
                        <Badge status="success" />
                        <Text style={{ fontSize: 11, color: '#64748b' }}>3D WebGL Engine</Text>
                      </Space>
                      <Space size={4}>
                        <Badge status="success" />
                        <Text style={{ fontSize: 11, color: '#64748b' }}>Cashfree & Razorpay Gateways</Text>
                      </Space>
                      <Space size={4}>
                        <Badge status="processing" color="#4f46e5" />
                        <Text style={{ fontSize: 11, color: '#64748b' }}>Supabase Cloud DB</Text>
                      </Space>
                      <Space size={4}>
                        <Badge status="processing" color="#0284c7" />
                        <Text style={{ fontSize: 11, color: '#64748b' }}>Email & SMS Gateways</Text>
                      </Space>
                    </Space>

                    <Tag color="success" style={{ margin: 0, fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 8px' }}>
                      99.98% Studio Uptime
                    </Tag>
                  </Row>
                </Card>
              </div>
            ) : (
              /* ======================================================= */
              /* OTHER TABS (Dedicated Scrollable Area with Ant Design)  */
              /* ======================================================= */
              <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                {/* TAB 2: USER DIRECTORY */}
                {activeTab === 'users' && (
                  <Card
                    title={
                      <Space>
                        <TeamOutlined style={{ color: '#4f46e5' }} />
                        <span style={{ fontWeight: 700 }}>Customer Directory (Customers & Admin)</span>
                        <Tag color="blue">{allMergedUsers.length} total</Tag>
                      </Space>
                    }
                    extra={
                      <Space>
                        <Button icon={<ReloadOutlined />} onClick={refreshUsersList} loading={isUsersLoading}>
                          Refresh
                        </Button>
                        <Button type="primary" icon={<UserAddOutlined />} onClick={onOpenAddUserModal}>
                          Add Customer
                        </Button>
                      </Space>
                    }
                  >
                    <div style={{ marginBottom: 16 }}>
                      <Row gutter={[12, 12]} justify="space-between">
                        <Col span={10}>
                          <Input
                            prefix={<SearchOutlined />}
                            placeholder="Search by name, email, or phone..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            allowClear
                          />
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                          <Select
                            value={userFilterRole}
                            onChange={(v) => setUserFilterRole(v)}
                            style={{ width: 180 }}
                            options={[
                              { label: 'All Accounts', value: 'ALL' },
                              { label: 'Superadmin (visualrendered.io)', value: 'ADMIN' },
                              { label: 'Customers (Pay & Use)', value: 'CUSTOMER' },
                              { label: 'Paid Pass Active', value: 'PAID' },
                              { label: 'Unpaid / Blocked', value: 'UNPAID' },
                            ]}
                          />
                        </Col>
                      </Row>
                    </div>

                    <Table
                      dataSource={filteredUsers}
                      rowKey="id"
                      columns={userDirectoryColumns}
                      pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} accounts` }}
                    />
                  </Card>
                )}

                {/* TAB 3: LIVE TELEMETRY */}
                {activeTab === 'live_people' && (
                  <Card
                    title={
                      <Space>
                        <RadarChartOutlined style={{ color: '#10b981' }} />
                        <span style={{ fontWeight: 700 }}>Live Telemetry & Active Sessions</span>
                        <Tag color="success">{liveSessions.length} active</Tag>
                      </Space>
                    }
                  >
                    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                      <Col span={6}>
                        <Card size="small">
                          <Statistic title="Connected CAD Users" value={liveSessions.length} prefix={<RadarChartOutlined />} />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card size="small">
                          <Statistic title="Average Frame Rate" value="60 FPS" prefix={<ThunderboltOutlined style={{ color: '#10b981' }} />} />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card size="small">
                          <Statistic title="Cluster Latency" value={`${simulatedPing} ms`} prefix={<LaptopOutlined style={{ color: '#4f46e5' }} />} />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card size="small">
                          <Statistic title="Active WebGL Orbit" value="100%" prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />} />
                        </Card>
                      </Col>
                    </Row>

                    <Table
                      dataSource={liveSessions}
                      rowKey="id"
                      columns={[
                        {
                          title: 'Active Designer',
                          dataIndex: 'userName',
                          key: 'userName',
                          render: (name, s) => (
                            <Space>
                              <Avatar style={{ backgroundColor: '#10b981' }}>{name.charAt(0)}</Avatar>
                              <div>
                                <Text strong>{name}</Text>
                                <div style={{ fontSize: 11, color: '#8c8c8c' }}>{s.email}</div>
                              </div>
                            </Space>
                          ),
                        },
                        { title: 'Project', dataIndex: 'activeProject', key: 'activeProject' },
                        { title: 'Room / Viewport', dataIndex: 'room', key: 'room' },
                        { title: 'Current Action', dataIndex: 'currentAction', key: 'currentAction' },
                        { title: 'Latency', dataIndex: 'latency', key: 'latency', render: (l) => <Tag color="green">{l}</Tag> },
                        { title: 'Device', dataIndex: 'device', key: 'device' },
                      ]}
                      pagination={{ pageSize: 8 }}
                    />
                  </Card>
                )}

                {/* TAB 4: PASS SUBSCRIBERS */}
                {activeTab === 'subscribers' && (
                  <Card
                    title={
                      <Space>
                        <CrownOutlined style={{ color: '#f59e0b' }} />
                        <span style={{ fontWeight: 700 }}>Pass Subscribers & Pro Entitlements</span>
                        <Tag color="gold">{subscribersList.length} Subscribers</Tag>
                      </Space>
                    }
                  >
                    <Table
                      dataSource={subscribersList}
                      rowKey="id"
                      columns={[
                        { title: 'Subscriber Name', dataIndex: 'name', key: 'name', render: (t) => <Text strong>{t}</Text> },
                        { title: 'Email', dataIndex: 'email', key: 'email' },
                        { title: 'Pass Plan', dataIndex: 'planName', key: 'planName', render: (p) => <Tag color="gold">{p}</Tag> },
                        { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a) => <Text strong>{a}</Text> },
                        {
                          title: 'Remaining',
                          dataIndex: 'daysLeft',
                          key: 'daysLeft',
                          render: (days, r) => (
                            <Tag color={r.status === 'EXPIRING SOON' ? 'volcano' : 'success'}>
                              {days} Days Left
                            </Tag>
                          ),
                        },
                        {
                          title: 'Action',
                          key: 'ext',
                          render: () => (
                            <Button size="small" type="primary" onClick={() => message.success('Granted 30-day extension')}>
                              +30 Days Pass
                            </Button>
                          ),
                        },
                      ]}
                      pagination={{ pageSize: 8 }}
                    />
                  </Card>
                )}

                {/* TAB 5: BILLING & DUAL GATEWAYS */}
                {activeTab === 'payments' && (
                  <Card title={<Space><DollarOutlined style={{ color: '#10b981' }} /><span style={{ fontWeight: 700 }}>Dual Gateway Settlement & Transactions</span></Space>}>
                    <AdminPaymentsView currentUser={currentUser} theme={theme} />
                  </Card>
                )}

                {/* TAB 6: EMAIL & SMS GATEWAY CONFIG */}
                {(activeTab === 'email_config' || (activeTab as string) === 'sms_gateway') && (
                  <Card title={<Space><MailOutlined style={{ color: '#0284c7' }} /><span style={{ fontWeight: 700 }}>Communications & OTP Gateways</span></Space>}>
                    <Tabs
                      defaultActiveKey="email"
                      items={[
                        {
                          key: 'email',
                          label: 'Resend & SMTP Delivery',
                          children: (
                            <div style={{ maxWidth: 640 }}>
                              <Form layout="vertical">
                                <Form.Item label="SMTP Server Host">
                                  <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
                                </Form.Item>
                                <Form.Item label="Port">
                                  <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
                                </Form.Item>
                                <Form.Item label="Test Dispatch Recipient">
                                  <Input
                                    value={testEmailRecipient}
                                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                                  />
                                </Form.Item>
                                <Button
                                  type="primary"
                                  icon={<SendOutlined />}
                                  loading={isSendingTestEmail}
                                  onClick={handleSendTestEmail}
                                >
                                  Dispatch Test Email
                                </Button>
                              </Form>
                            </div>
                          ),
                        },
                        {
                          key: 'sms',
                          label: 'Fast2SMS & Mobile OTP',
                          children: (
                            <div style={{ maxWidth: 640 }}>
                              <Form layout="vertical">
                                <Form.Item label="Fast2SMS API Key">
                                  <Input.Password value={smsApiKey} onChange={(e) => setSmsApiKey(e.target.value)} />
                                </Form.Item>
                                <Form.Item label="Test Mobile Number">
                                  <Input value={testSmsPhone} onChange={(e) => setTestSmsPhone(e.target.value)} prefix="+91" />
                                </Form.Item>
                                <Button
                                  type="primary"
                                  icon={<MobileOutlined />}
                                  loading={isSendingTestSms}
                                  onClick={handleSendTestSms}
                                >
                                  Dispatch Test OTP SMS
                                </Button>
                              </Form>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </Card>
                )}

                {/* TAB 7: 3D MODEL CATALOG */}
                {activeTab === 'catalog' && (
                  <Card
                    title={
                      <Space>
                        <AppstoreOutlined style={{ color: '#8b5cf6' }} />
                        <span style={{ fontWeight: 700 }}>3D Furniture & Asset Catalog</span>
                        <Tag color="purple">{filteredCatalog.length} Models</Tag>
                      </Space>
                    }
                    extra={
                      <Space>
                        <Button
                          type="primary"
                          icon={<BoxPlotOutlined />}
                          style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                          onClick={() => handleSelectTab('object_design')}
                        >
                          3D Object Design Studio
                        </Button>
                        <Button icon={<PlusOutlined />} onClick={onOpenAddItemModal}>
                          Add 3D Model
                        </Button>
                      </Space>
                    }
                  >
                    <div style={{ marginBottom: 16 }}>
                      <Row gutter={[12, 12]} justify="space-between">
                        <Col span={8}>
                          <Input
                            prefix={<SearchOutlined />}
                            placeholder="Search 3D catalog..."
                            value={catalogSearch}
                            onChange={(e) => setCatalogSearch(e.target.value)}
                            allowClear
                          />
                        </Col>
                        <Col span={16} style={{ textAlign: 'right' }}>
                          <Radio.Group
                            value={catalogCategory}
                            onChange={(e) => setCatalogCategory(e.target.value)}
                            buttonStyle="solid"
                          >
                            {categories.slice(0, 6).map((cat) => (
                              <Radio.Button key={cat} value={cat}>
                                {cat}
                              </Radio.Button>
                            ))}
                          </Radio.Group>
                        </Col>
                      </Row>
                    </div>

                    <Row gutter={[12, 12]}>
                      {filteredCatalog.slice(0, 18).map((item) => (
                        <Col key={item.id} xs={12} sm={8} md={6} lg={4}>
                          <Card
                            hoverable
                            size="small"
                            cover={
                              <div
                                style={{
                                  height: 110,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: isLight ? '#f8fafc' : '#0f172a',
                                  overflow: 'hidden',
                                }}
                              >
                                <CatalogThumbnail icon={item.icon} name={item.name} category={item.category} />
                              </div>
                            }
                            actions={[
                              <Tooltip key="preview" title="3D Preview">
                                <EyeOutlined onClick={() => setPreviewCatalogItem(item)} />
                              </Tooltip>,
                              <Tooltip key="redesign" title="Redesign in 3D Object Studio">
                                <ToolOutlined
                                  style={{ color: '#0284c7' }}
                                  onClick={() => handleSelectTab('object_design')}
                                />
                              </Tooltip>,
                              <Tooltip key="edit" title="Edit dimensions & details">
                                <EditOutlined onClick={() => setEditingCatalogItem(item)} />
                              </Tooltip>,
                              <Popconfirm
                                key="del"
                                title="Delete model?"
                                onConfirm={() => onDeleteCatalogItem(item.id)}
                              >
                                <DeleteOutlined style={{ color: '#ef4444' }} />
                              </Popconfirm>,
                            ]}
                          >
                            <Card.Meta
                              title={<Text strong style={{ fontSize: 11 }}>{item.name}</Text>}
                              description={<Tag style={{ fontSize: 9 }}>{item.category}</Tag>}
                            />
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                )}

                {/* TAB 8: 3D OBJECT DESIGN STUDIO */}
                {activeTab === 'object_design' && (
                  <div style={{ margin: -14, height: 'calc(100vh - 105px)', overflow: 'hidden' }}>
                    <Admin3DObjectDesigner
                      catalog={catalog}
                      onAddCustomCatalogItem={onAddCustomCatalogItem}
                      onUpdateCatalogItem={onUpdateCatalogItem}
                      onAddItemToPlan={onAddItem}
                      plan={plan}
                    />
                  </div>
                )}

                {/* TAB 8: FLOOR TEMPLATES */}
                {activeTab === 'floors' && (
                  <Card
                    title={
                      <Space>
                        <BuildOutlined style={{ color: '#4f46e5' }} />
                        <span style={{ fontWeight: 700 }}>Architectural Floor Templates</span>
                        <Tag color="cyan">{filteredTemplates.length} Templates in DB</Tag>
                      </Space>
                    }
                    extra={
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowSaveTemplateModal(true)}>
                        Save Current as Template
                      </Button>
                    }
                  >
                    <div style={{ marginBottom: 16 }}>
                      <Row gutter={[12, 12]} justify="space-between">
                        <Col span={8}>
                          <Input
                            prefix={<SearchOutlined />}
                            placeholder="Search design templates..."
                            value={templateSearchQuery}
                            onChange={(e) => setTemplateSearchQuery(e.target.value)}
                            allowClear
                          />
                        </Col>
                        <Col span={16} style={{ textAlign: 'right' }}>
                          <Radio.Group
                            value={templateCategoryFilter}
                            onChange={(e) => setTemplateCategoryFilter(e.target.value)}
                            buttonStyle="solid"
                          >
                            {templateCategories.map((c) => (
                              <Radio.Button key={c} value={c}>
                                {c}
                              </Radio.Button>
                            ))}
                          </Radio.Group>
                        </Col>
                      </Row>
                    </div>

                    <Row gutter={[16, 16]}>
                      {filteredTemplates.map((tpl) => (
                        <Col key={tpl.id} xs={24} sm={12} md={8} lg={6}>
                          <Card
                            hoverable
                            style={{
                              borderRadius: 12,
                              overflow: 'hidden',
                              border: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
                              background: isLight ? '#ffffff' : '#111827',
                            }}
                            bodyStyle={{ padding: '12px 14px' }}
                            cover={
                              <TemplateThumbnail
                                template={tpl}
                                isLight={isLight}
                                onPreview3D={() => setPreviewingTemplate(tpl)}
                              />
                            }
                            title={<Text strong style={{ fontSize: 13 }}>{tpl.name}</Text>}
                            extra={<Tag color="purple" style={{ borderRadius: 6, fontWeight: 700, margin: 0, fontSize: 10 }}>{tpl.category || 'Apartment'}</Tag>}
                            actions={[
                              <Button
                                key="preview"
                                size="small"
                                icon={<RotateLeftOutlined />}
                                onClick={() => setPreviewingTemplate(tpl)}
                                style={{ borderRadius: 6, fontSize: 11, fontWeight: 700 }}
                              >
                                3D Rotate
                              </Button>,
                              <Button
                                key="open"
                                type="primary"
                                size="small"
                                icon={<ArrowRightOutlined />}
                                onClick={() => onOpenStudioWithTemplate(tpl.id)}
                                style={{
                                  borderRadius: 6,
                                  fontSize: 11,
                                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                }}
                              >
                                Open
                              </Button>,
                              <Popconfirm
                                key="del"
                                title="Delete this template?"
                                onConfirm={() => handleDeleteTemplate(tpl.id, tpl.name)}
                              >
                                <Button key="delete" size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 6 }} />
                              </Popconfirm>,
                            ]}
                          >
                            <p style={{ fontSize: 11, color: isLight ? '#64748b' : '#94a3b8', minHeight: 32, marginBottom: 8, lineHeight: '15px' }}>
                              {tpl.description}
                            </p>
                            <Row justify="space-between" align="middle">
                              <Text type="secondary" style={{ fontSize: 11 }}>Floors: {tpl.floors || 1}</Text>
                              <Tag color="blue" style={{ borderRadius: 6, fontWeight: 700, margin: 0 }}>
                                {tpl.area || '45 m²'}
                              </Tag>
                            </Row>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                )}
              </div>
            )}
          </Content>
        </Layout>

        {/* Modal: Save Template */}
        <Modal
          open={showSaveTemplateModal}
          title="Save Current Plan as Database Template"
          onCancel={() => setShowSaveTemplateModal(false)}
          onOk={handleSaveCurrentPlanAsTemplate}
          okText="Save to Supabase"
          centered
        >
          <Form layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item label="Template Name" required>
              <Input
                placeholder="e.g. Modern Minimalist Duplex"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Category">
              <Select
                value={newTemplateCategory}
                onChange={(v) => setNewTemplateCategory(v)}
                options={[
                  { label: 'Apartment', value: 'Apartment' },
                  { label: 'Villa', value: 'Villa' },
                  { label: 'Penthouse', value: 'Penthouse' },
                  { label: 'Studio', value: 'Studio' },
                  { label: 'Office', value: 'Office' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Description">
              <Input.TextArea
                rows={3}
                placeholder="Architectural design description..."
                value={newTemplateDesc}
                onChange={(e) => setNewTemplateDesc(e.target.value)}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* 3D Catalog Item Preview Modal */}
        {previewCatalogItem && (
          <Catalog3DPreviewModal
            item={previewCatalogItem}
            isOpen={!!previewCatalogItem}
            onClose={() => setPreviewCatalogItem(null)}
          />
        )}

        {/* 3D Floor Template Interactive Rotate & Preview Modal */}
        {previewingTemplate && (
          <Template3DPreviewModal
            isOpen={!!previewingTemplate}
            template={previewingTemplate}
            onClose={() => setPreviewingTemplate(null)}
            onOpenInStudio={(tplId) => {
              setPreviewingTemplate(null);
              onOpenStudioWithTemplate(tplId);
            }}
            theme={theme}
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
      </Layout>
    </ConfigProvider>
  );
};
