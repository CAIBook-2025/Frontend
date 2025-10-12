// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#E60041', // El rojo/fucsia principal
        'brand-secondary': '#0033A0', // Azul UC (aproximado)
        'brand-accent': '#FFD100', // Amarillo/Dorado UC (aproximado)
        'brand-dark': '#2D3748', // Un gris oscuro para texto
        'brand-light': '#F7FAFC', // Un gris muy claro para fondos
      },
    },
  },
  plugins: [],
};
export default config;
