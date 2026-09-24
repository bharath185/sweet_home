'use client';

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  FileSpreadsheet,
  Printer,
  Download,
  X,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  Package,
  Building,
  HelpCircle,
} from 'lucide-react';
import { HomePlan, FurnitureItem, Wall, Room } from '../types/plan';

interface CostEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: HomePlan;
  activeFloor?: number;
  onUpgradePrompt?: (featureName: string) => void;
  isPro?: boolean;
}

// Localized benchmark pricing per item category in INR (₹)
const DEFAULT_UNIT_COSTS: { [category: string]: number } = {
  Living: 65000,
  Bedroom: 75000,
  Kitchen: 180000,
  Dining: 45000,
  Office: 35000,
  Bathroom: 55000,
  Lighting: 6500,
  'Doors & Windows': 25000,
  Outdoor: 18000,
  Decor: 3500,
  default: 15000,
};

export const CURRENCY_CONFIG: { [symbol: string]: { label: string; rateFromInr: number; locale: string } } = {
  '₹': { label: 'INR (₹)', rateFromInr: 1.0, locale: 'en-IN' },
  '$': { label: 'USD ($)', rateFromInr: 0.012, locale: 'en-US' },
  '€': { label: 'EUR (€)', rateFromInr: 0.011, locale: 'de-DE' },
  '£': { label: 'GBP (£)', rateFromInr: 0.0095, locale: 'en-GB' },
  'AED': { label: 'AED (د.إ)', rateFromInr: 0.044, locale: 'en-AE' },
};

const WALL_COST_PER_METER = 2400; // ₹2,400 per linear meter partition/masonry
const FLOOR_FINISH_PER_SQM = 1500; // ₹1,500 per sq meter flooring finish

export const CostEstimatorModal: React.FC<CostEstimatorModalProps> = ({
  isOpen,
  onClose,
  plan,
  activeFloor = 0,
  onUpgradePrompt,
  isPro = true,
}) => {
  const [filterFloor, setFilterFloor] = useState<number | 'all'>('all');
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹');
  const [laborTaxRate, setLaborTaxRate] = useState<number>(10); // 10% installation/tax buffer
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formatPrice = (amountInInr: number) => {
    const cfg = CURRENCY_CONFIG[currencySymbol] || CURRENCY_CONFIG['₹'];
    const converted = Math.round(amountInInr * cfg.rateFromInr);
    return `${currencySymbol}${converted.toLocaleString(cfg.locale)}`;
  };

  // 1. Group furniture items & compute quantities
  const furnitureSummary = useMemo(() => {
    const items = plan.furniture.filter((f) => {
      if (filterFloor !== 'all' && (f.floorLevel ?? 0) !== filterFloor) return false;
      if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    const groups: { [key: string]: { item: FurnitureItem; count: number; totalCost: number } } = {};
    items.forEach((f) => {
      const key = `${f.name}_${f.width}x${f.depth}`;
      const unitPrice = DEFAULT_UNIT_COSTS[f.category] || DEFAULT_UNIT_COSTS.default;
      if (!groups[key]) {
        groups[key] = {
          item: f,
          count: 1,
          totalCost: unitPrice,
        };
      } else {
        groups[key].count += 1;
        groups[key].totalCost += unitPrice;
      }
    });

    return Object.values(groups);
  }, [plan.furniture, filterFloor, searchQuery]);

  // 2. Compute Architectural metrics (Walls length, Room area)
  const architecturalSummary = useMemo(() => {
    // Walls
    const activeWalls = plan.walls.filter((w) =>
      filterFloor === 'all' ? true : (w.floorLevel ?? 0) === filterFloor
    );
    let totalWallLengthM = 0;
    activeWalls.forEach((w) => {
      const lenCm = Math.hypot(w.xEnd - w.xStart, w.yEnd - w.yStart);
      totalWallLengthM += lenCm / 100;
    });

    // Rooms area
    const activeRooms = plan.rooms.filter((r) =>
      filterFloor === 'all' ? true : (r.floorLevel ?? 0) === filterFloor
    );
    let totalRoomAreaSqm = 0;
    activeRooms.forEach((r) => {
      if (r.areaSquareMeters) {
        totalRoomAreaSqm += r.areaSquareMeters;
      } else if (r.points.length >= 3) {
        // Shoelace formula in meters
        let a = 0;
        for (let i = 0; i < r.points.length; i++) {
          const j = (i + 1) % r.points.length;
          a += (r.points[i].x / 100) * (r.points[j].y / 100);
          a -= (r.points[j].x / 100) * (r.points[i].y / 100);
        }
        totalRoomAreaSqm += Math.abs(a) / 2;
      }
    });

    const wallTotalCost = Math.round(totalWallLengthM * WALL_COST_PER_METER);
    const floorTotalCost = Math.round(totalRoomAreaSqm * FLOOR_FINISH_PER_SQM);

    return {
      wallLengthM: Math.round(totalWallLengthM * 10) / 10,
      wallTotalCost,
      roomAreaSqm: Math.round(totalRoomAreaSqm * 10) / 10,
      floorTotalCost,
      totalArchCost: wallTotalCost + floorTotalCost,
    };
  }, [plan.walls, plan.rooms, filterFloor]);

  // 3. Totals
  const furnitureSubtotal = useMemo(() => {
    return furnitureSummary.reduce((acc, row) => acc + row.totalCost, 0);
  }, [furnitureSummary]);

  const rawSubtotal = furnitureSubtotal + architecturalSummary.totalArchCost;
  const taxLaborEstimate = Math.round(rawSubtotal * (laborTaxRate / 100));
  const grandTotal = rawSubtotal + taxLaborEstimate;

  // CSV Export
  const handleExportCSV = () => {
    if (!isPro && onUpgradePrompt) {
      onUpgradePrompt('Bill of Materials (BOM) Excel & CSV Quotation Export');
      return;
    }

    let csv = `Item Name,Category,Dimensions (cm),Quantity,Estimated Unit Price (${currencySymbol}),Total (${currencySymbol})\n`;
    furnitureSummary.forEach((row) => {
      const unit = Math.round(row.totalCost / row.count);
      csv += `"${row.item.name}","${row.item.category}","${row.item.width}x${row.item.depth}x${row.item.height}",${row.count},${unit},${row.totalCost}\n`;
    });
    csv += `\n"Drywall / Partition Walls","Architectural","${architecturalSummary.wallLengthM} meters",1,${architecturalSummary.wallTotalCost},${architecturalSummary.wallTotalCost}\n`;
    csv += `"Floor Finishing & Tiles","Architectural","${architecturalSummary.roomAreaSqm} m²",1,${architecturalSummary.floorTotalCost},${architecturalSummary.floorTotalCost}\n`;
    csv += `\n"Subtotal","","","",,${rawSubtotal}\n`;
    csv += `"Labor & Tax (${laborTaxRate}%)","","","",,${taxLaborEstimate}\n`;
    csv += `"Grand Total","","","",,${grandTotal}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(plan.name || 'Project').replace(/\s+/g, '_')}_Bill_of_Materials_BOM.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Bill of Materials (BOM) & Cost Estimator</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Quotation
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated budget aggregation across furniture, architectural walls, and flooring finishes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs"
              title="Download BOM Spreadsheet (CSV)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs"
              title="Print Official Quotation"
            >
              <Printer className="w-4 h-4 text-sky-500" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Quick Configuration Bar */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Scope:</span>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950">
              <button
                onClick={() => setFilterFloor('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  filterFloor === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Entire House
              </button>
              {(plan.floors || [{ level: 0, name: 'Ground Floor' }, { level: 1, name: '1st Floor' }]).map((fl) => (
                <button
                  key={fl.level}
                  onClick={() => setFilterFloor(fl.level)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                    filterFloor === fl.level
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {fl.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Currency:</span>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                <option value="₹">INR (₹)</option>
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>

            {/* Contingency / Labor Buffer */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Labor/Tax:</span>
              <select
                value={laborTaxRate}
                onChange={(e) => setLaborTaxRate(parseInt(e.target.value))}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                <option value={0}>0% (Raw)</option>
                <option value={5}>5% Buffer</option>
                <option value={10}>10% Standard</option>
                <option value={15}>15% Luxury/Import</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Body / Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar text-xs">
          {/* Section A: Furniture & Interior Elements */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-500" />
                <span>Interior Furniture & Fixtures ({furnitureSummary.length} types)</span>
              </h3>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {formatPrice(furnitureSubtotal)}
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Dimensions</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Est. Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {furnitureSummary.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No furniture items placed on this floor level yet.
                      </td>
                    </tr>
                  ) : (
                    furnitureSummary.map((row, idx) => {
                      const unit = Math.round(row.totalCost / row.count);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.item.color || '#94a3b8' }} />
                            <span>{row.item.name}</span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{row.item.category}</td>
                          <td className="py-2 px-3 font-mono text-slate-500 dark:text-slate-400">
                            {row.item.width} × {row.item.depth} × {row.item.height} cm
                          </td>
                          <td className="py-2 px-3 text-center font-bold font-mono bg-slate-50/50 dark:bg-slate-900/40">
                            {row.count}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                            {formatPrice(unit)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {formatPrice(row.totalCost)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Architectural & Structural Shell */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-500" />
                <span>Architectural Shell & Finishes</span>
              </h3>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatPrice(architecturalSummary.totalArchCost)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Wall Framing & Drywall</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {architecturalSummary.wallLengthM} meters total length @ {formatPrice(WALL_COST_PER_METER)}/m
                  </p>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {formatPrice(architecturalSummary.wallTotalCost)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Flooring & Tiling Subfloor</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {architecturalSummary.roomAreaSqm} m² covered area @ {formatPrice(FLOOR_FINISH_PER_SQM)}/m²
                  </p>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {formatPrice(architecturalSummary.floorTotalCost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Summary Bill */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <span>Subtotal: </span>
              <strong className="font-mono text-slate-900 dark:text-white">
                {formatPrice(rawSubtotal)}
              </strong>
            </div>
            <div>
              <span>Labor & Tax ({laborTaxRate}%): </span>
              <strong className="font-mono text-slate-900 dark:text-white">
                +{formatPrice(taxLaborEstimate)}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Estimated Project Total
              </span>
              <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {formatPrice(grandTotal)}
              </span>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{!isPro ? 'Export CSV (Pro 👑)' : 'Download Quotation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
