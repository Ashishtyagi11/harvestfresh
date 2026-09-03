import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';

export const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const showToast = useStore((state) => state.showToast);

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await api.get('/subscriptions/me');
        setSubscriptions(res.data);
      } catch (err) {
        console.error("Subscription fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSubscriptions();
  }, [user]);

  const handlePause = async (subId) => {
    try {
      const res = await api.patch(`/subscriptions/${subId}/pause?days=7`);
      showToast("Subscription paused for 7 days", "info");
      setSubscriptions(subscriptions.map(s => s.id === subId ? { ...s, status: 'paused' } : s));
    } catch (err) {
      showToast("Failed to pause subscription", "error");
    }
  };

  const handleResume = async (subId) => {
    try {
      const res = await api.patch(`/subscriptions/${subId}/resume`);
      showToast("Subscription resumed!", "success");
      setSubscriptions(subscriptions.map(s => s.id === subId ? { ...s, status: 'active' } : s));
    } catch (err) {
      showToast("Failed to resume subscription", "error");
    }
  };

  const handleCancel = async (subId) => {
    try {
      await api.delete(`/subscriptions/${subId}`);
      showToast("Subscription cancelled", "info");
      setSubscriptions(subscriptions.map(s => s.id === subId ? { ...s, status: 'cancelled' } : s));
    } catch (err) {
      showToast("Failed to cancel subscription", "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-jakarta text-xs text-on-surface-variant mt-4">Loading active subscription passes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-hanken font-extrabold text-3xl sm:text-4xl text-primary">Manage Subscription Passes</h1>
          <p className="font-jakarta text-xs text-on-surface-variant mt-1">Control your recurring organic produce deliveries</p>
        </div>
        <Link to="/monthly-pass">
          <Button variant="accent" size="sm">Explore New Plans</Button>
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-outline-variant space-y-3">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">card_membership</span>
          <h3 className="font-hanken font-bold text-xl text-primary">No Active Subscription Pass</h3>
          <p className="font-jakarta text-xs text-on-surface-variant">Subscribe to get weekly organic baskets delivered automatically!</p>
          <div className="pt-2">
            <Link to="/monthly-pass">
              <Button variant="primary">View Monthly Pass Plans</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((sub) => {
            const nextDateStr = new Date(sub.next_delivery_date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            });

            return (
              <div key={sub.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-secondary/20 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-outline-variant/30">
                  <div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                      {sub.frequency} Pass
                    </span>
                    <h3 className="font-hanken font-bold text-2xl text-primary mt-1">{sub.plan_name}</h3>
                  </div>

                  <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full uppercase ${sub.status === 'active' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : sub.status === 'paused' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-red-100 text-red-900'}`}>
                    Status: {sub.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-jakarta">
                  <div className="bg-surface-container-low p-4 rounded-2xl">
                    <span className="text-on-surface-variant font-bold block mb-1">Next Delivery Date</span>
                    <span className="font-hanken font-bold text-base text-primary">{nextDateStr}</span>
                  </div>

                  <div className="bg-surface-container-low p-4 rounded-2xl">
                    <span className="text-on-surface-variant font-bold block mb-1">Delivery Address</span>
                    <span className="font-bold text-primary block">{sub.delivery_address.line1}</span>
                    <span className="text-on-surface-variant">{sub.delivery_address.city} - {sub.delivery_address.pincode}</span>
                  </div>

                  <div className="bg-surface-container-low p-4 rounded-2xl">
                    <span className="text-on-surface-variant font-bold block mb-1">Plan Billing</span>
                    <span className="font-hanken font-bold text-base text-tertiary">₹{sub.plan_price} / {sub.frequency}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                  {sub.status === 'active' ? (
                    <Button variant="soft" size="sm" onClick={() => handlePause(sub.id)}>
                      <span className="material-symbols-outlined text-sm">pause</span>
                      Pause Next 7 Days
                    </Button>
                  ) : sub.status === 'paused' ? (
                    <Button variant="primary" size="sm" onClick={() => handleResume(sub.id)}>
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      Resume Subscription
                    </Button>
                  ) : null}

                  {sub.status !== 'cancelled' && (
                    <Button variant="outline" size="sm" onClick={() => handleCancel(sub.id)}>
                      Cancel Pass
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
