import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Product, ProductFilters } from '@/types';
import ProductCard from './ProductCard';

interface ProductCarouselProps {
  products: Product[];
  filters?: ProductFilters;
  onFilterChange?: (filters: ProductFilters) => void;
  title?: string;
  onProductSelect?: (product: Product) => void;
}

export default function ProductCarousel({
  products,
  filters,
  onFilterChange,
  title = 'Recommended Products',
  onProductSelect,
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 3;

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + itemsPerPage >= products.length ? 0 : prev + itemsPerPage
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, products.length - itemsPerPage) : Math.max(0, prev - itemsPerPage)
    );
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters?.priceRange?.min || ''}
                  onChange={(e) =>
                    onFilterChange?.({
                      ...filters,
                      priceRange: {
                        ...filters?.priceRange,
                        min: Number(e.target.value),
                        max: filters?.priceRange?.max || 10000,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters?.priceRange?.max || ''}
                  onChange={(e) =>
                    onFilterChange?.({
                      ...filters,
                      priceRange: {
                        min: filters?.priceRange?.min || 0,
                        max: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                />
              </div>
            </div>

            {/* Sustainability Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Sustainability Score
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters?.sustainabilityScore?.min || 0}
                onChange={(e) =>
                  onFilterChange?.({
                    ...filters,
                    sustainabilityScore: {
                      min: Number(e.target.value),
                      max: 100,
                    },
                  })
                }
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">
                {filters?.sustainabilityScore?.min || 0}+
              </div>
            </div>

            {/* In Stock Only */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters?.inStockOnly || false}
                  onChange={(e) =>
                    onFilterChange?.({
                      ...filters,
                      inStockOnly: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-sustainable-600 border-gray-300 rounded focus:ring-sustainable-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  In Stock Only
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Carousel */}
      <div className="relative">
        {/* Navigation Buttons */}
        {products.length > itemsPerPage && (
          <>
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            
            <button
              onClick={nextSlide}
              disabled={currentIndex + itemsPerPage >= products.length}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onProductSelect}
            />
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products found matching your criteria.
            </p>
            <button
              onClick={() => onFilterChange?.({})}
              className="mt-4 px-6 py-2 bg-sustainable-600 text-white rounded-lg hover:bg-sustainable-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination Dots */}
      {products.length > itemsPerPage && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(products.length / itemsPerPage) }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsPerPage)}
                className={`w-2 h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / itemsPerPage) === index
                    ? 'bg-sustainable-600 w-6'
                    : 'bg-gray-300'
                }`}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
