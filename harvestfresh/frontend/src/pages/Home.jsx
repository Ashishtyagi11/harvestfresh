import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/Button';
import { PincodeChecker } from '../components/PincodeChecker';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/categories')
        ]);
        setFeaturedProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Home data fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-secondary text-white py-16 lg:py-24 rounded-b-3xl">
        {/* Organic Background Blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                HARVESTED DAILY AT 5:00 AM
              </div>

              <h1 className="font-hanken font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight">
                Fresh Organic Produce, <br />
                <span className="text-amber-300">Farm Direct to Your Door</span>
              </h1>

              <p className="font-jakarta text-base sm:text-lg text-emerald-100 max-w-2xl leading-relaxed">
                Connect directly with certified local organic farms. Zero chemical pesticides, zero plastic waste, and guaranteed delivery in under 60 minutes.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/shop">
                  <Button variant="accent" size="lg">
                    <span className="material-symbols-outlined">shopping_basket</span>
                    Shop Fresh Harvest
                  </Button>
                </Link>

                <Link to="/monthly-pass">
                  <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">
                    <span className="material-symbols-outlined">card_membership</span>
                    Explore Monthly Pass
                  </Button>
                </Link>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/15 text-xs text-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-300 text-xl">verified</span>
                  <span>100% Certified Organic</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-300 text-xl">timer</span>
                  <span>Under 60 Mins Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-300 text-xl">recycling</span>
                  <span>Zero Plastic Packaging</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=1000&auto=format&fit=crop"
                  alt="Organic Harvest Produce Basket"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 text-on-surface">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Today's Highlight</span>
                      <h4 className="font-hanken font-bold text-sm text-primary">Organic Heirloom Carrots & Greens</h4>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      99% Freshness
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-hanken font-bold text-2xl sm:text-3xl text-primary">Explore Farm Categories</h2>
            <p className="font-jakarta text-xs text-on-surface-variant mt-1">Directly sourced from verified organic growers</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-secondary hover:text-primary flex items-center gap-1">
            View All Categories <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="bg-white p-5 rounded-2xl border border-outline-variant/40 hover:border-primary hover:shadow-sun-kissed transition-all text-center group"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-secondary-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">
                  {cat.slug.includes('greens') ? 'eco' : cat.slug.includes('fruits') ? 'nutrition' : cat.slug.includes('herbs') ? 'grass' : cat.slug.includes('dairy') ? 'egg' : 'agriculture'}
                </span>
              </div>
              <h4 className="font-hanken font-bold text-sm text-primary group-hover:text-secondary">{cat.name}</h4>
              <span className="text-[11px] font-semibold text-on-surface-variant mt-1 block">Fresh Daily</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCE GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              TODAY'S MORNING HARVEST
            </div>
            <h2 className="font-hanken font-bold text-2xl sm:text-3xl text-primary">Featured Produce</h2>
          </div>
          <Link to="/shop">
            <Button variant="outline" size="sm">Browse All Produce</Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-surface-container animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* MONTHLY PASS PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-tertiary-container via-tertiary to-primary text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="max-w-xl relative z-10 space-y-4">
            <span className="bg-amber-400 text-tertiary font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Subscribe & Save 35%
            </span>
            <h3 className="font-hanken font-extrabold text-3xl sm:text-4xl text-white">
              HarvestFresh Family Monthly Pass
            </h3>
            <p className="font-jakarta text-sm text-amber-100 leading-relaxed">
              Never run out of organic greens and fresh veggies. Get weekly curated farm baskets delivered automatically with zero delivery fees and priority morning slots.
            </p>
            <div className="pt-2">
              <Link to="/monthly-pass">
                <Button variant="accent" size="lg">
                  Subscribe for ₹899/week
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PINCODE CHECKER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PincodeChecker />
      </section>
    </div>
  );
};
