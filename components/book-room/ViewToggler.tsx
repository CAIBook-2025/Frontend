// components/book-room/ViewToggler.tsx
'use client';

import { List, Map } from 'lucide-react';

type ViewMode = 'list' | 'map';

interface ViewTogglerProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const ViewToggler = ({ viewMode, setViewMode }: ViewTogglerProps) => {
  return (
    <div className="flex items-center rounded-full bg-slate-100 p-1">
      <button
        onClick={() => setViewMode('list')}
        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${viewMode === 'list' ? 'bg-white shadow text-brand-primary' : 'text-slate-600'}`}
        aria-pressed={viewMode === 'list'}
      >
        <List size={16} /> Lista
      </button>
      <button
        onClick={() => setViewMode('map')}
        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${viewMode === 'map' ? 'bg-white shadow text-brand-primary' : 'text-slate-600'}`}
        aria-pressed={viewMode === 'map'}
      >
        <Map size={16} /> Visualizador
      </button>
    </div>
  );
};