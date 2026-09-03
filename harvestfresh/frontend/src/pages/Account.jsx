import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';

export const Account = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const setAuth = useStore((state) => state.setAuth);
  const token = useStore((state) => state.token);
  const logout = useStore((state) => state.logout);
  const showToast = useStore((state) => state.showToast);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/me', { name, email });
      setAuth(token, { ...user, name: res.data.name, email: res.data.email });
      showToast("Profile updated successfully", "success");
    } catch (err) {
      showToast("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-hanken font-extrabold text-3xl text-primary">Your Account Profile</h1>
        <Button variant="outline" size="sm" onClick={() => { logout(); navigate('/'); }}>
          <span className="material-symbols-outlined text-sm">logout</span>
          Log Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-secondary/20 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-outline-variant/30">
            <div className="w-16 h-16 rounded-full bg-primary text-emerald-400 flex items-center justify-center font-hanken font-extrabold text-2xl">
              {user.name[0]}
            </div>
            <div>
              <h3 className="font-hanken font-bold text-xl text-primary">{user.name}</h3>
              <p className="font-jakarta text-xs text-on-surface-variant">+91 {user.phone}</p>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mt-1">
                {user.role} Account
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-xs font-jakarta focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-xs font-jakarta focus:outline-none"
              />
            </div>

            <Button type="submit" variant="primary" size="md" disabled={loading}>
              {loading ? 'Saving...' : 'Update Profile'}
            </Button>
          </form>
        </div>

        {/* Quick Shortcuts Side Box */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary to-primary-container text-white p-6 rounded-3xl shadow-sm space-y-3">
            <span className="material-symbols-outlined text-amber-300 text-3xl">card_membership</span>
            <h4 className="font-hanken font-bold text-lg">Active Subscription</h4>
            <p className="font-jakarta text-xs text-emerald-100">Manage your recurring Monthly Pass deliveries, pause or change plans.</p>
            <Link to="/subscription-management" className="block pt-2">
              <Button variant="accent" size="sm" fullWidth>Manage Monthly Pass</Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-outline-variant/40 space-y-3">
            <span className="material-symbols-outlined text-primary text-3xl">history</span>
            <h4 className="font-hanken font-bold text-lg text-primary">Order History</h4>
            <p className="font-jakarta text-xs text-on-surface-variant">View past purchases, reorder favorite produce, and track status.</p>
            <Link to="/order-history" className="block pt-2">
              <Button variant="outline" size="sm" fullWidth>View Past Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
