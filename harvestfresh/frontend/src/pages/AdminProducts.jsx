import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStock, setFilterStock] = useState('all'); // 'all' | 'low' | 'sale'

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    price: 99.0,
    original_price: 120.0,
    is_on_sale: false,
    unit: '500g',
    stock_qty: 100,
    organic_certified: true,
    seasonal: false,
    farm_source: 'Green Valley Organic Farm',
    images: ['https://images.unsplash.com/photo-1598170845058-12f6a6723223?q=80&w=800&auto=format&fit=crop'],
    tags: ['Organic', 'Local']
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?limit=150'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Fetch admin products error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      category_id: categories[0]?.id || '',
      description: '',
      price: 99.0,
      original_price: 120.0,
      is_on_sale: false,
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
      category_id: p.category_id || '',
      description: p.description,
      price: p.price,
      original_price: p.original_price || p.price,
      is_on_sale: p.is_on_sale || false,
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
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Error saving product");
    }
  };

  const handleQuickStockUpdate = async (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await api.patch(`/products/${id}/stock?stock_qty=${newStock}`);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_qty: newStock } : p));
    } catch (err) {
      alert("Error updating stock");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to soft-delete this produce item?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchData();
      } catch (err) {
        alert("Error deleting product");
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.farm_source.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStock === 'low') return p.stock_qty <= 20;
    if (filterStock === 'sale') return p.is_on_sale;
    return true;
  });

  return (
    <div className="space-y-6 font-jakarta">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-hanken font-extrabold text-3xl text-primary">Produce & Catalog Control</h2>
          <p className="font-jakarta text-xs text-on-surface-variant mt-1">
            Add new products, adjust pricing & discounts, update inventory stock levels, and set organic tags
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd}>
          <span className="material-symbols-outlined text-sm">add</span>
          Add New Produce Item
        </Button>
      </div>

      {/* Filter / Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">search</span>
          <input
            type="text"
            placeholder="Search produce by title or farm source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStock('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filterStock === 'all' ? 'bg-primary text-white' : 'bg-surface-container-low text-primary hover:bg-slate-200'}`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setFilterStock('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filterStock === 'low' ? 'bg-red-600 text-white' : 'bg-surface-container-low text-red-700 hover:bg-red-100'}`}
          >
            Low Stock (&le;20)
          </button>
          <button
            onClick={() => setFilterStock('sale')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filterStock === 'sale' ? 'bg-amber-500 text-white' : 'bg-surface-container-low text-amber-900 hover:bg-amber-100'}`}
          >
            🔥 On Sale
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-white rounded-2xl animate-pulse"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-primary font-bold uppercase tracking-wider border-b border-outline-variant/40">
                <tr>
                  <th className="p-4">Produce & Slug</th>
                  <th className="p-4">Farm Origin</th>
                  <th className="p-4">Price / Unit</th>
                  <th className="p-4">Sale status</th>
                  <th className="p-4">Live Inventory Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1598170845058-12f6a6723223?q=80&w=800&auto=format&fit=crop'}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border"
                      />
                      <div>
                        <span className="font-bold text-primary block text-sm">{p.name}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-on-surface-variant font-mono">{p.slug}</span>
                          {p.organic_certified && <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">Organic</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{p.farm_source}</td>
                    <td className="p-4">
                      <div>
                        <span className="font-extrabold text-tertiary text-sm block">₹{p.price} / {p.unit}</span>
                        {p.is_on_sale && p.original_price && (
                          <span className="text-[11px] text-slate-400 line-through block">₹{p.original_price}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {p.is_on_sale ? (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase flex items-center w-max gap-1">
                          <span className="material-symbols-outlined text-xs">local_fire_department</span>
                          On Sale
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Regular</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${p.stock_qty <= 20 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {p.stock_qty} in stock
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickStockUpdate(p.id, p.stock_qty, 10)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded"
                            title="Add 10"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(p.id, p.stock_qty, 50)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded"
                            title="Add 50"
                          >
                            +50
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-secondary hover:text-primary" title="Edit Product">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-error hover:text-red-800" title="Delete Product">
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
                <label className="block font-bold text-primary mb-1">Product Title</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') });
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 font-bold text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block font-bold text-primary mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 font-semibold"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-primary mb-1">Current Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-primary mb-1">Original Price (MRP)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.original_price || ''}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-primary mb-1">Unit (500g, kg)</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block font-bold text-primary mb-1">Product Image URL</label>
                <input
                  type="text"
                  value={formData.images[0] || ''}
                  onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 font-mono text-[11px]"
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

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                  <input
                    type="checkbox"
                    checked={formData.is_on_sale}
                    onChange={(e) => setFormData({ ...formData, is_on_sale: e.target.checked })}
                    className="w-4 h-4 accent-amber-600"
                  />
                  <span>Mark On Special Sale 🔥</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-900">
                  <input
                    type="checkbox"
                    checked={formData.organic_certified}
                    onChange={(e) => setFormData({ ...formData, organic_certified: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span>Organic Certified</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-primary">
                  <input
                    type="checkbox"
                    checked={formData.seasonal}
                    onChange={(e) => setFormData({ ...formData, seasonal: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span>Seasonal Harvest</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Product Catalog Item</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
