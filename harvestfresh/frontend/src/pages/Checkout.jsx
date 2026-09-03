import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';

export const Checkout = () => {
  const navigate = useNavigate();
  const cartItems = useStore((state) => state.cartItems);
  const cartSubtotal = useStore((state) => state.cartSubtotal);
  const user = useStore((state) => state.user);
  const showToast = useStore((state) => state.showToast);

  const [address, setAddress] = useState({
    label: "Home",
    line1: user?.addresses?.[0]?.line1 || "100 Feet Road, Indiranagar",
    pincode: user?.addresses?.[0]?.pincode || "560038",
    city: user?.addresses?.[0]?.city || "Bengaluru"
  });

  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [deliveryWindow, setDeliveryWindow] = useState("7:00 AM - 9:00 AM");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod | stub_card | stub_upi
  const [loading, setLoading] = useState(false);

  const deliveryFee = cartSubtotal >= 499 ? 0 : 49;
  const totalAmount = (cartSubtotal + deliveryFee).toFixed(2);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.line1 || !address.pincode || !address.city) {
      showToast("Please fill in complete delivery address details", "warning");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        delivery_address: address,
        delivery_slot_date: deliveryDate,
        delivery_slot_window: deliveryWindow,
        payment_method: paymentMethod
      };

      const res = await api.post('/orders', orderPayload);
      showToast("Order placed successfully!", "success");
      navigate(`/order-confirmation/${res.data.id}`);
    } catch (err) {
      showToast(err.response?.data?.detail || "Order creation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="font-hanken font-extrabold text-2xl text-primary">No items in cart for checkout</h2>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/shop')}>Return to Shop</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="font-hanken font-extrabold text-3xl sm:text-4xl text-primary">Checkout & Slot Selection</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Address, Delivery Slot & Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* Address Section */}
          <div className="bg-white p-6 rounded-3xl border border-secondary/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
              <h3 className="font-hanken font-bold text-xl text-primary">Delivery Address</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Address Label</label>
                <input
                  type="text"
                  value={address.label}
                  onChange={(e) => setAddress({ ...address, label: e.target.value })}
                  placeholder="Home / Work"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-xs font-jakarta focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Pincode (6 Digits)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="560038"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-xs font-jakarta focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-primary mb-1">Full Street Address & Landmark</label>
                <input
                  type="text"
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  placeholder="Flat No., House Name, Street 100 Feet Road"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-xs font-jakarta focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-primary mb-1">City / Region</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="Bengaluru"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-xs font-jakarta focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Slot Picker */}
          <div className="bg-white p-6 rounded-3xl border border-secondary/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
              <h3 className="font-hanken font-bold text-xl text-primary">Harvest Delivery Slot</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Select Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-xs font-jakarta focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Preferred Time Window</label>
                <select
                  value={deliveryWindow}
                  onChange={(e) => setDeliveryWindow(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-xs font-jakarta focus:outline-none"
                >
                  <option value="7:00 AM - 9:00 AM">7:00 AM - 9:00 AM (Early Harvest)</option>
                  <option value="9:00 AM - 11:00 AM">9:00 AM - 11:00 AM (Standard)</option>
                  <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM (Evening Harvest)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white p-6 rounded-3xl border border-secondary/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-2xl">payments</span>
              <h3 className="font-hanken font-bold text-xl text-primary">Payment Method</h3>
            </div>

            <div className="space-y-3">
              <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-secondary-container/20' : 'border-outline-variant'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 accent-primary"
                  />
                  <div>
                    <span className="font-hanken font-bold text-sm text-primary block">Cash / Pay on Delivery (COD)</span>
                    <span className="font-jakarta text-xs text-on-surface-variant">Pay via cash or UPI to delivery rider upon fresh arrival</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-emerald-600">local_atm</span>
              </label>

              <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'stub_upi' ? 'border-primary bg-secondary-container/20' : 'border-outline-variant'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="stub_upi"
                    checked={paymentMethod === 'stub_upi'}
                    onChange={() => setPaymentMethod('stub_upi')}
                    className="w-4 h-4 accent-primary"
                  />
                  <div>
                    <span className="font-hanken font-bold text-sm text-primary block">Instant UPI Gateway (Simulated)</span>
                    <span className="font-jakarta text-xs text-on-surface-variant">GPay, PhonePe, Paytm instant payment interface</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-emerald-600">qr_code_scanner</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Place Order */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-secondary/20 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-hanken font-bold text-xl text-primary pb-3 border-b border-outline-variant/30">Basket Summary</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.product_id} className="flex justify-between items-center text-xs font-jakarta">
                  <div>
                    <span className="font-bold text-primary block">{item.name}</span>
                    <span className="text-on-surface-variant">{item.qty} x ₹{item.price}</span>
                  </div>
                  <span className="font-bold text-tertiary">₹{item.item_total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-outline-variant/30 text-xs font-jakarta">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-primary">₹{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-outline-variant/30 items-baseline">
                <span className="font-hanken font-bold text-base text-primary">Total Amount</span>
                <span className="font-hanken font-extrabold text-2xl text-tertiary">₹{totalAmount}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Processing Order...' : 'Confirm & Place Order'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
