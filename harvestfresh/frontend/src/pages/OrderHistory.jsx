import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';

export const OrderHistory = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const addToCart = useStore((state) => state.addToCart);
  const showToast = useStore((state) => state.showToast);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) {
        console.error("Order history fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const handleReorder = async (order) => {
    for (const item of order.items) {
      await addToCart(item.product_id, item.qty);
    }
    showToast("Items added back to your cart!", "success");
    navigate('/cart');
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/cancel`);
      showToast("Order cancelled", "info");
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to cancel order", "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-jakarta text-xs text-on-surface-variant mt-4">Fetching order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="font-hanken font-extrabold text-3xl sm:text-4xl text-primary">Your Harvest Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-outline-variant">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-2">history</span>
          <h3 className="font-hanken font-bold text-xl text-primary">No previous orders found</h3>
          <p className="font-jakarta text-xs text-on-surface-variant mt-1">Start shopping fresh produce today!</p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/shop')}>Browse Fresh Produce</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const dateStr = new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            });

            const statusColors = {
              pending: 'bg-amber-100 text-amber-900',
              confirmed: 'bg-blue-100 text-blue-900',
              packed: 'bg-indigo-100 text-indigo-900',
              out_for_delivery: 'bg-purple-100 text-purple-900',
              delivered: 'bg-emerald-100 text-emerald-900',
              cancelled: 'bg-red-100 text-red-900'
            };

            return (
              <div key={order.id} className="bg-white p-6 rounded-3xl border border-outline-variant/40 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-outline-variant/30">
                  <div>
                    <span className="font-mono font-bold text-sm text-primary">{order.order_number}</span>
                    <span className="font-jakarta text-xs text-on-surface-variant ml-3">• Placed on {dateStr}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${statusColors[order.status] || 'bg-gray-100'}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-jakarta text-on-surface">
                      <span>{item.qty} x {item.name}</span>
                      <span className="font-bold text-tertiary">₹{(item.qty * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-outline-variant/30 text-xs font-jakarta">
                  <div>
                    <span className="text-on-surface-variant">Slot: </span>
                    <span className="font-bold text-primary">{order.delivery_slot.date} ({order.delivery_slot.window})</span>
                    <span className="block font-hanken font-bold text-base text-tertiary mt-1">Total: ₹{order.total_amount.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <Button variant="outline" size="sm" onClick={() => handleCancelOrder(order.id)}>
                        Cancel Order
                      </Button>
                    )}
                    <Button variant="primary" size="sm" onClick={() => handleReorder(order)}>
                      <span className="material-symbols-outlined text-sm">replay</span>
                      Reorder Basket
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
