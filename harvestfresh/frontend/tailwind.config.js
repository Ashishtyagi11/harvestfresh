/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#163821",
        "on-primary": "#ffffff",
        "primary-container": "#2d4f36",
        "on-primary-container": "#9ac0a0",
        "secondary": "#4a6549",
        "on-secondary": "#ffffff",
        "secondary-container": "#ccebc7",
        "on-secondary-container": "#506b4f",
        "tertiary": "#4e2700",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#6f3a00",
        "on-tertiary-container": "#ffa04c",
        "background": "#fafaf5",
        "on-background": "#1a1c1a",
        "surface": "#fafaf5",
        "on-surface": "#1a1c1a",
        "on-surface-variant": "#424842",
        "surface-container-low": "#f4f4f0",
        "surface-container": "#eeeeea",
        "surface-container-high": "#e8e8e4",
        "surface-container-highest": "#e2e3df",
        "surface-container-lowest": "#ffffff",
        "surface-bright": "#fafaf5",
        "surface-dim": "#dadad6",
        "outline": "#727971",
        "outline-variant": "#c2c8c0",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a"
      },
      fontFamily: {
        hanken: ["Hanken Grotesk", "sans-serif"],
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Hanken Grotesk", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"]
      },
      borderRadius: {
        'DEFAULT': '0.5rem', // 8px
        'sm': '0.25rem',     // 4px
        'md': '0.75rem',     // 12px
        'lg': '1rem',        // 16px
        'xl': '1.5rem',      // 24px
        'full': '9999px'
      },
      boxShadow: {
        'sun-kissed': '0 10px 25px -5px rgba(234, 88, 12, 0.08), 0 8px 10px -6px rgba(22, 56, 33, 0.05)',
        'tactile': '0 4px 0 0 #0d2315'
      }
    },
  },
  plugins: [],
}
