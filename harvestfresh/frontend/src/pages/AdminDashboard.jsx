import React, { useEffect, useState } from 'react';
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
    <div className="space-y-8">
      <div>
        <h2 className="font-hanken font-extrabold text-3xl text-primary">Operations & Sales Analytics</h2>
        <p className="font-jakarta text-xs text-on-surface-variant mt-1">Live metrics from MongoDB produce pipeline</p>
      </div>

      {/* Stats Cards */}
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
          <div className="flex items-center justify-between text-primary">
            <span className="material-symbols-outlined text-3xl">card_membership</span>
            <span className="text-[11px] font-bold uppercase bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <span className="font-hanken font-extrabold text-3xl text-primary block">{stats.active_subscriptions}</span>
          <span className="font-jakarta text-xs text-on-surface-variant font-semibold">Active Monthly Passes</span>
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
            className="bg-emerald-400 text-primary font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-emerald-300 transition-colors"
          >
            Trigger Subscription Order Generation
          </button>
        </div>
      </div>
    </div>
  );
};
