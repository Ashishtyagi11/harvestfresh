import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/Button';

export const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Order confirm fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-jakarta text-xs text-on-surface-variant mt-4">Generating order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="font-hanken font-bold text-2xl text-primary">Order not found</h2>
        <Link to="/order-history" className="text-xs font-bold text-secondary underline mt-2 block">View Order History</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Success Badge */}
      <div className="bg-white p-8 rounded-3xl border border-secondary/20 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>

        <h1 className="font-hanken font-extrabold text-3xl text-primary">Order Confirmed!</h1>
        <p className="font-jakarta text-xs text-on-surface-variant max-w-md mx-auto">
          Thank you for choosing HarvestFresh! Our farm partner is packing your organic produce.
        </p>

        <div className="inline-block bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant text-xs font-mono font-bold text-primary">
          Order Number: {order.order_number}
        </div>
      </div>

      {/* Delivery Status Timeline Widget */}
      <div className="bg-gradient-to-r from-primary to-primary-container text-white p-6 rounded-3xl shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-300 text-2xl">timer</span>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Estimated Arrival</span>
              <h4 className="font-hanken font-bold text-lg text-white">Under 60 Minutes</h4>
            </div>
          </div>
          <span className="bg-emerald-800 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full uppercase">
            Status: {order.status}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/20 text-center text-[10px] font-bold text-emerald-100">
          <div className="space-y-1">
            <div className="w-6 h-6 mx-auto rounded-full bg-emerald-400 text-primary flex items-center justify-center">✓</div>
            <span>Confirmed</span>
          </div>
          <div className="space-y-1 opacity-80">
            <div className="w-6 h-6 mx-auto rounded-full bg-emerald-700 text-white flex items-center justify-center">2</div>
            <span>Packing</span>
          </div>
          <div className="space-y-1 opacity-50">
            <div className="w-6 h-6 mx-auto rounded-full bg-emerald-900 text-white flex items-center justify-center">3</div>
            <span>Out for Delivery</span>
          </div>
          <div className="space-y-1 opacity-50">
            <div className="w-6 h-6 mx-auto rounded-full bg-emerald-900 text-white flex items-center justify-center">4</div>
            <span>Delivered</span>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-3xl border border-outline-variant/40 space-y-4">
        <h3 className="font-hanken font-bold text-lg text-primary pb-3 border-b border-outline-variant/30">Order Details</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-jakarta text-on-surface">
          <div>
            <span className="font-bold text-primary block">Delivery Address:</span>
            <p className="text-on-surface-variant">{order.delivery_address.line1}, {order.delivery_address.city} - {order.delivery_address.pincode}</p>
          </div>
          <div>
            <span className="font-bold text-primary block">Scheduled Delivery Slot:</span>
            <p className="text-on-surface-variant">{order.delivery_slot.date} ({order.delivery_slot.window})</p>
          </div>
        </div>

        <div className="pt-4 border-t border-outline-variant/30 space-y-2">
          <span className="font-bold text-xs text-primary block">Produce Basket Items:</span>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs font-jakarta text-on-surface">
              <span>{item.qty} x {item.name}</span>
              <span className="font-bold text-tertiary">₹{(item.qty * item.price).toFixed(2)}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-outline-variant/30 flex justify-between font-hanken font-bold text-base text-primary">
            <span>Total Paid</span>
            <span className="text-tertiary text-xl">₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/order-history" className="flex-1">
          <Button variant="outline" size="lg" fullWidth>Track Order History</Button>
        </Link>
        <Link to="/shop" className="flex-1">
          <Button variant="primary" size="lg" fullWidth>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
};
