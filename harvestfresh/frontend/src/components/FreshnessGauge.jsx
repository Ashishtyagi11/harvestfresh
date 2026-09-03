import React from 'react';

export const FreshnessGauge = ({ percentage = 95, harvestTime = "Harvested 4 hours ago" }) => {
  return (
    <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">eco</span>
          <span className="font-hanken font-bold text-sm text-primary">Harvest Freshness Gauge</span>
        </div>
        <span className="font-jakarta font-bold text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">
          {percentage}% Peak Freshness
        </span>
      </div>

      {/* Gradient Progress Bar */}
      <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden p-0.5 relative">
        <div
          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-400 via-emerald-500 to-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-on-surface-variant mt-2">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {harvestTime}
        </span>
        <span className="font-medium text-emerald-800">Farm Direct & Standard Cleaned</span>
      </div>
    </div>
  );
};
