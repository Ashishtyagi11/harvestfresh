import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';

export const AdminSalesAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    promo_code: '',
    discount_percentage: 20,
    banner_type: 'sale',
    target_page: 'all',
    is_active: true,
    bg_gradient: 'from-emerald-700 via-teal-800 to-emerald-900'
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Fetch announcements error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      message: '',
      promo_code: '',
      discount_percentage: 20,
      banner_type: 'sale',
      target_page: 'all',
      is_active: true,
      bg_gradient: 'from-emerald-700 via-teal-800 to-emerald-900'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      message: item.message,
      promo_code: item.promo_code || '',
      discount_percentage: item.discount_percentage || 0,
      banner_type: item.banner_type,
      target_page: item.target_page,
      is_active: item.is_active,
      bg_gradient: item.bg_gradient || 'from-emerald-700 via-teal-800 to-emerald-900'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : None
      };
      if (editingItem) {
        await api.put(`/announcements/${editingItem.id}`, payload);
      } else {
        await api.post('/announcements', payload);
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.detail || "Error saving sales announcement");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/announcements/${id}/toggle`);
      fetchAnnouncements();
    } catch (err) {
      alert("Error toggling banner active status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this sale announcement banner?")) {
      try {
        await api.delete(`/announcements/${id}`);
        fetchAnnouncements();
      } catch (err) {
        alert("Error deleting announcement");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-hanken font-extrabold text-3xl text-primary">Sales & Promo Announcements</h2>
          <p className="font-jakarta text-xs text-on-surface-variant mt-1">
            Broadcast promotional banners, flash deals, and discount promo codes live to customer storefronts
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd}>
          <span className="material-symbols-outlined text-sm">campaign</span>
          Announce New Sale Banner
        </Button>
      </div>

      {/* Live Storefront Preview Banner Card */}
      <div className="bg-white p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-3">
        <h3 className="font-hanken font-bold text-sm text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500">visibility</span>
          Live Storefront Ticker Preview
        </h3>
        {announcements.filter(a => a.is_active).length === 0 ? (
          <div className="bg-slate-100 p-4 rounded-xl text-center text-xs text-slate-500 italic">
            No active promotional banners right now. Click "Announce New Sale Banner" to publish one live!
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.filter(a => a.is_active).map(a => (
              <div key={a.id} className={`p-4 rounded-xl bg-gradient-to-r ${a.bg_gradient || 'from-emerald-800 to-teal-900'} text-white flex items-center justify-between shadow-sm`}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-300">campaign</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                        {a.banner_type.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-xs">{a.title}</span>
                    </div>
                    <p className="text-xs text-emerald-100 mt-0.5">{a.message}</p>
                  </div>
                </div>
                {a.promo_code && (
                  <span className="bg-white/20 border border-white/30 text-white text-xs font-mono font-bold px-3 py-1 rounded-lg">
                    CODE: {a.promo_code}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Announcements Table */}
      {loading ? (
        <div className="h-64 bg-white rounded-2xl animate-pulse"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-jakarta">
              <thead className="bg-surface-container-low text-primary font-bold uppercase tracking-wider border-b border-outline-variant/40">
                <tr>
                  <th className="p-4">Banner Details</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Promo Code & Discount</th>
                  <th className="p-4">Target Page</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {announcements.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-primary block text-sm">{item.title}</span>
                      <span className="text-xs text-on-surface-variant block mt-0.5">{item.message}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900">
                        {item.banner_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold">
                      {item.promo_code ? (
                        <div className="space-y-1">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-primary border border-slate-200">
                            {item.promo_code}
                          </span>
                          {item.discount_percentage && (
                            <span className="text-emerald-700 block text-[10px] font-semibold">
                              {item.discount_percentage}% OFF
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No code</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold capitalize">{item.target_page}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(item.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                          item.is_active 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {item.is_active ? 'Active & Live' : 'Paused'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-secondary hover:text-primary" title="Edit">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-error hover:text-red-800" title="Delete">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Announcement Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative shadow-2xl space-y-4">
            <h3 className="font-hanken font-bold text-xl text-primary">
              {editingItem ? 'Edit Sale Announcement' : 'Publish New Sales Banner'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-jakarta">
              <div>
                <label className="block font-bold text-primary mb-1">Banner Title</label>
                <input
                  type="text"
                  placeholder="e.g. 🎉 Weekend Organic Harvest Sale!"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-primary mb-1">Description Message</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Get FLAT 20% OFF on all freshly harvested heirloom carrots and organic baby greens."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-primary mb-1">Promo Coupon Code</label>
                  <input
                    type="text"
                    placeholder="HARVEST20"
                    value={formData.promo_code}
                    onChange={(e) => setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-primary mb-1">Discount %</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="20"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-primary mb-1">Banner Category / Type</label>
                  <select
                    value={formData.banner_type}
                    onChange={(e) => setFormData({ ...formData, banner_type: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 font-semibold"
                  >
                    <option value="sale">🔥 Special Sale</option>
                    <option value="flash_deal">⚡ Flash Deal</option>
                    <option value="delivery_alert">🚚 Express Delivery News</option>
                    <option value="harvest_special">🌾 Fresh Farm Harvest</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-primary mb-1">Color Theme</label>
                  <select
                    value={formData.bg_gradient}
                    onChange={(e) => setFormData({ ...formData, bg_gradient: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 font-semibold"
                  >
                    <option value="from-emerald-700 via-teal-800 to-emerald-900">🌿 Forest Emerald</option>
                    <option value="from-amber-600 via-orange-600 to-red-700">🔥 Harvest Gold & Fire</option>
                    <option value="from-purple-800 via-indigo-900 to-slate-900">✨ Night VIP Purple</option>
                    <option value="from-blue-700 via-cyan-800 to-slate-900">💧 Ocean Hydroponic Blue</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-primary">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span>Publish & Activate Immediately</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save & Broadcast Banner</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
