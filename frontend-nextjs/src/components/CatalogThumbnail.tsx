'use client';

import React, { useState } from 'react';

interface CatalogThumbnailProps {
  icon?: string;
  name: string;
  category?: string;
  size?: number;
  className?: string;
}

// Smart mapping to guaranteed real 3D rendered PNG images in /models/
export function getRealThumbnailUrl(icon?: string, name?: string, category?: string): string {
  if (icon && icon.trim()) {
    if (icon.startsWith('/models/') || icon.startsWith('data:') || icon.startsWith('http')) {
      return icon;
    }
    return `/models/${icon.replace(/^\/+/, '')}`;
  }

  const lowerName = (name || '').toLowerCase();
  const lowerCat = (category || '').toLowerCase();

  if (lowerName.includes('washer') || lowerName.includes('washing machine') || lowerName.includes('dryer') || lowerName.includes('laundry')) return '/models/clothesWasher.png';
  if (lowerName.includes('dishwasher')) return '/models/dishwasher.png';
  if (lowerName.includes('corner sofa') || lowerName.includes('sectional')) return '/models/cornerSofa.png';
  if (lowerName.includes('armchair')) return '/models/armchair.png';
  if (lowerName.includes('sofa') || lowerName.includes('couch') || lowerName.includes('lounge')) return '/models/sofa.png';
  if (lowerName.includes('round table') || lowerName.includes('coffee table')) return '/models/roundTable.png';
  if (lowerName.includes('table') || lowerName.includes('desk')) return '/models/squareTable.png';
  if (lowerName.includes('chair') || lowerName.includes('seat')) return '/models/chair.png';
  if (lowerName.includes('stool')) return '/models/stool.png';
  if (lowerName.includes('loft bed')) return '/models/loftBed140x190.png';
  if (lowerName.includes('bunk')) return '/models/bunkBed90x190.png';
  if (lowerName.includes('single bed')) return '/models/bed90x190.png';
  if (lowerName.includes('bed')) return '/models/bed140x190.png';
  if (lowerName.includes('nightstand') || lowerName.includes('bedside')) return '/models/bedsideTable.png';
  if (lowerName.includes('wardrobe') || lowerName.includes('closet')) return '/models/wardrobe.png';
  if (lowerName.includes('bookcase') || lowerName.includes('shelf')) return '/models/bookcase.png';
  if (lowerName.includes('chest') || lowerName.includes('drawer')) return '/models/chest.png';
  if (lowerName.includes('cabinet') || lowerName.includes('kitchen')) return '/models/kitchenCabinet.png';
  if (lowerName.includes('cooker') || lowerName.includes('stove')) return '/models/cooker.png';
  if (lowerName.includes('fridge') || lowerName.includes('refrigerator')) return '/models/fridge.png';
  if (lowerName.includes('shower')) return '/models/shower.png';
  if (lowerName.includes('sink') || lowerName.includes('washbasin')) return '/models/washbasinWithCabinet.png';
  if (lowerName.includes('bath') || lowerName.includes('tub')) return '/models/bath.png';
  if (lowerName.includes('toilet') || lowerName.includes('wc')) return '/models/toiletUnit.png';
  if (lowerName.includes('radiator') || lowerName.includes('heater')) return '/models/electricRadiator.png';
  if (lowerName.includes('tv') || lowerName.includes('console') || lowerName.includes('media')) return '/models/tvUnit.png';
  if (lowerName.includes('piano')) return '/models/piano.png';
  if (lowerName.includes('work lamp') || lowerName.includes('desk lamp')) return '/models/workLamp.png';
  if (lowerName.includes('spotlight') || lowerName.includes('downlight')) return '/models/spotlight.png';
  if (lowerName.includes('uplight') || lowerName.includes('sconce')) return '/models/wallUplight.png';
  if (lowerName.includes('lamp') || lowerName.includes('light') || lowerName.includes('chandelier') || lowerName.includes('fan')) return '/models/pendantLamp.png';
  if (lowerName.includes('sliding door')) return '/models/slidingDoors.png';
  if (lowerName.includes('door')) return '/models/door.png';
  if (lowerName.includes('window')) return '/models/window85x123.png';
  if (lowerName.includes('plant') || lowerName.includes('flower') || lowerName.includes('tree')) return '/models/plant.png';
  if (lowerName.includes('stair') || lowerName.includes('steps')) return '/models/staircase.png';

  if (lowerCat === 'living') return '/models/sofa.png';
  if (lowerCat === 'bedroom') return '/models/bed140x190.png';
  if (lowerCat === 'kitchen') return '/models/kitchenCabinet.png';
  if (lowerCat === 'bathroom') return '/models/bath.png';
  if (lowerCat === 'lighting') return '/models/pendantLamp.png';
  if (lowerCat === 'doors & windows') return '/models/door.png';
  if (lowerCat === 'shelves & storage') return '/models/bookcase.png';
  if (lowerCat === 'decor & plants') return '/models/plant.png';
  if (lowerCat === 'stairs & structural') return '/models/staircase.png';

  return '/models/squareTable.png';
}

export const CatalogThumbnail: React.FC<CatalogThumbnailProps> = ({
  icon,
  name,
  category,
  size = 48,
  className = '',
}) => {
  const [imgSrc, setImgSrc] = useState<string>(() => getRealThumbnailUrl(icon, name, category));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getRealThumbnailUrl(undefined, name, category));
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-md shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={imgSrc}
        alt={name}
        onError={handleError}
        loading="lazy"
        className="w-full h-full object-contain p-1 filter drop-shadow-sm transition-transform duration-200 group-hover:scale-105 select-none pointer-events-none"
      />
    </div>
  );
};
