'use client';

import React, { useState } from 'react';
import {
  Dropdown,
  Segmented,
  Button,
  Tooltip,
  Space,
  Tag,
  ConfigProvider,
  theme as antdTheme,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  AppstoreOutlined,
  SplitCellsOutlined,
  EyeOutlined,
  BorderOutlined,
  CompassOutlined,
  SaveOutlined,
  UploadOutlined,
  PlusOutlined,
  UndoOutlined,
  RedoOutlined,
  DeleteOutlined,
  CameraOutlined,
  ThunderboltOutlined,
  DollarCircleOutlined,
  QuestionCircleOutlined,
  DownOutlined,
  UpOutlined,
  DragOutlined,
  FileTextOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import {
  MousePointer,
  Hand,
  Square,
  DoorOpen,
  Split,
  Compass,
  Ruler,
  Type,
  Magnet,
  Camera,
  Gamepad2,
  Wand2,
  DollarSign,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  FileCode,
} from 'lucide-react';
import { HomePlan } from '../types/plan';
import { ToolMode, CADLayers } from './PlanCanvas2D';
import { APP_NAME } from '../constants/app';
import { exportPlanSvg, exportPlan4kPng, printPlanSheet } from '../services/planExporter';

const { Text } = Typography;

interface SweetHomeRibbonProps {
  plan: HomePlan;
  activeFloor?: number;
  onFloorChange?: (floor: number) => void;
  activeToolMode: ToolMode;
  onSelectToolMode: (mode: ToolMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteSelected?: () => void;
  hasSelection?: boolean;
  onSave: () => void;
  isSaving: boolean;
  onOpenGuidedBuilder: () => void;
  onOpenBlueprintModal: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onExportSvg?: () => void;
  onExportHdImage?: () => void;
  onPrintPlanSheet?: () => void;
  layers?: CADLayers;
  onToggleLayer?: (layerKey: keyof CADLayers) => void;
  onOpenAiStyler: () => void;
  onOpenCostEstimator: () => void;
  studioLayout: 'sweethome' | 'split' | '2d' | '3d' | 'tour';
  onLayoutChange: (layout: 'sweethome' | 'split' | '2d' | '3d' | 'tour') => void;
  cameraMode3D: 'aerial' | 'visitor';
  onToggleCameraMode3D: () => void;
  snapToGrid?: boolean;
  onToggleSnapToGrid?: () => void;
  theme?: 'dark' | 'light';
  onOpenWelcomeGuide?: () => void;
}

export const SweetHomeRibbon: React.FC<SweetHomeRibbonProps> = ({
  plan,
  activeFloor = 0,
  onFloorChange,
  activeToolMode,
  onSelectToolMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onDeleteSelected,
  hasSelection = false,
  onSave,
  isSaving,
  onOpenGuidedBuilder,
  onOpenBlueprintModal,
  onExportJson,
  onImportJson,
  onExportSvg,
  onExportHdImage,
  onPrintPlanSheet,
  layers,
  onToggleLayer,
  onOpenAiStyler,
  onOpenCostEstimator,
  studioLayout,
  onLayoutChange,
  cameraMode3D,
  onToggleCameraMode3D,
  snapToGrid = true,
  onToggleSnapToGrid,
  theme = 'light',
  onOpenWelcomeGuide,
}) => {
  // Default to compact ribbon to maximize viewport area for design
  const [isRibbonCollapsed, setIsRibbonCollapsed] = useState(true);
  const isDark = theme === 'dark';

  // Ant Design Dropdown Menus for Sweet Home 3D
  const fileMenuItems: MenuProps['items'] = [
    {
      key: 'new',
      label: 'New Custom Home Plan (+Create)',
      icon: <PlusOutlined />,
      onClick: onOpenGuidedBuilder,
    },
    {
      key: 'import_scan',
      label: 'Import Blueprint Image Overlay',
      icon: <UploadOutlined />,
      onClick: onOpenBlueprintModal,
    },
    {
      type: 'divider',
    },
    {
      key: 'save',
      label: isSaving ? 'Saving...' : 'Save Plan to Cloud (Ctrl+S)',
      icon: <SaveOutlined />,
      onClick: onSave,
    },
    {
      key: 'export_json',
      label: 'Export Plan as JSON',
      icon: <FileTextOutlined />,
      onClick: onExportJson,
    },
    {
      key: 'import_json',
      label: 'Import Plan from JSON',
      icon: <UploadOutlined />,
      onClick: onImportJson,
    },
  ];

  const editMenuItems: MenuProps['items'] = [
    {
      key: 'undo',
      label: 'Undo (Ctrl+Z)',
      icon: <UndoOutlined />,
      disabled: !canUndo,
      onClick: onUndo,
    },
    {
      key: 'redo',
      label: 'Redo (Ctrl+Y)',
      icon: <RedoOutlined />,
      disabled: !canRedo,
      onClick: onRedo,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete Selected (Del)',
      icon: <DeleteOutlined />,
      disabled: !hasSelection,
      onClick: onDeleteSelected,
      danger: true,
    },
  ];

  const furnitureMenuItems: MenuProps['items'] = [
    {
      key: 'ai_styler',
      label: 'AI Room Interior Styler',
      icon: <ThunderboltOutlined style={{ color: '#ec4899' }} />,
      onClick: onOpenAiStyler,
    },
    {
      key: 'cost_bom',
      label: 'BOM & Cost Estimator',
      icon: <DollarCircleOutlined style={{ color: '#10b981' }} />,
      onClick: onOpenCostEstimator,
    },
  ];

  const planMenuItems: MenuProps['items'] = [
    {
      key: 'draw_wall',
      label: 'Create Walls (W)',
      icon: <Square className="w-3.5 h-3.5" />,
      onClick: () => onSelectToolMode('drawWall'),
    },
    {
      key: 'draw_room',
      label: 'Create Rooms (R)',
      icon: <BorderOutlined />,
      onClick: () => onSelectToolMode('drawRoom'),
    },
    {
      key: 'add_doors',
      label: 'Insert Doors on Wall',
      icon: <DoorOpen className="w-3.5 h-3.5" />,
      onClick: () => onSelectToolMode('door'),
    },
    {
      key: 'add_windows',
      label: 'Insert Windows on Wall',
      icon: <Split className="w-3.5 h-3.5" />,
      onClick: () => onSelectToolMode('window'),
    },
    {
      type: 'divider',
    },
    {
      key: 'snap_toggle',
      label: snapToGrid ? 'Snap to Grid: ON' : 'Snap to Grid: OFF',
      onClick: onToggleSnapToGrid,
    },
  ];

  const view3dMenuItems: MenuProps['items'] = [
    {
      key: 'toggle_orbit',
      label: cameraMode3D === 'aerial' ? 'Current: 3D Aerial Orbit' : 'Switch to Aerial Orbit',
      icon: <EyeOutlined />,
      onClick: () => {
        if (cameraMode3D !== 'aerial') onToggleCameraMode3D();
      },
    },
    {
      key: 'toggle_walk',
      label: cameraMode3D === 'visitor' ? 'Current: First-Person Walk' : 'Switch to Walk Tour',
      icon: <CompassOutlined />,
      onClick: () => {
        if (cameraMode3D !== 'visitor') onToggleCameraMode3D();
      },
    },
  ];

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'export_hd',
      label: 'Export 4K HD Blueprint (PNG)',
      icon: <CameraOutlined style={{ color: '#0284c7' }} />,
      onClick: () => {
        if (onExportHdImage) onExportHdImage();
        else exportPlan4kPng(plan, activeFloor);
      },
    },
    {
      key: 'export_svg',
      label: 'Export Scalable Vector (SVG)',
      icon: <FileImageOutlined style={{ color: '#6366f1' }} />,
      onClick: () => {
        if (onExportSvg) onExportSvg();
        else exportPlanSvg(plan, activeFloor);
      },
    },
    {
      key: 'print_sheet',
      label: 'Print Architectural Sheet',
      icon: <Printer className="w-3.5 h-3.5 text-emerald-600 inline mr-1.5" />,
      onClick: () => {
        if (onPrintPlanSheet) onPrintPlanSheet();
        else printPlanSheet(plan, activeFloor);
      },
    },
    {
      key: 'export_cad_json',
      label: 'Export Plan as CAD JSON',
      icon: <FileTextOutlined />,
      onClick: onExportJson,
    },
    ...(layers && onToggleLayer
      ? [
          { type: 'divider' as const },
          {
            key: 'layers_group',
            label: 'CAD Layers Visibility',
            children: (Object.keys(layers) as (keyof CADLayers)[]).map((k) => ({
              key: `layer_${k}`,
              label: `${layers[k] ? '✓ ' : '✕ '} ${k.charAt(0).toUpperCase() + k.slice(1)}`,
              onClick: () => onToggleLayer(k),
            })),
          },
        ]
      : []),
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#4f46e5',
          fontSize: 11,
          borderRadius: 4,
          paddingXS: 4,
          paddingSM: 6,
        },
      }}
    >
      <div
        className={`flex flex-col shrink-0 select-none border-b transition-colors font-sans ${
          isDark ? 'bg-[#0f172a] border-slate-800 text-slate-200' : 'bg-[#f8fafc] border-slate-300 text-slate-800'
        }`}
      >
        {/* 1. Sweet Home 3D Menu Bar with Ant Design Dropdowns */}
        <div
          className={`h-7 px-2.5 flex items-center justify-between text-[11px] border-b ${
            isDark ? 'bg-[#0b1120] border-slate-800/90 text-slate-300' : 'bg-[#edf2f7] border-slate-300/80 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {/* Brand & Project Document Name */}
            <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
              <span>🏠</span>
              <span className="truncate max-w-[130px] sm:max-w-[200px]" title={plan.name}>
                {plan.name || 'My house.sh3d'}
              </span>
              <span className="text-[10px] text-slate-400 font-normal hidden xl:inline">
                - {APP_NAME} Studio
              </span>
            </div>

            <div className="w-[1px] h-3.5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0" />

            {/* Ant Design Top Dropdown Menus */}
            <Space size={2}>
              <Dropdown menu={{ items: fileMenuItems }} trigger={['click']}>
                <Button type="text" size="small" className="text-[11px] h-6 px-2 text-slate-700 dark:text-slate-300">
                  File
                </Button>
              </Dropdown>

              <Dropdown menu={{ items: editMenuItems }} trigger={['click']}>
                <Button type="text" size="small" className="text-[11px] h-6 px-2 text-slate-700 dark:text-slate-300">
                  Edit
                </Button>
              </Dropdown>

              <Dropdown menu={{ items: furnitureMenuItems }} trigger={['click']}>
                <Button type="text" size="small" className="text-[11px] h-6 px-2 text-slate-700 dark:text-slate-300">
                  Furniture
                </Button>
              </Dropdown>

              <Dropdown menu={{ items: planMenuItems }} trigger={['click']}>
                <Button type="text" size="small" className="text-[11px] h-6 px-2 text-slate-700 dark:text-slate-300">
                  Plan
                </Button>
              </Dropdown>

              <Dropdown menu={{ items: view3dMenuItems }} trigger={['click']}>
                <Button type="text" size="small" className="text-[11px] h-6 px-2 text-slate-700 dark:text-slate-300">
                  3D view
                </Button>
              </Dropdown>

              <Dropdown menu={{ items: exportMenuItems }} trigger={['click']}>
                <Button type="text" size="small" className="text-[11px] h-6 px-2 text-slate-700 dark:text-slate-300 font-medium">
                  Export
                </Button>
              </Dropdown>

              {onOpenWelcomeGuide && (
                <Button
                  type="text"
                  size="small"
                  icon={<QuestionCircleOutlined />}
                  onClick={onOpenWelcomeGuide}
                  className="text-[11px] h-6 px-2 text-indigo-500 font-medium"
                >
                  Help
                </Button>
              )}
            </Space>
          </div>

          {/* Ant Design Segmented Layout Switcher */}
          <div className="flex items-center gap-2">
            <Segmented
              size="small"
              value={studioLayout}
              onChange={(val) => onLayoutChange(val as any)}
              options={[
                {
                  label: <span className="text-[10px] font-semibold">4-Pane</span>,
                  value: 'sweethome',
                  icon: <AppstoreOutlined style={{ fontSize: 11 }} />,
                },
                {
                  label: <span className="text-[10px] font-semibold">Split</span>,
                  value: 'split',
                  icon: <SplitCellsOutlined style={{ fontSize: 11 }} />,
                },
                {
                  label: <span className="text-[10px] font-semibold">3D</span>,
                  value: '3d',
                  icon: <EyeOutlined style={{ fontSize: 11 }} />,
                },
                {
                  label: <span className="text-[10px] font-semibold">2D</span>,
                  value: '2d',
                  icon: <BorderOutlined style={{ fontSize: 11 }} />,
                },
                {
                  label: <span className="text-[10px] font-semibold">Tour</span>,
                  value: 'tour',
                  icon: <CompassOutlined style={{ fontSize: 11 }} />,
                },
              ]}
              style={{
                backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
            />

            {/* Collapse/Expand Ribbon Bar Toggle */}
            <Tooltip title={isRibbonCollapsed ? 'Expand Ribbon Toolbar' : 'Collapse Ribbon Toolbar'}>
              <Button
                type="text"
                size="small"
                icon={isRibbonCollapsed ? <DownOutlined style={{ fontSize: 10 }} /> : <UpOutlined style={{ fontSize: 10 }} />}
                onClick={() => setIsRibbonCollapsed(!isRibbonCollapsed)}
                style={{ width: 22, height: 22, minWidth: 22, padding: 0 }}
              />
            </Tooltip>
          </div>
        </div>

        {/* 2. Ant Design Ribbon Toolbar with Grouped Action Boxes */}
        {!isRibbonCollapsed && (
          <div className="px-2.5 py-1.5 flex items-stretch gap-1.5 overflow-x-auto no-scrollbar">
            {/* GROUP 1: FILE */}
            <div
              className={`flex flex-col items-center justify-between px-2 py-1 rounded border shrink-0 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1">
                <Tooltip title="Create New Custom Plan or Load Template">
                  <Button
                    type="text"
                    size="small"
                    onClick={onOpenGuidedBuilder}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                  >
                    <PlusOutlined style={{ fontSize: 14, color: '#10b981' }} />
                    <span className="text-[9px] font-semibold mt-1">+ Create</span>
                  </Button>
                </Tooltip>

                <Tooltip title="Import Blueprint Scan Overlay or Project CAD">
                  <Button
                    type="text"
                    size="small"
                    onClick={onOpenBlueprintModal}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                  >
                    <UploadOutlined style={{ fontSize: 14, color: '#f59e0b' }} />
                    <span className="text-[9px] font-semibold mt-1">Import</span>
                  </Button>
                </Tooltip>

                <Tooltip title="Save Project (Ctrl+S)">
                  <Button
                    type="text"
                    size="small"
                    onClick={onSave}
                    disabled={isSaving}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                  >
                    <SaveOutlined style={{ fontSize: 14, color: '#4f46e5' }} />
                    <span className="text-[9px] font-semibold mt-1">{isSaving ? 'Saving' : 'Save'}</span>
                  </Button>
                </Tooltip>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">FILE</span>
            </div>

            {/* GROUP 2: DRAW */}
            <div
              className={`flex flex-col items-center justify-between px-2 py-1 rounded border shrink-0 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1">
                <Tooltip title="Create Multi-Segment Walls (W)">
                  <Button
                    type={activeToolMode === 'drawWall' ? 'primary' : 'text'}
                    size="small"
                    onClick={() => onSelectToolMode(activeToolMode === 'drawWall' ? 'select' : 'drawWall')}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                    style={activeToolMode === 'drawWall' ? { backgroundColor: '#4f46e5' } : undefined}
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-semibold mt-1">Walls</span>
                  </Button>
                </Tooltip>

                <Tooltip title="Create Room Polygon (R) - Click points & hit Enter">
                  <Button
                    type={activeToolMode === 'drawRoom' ? 'primary' : 'text'}
                    size="small"
                    onClick={() => onSelectToolMode(activeToolMode === 'drawRoom' ? 'select' : 'drawRoom')}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                    style={activeToolMode === 'drawRoom' ? { backgroundColor: '#4f46e5' } : undefined}
                  >
                    <BorderOutlined style={{ fontSize: 13 }} />
                    <span className="text-[9px] font-semibold mt-1">Rooms</span>
                  </Button>
                </Tooltip>

                <Tooltip title="Insert Architectural Door (Click on wall)">
                  <Button
                    type={activeToolMode === 'door' ? 'primary' : 'text'}
                    size="small"
                    onClick={() => onSelectToolMode(activeToolMode === 'door' ? 'select' : 'door')}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                    style={activeToolMode === 'door' ? { backgroundColor: '#10b981' } : undefined}
                  >
                    <DoorOpen className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-semibold mt-1">Door</span>
                  </Button>
                </Tooltip>

                <Tooltip title="Insert Double-Glazed Window (Click on wall)">
                  <Button
                    type={activeToolMode === 'window' ? 'primary' : 'text'}
                    size="small"
                    onClick={() => onSelectToolMode(activeToolMode === 'window' ? 'select' : 'window')}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                    style={activeToolMode === 'window' ? { backgroundColor: '#06b6d4' } : undefined}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-semibold mt-1">Window</span>
                  </Button>
                </Tooltip>

                <Tooltip title="Insert Staircase Flight">
                  <Button
                    type={activeToolMode === 'stairs' ? 'primary' : 'text'}
                    size="small"
                    onClick={() => onSelectToolMode(activeToolMode === 'stairs' ? 'select' : 'stairs')}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                    style={activeToolMode === 'stairs' ? { backgroundColor: '#d97706' } : undefined}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-semibold mt-1">Stairs</span>
                  </Button>
                </Tooltip>

                <Tooltip title={snapToGrid ? 'Snap to Grid: ON' : 'Snap to Grid: OFF'}>
                  <Button
                    type={snapToGrid ? 'dashed' : 'text'}
                    size="small"
                    onClick={onToggleSnapToGrid}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                    style={snapToGrid ? { borderColor: '#10b981', color: '#10b981' } : undefined}
                  >
                    <Magnet className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-semibold mt-1">Snap</span>
                  </Button>
                </Tooltip>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">DRAW</span>
            </div>

            {/* GROUP 3: MODIFY */}
            <div
              className={`flex flex-col items-center justify-between px-2 py-1 rounded border shrink-0 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1">
                <Tooltip title="Undo (Ctrl+Z)">
                  <Button
                    type="text"
                    size="small"
                    disabled={!canUndo}
                    onClick={onUndo}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                  >
                    <UndoOutlined style={{ fontSize: 13 }} />
                    <span className="text-[9px] font-semibold mt-1">Undo</span>
                  </Button>
                </Tooltip>

                <Tooltip title="Redo (Ctrl+Y)">
                  <Button
                    type="text"
                    size="small"
                    disabled={!canRedo}
                    onClick={onRedo}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                  >
                    <RedoOutlined style={{ fontSize: 13 }} />
                    <span className="text-[9px] font-semibold mt-1">Redo</span>
                  </Button>
                </Tooltip>

                <Tooltip title="Delete Selected Item (Del)">
                  <Button
                    type="text"
                    danger
                    size="small"
                    disabled={!hasSelection}
                    onClick={onDeleteSelected}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                  >
                    <DeleteOutlined style={{ fontSize: 13 }} />
                    <span className="text-[9px] font-semibold mt-1">Delete</span>
                  </Button>
                </Tooltip>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">MODIFY</span>
            </div>

            {/* GROUP 4: NAVIGATE */}
            <div
              className={`flex flex-col items-center justify-between px-2 py-1 rounded border shrink-0 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1">
                <Tooltip title="Select & Move Tool (V)">
                  <Button
                    type={activeToolMode === 'select' ? 'primary' : 'text'}
                    size="small"
                    onClick={() => onSelectToolMode('select')}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                    style={activeToolMode === 'select' ? { backgroundColor: '#4f46e5' } : undefined}
                  >
                    <MousePointer className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-semibold mt-1">Select</span>
                  </Button>
                </Tooltip>

                <Tooltip title="Pan Hand Tool (Hold Space or H)">
                  <Button
                    type={activeToolMode === 'pan' ? 'primary' : 'text'}
                    size="small"
                    onClick={() => onSelectToolMode('pan')}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                    style={activeToolMode === 'pan' ? { backgroundColor: '#4f46e5' } : undefined}
                  >
                    <Hand className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-semibold mt-1">Pan</span>
                  </Button>
                </Tooltip>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">NAVIGATE</span>
            </div>

            {/* GROUP 5: ANNOTATE */}
            <div
              className={`flex flex-col items-center justify-between px-2 py-1 rounded border shrink-0 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1">
                <Tooltip title="Aligned Dimension Line Tool (D)">
                  <Button
                    type={activeToolMode === 'dimension' ? 'primary' : 'text'}
                    size="small"
                    onClick={() => onSelectToolMode('dimension')}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                    style={activeToolMode === 'dimension' ? { backgroundColor: '#4f46e5' } : undefined}
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-semibold mt-1">Dimension</span>
                  </Button>
                </Tooltip>

                <Tooltip title="Add Text Label / Room Note (T)">
                  <Button
                    type={activeToolMode === 'text' ? 'primary' : 'text'}
                    size="small"
                    onClick={() => onSelectToolMode('text')}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                    style={activeToolMode === 'text' ? { backgroundColor: '#4f46e5' } : undefined}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-semibold mt-1">Text</span>
                  </Button>
                </Tooltip>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">ANNOTATE</span>
            </div>

            {/* GROUP 6: EXPORT & LAYERS */}
            <div
              className={`flex flex-col items-center justify-between px-2 py-1 rounded border shrink-0 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1">
                <Dropdown menu={{ items: exportMenuItems }} trigger={['click']}>
                  <Button
                    type="text"
                    size="small"
                    className="flex flex-col items-center justify-center h-10 px-2.5 leading-none cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span className="text-[9px] font-semibold mt-1 flex items-center gap-0.5">
                      Export <DownOutlined style={{ fontSize: 7 }} />
                    </span>
                  </Button>
                </Dropdown>

                <Tooltip title="Print Architectural Blueprint Sheet">
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      if (onPrintPlanSheet) onPrintPlanSheet();
                      else printPlanSheet(plan, activeFloor);
                    }}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="text-[9px] font-semibold mt-1">Print</span>
                  </Button>
                </Tooltip>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">EXPORT</span>
            </div>

            {/* GROUP 7: STUDIO AI */}
            <div
              className={`flex flex-col items-center justify-between px-2 py-1 rounded border shrink-0 ${
                isDark ? 'bg-indigo-950/40 border-indigo-900/70' : 'bg-indigo-50/50 border-indigo-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1">
                <Tooltip title="AI Designer: Transform room themes in 1-click">
                  <Button
                    type="text"
                    size="small"
                    onClick={onOpenAiStyler}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-pink-500" />
                    <span className="text-[9px] font-semibold mt-1 text-pink-600 dark:text-pink-400">AI Styler</span>
                  </Button>
                </Tooltip>

                <Tooltip title="BOM & Cost Estimator: Real-time project cost">
                  <Button
                    type="text"
                    size="small"
                    onClick={onOpenCostEstimator}
                    className="flex flex-col items-center justify-center h-10 px-2 leading-none"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[9px] font-semibold mt-1 text-emerald-600 dark:text-emerald-400">Cost/BOM</span>
                  </Button>
                </Tooltip>
              </div>
              <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-wider">STUDIO AI</span>
            </div>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};
