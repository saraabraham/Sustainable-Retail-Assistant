import React from 'react';
import { X, Leaf, Award, Recycle, Zap, Calendar, DollarSign, TrendingDown, Package } from 'lucide-react';
import { Product } from '@/types';

interface ProductDetailsProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart?: (product: Product) => void;  // ✅ ADD THIS
}

export default function ProductDetails({ product, isOpen, onClose, onAddToCart }: ProductDetailsProps) {
    if (!isOpen) return null;

    const getSustainabilityColor = (score: number) => {
        if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-orange-600 bg-orange-50 border-orange-200';
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div
                        className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>

                        {/* Header with Image */}
                        <div className="relative h-80 bg-gradient-to-br from-sustainable-50 to-blue-50">
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Sustainability Badge Overlay */}
                            <div className="absolute top-4 left-4">
                                <div className={`px-4 py-2 rounded-full border-2 ${getSustainabilityColor(product.sustainabilityScore)}`}>
                                    <div className="flex items-center gap-2">
                                        <Leaf className="w-5 h-5" />
                                        <span className="font-bold text-lg">{product.sustainabilityScore}/100</span>
                                    </div>
                                </div>
                            </div>

                            {/* In Stock Badge */}
                            {product.inStock ? (
                                <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
                                    In Stock
                                </div>
                            ) : (
                                <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold">
                                    Out of Stock
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {/* Title and Price */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
                                    <p className="text-gray-600 text-lg">{product.description}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <div className="text-4xl font-bold text-sustainable-600">${product.price.toFixed(2)}</div>
                                    <p className="text-sm text-gray-500 mt-1">One-time purchase</p>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="mb-6">
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    {product.category}
                                </span>
                            </div>

                            {/* Environmental Impact */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Leaf className="w-6 h-6 text-sustainable-600" />
                                    Environmental Impact
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingDown className="w-5 h-5 text-green-600" />
                                            <span className="text-sm font-medium text-gray-600">Carbon</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {product.environmentalImpact.carbonFootprint}kg
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Package className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-600">Water</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {product.environmentalImpact.waterUsage}L
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Recycle className="w-5 h-5 text-purple-600" />
                                            <span className="text-sm font-medium text-gray-600">Recyclable</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {product.environmentalImpact.recyclablePercentage}%
                                        </p>
                                    </div>

                                    {product.environmentalImpact.energyEfficiency && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Zap className="w-5 h-5 text-yellow-600" />
                                                <span className="text-sm font-medium text-gray-600">Energy</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {product.environmentalImpact.energyEfficiency}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Certifications */}
                            {product.environmentalImpact.certifications.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Award className="w-6 h-6 text-sustainable-600" />
                                        Certifications
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.environmentalImpact.certifications.map((cert, idx) => (
                                            <div
                                                key={idx}
                                                className="px-4 py-2 bg-sustainable-50 border border-sustainable-200 rounded-full text-sustainable-700 font-medium"
                                            >
                                                {cert}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Circular Economy Options */}
                            {product.circularEconomyOptions.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Recycle className="w-6 h-6 text-sustainable-600" />
                                        Circular Economy Options
                                    </h3>
                                    <div className="space-y-3">
                                        {product.circularEconomyOptions.map((option, idx) => (
                                            <div
                                                key={idx}
                                                className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-bold uppercase">
                                                        {option.type}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700">{option.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        if (onAddToCart) {
                                            onAddToCart(product);
                                            onClose(); // Close modal after adding to cart
                                        }
                                    }}
                                    disabled={!product.inStock}
                                    className="flex-1 py-3 bg-sustainable-600 text-white rounded-lg hover:bg-sustainable-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}