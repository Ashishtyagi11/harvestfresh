import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-16 pb-12 border-t border-primary-container relative overflow-hidden">
      {/* Background Organic Leaf Blob Overlay */}
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-primary-container">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-2xl">eco</span>
              </div>
              <span className="font-hanken font-extrabold text-2xl tracking-tight">
                Harvest<span className="text-emerald-400">Fresh</span>
              </span>
            </div>
            <p className="font-jakarta text-xs text-on-primary-container leading-relaxed">
              HarvestFresh connects conscious urban households directly with certified local organic farms. Zero chemical pesticides, zero plastic waste, harvested daily.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-emerald-300 font-bold">100%</span>
              <span className="text-xs font-semibold text-on-primary-container">Organic Certified & Farm Traceable</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-hanken font-bold text-base text-emerald-400 mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 font-jakarta text-xs text-on-primary-container">
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop Produce Listing</Link></li>
              <li><Link to="/monthly-pass" className="hover:text-white transition-colors">Monthly Pass Subscription</Link></li>
              <li><Link to="/delivery-coverage" className="hover:text-white transition-colors">Delivery Zone Coverage</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Your Cart & Checkout</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors">Customer Account Profile</Link></li>
            </ul>
          </div>

          {/* Our Organic Promise */}
          <div>
            <h4 className="font-hanken font-bold text-base text-emerald-400 mb-4">The Terra Promise</h4>
            <ul className="leaf-list space-y-2.5 font-jakarta text-xs text-on-primary-container">
              <li>Harvested at 5:00 AM daily</li>
              <li>Guaranteed delivery in 60 minutes</li>
              <li>100% plastic-free compostable tote bags</li>
              <li>No synthetic pesticides or artificial wax</li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-hanken font-bold text-base text-emerald-400 mb-4">Farm-to-Door Support</h4>
            <p className="font-jakarta text-xs text-on-primary-container mb-3">
              Need assistance with an active subscription or fresh order?
            </p>
            <div className="space-y-2 text-xs font-semibold text-white">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-emerald-400">call</span>
                <span>+91 1800-HARVEST (4278)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-emerald-400">mail</span>
                <span>hello@harvestfresh.farm</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-emerald-400">schedule</span>
                <span>Mon - Sun: 6:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-jakarta text-on-primary-container">
          <p>© {new Date().getFullYear()} HarvestFresh Organic Platforms Inc. All rights reserved. Powered by Terra & Vine.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Harvest</a>
            <a href="#" className="hover:text-white">Organic Certification</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
