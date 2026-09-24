import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Toast } from '../components/Toast';
import api from '../services/api';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    if (user && user.role === 'admin') {
      api.get('/admin/stats')
        .then(res => setPendingApprovals(res.data.pending_approvals || 0))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md w-full text-center">
          <span className="material-symbols-outlined text-5xl text-error mb-2">gpp_maybe</span>
          <h2 className="font-hanken font-bold text-2xl text-primary">Admin Access Required</h2>
          <p className="font-jakarta text-sm text-on-surface-variant my-4">
            You must be logged in as an administrator (e.g., phone ends in 9999 or is 9999999999) to access the HarvestFresh Admin Operations Console.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-container shadow-md"
          >
            Log In as Admin
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview Analytics', path: '/admin', icon: 'dashboard' },
    { label: 'Products & Inventory', path: '/admin/products', icon: 'inventory_2' },
    { label: 'Announce Sales & Banners', path: '/admin/sales', icon: 'campaign' },
    { label: 'Customer Approvals', path: '/admin/customers', icon: 'person_check', badge: pendingApprovals },
    { label: 'Customer Orders', path: '/admin/orders', icon: 'local_shipping' },
    { label: 'Delivery Coverage', path: '/admin/delivery-zones', icon: 'map' },
    { label: 'Subscriptions Oversight', path: '/admin/subscriptions', icon: 'card_membership' }
  ];

  return (
    <div className="min-h-screen flex bg-surface-container-low font-jakarta">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col justify-between border-r border-primary-container shrink-0">
        <div>
          <div className="p-6 border-b border-primary-container flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-400 text-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">eco</span>
              </div>
              <div>
                <span className="font-hanken font-bold text-lg block leading-tight">Terra Admin</span>
                <span className="text-[10px] text-emerald-300 font-semibold">Storefront Management</span>
              </div>
            </Link>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    active 
                      ? 'bg-primary-container text-emerald-300 shadow-sm' 
                      : 'text-on-primary-container hover:bg-primary-container/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-primary-container space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              {user.name[0]}
            </div>
            <div className="truncate">
              <span className="font-bold text-xs block text-white">{user.name}</span>
              <span className="text-[10px] text-emerald-300 block">{user.phone}</span>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 bg-red-950/60 hover:bg-red-900 text-red-200 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-outline-variant/30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-hanken font-bold text-xl text-primary">HarvestFresh Operations Console</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">Live Operational Mode</span>
          </div>
          <Link to="/" className="text-xs font-bold text-secondary hover:text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Back to Customer Store
          </Link>
        </header>

        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Toast />
    </div>
  );
};
