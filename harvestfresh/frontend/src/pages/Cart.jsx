import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';
import { QuantityStepper } from '../components/QuantityStepper';

export const Cart = () => {
  const navigate = useNavigate();
  const cartItems = useStore((state) => state.cartItems);
  const cartSubtotal = useStore((state) => state.cartSubtotal);
  const updateCartQty = useStore((state) => state.updateCartQty);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const user = useStore((state) => state.user);
  const showToast = useStore((state) => state.showToast);

  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'FRESH20' || promoCode.trim().toUpperCase() === 'ORGANIC10') {
      setDiscountApplied(true);
      showToast("Promo code FRESH20 applied! 10% discount added.", "success");
    } else {
      showToast("Invalid promo code. Try FRESH20", "warning");
    }
  };

  const deliveryFee = cartSubtotal >= 499 ? 0 : 49;
  const discountAmount = discountApplied ? roundTwo(cartSubtotal * 0.1) : 0;
  const totalAmount = roundTwo(cartSubtotal - discountAmount + deliveryFee);

  function roundTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  const handleProceedToCheckout = () => {
    if (!user) {
      showToast("Please log in to complete your order checkout", "info");
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-secondary-container flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-4xl">shopping_basket</span>
        </div>
        <h2 className="font-hanken font-extrabold text-3xl text-primary">Your Harvest Cart is Empty</h2>
        <p className="font-jakarta text-xs text-on-surface-variant">Explore our morning farm harvest and add fresh organic veggies!</p>
        <div className="pt-4">
          <Link to="/shop">
            <Button variant="primary" size="lg">Browse Fresh Produce</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="font-hanken font-extrabold text-3xl sm:text-4xl text-primary">Your Harvest Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.product_id}
              className="bg-white p-5 rounded-2xl border border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1598170845058-12f6a6723223?q=80&w=800&auto=format&fit=crop'}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover border border-outline-variant/30 shrink-0"
                />
                <div>
                  <h4 className="font-hanken font-bold text-base text-primary">{item.name}</h4>
                  <span className="font-jakarta text-xs text-on-surface-variant">₹{item.price} / {item.unit}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <QuantityStepper
                  value={item.qty}
                  onChange={(newQty) => updateCartQty(item.product_id, newQty)}
                  size="sm"
                />

                <span className="font-hanken font-extrabold text-base text-tertiary w-20 text-right">
                  ₹{item.item_total.toFixed(2)}
                </span>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-on-surface-variant hover:text-error transition-colors p-1"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-secondary/20 shadow-sm space-y-6">
            <h3 className="font-hanken font-bold text-xl text-primary pb-3 border-b border-outline-variant/30">Order Summary</h3>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo Code (FRESH20)"
                className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-xs font-jakarta uppercase focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="bg-secondary text-white font-jakarta text-xs font-bold px-4 py-2 rounded-xl hover:bg-secondary-container hover:text-primary transition-colors"
              >
                Apply
              </button>
            </form>

            <div className="space-y-3 font-jakarta text-xs text-on-surface">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-primary">₹{cartSubtotal.toFixed(2)}</span>
              </div>

              {discountApplied && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Promo Discount (10%)</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700 uppercase">FREE (Over ₹499)</strong> : `₹${deliveryFee}`}</span>
              </div>

              <div className="pt-3 border-t border-outline-variant/30 flex justify-between items-baseline">
                <span className="font-hanken font-bold text-base text-primary">Total Amount</span>
                <span className="font-hanken font-extrabold text-2xl text-tertiary">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
