import { UnitSystem } from '../types/plan';

/**
 * Formats a length in centimeters to the selected unit system.
 */
export function formatDistance(cm: number, unit: UnitSystem = 'cm'): string {
  if (isNaN(cm)) return '0 cm';

  switch (unit) {
    case 'm':
      return `${(cm / 100).toFixed(2)} m`;
    case 'mm':
      return `${Math.round(cm * 10)} mm`;
    case 'ft_in': {
      const totalInches = cm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}' ${inches}"`;
    }
    case 'cm':
    default:
      return `${Math.round(cm)} cm`;
  }
}

/**
 * Formats an area in square meters to the selected unit system.
 */
export function formatArea(sqMeters: number, unit: UnitSystem = 'cm'): string {
  if (isNaN(sqMeters)) return '0 m²';

  if (unit === 'ft_in') {
    const sqFt = sqMeters * 10.7639;
    return `${sqFt.toFixed(1)} sq ft`;
  }

  return `${sqMeters.toFixed(1)} m²`;
}
