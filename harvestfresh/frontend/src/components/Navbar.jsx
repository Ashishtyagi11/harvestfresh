import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { PincodeChecker } from './PincodeChecker';

export const Navbar = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const cartItemCount = useStore((state) => state.cartItemCount);
  const currentPincode = useStore((state) => state.currentPincode);
  const deliveryEta = useStore((state) => state.deliveryEta);

  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 glass-nav border-b border-outline-variant/30">
        {/* Top Notification Announcement Bar */}
        <div className="bg-primary text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm text-amber-400">workspace_premium</span>
          <span>Get 20% OFF your first order with code <strong className="text-amber-300">FRESH20</strong> | Guaranteed Delivery Under 60 Mins</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-2xl text-emerald-400">eco</span>
              </div>
              <div>
                <span className="font-hanken font-extrabold text-xl text-primary tracking-tight block leading-none">
                  Harvest<span className="text-secondary">Fresh</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant block mt-0.5">
                  Organic & Local
                </span>
              </div>
            </Link>

            {/* Pincode / Location Selector */}
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="hidden md:flex items-center gap-2 bg-surface-container-low hover:bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/40 transition-colors text-xs font-jakarta"
            >
              <span className="material-symbols-outlined text-primary text-base">location_on</span>
              <div className="text-left">
                <span className="text-[10px] uppercase text-on-surface-variant block leading-none">Delivering to</span>
                <span className="font-bold text-primary">{currentPincode} ({deliveryEta})</span>
              </div>
              <span className="material-symbols-outlined text-sm text-on-surface-variant">expand_more</span>
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search heirloom carrots, fresh spinach, apples..."
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-full py-2 pl-10 pr-4 text-xs font-jakarta text-on-surface focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg">search</span>
            </form>

            {/* Nav Action Items */}
            <div className="flex items-center gap-3">
              <Link
                to="/shop"
                className="font-jakarta text-xs font-bold text-on-surface hover:text-primary px-3 py-2 rounded-lg transition-colors hidden md:block"
              >
                Shop Produce
              </Link>

              <Link
                to="/monthly-pass"
                className="hidden lg:flex items-center gap-1.5 bg-tertiary-container/30 hover:bg-tertiary-container/50 text-tertiary px-3 py-1.5 rounded-full font-jakarta text-xs font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-amber-600">card_membership</span>
                Monthly Pass
              </Link>

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative flex items-center gap-2 bg-primary text-white px-3.5 py-2 rounded-xl font-jakarta text-xs font-bold hover:bg-primary-container transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">shopping_bag</span>
                <span className="hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-tertiary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Account / Auth Dropdown */}
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/account"
                    className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high px-3 py-2 rounded-xl text-xs font-bold text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">account_circle</span>
                    <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="bg-amber-100 text-amber-900 hover:bg-amber-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                      <span className="hidden md:inline">Admin</span>
                    </Link>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-white px-4 py-2 rounded-xl font-jakarta text-xs font-bold transition-colors"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Pincode Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative shadow-2xl animate-in fade-in">
            <button
              onClick={() => setShowLocationModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <PincodeChecker />
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-xs font-semibold text-primary underline"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
