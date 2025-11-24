import React, { useState } from 'react';
import { ShoppingCart, X, Leaf, TrendingDown, Trash2 } from 'lucide-react';
import { Product } from '@/types';

interface CartProps {
  items: CartItem[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCheckout?: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Cart({ items, onRemove, onClear, onCheckout }: CartProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const averageSustainability = items.length > 0
    ? items.reduce((sum, item) => sum + item.product.sustainabilityScore, 0) / items.length
    : 0;
  const totalCarbonFootprint = items.reduce(
    (sum, item) => sum + (item.product.environmentalImpact.carbonFootprint * item.quantity),
    0
  );
  const totalWaterUsage = items.reduce(
    (sum, item) => sum + (item.product.environmentalImpact.waterUsage * item.quantity),
    0
  );

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-6 z-50 bg-sustainable-600 text-white p-4 rounded-full shadow-lg hover:bg-sustainable-700 transition-all"
      >
        <ShoppingCart className="w-6 h-6" />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
            {items.length}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-sustainable-600 to-sustainable-500 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">My Cart</h2>
                  <p className="text-sm opacity-90">{items.length} items</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Sustainability Dashboard */}
            {items.length > 0 && (
              <div className="bg-sustainable-50 p-4 border-b border-sustainable-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-sustainable-600" />
                  Sustainability Metrics
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Average Sustainability */}
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Avg. Score</p>
                    <p className={`text-2xl font-bold ${getSustainabilityColor(averageSustainability)}`}>
                      {averageSustainability.toFixed(0)}
                    </p>
                  </div>

                  {/* Carbon Footprint */}
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Carbon (kg)</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalCarbonFootprint.toFixed(1)}
                    </p>
                  </div>

                  {/* Water Usage */}
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Water (L)</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalWaterUsage.toFixed(0)}
                    </p>
                  </div>

                  {/* Recyclable */}
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Recyclable</p>
                    <p className="text-2xl font-bold text-green-600">
                      {(items.reduce((sum, item) => 
                        sum + item.product.environmentalImpact.recyclablePercentage, 0
                      ) / items.length).toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Sustainability Message */}
                {averageSustainability >= 80 && (
                  <div className="mt-3 bg-green-100 border border-green-200 rounded-lg p-2">
                    <p className="text-xs text-green-800 text-center">
                      🎉 Excellent! Your cart is highly sustainable!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Add sustainable products to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-800 truncate">
                            {item.product.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sustainable-50 text-sustainable-700 text-xs rounded-full">
                              <Leaf className="w-3 h-3" />
                              {item.product.sustainabilityScore}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-900 mt-2">
                            ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => onRemove(item.product.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Item Metrics */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Carbon</p>
                          <p className="text-xs font-semibold text-gray-700">
                            {item.product.environmentalImpact.carbonFootprint}kg
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Water</p>
                          <p className="text-xs font-semibold text-gray-700">
                            {item.product.environmentalImpact.waterUsage}L
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Recycle</p>
                          <p className="text-xs font-semibold text-gray-700">
                            {item.product.environmentalImpact.recyclablePercentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {/* Total */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={onCheckout}
                    className="w-full py-3 bg-sustainable-600 text-white rounded-lg hover:bg-sustainable-700 transition-colors font-semibold"
                  >
                    Checkout
                  </button>
                  <button
                    onClick={onClear}
                    className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Cart
                  </button>
                </div>

                {/* Eco Tip */}
                <div className="mt-4 bg-sustainable-100 border border-sustainable-200 rounded-lg p-3">
                  <p className="text-xs text-sustainable-800">
                    <strong>♻️ Eco Tip:</strong> Your purchases support sustainable practices 
                    and reduce environmental impact!
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
