import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store/useStore';
import { FreshnessGauge } from '../components/FreshnessGauge';
import { QuantityStepper } from '../components/QuantityStepper';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';

export const ProductDetail = () => {
  const { slug } = useParams();
  const addToCart = useStore((state) => state.addToCart);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
        
        // Fetch related products
        const relRes = await api.get('/products?limit=4');
        setRelatedProducts(relRes.data.filter(p => p.slug !== slug));
      } catch (err) {
        console.error("Product detail error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-jakarta text-xs text-on-surface-variant mt-4">Loading fresh harvest details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="font-hanken font-bold text-2xl text-primary">Produce item not found</h2>
        <Link to="/shop" className="text-xs font-bold text-secondary underline mt-2 block">
          Return to Shop
        </Link>
      </div>
    );
  }

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1598170845058-12f6a6723223?q=80&w=800&auto=format&fit=crop';
  const harvestFormatted = new Date(product.harvested_on).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-jakarta text-on-surface-variant">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        <span>/</span>
        <span className="font-semibold text-primary">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Product Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl overflow-hidden border border-outline-variant/40 bg-surface-container-low shadow-sm aspect-square relative">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.organic_certified && <Chip label="100% ORGANIC CERTIFIED" variant="organic" />}
              {product.seasonal && <Chip label="SEASONAL HARVEST" variant="carrot" />}
            </div>
          </div>
        </div>

        {/* Product Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              {product.farm_source}
            </span>
            <h1 className="font-hanken font-extrabold text-3xl sm:text-4xl text-primary mt-1">
              {product.name}
            </h1>
            <p className="font-jakarta text-xs text-on-surface-variant mt-1">
              Category: {product.category_name}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 pb-4 border-b border-outline-variant/30">
            <span className="font-hanken font-extrabold text-3xl text-tertiary">
              ₹{product.price}
            </span>
            <span className="font-jakarta text-sm font-semibold text-on-surface-variant">
              per {product.unit}
            </span>
            <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              In Stock ({product.stock_qty} available)
            </span>
          </div>

          {/* FRESHNESS GAUGE */}
          <FreshnessGauge
            percentage={product.freshness_percentage}
            harvestTime={`Harvested: ${harvestFormatted}`}
          />

          {/* Product Description */}
          <div className="space-y-2">
            <h4 className="font-hanken font-bold text-sm text-primary">Farm Fresh Details</h4>
            <p className="font-jakarta text-sm text-on-surface-variant leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Product Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, idx) => (
                <Chip key={idx} label={tag} variant="sage" />
              ))}
            </div>
          )}

          {/* Add to Cart Actions */}
          <div className="p-6 bg-white rounded-2xl border border-secondary/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-jakarta text-xs font-bold text-primary">Select Quantity</span>
              <QuantityStepper value={qty} onChange={setQty} size="md" />
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-primary pt-2 border-t border-outline-variant/30">
              <span>Item Total:</span>
              <span className="font-hanken font-extrabold text-lg text-tertiary">₹{(product.price * qty).toFixed(2)}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => addToCart(product.id, qty)}
            >
              <span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
              Add to Harvest Cart
            </Button>
          </div>

          {/* Delivery Promise */}
          <div className="grid grid-cols-2 gap-4 text-xs font-jakarta text-on-surface-variant pt-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              <span>Express delivery under 60 mins</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">verified_user</span>
              <span>100% Quality & Freshness Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-outline-variant/30">
          <h3 className="font-hanken font-bold text-2xl text-primary">You Might Also Fresh-Pick</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
