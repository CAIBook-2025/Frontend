import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Configuración base de Next.js + TypeScript
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // Ignorar carpetas innecesarias
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '__tests__/**',
      'jest.config.ts',
      'jest.setup.ts',
    ],
  },

  // Reglas personalizadas y compatibilidad con Prettier
  {
    plugins: {},
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // 🔧 desactiva la regla molesta
      'react/react-in-jsx-scope': 'off', // no necesario en Next.js
      '@typescript-eslint/no-explicit-any': 'off', // permite 'any' para flexibilidad
      ...prettier.rules, // integra Prettier sin conflictos
    },
  },
];

export default eslintConfig;
