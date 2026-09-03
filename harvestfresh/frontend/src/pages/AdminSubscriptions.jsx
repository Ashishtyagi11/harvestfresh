import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';

export const AdminSubscriptions = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Admin stats fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const handleProcessDue = async () => {
    try {
      const res = await api.post('/subscriptions/process-due');
      alert(res.data.message);
    } catch (err) {
      alert("Failed to process due subscriptions");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-hanken font-extrabold text-3xl text-primary">Monthly Pass Subscriptions Oversight</h2>
          <p className="font-jakarta text-xs text-on-surface-variant mt-1">Monitor active member plans and recurring background order scheduler</p>
        </div>
        <Button variant="accent" onClick={handleProcessDue}>
          <span className="material-symbols-outlined text-sm">published_with_changes</span>
          Run Daily Subscription Job
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-secondary/20 shadow-sm space-y-4">
        <h3 className="font-hanken font-bold text-lg text-primary">Active Subscriptions Summary</h3>
        <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
          The background scheduler (APScheduler) runs automatically every day to generate recurring produce orders for active pass holders when <code className="bg-surface-container px-1 py-0.5 rounded text-primary">next_delivery_date &le; today</code>.
        </p>

        {loading ? (
          <div className="h-20 bg-surface-container animate-pulse rounded-xl"></div>
        ) : (
          <div className="flex items-center gap-6 pt-4 border-t border-outline-variant/30 font-jakarta text-xs">
            <div className="bg-surface-container-low p-4 rounded-xl flex-1 text-center">
              <span className="text-on-surface-variant block font-bold">Active Subscriptions</span>
              <span className="font-hanken font-extrabold text-2xl text-primary">{stats.active_subscriptions}</span>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl flex-1 text-center">
              <span className="text-on-surface-variant block font-bold">Total Platform Users</span>
              <span className="font-hanken font-extrabold text-2xl text-secondary">{stats.total_users}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
