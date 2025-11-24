import React, { useState, useEffect } from 'react';
import { Calculator, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Product, CostAnalysis } from '@/types';
import recommendationService from '@/services/recommendationService';

interface TCOCalculatorProps {
  product: Product;
}

export default function TCOCalculator({ product }: TCOCalculatorProps) {
  const [years, setYears] = useState(5);
  const [tcoData, setTcoData] = useState<CostAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTCO();
  }, [product.id, years]);

  const fetchTCO = async () => {
    setLoading(true);
    const result = await recommendationService.calculateTCO(product.id, years);
    if (result.success && result.data) {
      setTcoData(result.data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!tcoData) return null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Total Cost of Ownership</h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Time Period Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calculate for:
          </label>
          <div className="flex gap-2">
            {[3, 5, 7, 10].map((y) => (
              <button
                key={y}
                onClick={() => setYears(y)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  years === y
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {y} years
              </button>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Initial Cost</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${tcoData.initialCost.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Energy Cost/Year</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${tcoData.energyCostPerYear.toFixed(2)}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              ${(tcoData.energyCostPerYear * years).toFixed(2)} total
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Maintenance/Year</p>
                <p className="text-lg font-semibold text-gray-900">
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
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Total Cost Over {years} Years
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                ${tcoData.totalCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Expected Lifespan */}
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-800 font-medium mb-1">
            Expected Lifespan
          </p>
          <p className="text-2xl font-bold text-green-900">
            {tcoData.expectedLifespan} years
          </p>
          {years > tcoData.expectedLifespan && (
            <p className="text-xs text-green-700 mt-2">
              ⚠️ Calculation exceeds expected lifespan
            </p>
          )}
        </div>

        {/* Comparison to Average */}
        {tcoData.comparisonToAverage !== 0 && (
          <div
            className={`p-4 rounded-lg ${
              tcoData.comparisonToAverage < 0
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <p className="text-sm font-medium mb-1">
              {tcoData.comparisonToAverage < 0
                ? '✓ Better than average'
                : '⚠ Higher than average'}
            </p>
            <p className="text-lg font-semibold">
              {tcoData.comparisonToAverage > 0 ? '+' : ''}
              {tcoData.comparisonToAverage.toFixed(1)}% vs category average
            </p>
            <p className="text-xs mt-2 opacity-80">
              {tcoData.comparisonToAverage < 0
                ? 'This product offers better long-term value'
                : 'This product costs more to own over time'}
            </p>
          </div>
        )}

        {/* Energy Efficiency Insight */}
        {product.environmentalImpact.energyEfficiency && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm font-medium text-yellow-900 mb-1">
              💡 Energy Efficiency Rating
            </p>
            <p className="text-lg font-bold text-yellow-900">
              {product.environmentalImpact.energyEfficiency}
            </p>
            <p className="text-xs text-yellow-800 mt-2">
              Higher efficiency ratings mean lower energy costs over time
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
