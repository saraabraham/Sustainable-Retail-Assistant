import React, { useState } from 'react';
import Head from 'next/head';
import ChatInterface from '@/components/ChatInterface';
import ProductCarousel from '@/components/ProductCarousel';
import ComparisonMatrix from '@/components/ComparisonMatrix';
import Cart from '@/components/Cart';
import TCOModal from '@/components/TCOModal';
import { Product, Recommendation, ProductFilters } from '@/types';
import { Leaf, ShoppingBag } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Home() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductForTCO, setSelectedProductForTCO] = useState<Product | null>(null);

  const handleRecommendationsReceived = (recs: Recommendation[]) => {
    const products = recs.map((r) => r.product);
    setRecommendations(products);
  };

  const handleProductSelect = (product: Product) => {
    // Add to comparison if not already there
    if (comparisonProducts.length < 4 && !comparisonProducts.find((p) => p.id === product.id)) {
      setComparisonProducts([...comparisonProducts, product]);
    }
  };

  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      setCartItems([]);
    }
  };

  const handleCheckout = () => {
    alert('Checkout functionality would be implemented here!');
  };

  const handleRemoveFromComparison = (productId: string) => {
    setComparisonProducts(comparisonProducts.filter((p) => p.id !== productId));
  };

  const handleClearComparison = () => {
    setComparisonProducts([]);
  };

  const handleViewTCO = (product: Product) => {
    setSelectedProductForTCO(product);
  };

  return (
    <>
      <Head>
        <title>Sustainable Retail Assistant - Smart Shopping for a Better Future</title>
        <meta
          name="description"
          content="AI-powered shopping assistant that recommends sustainable products based on your lifestyle and values"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-sustainable-50 via-white to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sustainable-600 to-sustainable-500 rounded-lg flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Sustainable Retail Assistant
                  </h1>
                  <p className="text-sm text-gray-600">
                    Smart shopping for a better future
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Cart Component */}
        <Cart
          items={cartItems}
          onRemove={handleRemoveFromCart}
          onClear={handleClearCart}
          onCheckout={handleCheckout}
        />

        {/* TCO Modal */}
        {selectedProductForTCO && (
          <TCOModal
            product={selectedProductForTCO}
            isOpen={!!selectedProductForTCO}
            onClose={() => setSelectedProductForTCO(null)}
          />
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Find Products That Match Your Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get personalized recommendations based on sustainability, lifestyle needs, and
              total cost of ownership
            </p>
          </div>

          {/* Chat Interface */}
          <div className="mb-12">
            <ChatInterface onRecommendationsReceived={handleRecommendationsReceived} />
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mb-12">
              <ProductCarousel
                products={recommendations}
                filters={filters}
                onFilterChange={setFilters}
                onProductSelect={handleProductSelect}
                onAddToCart={handleAddToCart}
                onViewTCO={handleViewTCO}
                title="Your Personalized Recommendations"
              />
            </div>
          )}

          {/* Comparison Matrix */}
          {comparisonProducts.length > 0 && (
            <div className="mb-12">
              <ComparisonMatrix
                products={comparisonProducts}
                onRemove={handleRemoveFromComparison}
                onClear={handleClearComparison}
              />
            </div>
          )}

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-sustainable-100 rounded-lg flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-sustainable-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sustainability First
              </h3>
              <p className="text-gray-600">
                Every recommendation considers environmental impact, certifications, and
                circular economy options
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Comparisons
              </h3>
              <p className="text-gray-600">
                Compare products side-by-side with detailed sustainability metrics and total
                cost analysis
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Personalized Experience
              </h3>
              <p className="text-gray-600">
                AI learns your preferences over time to provide better recommendations that
                match your lifestyle
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>© 2024 Sustainable Retail Assistant. Built with ♻️ for a better future.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}