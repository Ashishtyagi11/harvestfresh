import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';

export const AdminDeliveryZones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    area_name: '',
    pincode: '',
    city: 'Bengaluru',
    estimated_delivery_minutes: 45,
    is_active: true
  });

  const fetchZones = async () => {
    try {
      const res = await api.get('/delivery-zones');
      setZones(res.data);
    } catch (err) {
      console.error("Fetch zones error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/delivery-zones', formData);
      setShowModal(false);
      setFormData({ area_name: '', pincode: '', city: 'Bengaluru', estimated_delivery_minutes: 45, is_active: true });
      fetchZones();
    } catch (err) {
      alert(err.response?.data?.detail || "Error adding delivery zone");
    }
  };

  return (
    <div className="space-y-6 font-jakarta">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-hanken font-extrabold text-3xl text-primary">Delivery Zones & Coverage</h2>
          <p className="font-jakarta text-xs text-on-surface-variant mt-1">
            Manage serviceable delivery pincodes, cities, and estimated delivery turnaround times
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <span className="material-symbols-outlined text-sm">add_location_alt</span>
          Add New Delivery Pincode
        </Button>
      </div>

      {loading ? (
        <div className="h-64 bg-white rounded-2xl animate-pulse"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-primary font-bold uppercase tracking-wider border-b border-outline-variant/40">
                <tr>
                  <th className="p-4">Area & Location</th>
                  <th className="p-4">Pincode</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Estimated Delivery Time</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {zones.map((z) => (
                  <tr key={z.pincode} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-bold text-primary text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-lg">location_on</span>
                      {z.area_name}
                    </td>
                    <td className="p-4 font-mono font-extrabold text-secondary text-sm">{z.pincode}</td>
                    <td className="p-4 font-semibold">{z.city}</td>
                    <td className="p-4 font-bold text-tertiary">{z.estimated_delivery_minutes} mins turnaround</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${z.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                        {z.is_active ? 'Active Coverage' : 'Suspended'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Zone Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full relative shadow-2xl space-y-4">
            <h3 className="font-hanken font-bold text-xl text-primary">Add Serviceable Pincode</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-jakarta">
              <div>
                <label className="block font-bold text-primary mb-1">Area Name</label>
                <input
                  type="text"
                  placeholder="e.g. HSR Layout & Bellandur"
                  value={formData.area_name}
                  onChange={(e) => setFormData({ ...formData, area_name: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-primary mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="560102"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-primary mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-primary mb-1">Estimated Delivery Minutes</label>
                <input
                  type="number"
                  value={formData.estimated_delivery_minutes}
                  onChange={(e) => setFormData({ ...formData, estimated_delivery_minutes: parseInt(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Pincode Zone</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
