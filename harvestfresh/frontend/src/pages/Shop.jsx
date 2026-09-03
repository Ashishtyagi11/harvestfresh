import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Chip } from '../components/Chip';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [seasonalOnly, setSeasonalOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Categories fetch error", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/products?`;
        if (activeCategory) url += `category=${activeCategory}&`;
        if (organicOnly) url += `organic=true&`;
        if (seasonalOnly) url += `seasonal=true&`;
        if (search) url += `search=${encodeURIComponent(search)}&`;

        const res = await api.get(url);
        let data = res.data;

        if (sortBy === 'price-low') {
          data.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          data.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'freshness') {
          data.sort((a, b) => b.freshness_percentage - a.freshness_percentage);
        }

        setProducts(data);
      } catch (err) {
        console.error("Products fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, organicOnly, seasonalOnly, search, sortBy]);

  const handleCategorySelect = (slug) => {
    if (activeCategory === slug) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-hanken font-extrabold text-3xl sm:text-4xl text-primary">
          Shop Fresh Organic Produce
        </h1>
        <p className="font-jakarta text-sm text-on-surface-variant mt-1">
          Harvested daily at dawn. Pure organic quality guaranteed.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-outline-variant/40 space-y-4 shadow-sm">
        {/* Search input + toggles */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search produce name or tag..."
              className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl py-2.5 pl-10 pr-4 text-xs font-jakarta focus:outline-none focus:border-primary"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">search</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            {/* Organic Switch */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-primary">
              <input
                type="checkbox"
                checked={organicOnly}
                onChange={(e) => setOrganicOnly(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
              <span>100% Organic Certified</span>
            </label>

            {/* Seasonal Switch */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-tertiary">
              <input
                type="checkbox"
                checked={seasonalOnly}
                onChange={(e) => setSeasonalOnly(e.target.checked)}
                className="w-4 h-4 accent-tertiary rounded cursor-pointer"
              />
              <span>Seasonal Picks</span>
            </label>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/60 text-xs font-semibold text-on-surface rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="freshness">Sort by: Harvest Freshness</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-outline-variant/20">
          <Chip
            label="All Produce"
            active={!activeCategory}
            onClick={() => { searchParams.delete('category'); setSearchParams(searchParams); }}
          />
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              active={activeCategory === cat.slug}
              onClick={() => handleCategorySelect(cat.slug)}
            />
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-80 bg-surface-container animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-outline-variant">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-2">eco</span>
          <h3 className="font-hanken font-bold text-xl text-primary">No produce matched your search</h3>
          <p className="font-jakarta text-xs text-on-surface-variant mt-1">Try clearing filters or searching for different keywords.</p>
          <button
            onClick={() => { setSearch(''); setOrganicOnly(false); setSeasonalOnly(false); searchParams.delete('category'); setSearchParams(searchParams); }}
            className="mt-4 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
