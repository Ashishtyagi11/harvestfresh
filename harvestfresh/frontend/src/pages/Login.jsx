import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const setAuth = useStore((state) => state.setAuth);
  const showToast = useStore((state) => state.showToast);

  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Profile Name
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      showToast("Please enter a valid 10-digit phone number", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/request', { phone });
      setDebugOtp(res.data.debug_otp || '');
      setStep(2);
      showToast(res.data.message, "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      showToast("Please enter the 6-digit OTP code", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/verify', {
        phone,
        otp,
        name: name || undefined,
        email: email || undefined
      });

      setAuth(res.data.access_token, {
        id: res.data.user_id,
        phone: res.data.phone,
        role: res.data.role,
        name: res.data.name
      });

      showToast(`Welcome back, ${res.data.name}!`, "success");
      if (res.data.role === 'admin' && redirectPath === '/') {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      showToast(err.response?.data?.detail || "Invalid OTP code", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-secondary/20 shadow-xl max-w-md w-full relative">
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-primary text-emerald-400 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">eco</span>
          </div>
          <h2 className="font-hanken font-extrabold text-2xl sm:text-3xl text-primary">
            {step === 1 ? 'Login or Sign Up' : step === 2 ? 'Verify OTP Code' : 'Complete Your Profile'}
          </h2>
          <p className="font-jakarta text-xs text-on-surface-variant">
            {step === 1
              ? 'Enter your phone number to receive a 6-digit access code'
              : `Enter the 6-digit code sent to +91 ${phone}`}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-primary mb-1.5">Mobile Phone Number</label>
              <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-xl px-3 py-3">
                <span className="font-jakarta text-xs font-bold text-on-surface-variant border-r border-outline-variant pr-2.5">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-transparent font-jakarta text-sm font-semibold focus:outline-none"
                  required
                />
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1.5">
                Tip: Enter <span className="font-bold text-primary">9999999999</span> for instant Admin login!
              </p>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
              {loading ? 'Sending Code...' : 'Get 6-Digit OTP'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {debugOtp && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs text-center font-bold">
                [DEV DEMO] Your OTP Code is: <span className="text-base text-primary font-mono">{debugOtp}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-primary mb-1.5">Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="6-Digit OTP (e.g. 123456)"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-center font-mono text-xl tracking-widest font-bold focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1.5">Full Name (New Users)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tarinee Sharma"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-xs font-jakarta focus:outline-none"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs font-bold text-secondary hover:underline text-center"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
