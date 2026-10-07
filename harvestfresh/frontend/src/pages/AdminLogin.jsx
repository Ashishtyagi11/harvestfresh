import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const setAuth = useStore((state) => state.setAuth);
  const showToast = useStore((state) => state.showToast);

  const [identifier, setIdentifier] = useState('admin@harvestfresh.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast("Please enter admin identifier and password", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/admin/login', {
        identifier,
        password
      });

      setAuth(res.data.access_token, {
        id: res.data.user_id,
        phone: res.data.phone,
        email: res.data.email,
        role: res.data.role,
        name: res.data.name
      });

      showToast(`Welcome back to Operations Console, ${res.data.name}!`, "success");
      navigate('/admin');
    } catch (err) {
      console.error("Admin authentication error", err);
      showToast(err.response?.data?.detail || "Admin authentication failed. Please check credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantAdmin = async () => {
    setLoading(true);
    try {
      const adminPhone = '9999999999';
      const reqRes = await api.post('/auth/otp/request', { phone: adminPhone });
      const debugOtp = reqRes.data.debug_otp || '123456';
      
      const verifyRes = await api.post('/auth/otp/verify', {
        phone: adminPhone,
        otp: debugOtp,
        name: 'Terra Admin'
      });

      setAuth(verifyRes.data.access_token, {
        id: verifyRes.data.user_id,
        phone: verifyRes.data.phone,
        email: verifyRes.data.email,
        role: verifyRes.data.role,
        name: verifyRes.data.name
      });

      showToast("Authenticated as Terra Admin! Welcome to Operations Console.", "success");
      navigate('/admin');
    } catch (err) {
      showToast(err.response?.data?.detail || "Instant admin login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-jakarta relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <div>
            <h2 className="font-hanken font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Admin Operations Portal
            </h2>
            <p className="font-jakarta text-xs text-slate-400 mt-1.5 leading-relaxed">
              Separate administrative portal for managing HarvestFresh inventory, orders, announcements, and customer approvals.
            </p>
          </div>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Admin Email or Mobile Phone
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@harvestfresh.com or 9999999999"
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500 font-mono"
                required
              />
              <span className="material-symbols-outlined text-slate-400 absolute left-3 top-3 text-base">person</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default: admin123)"
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                required
              />
              <span className="material-symbols-outlined text-slate-400 absolute left-3 top-3 text-base">lock</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            className="!bg-emerald-600 hover:!bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/40 text-xs"
          >
            {loading ? 'Authenticating Console Session...' : 'Sign In to Admin Console'}
          </Button>
        </form>

        <div className="border-t border-slate-800 pt-4 text-center space-y-3">
          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block">
            Demo Instant Override Access
          </span>
          
          <button
            type="button"
            onClick={handleInstantAdmin}
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-amber-400 text-base">bolt</span>
            1-Click Instant Demo Admin Access
          </button>
        </div>

        <div className="pt-2 text-center">
          <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-sm">west</span>
            Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
