import React, { useState } from 'react';
import { X, CreditCard, MapPin, User, Mail, Phone, CheckCircle, Leaf } from 'lucide-react';
import { Product } from '@/types';

interface CheckoutProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Checkout({ items, isOpen, onClose, onComplete }: CheckoutProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Shipping Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    // Payment
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const avgSustainability = items.length > 0
    ? items.reduce((sum, item) => sum + item.product.sustainabilityScore, 0) / items.length
    : 0;
  const totalCarbon = items.reduce((sum, item) => sum + (item.product.environmentalImpact.carbonFootprint * item.quantity), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Process payment
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setStep(4); // Success page
      
      setTimeout(() => {
        onComplete();
        onClose();
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {step !== 4 && (
            <div className="bg-gradient-to-r from-sustainable-600 to-sustainable-500 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Checkout</h2>
                <p className="text-sm opacity-90">Complete your sustainable purchase</p>
              </div>
              <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Progress Steps */}
          {step !== 4 && (
            <div className="flex items-center justify-center gap-4 p-6 border-b border-gray-200">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s ? 'bg-sustainable-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-sustainable-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="p-6 space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Address */}
            {step === 2 && (
              <div className="p-6 space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <input
                      type="text"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                    />
                  </div>
                </div>

                {/* Eco Shipping Option */}
                <div className="bg-sustainable-50 border border-sustainable-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-1" />
                    <div>
                      <p className="font-medium text-sustainable-900">🌱 Carbon-Neutral Shipping (Free!)</p>
                      <p className="text-sm text-sustainable-700 mt-1">
                        We offset 100% of shipping emissions through verified carbon credits
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="p-6 space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    maxLength={19}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                  <input
                    type="text"
                    name="cardName"
                    required
                    value={formData.cardName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                    <input
                      type="text"
                      name="expiryDate"
                      required
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      maxLength={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      required
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      maxLength={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500"
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.product.name} x {item.quantity}</span>
                        <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-sustainable-600">${totalPrice.toFixed(2)}</span>
                  </div>

                  {/* Sustainability Impact */}
                  <div className="mt-4 bg-sustainable-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-sustainable-900 mb-2 flex items-center gap-2">
                      <Leaf className="w-4 h-4" />
                      Your Environmental Impact
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-sustainable-700">Avg. Sustainability</p>
                        <p className="font-bold text-sustainable-900">{avgSustainability.toFixed(0)}/100</p>
                      </div>
                      <div>
                        <p className="text-sustainable-700">Carbon Saved</p>
                        <p className="font-bold text-sustainable-900">{(100 - totalCarbon).toFixed(1)}kg CO₂</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed! 🎉</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for choosing sustainable products. Your order has been placed successfully!
                </p>
                <div className="bg-sustainable-50 border border-sustainable-200 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-sustainable-900 font-medium mb-2">
                    🌍 You're making a difference!
                  </p>
                  <p className="text-sm text-sustainable-700">
                    This purchase supports sustainable practices and helps reduce environmental impact.
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-6">
                  Redirecting you back to shopping...
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {step !== 4 && (
              <div className="p-6 border-t border-gray-200 flex justify-between">
                <button
                  type="button"
                  onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {step > 1 ? 'Back' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-sustainable-600 text-white rounded-lg hover:bg-sustainable-700 transition-colors font-semibold"
                >
                  {step === 3 ? 'Place Order' : 'Continue'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
