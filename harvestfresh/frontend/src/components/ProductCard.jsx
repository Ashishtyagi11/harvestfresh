import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Chip } from './Chip';
import { Button } from './Button';

export const ProductCard = ({ product }) => {
  const addToCart = useStore((state) => state.addToCart);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1598170845058-12f6a6723223?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="terra-card flex flex-col justify-between overflow-hidden group">
      <Link to={`/product/${product.slug}`} className="block relative">
        <div className="aspect-[4/3] w-full overflow-hidden bg-surface-container-low relative">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {product.organic_certified && <Chip label="ORGANIC" variant="organic" />}
            {product.seasonal && <Chip label="SEASONAL" variant="carrot" />}
          </div>
          <div className="absolute bottom-2 right-2 bg-primary/80 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-amber-300">eco</span>
            {product.freshness_percentage}% Fresh
          </div>
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-secondary">
            {product.farm_source || 'Farm Fresh'}
          </span>
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-hanken font-bold text-base text-primary line-clamp-1 group-hover:text-secondary transition-colors mt-0.5">
              {product.name}
            </h3>
          </Link>
          <p className="font-jakarta text-xs text-on-surface-variant line-clamp-2 mt-1 mb-3">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
          <div>
            <span className="font-hanken font-extrabold text-lg text-tertiary">
              ₹{product.price}
            </span>
            <span className="font-jakarta text-xs text-on-surface-variant ml-1">
              / {product.unit}
            </span>
          </div>

          <Button variant="primary" size="sm" onClick={handleAdd}>
            <span className="material-symbols-outlined text-base">add_shopping_cart</span>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};
