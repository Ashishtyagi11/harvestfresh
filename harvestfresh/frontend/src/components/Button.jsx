import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-jakarta font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98";
  
  const sizes = {
    sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-lg gap-2",
    lg: "px-7 py-3.5 text-base rounded-xl gap-2.5"
  };

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-container border-b-2 border-[#0d2315] shadow-sm",
    secondary: "bg-secondary text-white hover:bg-on-secondary-container shadow-sm",
    outline: "bg-transparent text-primary border-2 border-primary/30 hover:border-primary hover:bg-surface-container-low",
    accent: "bg-tertiary-container text-on-tertiary-container hover:bg-tertiary hover:text-white shadow-sm",
    soft: "bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-white",
    ghost: "bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
