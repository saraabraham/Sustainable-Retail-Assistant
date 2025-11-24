import React, { useState, useEffect } from 'react';
import { X, Calculator, DollarSign, Zap, Calendar, TrendingDown } from 'lucide-react';
import { Product } from '@/types';
import recommendationService from '@/services/recommendationService';

interface TCOModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function TCOModal({ product, isOpen, onClose }: TCOModalProps) {
  const [years, setYears] = useState(5);
  const [tcoData, setTcoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTCO();
    }
  }, [isOpen, years, product.id]);

  const fetchTCO = async () => {
    setLoading(true);
    const result = await recommendationService.calculateTCO(product.id, years);
    if (result.success && result.data) {
      setTcoData(result.data);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Total Cost of Ownership</h2>
                <p className="text-sm opacity-90">{product.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Calculating...</p>
              </div>
            ) : tcoData ? (
              <>
                {/* Time Period Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Calculate for:
                  </label>
                  <div className="flex gap-2">
                    {[3, 5, 7, 10].map((y) => (
                      <button
                        key={y}
                        onClick={() => setYears(y)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                          years === y
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {y} years
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Initial Cost</p>
                        <p className="text-xl font-bold text-gray-900">
                          ${tcoData.initialCost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Energy Cost/Year</p>
                        <p className="text-xl font-bold text-gray-900">
                          ${tcoData.energyCostPerYear.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      ${(tcoData.energyCostPerYear * years).toFixed(2)} total
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Maintenance/Year</p>
                        <p className="text-xl font-bold text-gray-900">
                          ${tcoData.maintenanceCostPerYear.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      ${(tcoData.maintenanceCostPerYear * years).toFixed(2)} total
                    </span>
                  </div>
                </div>

                {/* Total Cost */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        Total Cost Over {years} Years
                      </p>
                      <p className="text-4xl font-bold text-blue-900">
                        ${tcoData.totalCost.toFixed(2)}
                      </p>
                    </div>
                    <TrendingDown className="w-12 h-12 text-blue-600 opacity-50" />
                  </div>
                </div>

                {/* Expected Lifespan */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-800 font-medium">Expected Lifespan</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {tcoData.expectedLifespan} years
                      </p>
                    </div>
                    {years > tcoData.expectedLifespan && (
                      <span className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full">
                        ⚠️ Exceeds lifespan
                      </span>
                    )}
                  </div>
                </div>

                {/* Comparison to Average */}
                {tcoData.comparisonToAverage !== 0 && (
                  <div
                    className={`rounded-xl p-4 ${
                      tcoData.comparisonToAverage < 0
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <p className="text-sm font-medium mb-2">
                      {tcoData.comparisonToAverage < 0
                        ? '✅ Better than category average'
                        : '⚠️ Higher than category average'}
                    </p>
                    <p className="text-2xl font-bold">
                      {tcoData.comparisonToAverage > 0 ? '+' : ''}
                      {tcoData.comparisonToAverage.toFixed(1)}%
                    </p>
                    <p className="text-xs mt-2 opacity-80">
                      {tcoData.comparisonToAverage < 0
                        ? 'This product offers better long-term value compared to similar products'
                        : 'This product costs more to own over time compared to similar products'}
                    </p>
                  </div>
                )}

                {/* Energy Efficiency */}
                {product.environmentalImpact.energyEfficiency && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-yellow-900 mb-1">
                      💡 Energy Efficiency Rating
                    </p>
                    <p className="text-xl font-bold text-yellow-900">
                      {product.environmentalImpact.energyEfficiency}
                    </p>
                    <p className="text-xs text-yellow-800 mt-2">
                      Higher efficiency ratings mean lower energy costs over time
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No TCO data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
