import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';

export const MonthlyPass = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const showToast = useStore((state) => state.showToast);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/subscriptions/plans');
        setPlans(res.data);
      } catch (err) {
        console.error("Subscription plans fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (plan) => {
    if (!user) {
      showToast("Please log in to subscribe to a Monthly Pass", "warning");
      navigate('/login');
      return;
    }
    
    try {
      const payload = {
        plan_id: plan._id || plan.id,
        delivery_address: user.addresses[0] || {
          label: "Home",
          line1: "100 Feet Road, Indiranagar",
          pincode: "560038",
          city: "Bengaluru"
        },
        frequency: plan.frequency || "weekly"
      };
      const res = await api.post('/subscriptions', payload);
      showToast(`Subscribed to ${plan.name} successfully!`, "success");
      navigate('/subscription-management');
    } catch (err) {
      showToast(err.response?.data?.detail || "Subscription creation failed", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* HERO BANNER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tertiary-container/30 text-tertiary text-xs font-bold">
          <span className="material-symbols-outlined text-sm">card_membership</span>
          ORGANIC SUBSCRIPTION MEMBERSHIP
        </div>
        <h1 className="font-hanken font-extrabold text-4xl sm:text-5xl text-primary">
          HarvestFresh Monthly Pass
        </h1>
        <p className="font-jakarta text-base text-on-surface-variant leading-relaxed">
          Get peak-freshness organic produce delivered to your doorstep every week. Enjoy guaranteed savings of up to 35%, zero delivery fees, and priority morning slots.
        </p>
      </div>

      {/* PLANS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 bg-surface-container animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => {
            const isFeatured = idx === 1;
            return (
              <div
                key={plan._id || plan.id}
                className={`terra-card p-8 rounded-3xl flex flex-col justify-between relative ${isFeatured ? 'border-2 border-primary shadow-xl bg-white scale-105' : 'bg-surface-container-lowest'}`}
              >
                {isFeatured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular Choice
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="font-hanken font-bold text-2xl text-primary">{plan.name}</h3>
                    <p className="font-jakarta text-xs text-on-surface-variant mt-2 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="py-4 border-y border-outline-variant/30">
                    <span className="font-hanken font-extrabold text-4xl text-tertiary">₹{plan.price}</span>
                    <span className="font-jakarta text-xs font-semibold text-on-surface-variant ml-1">
                      / {plan.frequency}
                    </span>
                    {plan.included_items_value > 0 && (
                      <div className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full inline-block mt-2">
                        Get ₹{plan.included_items_value} worth of fresh harvest
                      </div>
                    )}
                  </div>

                  {/* Plan Perks */}
                  <ul className="leaf-list space-y-3 text-xs font-jakarta text-on-surface leading-snug">
                    <li>100% Certified Organic & Farm Traceable</li>
                    <li>Zero Express Delivery Fees</li>
                    <li>Priority 7:00 AM - 9:00 AM Delivery Slot</li>
                    <li>Pause, skip or cancel anytime with 1-click</li>
                    <li>Eco-friendly compostable jute bag inclusion</li>
                  </ul>
                </div>

                <div className="pt-8">
                  <Button
                    variant={isFeatured ? 'primary' : 'outline'}
                    size="lg"
                    fullWidth
                    onClick={() => handleSubscribe(plan)}
                  >
                    Subscribe to {plan.name}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WHY SUBSCRIBE PERKS */}
      <div className="bg-surface-container-low p-8 sm:p-12 rounded-3xl border border-outline-variant/40 space-y-8">
        <h3 className="font-hanken font-bold text-2xl text-primary text-center">Why Members Love Harvest Pass</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4 space-y-2">
            <span className="material-symbols-outlined text-4xl text-primary">schedule</span>
            <h4 className="font-hanken font-bold text-lg text-primary">Fixed Schedule Convenience</h4>
            <p className="font-jakarta text-xs text-on-surface-variant">Set your preferred delivery days. No need to manually order every week.</p>
          </div>
          <div className="p-4 space-y-2">
            <span className="material-symbols-outlined text-4xl text-primary">savings</span>
            <h4 className="font-hanken font-bold text-lg text-primary">Guaranteed Farm Savings</h4>
            <p className="font-jakarta text-xs text-on-surface-variant">Save up to ₹1,500 monthly compared to individual grocery store prices.</p>
          </div>
          <div className="p-4 space-y-2">
            <span className="material-symbols-outlined text-4xl text-primary">pause_circle</span>
            <h4 className="font-hanken font-bold text-lg text-primary">Ultimate Flexibility</h4>
            <p className="font-jakarta text-xs text-on-surface-variant">Going on vacation? Pause or skip any upcoming week with a single click.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
