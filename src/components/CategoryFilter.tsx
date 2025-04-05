'use client';

import { useState } from 'react';

interface CategoryFilterProps {
  categories: string[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    // Dispatch a custom event when category changes
    const event = new CustomEvent('categoryChange', {
      detail: { category }
    });
    
    window.dispatchEvent(event);
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryChange(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            selectedCategory === category
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {category === 'all' ? 'All Categories' : category}
        </button>
      ))}
    </div>
  );
} 