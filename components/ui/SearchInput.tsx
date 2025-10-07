// components/ui/SearchInput.tsx
'use client';

import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export const SearchInput = ({ label, id, ...props }: SearchInputProps) => {
  return (
    // El contenedor principal ya no necesita ser 'relative'
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      {/* Añadimos un nuevo div 'relative' que envuelve solo el icono y el input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          id={id}
          {...props}
          className="w-full rounded-md border-slate-300 pl-10 shadow-sm focus:border-brand-primary focus:ring-brand-primary"
        />
      </div>
    </div>
  );
};