import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, FileText, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from "../lib/supabase";

type Shipping = {
  name: string; 
  phone: string;
  address1: string; 
  address2?: string;
  city: string; 
  state: string; 
  postal: string; 
  country: string;
};

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

export default function CheckoutForm() {
  const navigate = useNavigate();
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [shipping, setShipping] = useState<Shipping>({
    name: "", 
    phone: "", 
    address1: "", 
    address2: "", 
    city: "", 
    state: "", 
    postal: "", 
    country: "US"
  });
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setSessionUserId(uid);
    });
  }, []);

  // Prefill from last order (if any)
  useEffect(() => {
    if (!sessionUserId) {
      return;
    }
    
    setPrefillLoading(true);
    
    (async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("shipping_name, shipping_phone, shipping_address1, shipping_address2, shipping_city, shipping_state, shipping_postal, shipping_country, placed_at, created_at")
          .eq("user_id", sessionUserId)
          .order("placed_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (data) {
          setShipping({
            name: data.shipping_name ?? "",
            phone: data.shipping_phone ?? "",
            address1: data.shipping_address1 ?? "",
            address2: data.shipping_address2 ?? "",
            city: data.shipping_city ?? "",
            state: data.shipping_state ?? "",
            postal: data.shipping_postal ?? "",
            country: data.shipping_country ?? "US",
          });
        } else {
        }
      } catch (err) {
      } finally {
        setPrefillLoading(false);
      }
    })();
  }, [sessionUserId]);

  const update = (k: keyof Shipping, v: string) => {
    setShipping((s) => ({ ...s, [k]: v }));
  };

  const validateForm = () => {
    const required = ['name', 'phone', 'address1', 'city', 'state', 'postal'];
    const missing = required.filter(field => !shipping[field as keyof Shipping]);
    
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return false;
    }
    
    if (shipping.country.toUpperCase() !== 'US') {
      setError('Only US shipping is supported');
      return false;
    }
    
    return true;
  };

  async function placeOrder() {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true); 
    setError(null); 
    setResult(null);
    
    try {
      // Single session fetch to avoid duplicate calls
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      const userId = data.session?.user?.id ?? null;
      
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/place-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          "Idempotency-Key": crypto.randomUUID()
        },
        body: JSON.stringify({
          userId,
          quantity,
          shipping,
          notes,
          source: "site_checkout"
        })
      });
      
      if (!res.ok) {
        let errorMessage = 'Order failed';
        let errorDetails = '';
        
        try {
          const errorText = await res.text();
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
          errorDetails = errorJson.details || '';
        } catch {
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
        
        // Log for debugging (not user-facing)
        console.error('Order API Error:', { status: res.status, message: errorMessage, details: errorDetails });
        
        throw new Error(errorMessage);
      }
      
      const json = await res.json();

      setResult(json);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  // Calculate totals for display
  const subtotalCents = 2999 * quantity;
  const shippingCents = 599;
  const taxCents = Math.round(subtotalCents * 0.07);
  const totalCents = subtotalCents + shippingCents + taxCents;

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-amber-100">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-white" />
            </div>
            
            <h1 className="font-serif text-2xl text-stone-900 mb-4">Order Placed!</h1>
            <p className="text-stone-600 mb-2">
              <strong>Order #{result.order.order_number}</strong>
            </p>
            <p className="text-stone-600 mb-6 leading-relaxed">
              Thank you for your order! We'll send you tracking information once your Golden Graze Whipped Tallow Balm ships.
            </p>
            
            <div className="bg-stone-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-stone-900 mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{result.totals.human.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{result.totals.human.shipping}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{result.totals.human.tax}</span>
                </div>
                <div className="flex justify-between font-medium text-stone-900 border-t border-stone-200 pt-1">
                  <span>Total:</span>
                  <span>{result.totals.human.total}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="bg-amber-400 hover:bg-amber-500 text-white px-8 py-3 tracking-widest transition-all duration-300 rounded-lg font-medium transform hover:scale-105"
            >
              RETURN HOME
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">Complete Your Order</h1>
        <p className="text-stone-600 text-lg">
          You're one step away from beginning your skincare ritual
        </p>
        <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-6"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100">
            <h2 className="font-serif text-2xl text-stone-900 mb-6">Shipping Information</h2>
            
            {/* Prefill Loading */}
            {prefillLoading && (
              <div className="flex items-center justify-center py-4 mb-6 bg-amber-50 rounded-lg">
                <Loader2 size={20} className="text-amber-600 animate-spin mr-3" />
                <span className="text-amber-700 text-sm">Loading your saved details...</span>
              </div>
            )}
            
            <div className="space-y-6">
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
                    value={shipping.name}
                    onChange={(e) => update("name", e.target.value)}
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
                    PHONE NUMBER *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-stone-400" />
                    </div>
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 text-sm tracking-wider mb-2">
                    QUANTITY
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                  />
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
                    value={shipping.address1}
                    onChange={(e) => update("address1", e.target.value)}
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
                  value={shipping.address2}
                  onChange={(e) => update("address2", e.target.value)}
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
                    value={shipping.city}
                    onChange={(e) => update("city", e.target.value)}
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
                    value={shipping.state}
                    onChange={(e) => update("state", e.target.value)}
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
                    value={shipping.postal}
                    onChange={(e) => update("postal", e.target.value)}
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
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors resize-vertical"
                    placeholder="Special delivery instructions, gift message, etc. (optional)"
                  />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-amber-300 text-white py-4 px-6 tracking-widest transition-all duration-300 rounded-lg font-medium relative overflow-hidden group"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 size={20} className="animate-spin" />
                    <span>PROCESSING ORDER...</span>
                  </div>
                ) : (
                  <span className="group-hover:scale-105 transition-transform duration-300">PLACE ORDER</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100 sticky top-24">
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
                <p className="text-stone-600 text-sm">4oz jar</p>
                <p className="text-amber-600 text-sm">Unscented</p>
                <p className="text-stone-600 text-sm">Qty: {quantity}</p>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-medium text-stone-900">${(subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Shipping</span>
                <span className="font-medium text-stone-900">${(shippingCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Tax (7%)</span>
                <span className="font-medium text-stone-900">${(taxCents / 100).toFixed(2)}</span>
              </div>
              <div className="border-t border-stone-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-serif text-stone-900">Total</span>
                  <span className="text-xl font-serif text-stone-900">${(totalCents / 100).toFixed(2)}</span>
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
  );
}