import React, { useState } from 'react';
import api from '../services/api';
import { useStore } from '../store/useStore';

export const PincodeChecker = ({ compact = false }) => {
  const currentPincode = useStore((state) => state.currentPincode);
  const setPincode = useStore((state) => state.setPincode);
  const showToast = useStore((state) => state.showToast);

  const [inputPincode, setInputPincode] = useState(currentPincode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!inputPincode || inputPincode.trim().length !== 6) {
      showToast("Please enter a valid 6-digit pincode", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/delivery-zones/check?pincode=${inputPincode.trim()}`);
      setResult(res.data);
      if (res.data.serviceable) {
        setPincode(res.data.pincode, `Under ${res.data.eta_minutes} Mins`);
        showToast(res.data.message, "success");
      } else {
        showToast(res.data.message, "warning");
      }
    } catch (err) {
      showToast("Failed to verify pincode", "error");
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleCheck} className="flex items-center gap-2 bg-surface-container rounded-lg p-1.5 border border-outline-variant">
        <span className="material-symbols-outlined text-primary ml-1 text-lg">location_on</span>
        <input
          type="text"
          maxLength={6}
          value={inputPincode}
          onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter Pincode"
          className="bg-transparent font-jakarta text-xs font-semibold text-on-surface focus:outline-none w-24"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-md hover:bg-primary-container transition-colors disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Verify'}
        </button>
      </form>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-secondary/20 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-2xl">local_shipping</span>
        </div>
        <div>
          <h4 className="font-hanken font-bold text-lg text-primary">Check Delivery Time in Your Area</h4>
          <p className="font-jakarta text-xs text-on-surface-variant">We deliver freshly harvested organic produce in under 60 minutes.</p>
        </div>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2 mt-4">
        <input
          type="text"
          maxLength={6}
          value={inputPincode}
          onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter 6-digit Pincode (e.g. 560038)"
          className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm font-jakarta focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white font-jakarta text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-container transition-colors"
        >
          {loading ? 'Verifying...' : 'Check ETA'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-3 rounded-xl text-xs font-jakarta flex items-center gap-2 ${result.serviceable ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}>
          <span className="material-symbols-outlined text-base">
            {result.serviceable ? 'check_circle' : 'info'}
          </span>
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
};
