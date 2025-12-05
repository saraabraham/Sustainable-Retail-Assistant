import React, { useState } from 'react';
import { Leaf, Award, Recycle, TrendingUp, ShoppingCart, Calculator } from 'lucide-react';
import { Product } from '@/types';
import ProductDetails from './ProductDetails';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onViewTCO?: (product: Product) => void;
  showSustainabilityBadge?: boolean;
  compact?: boolean;
}

export default function ProductCard({
  product,
  onSelect,
  onAddToCart,
  onViewTCO,
  showSustainabilityBadge = true,
  compact = false,
}: ProductCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getSustainabilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Fair';
  };

  const handleViewDetails = () => {
    setShowDetails(true);
    onSelect?.(product);
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group ${compact ? 'flex' : 'flex flex-col'
          }`}
      >
        {/* Image - Make it clickable for details */}
        <div
          className={`relative ${compact ? 'w-32 h-32' : 'w-full h-48'} overflow-hidden cursor-pointer`}
          onClick={handleViewDetails}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {showSustainabilityBadge && (
            <div
              className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${getSustainabilityColor(
                product.sustainabilityScore
              )}`}
            >
              <div className="flex items-center gap-1">
                <Leaf className="w-3 h-3" />
                {product.sustainabilityScore}
              </div>
            </div>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className={`font-semibold text-gray-800 mb-1 ${compact ? 'text-sm' : 'text-lg'}`}>
            {product.name}
          </h3>

          {!compact && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Environmental Info */}
          <div className="flex flex-wrap gap-2 mb-3">
            {product.environmentalImpact.certifications.slice(0, 2).map((cert) => (
              <span
                key={cert}
                className="inline-flex items-center gap-1 px-2 py-1 bg-sustainable-50 text-sustainable-700 text-xs rounded-full"
              >
                <Award className="w-3 h-3" />
                {cert}
              </span>
            ))}

            {product.circularEconomyOptions.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                <Recycle className="w-3 h-3" />
                {product.circularEconomyOptions.length} options
              </span>
            )}
          </div>

          {/* Price and Sustainability */}
          <div className="flex items-center justify-between mt-auto">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSustainabilityColor(product.sustainabilityScore)}`}>
              {getSustainabilityLabel(product.sustainabilityScore)}
            </div>
          </div>

          {/* Energy Efficiency */}
          {product.environmentalImpact.energyEfficiency && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <TrendingUp className="w-3 h-3" />
              <span>Energy: {product.environmentalImpact.energyEfficiency}</span>
            </div>
          )}

          {/* Buttons */}
          {!compact && (
            <div className="mt-4 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails();
                  }}
                  className="flex-1 py-2 border border-sustainable-600 text-sustainable-600 rounded-lg hover:bg-sustainable-50 transition-colors font-medium text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart?.(product);
                  }}
                  disabled={!product.inStock}
                  className="flex-1 py-2 bg-sustainable-600 text-white rounded-lg hover:bg-sustainable-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewTCO?.(product);
                }}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
              >
                <Calculator className="w-4 h-4" />
                View TCO Calculator
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ProductDetails Modal */}
      <ProductDetails
        product={product}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
}