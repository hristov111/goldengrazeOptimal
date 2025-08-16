import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/supabase';

const US_STATES = [
  { value: '', label: 'Select State' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

const Order = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, isLoading: authLoading } = useAuth();
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    apt: '',
    city: '',
    state: '',
    zip: '',
    notes: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, [isLoggedIn, user]);

  const loadUserProfile = async () => {
    console.log('🔍 loadUserProfile called');
    console.log('📊 Auth state:', { isLoggedIn, user });
    
    if (!isLoggedIn || !user) {
      console.log('❌ Not logged in or no user, skipping profile load');
      return; // Not logged in, render empty form
    }

    setIsLoadingProfile(true);
    setProfileError('');
    console.log('🚀 Starting profile fetch for user:', user.id);

    try {
      // Get user profile from Supabase
      const { data: profile, error } = await database.getUserProfile(user.id);
      
      console.log('📥 Profile fetch result:', { profile, error });
      
      if (error) {
        throw error;
      }
      
      if (profile) {
        console.log('✅ Profile found:', profile);
        // Extract shipping address from profile
        const shippingAddress = profile.shipping_address || {};
        console.log('📦 Shipping address:', shippingAddress);
        
        // Prefill form with saved data
        const newFormData = {
          ...prev,
          fullName: profile.full_name || user.name || '',
          email: user.email || '',
          phone: profile.phone || '',
          street: shippingAddress.street || '',
          apt: shippingAddress.apt || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          zip: shippingAddress.zip || '',
          notes: ''
        };
        console.log('📝 Setting form data:', newFormData);
        setFormData(prev => ({
          ...newFormData
        }));
      } else {
        console.log('⚠️ No profile found, using basic user data');
        // No profile found, use basic user data
        setFormData(prev => ({
          ...prev,
          fullName: user.name || '',
          email: user.email || ''
        }));
      }
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      console.warn('Failed to load user profile:', error);
      setProfileError("We couldn't load your saved details. You can fill them in below.");
      
      // Still prefill with basic user data
      console.log('🔄 Falling back to basic user data');
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || ''
      }));
    } finally {
      console.log('✅ Profile loading complete');
      setIsLoadingProfile(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log order data to console
    const orderData = {
      product: 'Golden Graze Whipped Tallow Balm',
      price: 48.00,
      customer: formData,
      timestamp: new Date().toISOString()
    };
    
    console.log('Order Data:', orderData);
    
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="font-serif text-2xl text-stone-900 mb-4">Thank You!</h1>
            <p className="text-stone-600 mb-6 leading-relaxed">
              Thanks! We'll confirm by email/SMS and send you tracking information once your Golden Graze Whipped Tallow Balm ships.
            </p>
            
            <button
              onClick={() => navigate('/')}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 tracking-widest transition-all duration-300 rounded-lg font-medium transform hover:scale-105"
            >
              RETURN HOME
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-stone-600 hover:text-amber-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm tracking-wider">Back to Home</span>
        </button>

        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">Complete Your Order</h1>
          <p className="text-stone-600 text-lg">
            You're one step away from beginning your skincare ritual
          </p>
          <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-6"></div>
        </div>

        {/* Profile Loading Error */}
        {profileError && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
              {profileError}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100">
              <h2 className="font-serif text-2xl text-stone-900 mb-6">Shipping Information</h2>
              
              {/* Loading State */}
              {isLoadingProfile && (
                <div className="flex items-center justify-center py-8 mb-6">
                  <div className="flex items-center space-x-3 text-amber-600">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm">Loading your saved details...</span>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-stone-700 text-sm tracking-wider mb-2">
                    FULL NAME *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-stone-400" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-700 text-sm tracking-wider mb-2">
                      EMAIL *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-stone-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 text-sm tracking-wider mb-2">
                      PHONE NUMBER *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={18} className="text-stone-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-stone-700 text-sm tracking-wider mb-2">
                    STREET ADDRESS *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={18} className="text-stone-400" />
                    </div>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                      placeholder="123 Main Street"
                    />
                  </div>
                </div>

                {/* Apartment/Suite */}
                <div>
                  <label className="block text-stone-700 text-sm tracking-wider mb-2">
                    APARTMENT / SUITE
                  </label>
                  <input
                    type="text"
                    name="apt"
                    value={formData.apt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                    placeholder="Apt 4B, Suite 200, etc. (optional)"
                  />
                </div>

                {/* City, State, ZIP */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-stone-700 text-sm tracking-wider mb-2">
                      CITY *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 text-sm tracking-wider mb-2">
                      STATE *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                    >
                      {US_STATES.map(state => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 text-sm tracking-wider mb-2">
                      ZIP CODE *
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{5}(-[0-9]{4})?"
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                      placeholder="12345"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-stone-700 text-sm tracking-wider mb-2">
                    ORDER NOTES
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FileText size={18} className="text-stone-400" />
                    </div>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors resize-vertical"
                      placeholder="Special delivery instructions, gift message, etc. (optional)"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white py-4 px-6 tracking-widest transition-all duration-300 rounded-lg font-medium relative overflow-hidden group"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 size={20} className="animate-spin" />
                      <span>PROCESSING ORDER...</span>
                    </div>
                  ) : (
                    <span className="group-hover:scale-105 transition-transform duration-300">PLACE ORDER</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-amber-100 sticky top-24">
              <h3 className="font-serif text-xl text-stone-900 mb-6">Order Summary</h3>
              
              {/* Product */}
              <div className="flex items-center space-x-4 mb-6 p-4 bg-stone-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                  <img 
                    src="/product_images/golden_graze1.png" 
                    alt="Golden Graze Whipped Tallow Balm"
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/balm_images/firstPic.png";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-stone-900">Golden Graze Whipped Tallow Balm</h4>
                  <p className="text-stone-600 text-sm">2oz jar</p>
                  <p className="text-amber-600 text-sm">Unscented</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-medium text-stone-900">$48.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Tax</span>
                  <span className="font-medium text-stone-900">$3.84</span>
                </div>
                <div className="border-t border-stone-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-serif text-stone-900">Total</span>
                    <span className="text-xl font-serif text-stone-900">$51.84</span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-green-600 text-sm font-medium mb-1">🔒 Secure Checkout</div>
                <div className="text-green-700 text-xs">Your information is protected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;