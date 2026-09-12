import React, { useState } from 'react';
import { CATALOG } from '../catalogData';
import { Search } from 'lucide-react';

export function CatalogSidebar({ onAddFurniture }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Living', 'Bedroom', 'Kitchen', 'Bathroom', 'Doors & Windows'];

  const filteredItems = CATALOG.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesQ = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQ;
  });

  return (
    <aside style={{
      width: '260px',
      background: '#18181b',
      borderRight: '1px solid #27272a',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      userSelect: 'none'
    }}>
      {/* Search */}
      <div style={{ padding: '10px', borderBottom: '1px solid #27272a' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#27272a',
          border: '1px solid #3f3f46',
          borderRadius: '6px',
          padding: '4px 8px',
          gap: '6px'
        }}>
          <Search size={14} color="#a1a1aa" />
          <input
            type="text"
            placeholder="Search furniture..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '0.85rem',
              outline: 'none',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '8px 10px',
        overflowX: 'auto',
        borderBottom: '1px solid #27272a'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              background: activeCategory === cat ? '#3b82f6' : '#27272a',
              color: activeCategory === cat ? 'white' : '#a1a1aa',
              border: 'none',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        alignContent: 'start'
      }}>
        {filteredItems.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify(item))}
            onClick={() => onAddFurniture(item)}
            style={{
              background: '#202024',
              border: '1px solid #2e2e34',
              borderRadius: '8px',
              padding: '8px',
              textAlign: 'center',
              cursor: 'grab',
              transition: 'transform 0.15s, border-color 0.15s'
            }}
          >
            <img
              src={item.icon}
              alt={item.name}
              style={{ width: '44px', height: '44px', objectFit: 'contain', marginBottom: '4px' }}
              onError={(e) => { e.target.src = '/models/box.png'; }}
            />
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#e4e4e7' }}>{item.name}</div>
            <div style={{ fontSize: '0.65rem', color: '#71717a' }}>{item.width} × {item.depth} cm</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
