import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const setAuth = useStore((state) => state.setAuth);
  const showToast = useStore((state) => state.showToast);

  // Auth Modes: 'login' | 'signup' | 'otp'
  const [activeTab, setActiveTab] = useState('login');

  // Password Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up state (Name, Address, Phone, Email, Password)
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560038');
  const [addressLabel, setAddressLabel] = useState('Home');

  // OTP Login state
  const [otpStep, setOtpStep] = useState(1); // 1: Request, 2: Verify
  const [otpPhone, setOtpPhone] = useState('9876543210');
  const [otpCode, setOtpCode] = useState('');
  const [debugOtp, setDebugOtp] = useState('');

  const [loading, setLoading] = useState(false);

  // 1. Handle Customer Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!loginIdentifier) {
      showToast("Please enter your email or mobile phone number", "warning");
      return;
    }
    if (!loginPassword) {
      showToast("Please enter your password", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        identifier: loginIdentifier,
        password: loginPassword
      });

      setAuth(res.data.access_token, {
        id: res.data.user_id,
        phone: res.data.phone,
        email: res.data.email,
        role: res.data.role,
        name: res.data.name
      });

      showToast(`Welcome back, ${res.data.name}!`, "success");
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      console.error("Login error", err);
      showToast(err.response?.data?.detail || "Invalid login credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Customer Sign Up with Name, Address, Phone, Email & Password
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpName.trim()) {
      showToast("Please enter your full name", "warning");
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      showToast("Please enter a valid email address", "warning");
      return;
    }
    if (!signUpPhone || signUpPhone.length < 10) {
      showToast("Please enter a valid 10-digit mobile phone number", "warning");
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      showToast("Password must be at least 6 characters long", "warning");
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      showToast("Passwords do not match", "warning");
      return;
    }
    if (!addressLine1.trim() || !city.trim() || !pincode.trim()) {
      showToast("Please complete your delivery address details", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: signUpName,
        email: signUpEmail,
        phone: signUpPhone,
        password: signUpPassword,
        address_line1: addressLine1,
        city: city,
        pincode: pincode,
        address_label: addressLabel
      });

      setAuth(res.data.access_token, {
        id: res.data.user_id,
        phone: res.data.phone,
        email: res.data.email,
        role: res.data.role,
        name: res.data.name
      });

      showToast(`Account created successfully! Welcome to HarvestFresh, ${res.data.name}.`, "success");
      navigate(redirectPath);
    } catch (err) {
      console.error("Sign up error", err);
      showToast(err.response?.data?.detail || "Registration failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Quick OTP Request
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!otpPhone || otpPhone.length < 10) {
      showToast("Please enter a valid 10-digit phone number", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/request', { phone: otpPhone });
      setDebugOtp(res.data.debug_otp || '');
      setOtpStep(2);
      showToast(res.data.message, "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Quick OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      showToast("Please enter the 6-digit OTP code", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/verify', {
        phone: otpPhone,
        otp: otpCode
      });

      setAuth(res.data.access_token, {
        id: res.data.user_id,
        phone: res.data.phone,
        email: res.data.email,
        role: res.data.role,
        name: res.data.name
      });

      showToast(`Welcome back, ${res.data.name}!`, "success");
      if (res.data.role === 'admin') {
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
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-8 font-jakarta bg-surface-container-low/50">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-secondary/20 shadow-xl max-w-lg w-full relative">
        {/* Top Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-primary text-emerald-400 flex items-center justify-center font-bold shadow-md">
            <span className="material-symbols-outlined text-2xl">eco</span>
          </div>
          <h2 className="font-hanken font-extrabold text-2xl sm:text-3xl text-primary">
            HarvestFresh Express
          </h2>
          <p className="font-jakarta text-xs text-on-surface-variant">
            Farm-to-table organic produce delivered to your doorstep under 60 mins
          </p>
        </div>

        {/* Tab Navigation: Log In vs Sign Up */}
        <div className="flex border-b border-outline-variant/30 mb-6 bg-surface-container-low p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'login'
                ? 'bg-white text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'signup'
                ? 'bg-white text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* --- TAB 1: LOG IN --- */}
        {activeTab === 'login' && (
          <div className="space-y-5">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-1.5">
                  Email Address or Mobile Phone
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. tarinee@example.com or 9876543210"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 pl-10 text-xs font-jakarta focus:outline-none focus:border-primary"
                    required
                  />
                  <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-3 text-base">person</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-primary">Password</label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 pl-10 text-xs font-jakarta focus:outline-none focus:border-primary"
                    required
                  />
                  <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-3 text-base">lock</span>
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                {loading ? 'Logging In...' : 'Log In'}
              </Button>
            </form>

            <div className="relative border-t border-outline-variant/30 pt-4 text-center">
              <span className="bg-white px-2 text-[11px] font-semibold text-on-surface-variant block mb-3">
                Or prefer one-time SMS verification?
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('otp')}
                className="w-full bg-surface-container-low hover:bg-surface-container text-primary font-bold py-2.5 rounded-xl text-xs border border-outline-variant/40 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">sms</span>
                Log In via 6-Digit Mobile OTP
              </button>
            </div>
          </div>
        )}

        {/* --- TAB 2: SIGN UP (Name, Address, Phone, Email, Password) --- */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Full Name</label>
              <input
                type="text"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="e.g. Tarinee Sharma"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs font-jakarta focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Email Address</label>
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs font-jakarta focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Phone Number</label>
                <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-xl px-2.5 py-2">
                  <span className="text-xs font-bold text-on-surface-variant pr-1.5 border-r border-outline-variant/40 mr-1.5">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full bg-transparent text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address Registration Fields */}
            <div className="bg-emerald-50/50 border border-emerald-200/60 p-3.5 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                <span className="material-symbols-outlined text-base">location_on</span>
                <span>Delivery Address (For Fresh Orders)</span>
              </div>

              <div>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Flat / House / Street Address Line 1"
                  className="w-full bg-white border border-outline-variant/60 rounded-xl p-2 text-xs font-jakarta focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City (e.g. Bengaluru)"
                  className="w-full bg-white border border-outline-variant/60 rounded-xl p-2 text-xs font-jakarta focus:outline-none focus:border-primary"
                  required
                />
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Pincode (e.g. 560038)"
                  className="w-full bg-white border border-outline-variant/60 rounded-xl p-2 text-xs font-mono font-bold focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Create Password</label>
                <input
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs font-jakarta focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs font-jakarta focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading} className="mt-2">
              {loading ? 'Creating Account...' : 'Sign Up & Start Fresh'}
            </Button>
          </form>
        )}

        {/* --- TAB 3: OTP ACCESS (Alternate Mode) --- */}
        {activeTab === 'otp' && (
          <div className="space-y-4">
            {otpStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Mobile Phone Number</label>
                  <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-xl px-3 py-3">
                    <span className="font-jakarta text-xs font-bold text-on-surface-variant border-r border-outline-variant pr-2.5">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full bg-transparent font-jakarta text-sm font-semibold focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                  {loading ? 'Sending Code...' : 'Get 6-Digit OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {debugOtp && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs text-center font-bold">
                    [DEMO] Your OTP Code is: <span className="text-base text-primary font-mono">{debugOtp}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-Digit OTP (e.g. 123456)"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-center font-mono text-xl tracking-widest font-bold focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Log In'}
                </Button>
              </form>
            )}

            <button
              type="button"
              onClick={() => { setActiveTab('login'); setOtpStep(1); }}
              className="w-full text-xs font-bold text-secondary hover:underline text-center block pt-2"
            >
              Back to Standard Login
            </button>
          </div>
        )}

        {/* Separate Link to Admin Console */}
        <div className="mt-8 pt-4 border-t border-outline-variant/30 text-center">
          <Link
            to="/admin/login"
            className="text-xs font-bold text-slate-500 hover:text-emerald-700 flex items-center justify-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            Looking for Admin Portal? Go to /admin/login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
