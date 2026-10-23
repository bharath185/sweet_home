'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ConfigProvider,
  theme as antdTheme,
  Typography,
  Card,
  Button,
  Row,
  Col,
  Tag,
  Alert,
  Checkbox,
} from 'antd';

const { Title, Text, Paragraph } = Typography;

interface CustomerWelcomeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTemplates: () => void;
  onOpenCatalog: () => void;
  onStartWalkTour: () => void;
  theme?: 'dark' | 'light';
}

export const CustomerWelcomeGuideModal: React.FC<CustomerWelcomeGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenTemplates,
  onOpenCatalog,
  onStartWalkTour,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [dontShowAgain, setDontShowAgain] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('decofrog_tour_completed');
      if (stored === 'false') {
        setDontShowAgain(false);
      } else {
        setDontShowAgain(true);
      }
    }
  }, [isOpen]);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('decofrog_tour_completed', 'true');
      localStorage.setItem('decofrog_welcome_dismissed', 'true');
      localStorage.setItem('decofrog_has_visited', 'true');
    }
    onClose();
  };

  const handleCheckboxChange = (checked: boolean) => {
    setDontShowAgain(checked);
    if (typeof window !== 'undefined') {
      if (checked) {
        localStorage.setItem('decofrog_tour_completed', 'true');
        localStorage.setItem('decofrog_welcome_dismissed', 'true');
      } else {
        localStorage.removeItem('decofrog_tour_completed');
        localStorage.removeItem('decofrog_welcome_dismissed');
      }
    }
  };

  const STEPS = [
    {
      num: 'Step 1',
      title: 'Draw 2D Walls & Rooms',
      desc: 'Use the Wall tool to draw perimeter walls. Closing the loop automatically detects room boundaries and calculates square meters.',
      actionText: 'Choose Template',
      action: () => {
        handleDismiss();
        onOpenTemplates();
      },
    },
    {
      num: 'Step 2',
      title: 'Add & Snap Furniture',
      desc: 'Browse architectural fixtures. Drag items into rooms, customize dimensions, and snap flush to walls.',
      actionText: 'Browse 3D Catalog',
      action: () => {
        handleDismiss();
        onOpenCatalog();
      },
    },
    {
      num: 'Step 3',
      title: 'Switch to Real-Time 3D',
      desc: 'Toggle between Split (2D + 3D) or full 3D Orbit. Walk through your project in first-person view.',
      actionText: 'Start 3D Tour',
      action: () => {
        handleDismiss();
        onStartWalkTour();
      },
    },
    {
      num: 'Step 4',
      title: 'Save & Export Blueprints',
      desc: 'Your project auto-saves locally. Export high-resolution 2D floor plans with dimension stamps or save project backups to JSON anytime.',
      actionText: 'Start Designing',
      action: handleDismiss,
    },
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
        onCancel={handleDismiss}
        footer={null}
        width={680}
        centered
        destroyOnClose
        className="customer-welcome-guide-modal"
        styles={{
          body: {
            padding: 0,
            overflow: 'hidden',
          },
        }}
      >
        {/* Simple, Icon-Free Header */}
        <div
          className={`px-6 py-4 border-b ${
            isDark ? 'border-slate-800 bg-[#0d1527]' : 'border-slate-100 bg-slate-50/70'
          }`}
        >
          <Title level={4} style={{ margin: '0 0 2px 0', fontWeight: 700 }}>
            How to Design Your Dream Home
          </Title>
          <Text type="secondary" className="text-xs">
            Quick 4-step beginner guide • Zero CAD experience required
          </Text>
        </div>

        {/* Content Body */}
        <div className={`p-5 space-y-3.5 ${isDark ? 'bg-[#0a101f]' : 'bg-white'}`}>
          <Row gutter={[12, 12]}>
            {STEPS.map((step, idx) => (
              <Col xs={24} sm={12} key={step.num}>
                <Card
                  hoverable
                  size="small"
                  className={`h-full border transition-all duration-200 flex flex-col justify-between ${
                    isDark
                      ? 'bg-[#10192d] border-slate-800 hover:border-indigo-500/50'
                      : 'bg-slate-50/60 border-slate-200/80 hover:border-indigo-400 hover:shadow-xs'
                  }`}
                  styles={{
                    body: {
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      justifyContent: 'space-between',
                    },
                  }}
                >
                  <div>
                    <Tag
                      color="indigo"
                      bordered={false}
                      className="font-bold text-[10px] uppercase mb-2 px-2 py-0.5"
                    >
                      {step.num}
                    </Tag>
                    <Title level={5} style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600 }}>
                      {step.title}
                    </Title>
                    <Paragraph
                      type="secondary"
                      style={{ fontSize: '11px', lineHeight: 1.5, marginBottom: '12px' }}
                    >
                      {step.desc}
                    </Paragraph>
                  </div>

                  <Button
                    type={idx === 0 || idx === 3 ? 'primary' : 'default'}
                    block
                    onClick={step.action}
                    className="font-medium text-xs h-8 flex items-center justify-center cursor-pointer"
                  >
                    {step.actionText}
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Simple, Icon-Free Quick Alignment Tip Box */}
          <Alert
            type="info"
            showIcon={false}
            className={`border rounded-xl p-3 text-xs ${
              isDark ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-200' : 'bg-indigo-50/60 border-indigo-200 text-slate-700'
            }`}
            message={
              <div>
                <strong className="text-indigo-600 dark:text-indigo-400 mr-1.5">Quick Tip:</strong>
                <span>
                  Select any furniture item to instantly align it flush to a wall or center it in the room using the bottom bar.
                </span>
              </div>
            }
          />
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between gap-4 ${
            isDark ? 'border-slate-800 bg-[#0d1527]' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <Checkbox
            checked={dontShowAgain}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="text-xs select-none"
          >
            Don&apos;t show on startup (Replay anytime via Help)
          </Checkbox>

          <Button
            type="primary"
            size="middle"
            onClick={handleDismiss}
            className="font-semibold text-xs px-5 h-8.5 shadow-sm shadow-indigo-600/20 cursor-pointer"
          >
            Start Designing
          </Button>
        </div>
      </Modal>
    </ConfigProvider>
  );
};
