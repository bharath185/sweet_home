'use client';

import React, { useState, useMemo } from 'react';
import {
  Input,
  Collapse,
  Badge,
  Button,
  Tooltip,
  Empty,
  ConfigProvider,
  theme as antdTheme,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  FolderOpenOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import {
  Bed,
  Bath,
  UtensilsCrossed,
  Armchair,
  Car,
  Trees,
  Lightbulb,
  Briefcase,
  DoorOpen,
  Box,
} from 'lucide-react';
import { CatalogItem } from '../types/plan';
import { CatalogThumbnail } from './CatalogThumbnail';

const { Text } = Typography;

interface SweetHomeCatalogTreeProps {
  catalog: CatalogItem[];
  onAddItem: (item: CatalogItem) => void;
  theme?: 'dark' | 'light';
}

interface CategoryDefinition {
  id: string;
  name: string;
  icon: any;
  filterFn: (item: CatalogItem) => boolean;
}

const CATEGORY_DEFS: CategoryDefinition[] = [
  {
    id: 'bedroom',
    name: 'Bedroom',
    icon: Bed,
    filterFn: (item) => {
      const cat = (item.category || '').toLowerCase();
      const nm = item.name.toLowerCase();
      return cat.includes('bed') || nm.includes('bed') || nm.includes('wardrobe') || nm.includes('nightstand') || nm.includes('dresser');
    },
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    icon: Bath,
    filterFn: (item) => {
      const cat = (item.category || '').toLowerCase();
      const nm = item.name.toLowerCase();
      return cat.includes('bath') || nm.includes('bath') || nm.includes('toilet') || nm.includes('sink') || nm.includes('shower') || nm.includes('vanity') || nm.includes('tub');
    },
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: UtensilsCrossed,
    filterFn: (item) => {
      const cat = (item.category || '').toLowerCase();
      const nm = item.name.toLowerCase();
      return cat.includes('kitchen') || cat.includes('dining') || nm.includes('kitchen') || nm.includes('fridge') || nm.includes('cooker') || nm.includes('dining') || nm.includes('cabinet') || nm.includes('stove');
    },
  },
  {
    id: 'living',
    name: 'Living room',
    icon: Armchair,
    filterFn: (item) => {
      const cat = (item.category || '').toLowerCase();
      const nm = item.name.toLowerCase();
      return cat.includes('living') || nm.includes('sofa') || nm.includes('couch') || nm.includes('tv') || nm.includes('coffee table') || nm.includes('armchair') || nm.includes('fireplace');
    },
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    icon: Car,
    filterFn: (item) => {
      const cat = (item.category || '').toLowerCase();
      const nm = item.name.toLowerCase();
      return cat.includes('vehicle') || cat.includes('garage') || nm.includes('car') || nm.includes('sedan') || nm.includes('suv') || nm.includes('truck') || nm.includes('scooter') || nm.includes('bike');
    },
  },
  {
    id: 'garden',
    name: 'Balcony & Garden',
    icon: Trees,
    filterFn: (item) => {
      const cat = (item.category || '').toLowerCase();
      const nm = item.name.toLowerCase();
      return cat.includes('garden') || cat.includes('outdoor') || nm.includes('tree') || nm.includes('plant') || nm.includes('palm') || nm.includes('hedge') || nm.includes('fountain') || nm.includes('pool') || nm.includes('flower');
    },
  },
  {
    id: 'lights',
    name: 'Lights',
    icon: Lightbulb,
    filterFn: (item) => {
      const cat = (item.category || '').toLowerCase();
      const nm = item.name.toLowerCase();
      return cat.includes('light') || nm.includes('lamp') || nm.includes('ceiling') || nm.includes('chandelier') || nm.includes('spotlight') || nm.includes('fan');
    },
  },
  {
    id: 'office',
    name: 'Office',
    icon: Briefcase,
    filterFn: (item) => {
      const cat = (item.category || '').toLowerCase();
      const nm = item.name.toLowerCase();
      return cat.includes('office') || nm.includes('desk') || nm.includes('office chair') || nm.includes('bookshelf') || nm.includes('computer');
    },
  },
  {
    id: 'doors_windows',
    name: 'Doors & Windows',
    icon: DoorOpen,
    filterFn: (item) => {
      const cat = (item.category || '').toLowerCase();
      const nm = item.name.toLowerCase();
      return cat.includes('door') || cat.includes('window') || nm.includes('door') || nm.includes('window');
    },
  },
  {
    id: 'misc',
    name: 'Miscellaneous',
    icon: Box,
    filterFn: (item) => {
      return !['bed', 'bath', 'kitchen', 'living', 'vehicle', 'garden', 'light', 'office', 'door', 'window'].some(k => 
        (item.category || '').toLowerCase().includes(k) || item.name.toLowerCase().includes(k)
      );
    },
  },
];

export const SweetHomeCatalogTree: React.FC<SweetHomeCatalogTreeProps> = ({
  catalog,
  onAddItem,
  theme = 'light',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>(['living', 'bedroom']);
  const isDark = theme === 'dark';

  // Group catalog into categories
  const categorizedItems = useMemo(() => {
    const map = new Map<string, CatalogItem[]>();
    CATEGORY_DEFS.forEach((def) => {
      map.set(def.id, []);
    });

    catalog.forEach((item) => {
      for (const def of CATEGORY_DEFS) {
        if (def.filterFn(item)) {
          map.get(def.id)?.push(item);
          break;
        }
      }
    });

    return map;
  }, [catalog]);

  // Filtered items when searching
  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return catalog.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q))
    );
  }, [catalog, searchQuery]);

  // Handle Drag Start for 2D & 3D canvas drop
  const handleDragStart = (e: React.DragEvent, item: CatalogItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Build Ant Design Collapse items
  const collapseItems = useMemo(() => {
    return CATEGORY_DEFS.map((catDef) => {
      const Icon = catDef.icon;
      const items = categorizedItems.get(catDef.id) || [];

      return {
        key: catDef.id,
        label: (
          <div className="flex items-center justify-between w-full pr-2 select-none">
            <div className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold">{catDef.name}</span>
            </div>
            <Badge
              count={items.length}
              overflowCount={999}
              style={{
                backgroundColor: isDark ? '#334155' : '#e2e8f0',
                color: isDark ? '#cbd5e1' : '#475569',
                fontSize: 10,
                height: 16,
                lineHeight: '16px',
                minWidth: 16,
                padding: '0 4px',
              }}
            />
          </div>
        ),
        children: (
          <div className="space-y-1 py-1">
            {items.length === 0 ? (
              <div className="py-2 text-center text-xs text-slate-400 italic">
                No items in this category
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onClick={() => onAddItem(item)}
                  className={`flex items-center justify-between p-1.5 rounded transition cursor-pointer border ${
                    isDark
                      ? 'bg-slate-900/40 border-slate-800 hover:border-indigo-500 hover:bg-slate-800'
                      : 'bg-white border-slate-200/70 hover:border-indigo-400 hover:bg-indigo-50/40 shadow-2xs'
                  }`}
                  title={`Click or drag to place: ${item.name} (${item.width || 80}×${item.depth || 80}×${item.height || 80}cm)`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <div className="w-7 h-7 rounded shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <CatalogThumbnail icon={item.icon} name={item.name} category={item.category} size={26} />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] font-semibold truncate leading-tight">
                        {item.name}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        {Math.round(item.width || 80)}×{Math.round(item.depth || 80)}×{Math.round(item.height || 80)}cm
                      </div>
                    </div>
                  </div>

                  <Tooltip title="Add to Plan">
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined style={{ fontSize: 10 }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddItem(item);
                      }}
                      style={{
                        width: 22,
                        height: 22,
                        minWidth: 22,
                        padding: 0,
                        backgroundColor: '#4f46e5',
                      }}
                    />
                  </Tooltip>
                </div>
              ))
            )}
          </div>
        ),
      };
    });
  }, [categorizedItems, isDark, onAddItem]);

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
          Collapse: {
            headerPadding: '6px 10px',
            contentPadding: '4px 8px',
          },
        },
      }}
    >
      <div
        className={`flex flex-col h-full select-none font-sans overflow-hidden border-r ${
          isDark ? 'bg-[#0f172a] border-slate-800 text-slate-200' : 'bg-[#fcfdfd] border-slate-300 text-slate-800'
        }`}
      >
        {/* Ant Design Header Bar */}
        <div
          className={`h-8 px-2.5 flex items-center justify-between shrink-0 border-b text-[11px] font-bold ${
            isDark ? 'bg-[#0c1322] border-slate-800 text-slate-300' : 'bg-[#f8fafc] border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <FolderOpenOutlined style={{ color: '#4f46e5' }} />
            <span>Furniture Catalog</span>
            <Badge
              count={catalog.length}
              overflowCount={999}
              style={{
                backgroundColor: isDark ? '#334155' : '#e2e8f0',
                color: isDark ? '#cbd5e1' : '#475569',
                fontSize: 10,
                height: 16,
                lineHeight: '16px',
                minWidth: 16,
                padding: '0 4px',
              }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-normal">Click or Drag</span>
        </div>

        {/* Ant Design Search Input */}
        <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <Input
            size="small"
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search 3D catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            className="w-full text-[11px]"
          />
        </div>

        {/* Catalog Body: Filtered Search Results OR Ant Design Accordion Tree */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredSearchResults !== null ? (
            <div className="p-2 space-y-1">
              {filteredSearchResults.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No 3D elements matched your search"
                  style={{ margin: '24px 0' }}
                />
              ) : (
                filteredSearchResults.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => onAddItem(item)}
                    className={`flex items-center justify-between p-1.5 rounded transition cursor-pointer border ${
                      isDark
                        ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500 hover:bg-slate-800'
                        : 'bg-white border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/40 shadow-2xs'
                    }`}
                    title={`Click or drag to place: ${item.name}`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <div className="w-7 h-7 rounded shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <CatalogThumbnail icon={item.icon} name={item.name} category={item.category} size={26} />
                      </div>
                      <div className="truncate">
                        <div className="text-[11px] font-semibold truncate leading-tight">
                          {item.name}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400">
                          {Math.round(item.width || 80)}×{Math.round(item.depth || 80)}×{Math.round(item.height || 80)}cm
                        </div>
                      </div>
                    </div>

                    <Tooltip title="Add to Plan">
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined style={{ fontSize: 10 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddItem(item);
                        }}
                        style={{
                          width: 22,
                          height: 22,
                          minWidth: 22,
                          padding: 0,
                          backgroundColor: '#4f46e5',
                        }}
                      />
                    </Tooltip>
                  </div>
                ))
              )}
            </div>
          ) : (
            <Collapse
              activeKey={activeCollapseKeys}
              onChange={(keys) => setActiveCollapseKeys(typeof keys === 'string' ? [keys] : keys)}
              size="small"
              bordered={false}
              items={collapseItems}
              style={{
                backgroundColor: 'transparent',
              }}
            />
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};
