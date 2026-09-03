import React from 'react';

export const Chip = ({ label, variant = 'sage', icon, active = false, onClick }) => {
  const variants = {
    sage: "bg-secondary-container text-on-secondary-container border-secondary/20",
    organic: "bg-primary-container text-on-primary-container border-primary/20",
    carrot: "bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/20",
    outline: "bg-white text-on-surface border-outline-variant hover:border-primary"
  };

  const activeStyles = active
    ? "bg-primary text-white border-primary shadow-sm"
    : variants[variant] || variants.sage;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all ${activeStyles} ${onClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
    >
      {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
