'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  Input,
  Button,
  Badge,
  Tag,
  Space,
  Tooltip,
  Popconfirm,
  ConfigProvider,
  theme as antdTheme,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { FurnitureItem } from '../types/plan';
import { CatalogThumbnail } from './CatalogThumbnail';

const { Text } = Typography;

interface SweetHomeFurnitureTableProps {
  furniture: FurnitureItem[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteItem: (id: string) => void;
  collidingItemIds?: Set<string>;
  theme?: 'dark' | 'light';
}

const CATEGORY_TAG_COLORS: Record<string, string> = {
  Bedroom: 'purple',
  Bathroom: 'cyan',
  Kitchen: 'orange',
  'Living room': 'blue',
  Vehicles: 'geekblue',
  'Balcony & Garden': 'green',
  Lights: 'gold',
  Office: 'magenta',
  'Doors & Windows': 'volcano',
};

export const SweetHomeFurnitureTable: React.FC<SweetHomeFurnitureTableProps> = ({
  furniture,
  selectedId,
  onSelectId,
  onToggleVisibility,
  onToggleLock,
  onDeleteItem,
  collidingItemIds = new Set(),
  theme = 'light',
}) => {
  const [search, setSearch] = useState('');
  const isDark = theme === 'dark';

  const filteredFurniture = useMemo(() => {
    if (!search.trim()) return furniture;
    const q = search.toLowerCase();
    return furniture.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.category && f.category.toLowerCase().includes(q))
    );
  }, [furniture, search]);

  const columns: ColumnsType<FurnitureItem> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      ellipsis: true,
      render: (_, record) => {
        const isColliding = collidingItemIds.has(record.id);
        const tagColor = CATEGORY_TAG_COLORS[record.category || ''] || 'default';

        return (
          <Space align="center" size={8} style={{ width: '100%' }}>
            <div className="w-6 h-6 shrink-0 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <CatalogThumbnail icon={record.icon} name={record.name} category={record.category} size={24} />
            </div>
            <div className="flex orientation-col truncate min-w-0" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="flex items-center gap-1.5 truncate">
                <Text
                  strong={selectedId === record.id}
                  className="truncate text-[11px]"
                  style={{ maxWidth: 120 }}
                  title={record.name}
                >
                  {record.name}
                </Text>
                {isColliding && (
                  <Tooltip title="Colliding with another element">
                    <WarningOutlined style={{ color: '#ff4d4f', fontSize: 11 }} />
                  </Tooltip>
                )}
              </div>
              {record.category && (
                <Tag
                  color={tagColor}
                  bordered={false}
                  style={{
                    fontSize: 9,
                    lineHeight: '14px',
                    padding: '0 4px',
                    margin: 0,
                    alignSelf: 'flex-start',
                  }}
                >
                  {record.category}
                </Tag>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'W',
      dataIndex: 'width',
      key: 'width',
      width: 48,
      align: 'right',
      sorter: (a, b) => (a.width || 0) - (b.width || 0),
      render: (val) => (
        <span className="font-mono text-[10px] text-slate-500">
          {Math.round(val || 0)}
        </span>
      ),
    },
    {
      title: 'D',
      dataIndex: 'depth',
      key: 'depth',
      width: 48,
      align: 'right',
      sorter: (a, b) => (a.depth || 0) - (b.depth || 0),
      render: (val) => (
        <span className="font-mono text-[10px] text-slate-500">
          {Math.round(val || 0)}
        </span>
      ),
    },
    {
      title: 'H',
      dataIndex: 'height',
      key: 'height',
      width: 48,
      align: 'right',
      sorter: (a, b) => (a.height || 0) - (b.height || 0),
      render: (val) => (
        <span className="font-mono text-[10px] text-slate-500">
          {Math.round(val || 0)}
        </span>
      ),
    },
    {
      title: 'Vis',
      key: 'visibility',
      width: 40,
      align: 'center',
      render: (_, record) => {
        const isVisible = record.isVisible !== false;
        return (
          <Tooltip title={isVisible ? 'Hide in 2D & 3D' : 'Show in 2D & 3D'}>
            <Button
              type="text"
              size="small"
              icon={
                isVisible ? (
                  <EyeOutlined style={{ color: '#1677ff', fontSize: 13 }} />
                ) : (
                  <EyeInvisibleOutlined style={{ color: '#bfbfbf', fontSize: 13 }} />
                )
              }
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(record.id);
              }}
              style={{ width: 22, height: 22, minWidth: 22, padding: 0 }}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Act',
      key: 'actions',
      width: 52,
      align: 'center',
      render: (_, record) => {
        const isLocked = record.isLocked === true;
        return (
          <Space orientation="horizontal" size={2} onClick={(e) => e.stopPropagation()}>
            <Tooltip title={isLocked ? 'Unlock Position' : 'Lock Position'}>
              <Button
                type="text"
                size="small"
                icon={
                  isLocked ? (
                    <LockOutlined style={{ color: '#faad14', fontSize: 12 }} />
                  ) : (
                    <UnlockOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                  )
                }
                onClick={() => onToggleLock(record.id)}
                style={{ width: 20, height: 20, minWidth: 20, padding: 0 }}
              />
            </Tooltip>

            <Popconfirm
              title="Delete item?"
              description={`Delete ${record.name}?`}
              onConfirm={() => onDeleteItem(record.id)}
              okText="Yes"
              cancelText="No"
              placement="topRight"
            >
              <Tooltip title="Delete (Del)">
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined style={{ fontSize: 12 }} />}
                  style={{ width: 20, height: 20, minWidth: 20, padding: 0 }}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
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
        components: {
          Table: {
            cellPaddingBlockSM: 4,
            cellPaddingInlineSM: 6,
            headerBg: isDark ? '#1e293b' : '#f8fafc',
            headerColor: isDark ? '#94a3b8' : '#475569',
            rowHoverBg: isDark ? '#1e293b80' : '#f1f5f980',
            rowSelectedBg: isDark ? '#312e81' : '#e0e7ff',
            rowSelectedHoverBg: isDark ? '#3730a3' : '#c7d2fe',
          },
        },
      }}
    >
      <div
        className={`flex flex-col h-full select-none font-sans overflow-hidden border-r border-t ${
          isDark ? 'bg-[#0f172a] border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
        }`}
      >
        {/* Ant Design Table Header Bar */}
        <div
          className={`h-8 px-2.5 flex items-center justify-between shrink-0 border-b text-[11px] font-bold ${
            isDark ? 'bg-[#0c1322] border-slate-800 text-slate-300' : 'bg-[#f8fafc] border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <AppstoreOutlined style={{ color: '#4f46e5' }} />
            <span>Furniture List</span>
            <Badge
              count={furniture.length}
              overflowCount={999}
              style={{
                backgroundColor: '#4f46e5',
                fontSize: 10,
                height: 16,
                lineHeight: '16px',
                minWidth: 16,
                padding: '0 4px',
              }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {collidingItemIds.size > 0 && (
              <Badge
                count={`${collidingItemIds.size} Collision`}
                style={{
                  backgroundColor: '#ff4d4f',
                  fontSize: 9,
                  height: 16,
                  lineHeight: '16px',
                  padding: '0 4px',
                }}
              />
            )}
          </div>
        </div>

        {/* Ant Design Quick Filter Search Input */}
        <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <Input
            size="small"
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search placed items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="w-full text-[11px]"
          />
        </div>

        {/* Ant Design Interactive Furniture Data Table */}
        <div className="flex-1 overflow-hidden ant-table-compact-container">
          <Table<FurnitureItem>
            rowKey="id"
            columns={columns}
            dataSource={filteredFurniture}
            pagination={false}
            size="small"
            scroll={{ y: 'calc(100% - 32px)' }}
            onRow={(record) => ({
              onClick: () => onSelectId(record.id),
              className: `cursor-pointer transition-colors ${
                selectedId === record.id ? 'ant-table-row-selected font-semibold' : ''
              }`,
            })}
            locale={{
              emptyText: (
                <div className="py-6 text-center text-xs text-slate-400 italic">
                  No furniture placed on this level. Click or drag items from catalog above.
                </div>
              ),
            }}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};
