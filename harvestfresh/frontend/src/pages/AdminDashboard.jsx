import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Admin stats fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-hanken font-bold text-2xl text-primary">Overview Analytics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-32 bg-white rounded-2xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-jakarta">
      <div>
        <h2 className="font-hanken font-extrabold text-3xl text-primary">Operations & Sales Command Center</h2>
        <p className="font-jakarta text-xs text-on-surface-variant mt-1">Live metrics from HarvestFresh online shopping & delivery platform</p>
      </div>

      {/* Primary KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-secondary/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-secondary">
            <span className="material-symbols-outlined text-3xl">shopping_cart</span>
            <span className="text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Today</span>
          </div>
          <span className="font-hanken font-extrabold text-3xl text-primary block">{stats.orders_today}</span>
          <span className="font-jakarta text-xs text-on-surface-variant font-semibold">Orders Placed Today</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-secondary/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-tertiary">
            <span className="material-symbols-outlined text-3xl">payments</span>
            <span className="text-[11px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">Today</span>
          </div>
          <span className="font-hanken font-extrabold text-3xl text-tertiary block">₹{stats.revenue_today}</span>
          <span className="font-jakarta text-xs text-on-surface-variant font-semibold">Revenue Collected Today</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-secondary/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="material-symbols-outlined text-3xl">person_check</span>
            <span className="text-[11px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">Approvals</span>
          </div>
          <span className="font-hanken font-extrabold text-3xl text-amber-600 block">{stats.pending_approvals}</span>
          <span className="font-jakarta text-xs text-on-surface-variant font-semibold">Pending Customer Approvals</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-secondary/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-red-600">
            <span className="material-symbols-outlined text-3xl">warning</span>
            <span className="text-[11px] font-bold uppercase bg-red-100 text-red-900 px-2 py-0.5 rounded-full">Inventory</span>
          </div>
          <span className="font-hanken font-extrabold text-3xl text-red-600 block">{stats.low_stock_products}</span>
          <span className="font-jakarta text-xs text-on-surface-variant font-semibold">Low Stock Products (&le;20)</span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h3 className="font-hanken font-bold text-xl text-primary mb-4">Operational Shortcut Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/sales" className="bg-white p-6 rounded-2xl border border-outline-variant/40 hover:border-emerald-500 hover:shadow-md transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">campaign</span>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-hanken font-bold text-base text-primary">Announce Sales & Banners</h4>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{stats.active_announcements} Active</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Broadcast promotional sales, promo codes, and delivery announcements live to customers.</p>
            </div>
          </Link>

          <Link to="/admin/customers" className="bg-white p-6 rounded-2xl border border-outline-variant/40 hover:border-emerald-500 hover:shadow-md transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">person_check</span>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-hanken font-bold text-base text-primary">Customer Approvals</h4>
                {stats.pending_approvals > 0 && (
                  <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                    {stats.pending_approvals} Action Needed
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Review new customer signups, approve B2B accounts, and manage user privileges.</p>
            </div>
          </Link>

          <Link to="/admin/products" className="bg-white p-6 rounded-2xl border border-outline-variant/40 hover:border-emerald-500 hover:shadow-md transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
            <div>
              <h4 className="font-hanken font-bold text-base text-primary">Products & Inventory</h4>
              <p className="text-xs text-on-surface-variant mt-1">Add organic produce, set sale discounts, restock stock levels, and assign organic tags.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/40 space-y-4">
          <h3 className="font-hanken font-bold text-lg text-primary">All-Time Platform Financials</h3>
          <div className="space-y-3 font-jakarta text-sm">
            <div className="flex justify-between py-2 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Total Completed Orders</span>
              <span className="font-bold text-primary">{stats.total_orders}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Total Platform Revenue</span>
              <span className="font-hanken font-bold text-lg text-tertiary">₹{stats.total_revenue}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-on-surface-variant">Registered Platform Customers</span>
              <span className="font-bold text-primary">{stats.total_users}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-primary-container text-white p-6 rounded-2xl space-y-4">
          <h3 className="font-hanken font-bold text-lg text-white">Daily Subscription Order Runner</h3>
          <p className="font-jakarta text-xs text-emerald-100 leading-relaxed">
            APScheduler automatically generates recurring delivery orders daily at midnight. You can also manually trigger an immediate check for due subscriptions.
          </p>
          <button
            onClick={async () => {
              try {
                const res = await api.post('/subscriptions/process-due');
                alert(res.data.message);
              } catch (e) {
                alert("Error triggering subscription runner");
              }
            }}
            className="bg-emerald-400 text-primary font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-emerald-300 transition-colors shadow-md"
          >
            Trigger Subscription Order Generation
          </button>
        </div>
      </div>
    </div>
  );
};
