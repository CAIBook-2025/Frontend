import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Aquí podría haber otras configuraciones que ya tengas...

  // --- AÑADE ESTE BLOQUE ---
  // Esto le dice a Next.js que no falle el build si hay errores de ESLint.
  // Seguirás viendo los errores en tu terminal local cuando ejecutes `npm run lint`
  // o en la extensión de VS Code, pero no detendrán el deploy en Vercel.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // -------------------------
};

export default nextConfig;
