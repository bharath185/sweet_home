'use client';

import React, { useState } from 'react';
import {
  Modal,
  ConfigProvider,
  theme as antdTheme,
  Typography,
  Card,
  Badge,
  Button,
  Input,
  Segmented,
  Row,
  Col,
  Space,
  Tag,
  Alert,
} from 'antd';
import {
  Layers,
  Sparkles,
  Building,
  Home,
  Check,
  Plus,
  Minus,
  Maximize2,
  ArrowRight,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { HomePlan, User } from '../types/plan';
import {
  generateCustomHomePlan,
  RoomSelectionState,
  HomePlanWizardConfig,
} from '../services/floorPlanGenerator';
import { referenceLuxuryPlan } from '../services/referencePlans';

const { Title, Text, Paragraph } = Typography;

interface GuidedFloorPlanBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: HomePlan) => void;
  onOpenBlankCanvas: () => void;
  onOpenBlueprintImport?: () => void;
  onOpenShowcaseDemos?: () => void;
  currentUser?: User | null;
  theme?: 'dark' | 'light';
}

export const GuidedFloorPlanBuilderModal: React.FC<GuidedFloorPlanBuilderModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
  onOpenBlankCanvas,
  onOpenBlueprintImport,
  onOpenShowcaseDemos,
  currentUser,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  // Wizard State
  const [projectName, setProjectName] = useState('My Custom Residence');
  const [floorsCount, setFloorsCount] = useState<1 | 2 | 3>(1);
  const [scale, setScale] = useState<'compact' | 'standard' | 'spacious'>('standard');
  const [furnishingMode, setFurnishingMode] = useState<'furnished' | 'shell'>('furnished');

  const [rooms, setRooms] = useState<RoomSelectionState>({
    living: true,
    kitchen: true,
    dining: true,
    masterBed: true,
    guestBedCount: 1,
    bathCount: 2,
    office: true,
    balcony: true,
    utility: false,
    foyer: true,
  });

  if (!isOpen) return null;

  // Toggle boolean room
  const toggleRoom = (key: keyof Omit<RoomSelectionState, 'guestBedCount' | 'bathCount'>) => {
    setRooms((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Adjust counters
  const setBedCount = (delta: number) => {
    setRooms((prev) => ({
      ...prev,
      guestBedCount: Math.max(0, Math.min(3, prev.guestBedCount + delta)),
    }));
  };

  const setBathCount = (delta: number) => {
    setRooms((prev) => ({
      ...prev,
      bathCount: Math.max(1, Math.min(3, prev.bathCount + delta)),
    }));
  };

  // Calculate live summary
  const totalRoomsCount =
    (rooms.living ? 1 : 0) +
    (rooms.kitchen ? 1 : 0) +
    (rooms.dining ? 1 : 0) +
    (rooms.masterBed ? 1 : 0) +
    rooms.guestBedCount +
    rooms.bathCount +
    (rooms.office ? 1 : 0) +
    (rooms.balcony ? 1 : 0);

  const approxArea = Math.round(
    totalRoomsCount *
      (scale === 'compact' ? 14 : scale === 'spacious' ? 24 : 18) *
      (floorsCount === 1 ? 1 : floorsCount * 0.85)
  );

  const handleGenerate = () => {
    const config: HomePlanWizardConfig = {
      projectName: projectName.trim() || 'My Custom Residence',
      floorsCount,
      rooms,
      scale,
      furnishingMode,
      userId: currentUser?.id || 'guest',
    };

    const newPlan = generateCustomHomePlan(config);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('decofrog_demo_chosen', 'true');
    }
    onPlanCreated(newPlan);
    onClose();
  };

  const roomItems = [
    { key: 'living' as const, icon: '🛋️', title: 'Living Room & Lounge', desc: 'Formal reception & seating', checked: rooms.living },
    { key: 'kitchen' as const, icon: '🍳', title: 'Modular Kitchen', desc: 'Arched cabinetry & counter zone', checked: rooms.kitchen },
    { key: 'dining' as const, icon: '🍽️', title: 'Dining Area', desc: 'Table & entertaining space', checked: rooms.dining },
    { key: 'masterBed' as const, icon: '🛏️', title: 'Primary Master Suite', desc: 'Spacious master bedroom', checked: rooms.masterBed },
    { key: 'office' as const, icon: '💼', title: 'Home Office / Study', desc: 'Dedicated workspace zone', checked: rooms.office },
    { key: 'balcony' as const, icon: '🌿', title: 'Balcony & Sun Terrace', desc: 'Outdoor living extension', checked: rooms.balcony },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 12,
          fontFamily: 'inherit',
        },
      }}
    >
      <Modal
        open={isOpen}
        onCancel={onClose}
        width={820}
        centered
        footer={null}
        destroyOnClose
        title={
          <div className="flex items-center gap-3 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                  Tailor Your Home Plan
                </Title>
                <Tag color="indigo" bordered={false} className="font-semibold text-[11px]">
                  Custom Studio Setup
                </Tag>
              </div>
              <Text type="secondary" className="text-xs font-normal">
                Select your floors and desired rooms. We generate a clean architectural layout — you furnish the rest.
              </Text>
            </div>
          </div>
        }
        styles={{
          body: {
            maxHeight: 'calc(85vh - 120px)',
            overflowY: 'auto',
            paddingRight: 6,
          },
        }}
      >
        <div className="space-y-6 pt-3 pb-2">
          {/* Featured 1-Click Layout: Reference 30' x 42' Luxury Residence */}
          <Badge.Ribbon text="100% Reference Match" color="#d97706">
            <Card
              size="small"
              className={`transition-all duration-200 ${
                isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-gradient-to-r from-amber-50/50 via-indigo-50/30 to-slate-50 border-indigo-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shrink-0 border border-amber-500/20">
                    🏛️
                  </div>
                  <div>
                    <Text strong className="text-sm block">
                      30&apos; × 42&apos; Premier Luxury Residence
                    </Text>
                    <Text type="secondary" className="text-xs">
                      Calacatta marble floor, dog-leg stairs, L-sofa, arched kitchen, sedan car &amp; luxury suites.
                    </Text>
                  </div>
                </div>
                <Button
                  type="primary"
                  className="bg-amber-600 hover:bg-amber-500 border-none font-semibold text-xs shrink-0 shadow-sm"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('decofrog_demo_chosen', 'true');
                    }
                    onPlanCreated(referenceLuxuryPlan);
                    onClose();
                  }}
                >
                  Load Reference Plan
                </Button>
              </div>
            </Card>
          </Badge.Ribbon>

          {/* Project Name Input */}
          <div>
            <Text strong className="text-xs uppercase tracking-wider text-slate-500 block mb-1.5">
              Project Title
            </Text>
            <Input
              size="large"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Modern Minimalist Penthouse, Family Villa"
              prefix={<Home className="w-4 h-4 text-slate-400 mr-1.5" />}
              allowClear
            />
          </div>

          {/* STEP 1: How many floors are you planning? */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <Text strong className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                1. How many floors are you planning?
              </Text>
              <Tag color="indigo" bordered={false} className="font-semibold text-xs">
                {floorsCount === 1 ? 'Single Story' : floorsCount === 2 ? 'Two-Story Duplex' : '3-Level Villa'}
              </Tag>
            </div>

            <Row gutter={[12, 12]}>
              {[
                {
                  count: 1 as const,
                  title: '1 Floor',
                  subtitle: 'Single Level / Apartment',
                  icon: Home,
                },
                {
                  count: 2 as const,
                  title: '2 Floors',
                  subtitle: 'Duplex / Family Home',
                  icon: Building,
                  badge: 'Popular',
                },
                {
                  count: 3 as const,
                  title: '3 Floors',
                  subtitle: 'Multi-Level Luxury Villa',
                  icon: Maximize2,
                },
              ].map((f) => {
                const isSelected = floorsCount === f.count;
                const Icon = f.icon;
                const cardNode = (
                  <Card
                    hoverable
                    onClick={() => setFloorsCount(f.count)}
                    className={`cursor-pointer transition-all h-full ${
                      isSelected
                        ? isDark
                          ? 'border-indigo-500 bg-indigo-950/20 shadow-md'
                          : 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                        : isDark
                        ? 'border-slate-800 bg-slate-900/60'
                        : 'border-slate-200 bg-white'
                    }`}
                    styles={{ body: { padding: '14px' } }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : isDark
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <Text strong className="text-sm block">
                        {f.title}
                      </Text>
                      <Text type="secondary" className="text-[11px] block leading-tight mt-0.5">
                        {f.subtitle}
                      </Text>
                    </div>
                  </Card>
                );

                return (
                  <Col span={8} key={f.count}>
                    {f.badge ? (
                      <Badge.Ribbon text={f.badge} color="#4f46e5">
                        {cardNode}
                      </Badge.Ribbon>
                    ) : (
                      cardNode
                    )}
                  </Col>
                );
              })}
            </Row>
          </div>

          {/* STEP 2: What rooms are you planning? */}
          <div>
            <Text strong className="text-xs uppercase tracking-wider text-slate-500 block mb-2.5">
              2. What rooms are you planning? (Rest you can furnish anytime)
            </Text>

            <Row gutter={[10, 10]}>
              {roomItems.map((r) => (
                <Col xs={24} sm={12} key={r.key}>
                  <Card
                    hoverable
                    onClick={() => toggleRoom(r.key)}
                    className={`cursor-pointer transition-all select-none ${
                      r.checked
                        ? isDark
                          ? 'border-indigo-500/80 bg-indigo-950/20'
                          : 'border-indigo-400 bg-indigo-50/40'
                        : isDark
                        ? 'border-slate-800 bg-slate-900/40'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                    styles={{ body: { padding: '10px 14px' } }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg leading-none">{r.icon}</span>
                        <div>
                          <Text strong className="text-xs block">
                            {r.title}
                          </Text>
                          <Text type="secondary" className="text-[10px] block">
                            {r.desc}
                          </Text>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          r.checked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {r.checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}

              {/* Guest Bedrooms Counter */}
              <Col xs={24} sm={12}>
                <Card
                  className={`${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}
                  styles={{ body: { padding: '10px 14px' } }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg leading-none">🛌</span>
                      <div>
                        <Text strong className="text-xs block">
                          Additional Bedrooms
                        </Text>
                        <Text type="secondary" className="text-[10px] block">
                          Guest or children&apos;s rooms
                        </Text>
                      </div>
                    </div>
                    <Space size={6}>
                      <Button
                        size="small"
                        shape="circle"
                        icon={<Minus className="w-3 h-3" />}
                        disabled={rooms.guestBedCount <= 0}
                        onClick={() => setBedCount(-1)}
                      />
                      <Text strong className="w-5 text-center text-xs block text-indigo-600 dark:text-indigo-400">
                        {rooms.guestBedCount}
                      </Text>
                      <Button
                        size="small"
                        shape="circle"
                        icon={<Plus className="w-3 h-3" />}
                        disabled={rooms.guestBedCount >= 3}
                        onClick={() => setBedCount(1)}
                      />
                    </Space>
                  </div>
                </Card>
              </Col>

              {/* Bathrooms Counter */}
              <Col xs={24} sm={12}>
                <Card
                  className={`${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}
                  styles={{ body: { padding: '10px 14px' } }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg leading-none">🚿</span>
                      <div>
                        <Text strong className="text-xs block">
                          Bathrooms & En-suites
                        </Text>
                        <Text type="secondary" className="text-[10px] block">
                          Master &amp; powder baths
                        </Text>
                      </div>
                    </div>
                    <Space size={6}>
                      <Button
                        size="small"
                        shape="circle"
                        icon={<Minus className="w-3 h-3" />}
                        disabled={rooms.bathCount <= 1}
                        onClick={() => setBathCount(-1)}
                      />
                      <Text strong className="w-5 text-center text-xs block text-indigo-600 dark:text-indigo-400">
                        {rooms.bathCount}
                      </Text>
                      <Button
                        size="small"
                        shape="circle"
                        icon={<Plus className="w-3 h-3" />}
                        disabled={rooms.bathCount >= 3}
                        onClick={() => setBathCount(1)}
                      />
                    </Space>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>

          {/* STEP 3: Overall Space Scale */}
          <div>
            <Text strong className="text-xs uppercase tracking-wider text-slate-500 block mb-2">
              3. Desired Home Scale
            </Text>
            <Segmented
              block
              size="large"
              value={scale}
              onChange={(val) => setScale(val as any)}
              options={[
                {
                  value: 'compact',
                  label: (
                    <div className="py-1">
                      <div className="font-semibold text-xs">Cozy / Compact</div>
                      <div className="text-[10px] opacity-75">~75 – 100 m²</div>
                    </div>
                  ),
                },
                {
                  value: 'standard',
                  label: (
                    <div className="py-1">
                      <div className="font-semibold text-xs">Standard Family</div>
                      <div className="text-[10px] opacity-75">~140 – 190 m²</div>
                    </div>
                  ),
                },
                {
                  value: 'spacious',
                  label: (
                    <div className="py-1">
                      <div className="font-semibold text-xs">Spacious / Luxury</div>
                      <div className="text-[10px] opacity-75">~220 – 320 m²</div>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* STEP 4: Pre-Interiors & Customization Option */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Text strong className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                4. Pre-Staged Interiors & Customization
              </Text>
              <Tag color={furnishingMode === 'furnished' ? 'indigo' : 'default'} bordered={false} className="font-semibold text-xs">
                {furnishingMode === 'furnished' ? '✨ Designer Furnished' : 'Architectural Shell'}
              </Tag>
            </div>

            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12}>
                <Card
                  hoverable
                  onClick={() => setFurnishingMode('furnished')}
                  className={`cursor-pointer transition-all h-full ${
                    furnishingMode === 'furnished'
                      ? isDark
                        ? 'border-indigo-500 bg-indigo-950/20'
                        : 'border-indigo-500 bg-indigo-50/50'
                      : isDark
                      ? 'border-slate-800 bg-slate-900/60'
                      : 'border-slate-200 bg-white'
                  }`}
                  styles={{ body: { padding: '14px' } }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Text strong className="text-xs flex items-center gap-1.5">
                      <span>🛋️</span>
                      <span>Curate Designer Interiors (Recommended)</span>
                    </Text>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        furnishingMode === 'furnished'
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {furnishingMode === 'furnished' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                  <Text type="secondary" className="text-[11px] block leading-relaxed">
                    Pre-populates with matched arched cabinetry, sofas, beds, dining sets &amp; fixtures. 100% customizable in 2D &amp; 3D.
                  </Text>
                </Card>
              </Col>

              <Col xs={24} sm={12}>
                <Card
                  hoverable
                  onClick={() => setFurnishingMode('shell')}
                  className={`cursor-pointer transition-all h-full ${
                    furnishingMode === 'shell'
                      ? isDark
                        ? 'border-indigo-500 bg-indigo-950/20'
                        : 'border-indigo-500 bg-indigo-50/50'
                      : isDark
                      ? 'border-slate-800 bg-slate-900/60'
                      : 'border-slate-200 bg-white'
                  }`}
                  styles={{ body: { padding: '14px' } }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Text strong className="text-xs flex items-center gap-1.5">
                      <span>📐</span>
                      <span>Architectural Shell Only</span>
                    </Text>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        furnishingMode === 'shell'
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {furnishingMode === 'shell' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                  <Text type="secondary" className="text-[11px] block leading-relaxed">
                    Generates empty rooms with perimeter walls, doors and windows only, ready for complete manual furniture placement.
                  </Text>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Live Summary Alert */}
          <Alert
            type="info"
            showIcon
            icon={<CheckCircle2 className="w-4 h-4 text-indigo-500" />}
            message={
              <div className="flex items-center justify-between text-xs">
                <span>
                  Configured:{' '}
                  <strong>
                    {floorsCount} {floorsCount === 1 ? 'Floor' : 'Floors'}
                  </strong>{' '}
                  • <strong>{totalRoomsCount} Selected Rooms</strong>
                </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Est. ~{approxArea} m² Envelope
                </span>
              </div>
            }
          />
        </div>

        {/* Footer Actions */}
        <div
          className={`-mx-6 -mb-5 px-6 py-3.5 border-t mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* Quick Alternatives */}
          <Space orientation="horizontal" size={8}>
            <Button
              type="link"
              size="small"
              className="text-xs p-0 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              onClick={() => {
                onOpenBlankCanvas();
                onClose();
              }}
            >
              Start Blank Canvas
            </Button>
            {onOpenShowcaseDemos && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <Button
                  type="link"
                  size="small"
                  className="text-xs p-0 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  onClick={() => {
                    onOpenShowcaseDemos();
                    onClose();
                  }}
                >
                  Showcase Demos
                </Button>
              </>
            )}
          </Space>

          {/* Primary Submit */}
          <Button
            type="primary"
            size="large"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={handleGenerate}
            className="w-full sm:w-auto font-semibold shadow-md shadow-indigo-500/20"
          >
            Create My Custom Floor Plan
          </Button>
        </div>
      </Modal>
    </ConfigProvider>
  );
};
