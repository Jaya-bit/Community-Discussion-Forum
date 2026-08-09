import React from 'react';

export default function CategoryTabs({ categories, active, onSelect }) {
  return (
    <div className="tabs" role="tablist" aria-label="Filter by category">
      {categories.map((cat) => (
        <button
          key={cat}
          role="tab"
          aria-selected={active === cat}
          className={active === cat ? 'tabs__item is-active' : 'tabs__item'}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
