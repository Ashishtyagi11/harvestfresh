import React, { useEffect, useState } from 'react';
import api from '../services/api';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error("Admin fetch orders error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-hanken font-extrabold text-3xl text-primary">Customer Order Pipeline</h2>
        <p className="font-jakarta text-xs text-on-surface-variant mt-1">View incoming orders and update delivery status</p>
      </div>

      {loading ? (
        <div className="h-64 bg-white rounded-2xl animate-pulse"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-jakarta">
              <thead className="bg-surface-container-low text-primary font-bold uppercase tracking-wider border-b border-outline-variant/40">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items / Total</th>
                  <th className="p-4">Pincode</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4 text-right">Update Pipeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-primary">{o.order_number}</td>
                    <td className="p-4 font-bold">{o.customer_name}</td>
                    <td className="p-4">
                      <span className="block font-semibold">{o.items_count} produce items</span>
                      <span className="font-bold text-tertiary">₹{o.total_amount.toFixed(2)}</span>
                    </td>
                    <td className="p-4 font-mono font-semibold">{o.pincode}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${o.source === 'subscription' ? 'bg-purple-100 text-purple-900' : 'bg-blue-100 text-blue-900'}`}>
                        {o.source}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold uppercase text-xs text-primary">{o.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="bg-surface-container-low border border-outline-variant rounded-xl px-2.5 py-1 text-xs font-bold text-primary focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
