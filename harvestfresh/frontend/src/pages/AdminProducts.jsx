import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 99.0,
    unit: '500g',
    stock_qty: 100,
    organic_certified: true,
    seasonal: false,
    farm_source: 'Green Valley Organic Farm',
    images: ['https://images.unsplash.com/photo-1598170845058-12f6a6723223?q=80&w=800&auto=format&fit=crop'],
    tags: ['Organic', 'Local']
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch admin products error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: 99.0,
      unit: '500g',
      stock_qty: 100,
      organic_certified: true,
      seasonal: false,
      farm_source: 'Green Valley Organic Farm',
      images: ['https://images.unsplash.com/photo-1598170845058-12f6a6723223?q=80&w=800&auto=format&fit=crop'],
      tags: ['Organic', 'Local']
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      unit: p.unit,
      stock_qty: p.stock_qty,
      organic_certified: p.organic_certified,
      seasonal: p.seasonal,
      farm_source: p.farm_source,
      images: p.images || [],
      tags: p.tags || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.detail || "Error saving product");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to soft-delete this produce product?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert("Error deleting product");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-hanken font-extrabold text-3xl text-primary">Produce Inventory (CRUD)</h2>
          <p className="font-jakarta text-xs text-on-surface-variant mt-1">Manage organic items, pricing, farm sources, and stock levels</p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd}>
          <span className="material-symbols-outlined text-sm">add</span>
          Add New Produce Item
        </Button>
      </div>

      {loading ? (
        <div className="h-64 bg-white rounded-2xl animate-pulse"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-jakarta">
              <thead className="bg-surface-container-low text-primary font-bold uppercase tracking-wider border-b border-outline-variant/40">
                <tr>
                  <th className="p-4">Produce</th>
                  <th className="p-4">Farm Source</th>
                  <th className="p-4">Price / Unit</th>
                  <th className="p-4">Stock Qty</th>
                  <th className="p-4">Badges</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1598170845058-12f6a6723223?q=80&w=800&auto=format&fit=crop'}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border"
                      />
                      <div>
                        <span className="font-bold text-primary block">{p.name}</span>
                        <span className="text-[10px] text-on-surface-variant font-mono">{p.slug}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{p.farm_source}</td>
                    <td className="p-4 font-bold text-tertiary">₹{p.price} / {p.unit}</td>
                    <td className="p-4 font-bold">
                      <span className={`px-2 py-0.5 rounded-full ${p.stock_qty <= 20 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {p.stock_qty}
                      </span>
                    </td>
                    <td className="p-4 space-x-1">
                      {p.organic_certified && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Organic</span>}
                      {p.seasonal && <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">Seasonal</span>}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-secondary hover:text-primary">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-error hover:text-red-800">
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

      {/* Product CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <h3 className="font-hanken font-bold text-xl text-primary mb-4">
              {editingProduct ? 'Edit Produce Item' : 'Add New Produce Item'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-jakarta">
              <div>
                <label className="block font-bold text-primary mb-1">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') });
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-primary mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-primary mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-primary mb-1">Unit (500g, kg, bundle)</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-primary mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock_qty}
                  onChange={(e) => setFormData({ ...formData, stock_qty: parseInt(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-primary mb-1">Farm Source</label>
                <input
                  type="text"
                  value={formData.farm_source}
                  onChange={(e) => setFormData({ ...formData, farm_source: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-primary mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5"
                  required
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-primary">
                  <input
                    type="checkbox"
                    checked={formData.organic_certified}
                    onChange={(e) => setFormData({ ...formData, organic_certified: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span>Organic Certified</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-tertiary">
                  <input
                    type="checkbox"
                    checked={formData.seasonal}
                    onChange={(e) => setFormData({ ...formData, seasonal: e.target.checked })}
                    className="w-4 h-4 accent-tertiary"
                  />
                  <span>Seasonal Pick</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Produce</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
