import React from 'react';
import { X, Check, Minus, Leaf, DollarSign, Zap } from 'lucide-react';
import { Product } from '@/types';

interface ComparisonMatrixProps {
  products: Product[];
  onRemove?: (productId: string) => void;
  onClear?: () => void;
}

export default function ComparisonMatrix({
  products,
  onRemove,
  onClear,
}: ComparisonMatrixProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">
          Select products to compare their features and sustainability metrics
        </p>
      </div>
    );
  }

  const comparisonFeatures = [
    { key: 'price', label: 'Price', icon: DollarSign },
    { key: 'sustainabilityScore', label: 'Sustainability Score', icon: Leaf },
    { key: 'energyEfficiency', label: 'Energy Efficiency', icon: Zap },
    { key: 'carbonFootprint', label: 'Carbon Footprint (kg CO2)', icon: Leaf },
    { key: 'recyclablePercentage', label: 'Recyclable %', icon: Leaf },
    { key: 'circularOptions', label: 'Circular Economy Options', icon: Check },
    { key: 'certifications', label: 'Certifications', icon: Check },
  ];

  const getFeatureValue = (product: Product, key: string) => {
    switch (key) {
      case 'price':
        return `$${product.price.toFixed(2)}`;
      case 'sustainabilityScore':
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold">{product.sustainabilityScore}</span>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sustainable-600 transition-all"
                style={{ width: `${product.sustainabilityScore}%` }}
              />
            </div>
          </div>
        );
      case 'energyEfficiency':
        return product.environmentalImpact.energyEfficiency;
      case 'carbonFootprint':
        return product.environmentalImpact.carbonFootprint.toFixed(2);
      case 'recyclablePercentage':
        return `${product.environmentalImpact.recyclablePercentage}%`;
      case 'circularOptions':
        return product.circularEconomyOptions.length > 0 ? (
          <div className="space-y-1">
            {product.circularEconomyOptions.map((option, idx) => (
              <span
                key={idx}
                className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full mr-1"
              >
                {option.type}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">None</span>
        );
      case 'certifications':
        return product.environmentalImpact.certifications.length > 0 ? (
          <div className="space-y-1">
            {product.environmentalImpact.certifications.map((cert, idx) => (
              <div key={idx} className="flex items-center gap-1 text-sm">
                <Check className="w-3 h-3 text-green-600" />
                {cert}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">None</span>
        );
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBestValue = (key: string): number => {
    if (key === 'price' || key === 'carbonFootprint') {
      return Math.min(...products.map((p) => 
        key === 'price' ? p.price : p.environmentalImpact.carbonFootprint
      ));
    }
    if (key === 'sustainabilityScore' || key === 'recyclablePercentage') {
      return Math.max(...products.map((p) => 
        key === 'sustainabilityScore' ? p.sustainabilityScore : p.environmentalImpact.recyclablePercentage
      ));
    }
    return 0;
  };

  const isBestValue = (product: Product, key: string): boolean => {
    const bestValue = getBestValue(key);
    if (key === 'price') return product.price === bestValue;
    if (key === 'sustainabilityScore') return product.sustainabilityScore === bestValue;
    if (key === 'carbonFootprint') return product.environmentalImpact.carbonFootprint === bestValue;
    if (key === 'recyclablePercentage') return product.environmentalImpact.recyclablePercentage === bestValue;
    return false;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sustainable-600 to-sustainable-500 text-white p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Product Comparison</h2>
        {onClear && (
          <button
            onClick={onClear}
            className="px-4 py-2 bg-white text-sustainable-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
                Feature
              </th>
              {products.map((product) => (
                <th key={product.id} className="px-6 py-4 text-center min-w-[250px]">
                  <div className="space-y-2">
                    <div className="relative">
                      {onRemove && (
                        <button
                          onClick={() => onRemove(product.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {comparisonFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <tr key={feature.key} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-700 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      {feature.label}
                    </div>
                  </td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className={`px-6 py-4 text-center ${
                        isBestValue(product, feature.key)
                          ? 'bg-sustainable-50 font-semibold'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {getFeatureValue(product, feature.key)}
                        {isBestValue(product, feature.key) && (
                          <Check className="w-4 h-4 text-sustainable-600 ml-2" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-sustainable-50 border border-sustainable-200 rounded"></div>
            <span>Best Value</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-sustainable-600" />
            <span>Winner in Category</span>
          </div>
        </div>
      </div>
    </div>
  );
}
