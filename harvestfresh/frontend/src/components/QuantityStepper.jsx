import React from 'react';

export const QuantityStepper = ({ value = 1, min = 1, max = 20, onChange, size = 'md' }) => {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const sizeClasses = {
    sm: "h-8 px-2 text-xs",
    md: "h-10 px-3 text-sm",
    lg: "h-12 px-4 text-base"
  };

  return (
    <div className={`inline-flex items-center rounded-lg bg-surface-container-high border border-outline-variant ${sizeClasses[size]}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="text-on-surface hover:text-primary disabled:opacity-30 p-1 flex items-center justify-center transition-colors"
      >
        <span className="material-symbols-outlined text-lg">remove</span>
      </button>

      <span className="font-jakarta font-bold text-on-surface px-3 min-w-[2rem] text-center">
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="text-on-surface hover:text-primary disabled:opacity-30 p-1 flex items-center justify-center transition-colors"
      >
        <span className="material-symbols-outlined text-lg">add</span>
      </button>
    </div>
  );
};
