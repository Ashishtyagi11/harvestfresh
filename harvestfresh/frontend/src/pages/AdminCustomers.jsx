import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'all'
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async () => {
    try {
      const statusParam = activeTab === 'all' ? 'all' : activeTab;
      const res = await api.get(`/admin/users?approval_status=${statusParam}`);
      setCustomers(res.data);
    } catch (err) {
      console.error("Fetch customers error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [activeTab]);

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/users/${id}/approve`);
      fetchCustomers();
    } catch (err) {
      alert("Error approving customer");
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Are you sure you want to reject this customer registration?")) {
      try {
        await api.post(`/admin/users/${id}/reject`);
        fetchCustomers();
      } catch (err) {
        alert("Error rejecting customer");
      }
    }
  };

  const handleUpdateStatus = async (id, statusPayload) => {
    try {
      await api.put(`/admin/users/${id}/status`, statusPayload);
      fetchCustomers();
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer((prev) => ({ ...prev, ...statusPayload }));
      }
    } catch (err) {
      alert("Error updating customer settings");
    }
  };

  const filteredCustomers = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q));
  });

  const pendingCount = customers.filter(c => c.approval_status === 'pending').length;

  return (
    <div className="space-y-6 font-jakarta">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-hanken font-extrabold text-3xl text-primary">Customer Approvals & Directory</h2>
          <p className="font-jakarta text-xs text-on-surface-variant mt-1">
            Review new customer signups, manage wholesale/B2B buyer approvals, and oversee account statuses
          </p>
        </div>

        <div className="flex items-center bg-white border border-outline-variant/40 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-primary hover:bg-slate-50'
            }`}
          >
            <span>Pending Approval</span>
            {pendingCount > 0 && (
              <span className="bg-white text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'approved' ? 'bg-primary text-white shadow-sm' : 'text-primary hover:bg-slate-50'
            }`}
          >
            Approved Customers
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'all' ? 'bg-primary text-white shadow-sm' : 'text-primary hover:bg-slate-50'
            }`}
          >
            All Accounts
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-outline-variant/40 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">search</span>
          <input
            type="text"
            placeholder="Search by customer name, phone number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-white rounded-2xl animate-pulse"></div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-on-surface-variant space-y-3">
          <span className="material-symbols-outlined text-4xl text-slate-300">person_off</span>
          <p className="font-bold text-sm">No customers found for this filter tab</p>
          <p className="text-xs text-slate-400">All customer registrations are up to date.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-primary font-bold uppercase tracking-wider border-b border-outline-variant/40">
                <tr>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Account Type</th>
                  <th className="p-4">Approval Status</th>
                  <th className="p-4">Orders / Spent</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200">
                          {c.name ? c.name[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <span className="font-bold text-primary block text-sm">{c.name}</span>
                          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant font-mono mt-0.5">
                            <span>{c.phone}</span>
                            {c.email && <span>• {c.email}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={c.account_type || 'retail'}
                        onChange={(e) => handleUpdateStatus(c.id, { account_type: e.target.value })}
                        className="bg-surface-container-low border border-outline-variant rounded-lg p-1 font-bold text-xs"
                      >
                        <option value="retail">🛒 Retail Buyer</option>
                        <option value="wholesale">📦 B2B Wholesale</option>
                        <option value="vip">⭐ VIP Pass Holder</option>
                      </select>
                    </td>
                    <td className="p-4">
                      {c.approval_status === 'pending' && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center w-max gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          Pending Review
                        </span>
                      )}
                      {c.approval_status === 'approved' && (
                        <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center w-max gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Approved
                        </span>
                      )}
                      {c.approval_status === 'rejected' && (
                        <span className="bg-red-100 text-red-800 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center w-max gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-semibold">
                      <div>
                        <span className="text-primary block font-bold">{c.total_orders} Orders</span>
                        <span className="text-tertiary text-[11px] block">₹{c.total_spent} Total</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.role === 'admin' ? 'bg-purple-100 text-purple-900' : 'bg-slate-100 text-slate-700'}`}>
                        {c.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {c.approval_status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(c.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(c.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="p-1.5 text-secondary hover:text-primary"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-lg">info</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(c.id, { is_active: !c.is_active })}
                            className={`p-1.5 font-bold text-xs rounded-lg ${c.is_active ? 'text-emerald-700 hover:bg-emerald-50' : 'text-red-700 hover:bg-red-50'}`}
                            title={c.is_active ? 'Account Active (Click to suspend)' : 'Account Suspended (Click to reactivate)'}
                          >
                            <span className="material-symbols-outlined text-lg">{c.is_active ? 'block' : 'lock_open'}</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detailed Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full relative shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-hanken font-bold text-xl text-primary">Customer Profile</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xl flex items-center justify-center border">
                  {selectedCustomer.name[0]}
                </div>
                <div>
                  <span className="font-bold text-base text-primary block">{selectedCustomer.name}</span>
                  <span className="text-slate-500 font-mono block">{selectedCustomer.phone}</span>
                </div>
              </div>

              <div className="bg-surface-container-low p-3 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email Address</span>
                  <span className="font-bold text-primary">{selectedCustomer.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Type</span>
                  <span className="font-bold uppercase text-primary">{selectedCustomer.account_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approval Status</span>
                  <span className="font-bold uppercase text-emerald-700">{selectedCustomer.approval_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Lifetime Orders</span>
                  <span className="font-bold text-primary">{selectedCustomer.total_orders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Lifetime Spent</span>
                  <span className="font-bold text-tertiary">₹{selectedCustomer.total_spent}</span>
                </div>
              </div>

              {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                <div>
                  <h4 className="font-bold text-primary mb-1">Saved Delivery Addresses</h4>
                  <div className="space-y-1">
                    {selectedCustomer.addresses.map((addr, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-primary block">{addr.label}: {addr.line1}</span>
                        <span className="text-slate-500 text-[11px] block">{addr.city} - {addr.pincode}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
