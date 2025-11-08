// app/components/dashboard/ViewToggle.tsx
'use client';

type View = 'active' | 'historical';

interface ViewToggleProps {
    currentView: View;
    onViewChange: (view: View) => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
    return (
        <div className="flex items-center rounded-full bg-slate-100 p-1">
            <button
                onClick={() => onViewChange('active')}
                className={`w-28 rounded-full px-4 py-1.5 text-base font-semibold transition-colors duration-300 ${
                    currentView === 'active'
                        ? 'bg-white shadow text-blue-600'
                        : 'text-slate-500 hover:bg-slate-200'
                }`}
            >
                Activas
            </button>
            <button
                onClick={() => onViewChange('historical')}
                className={`w-28 rounded-full px-4 py-1.5 text-base font-semibold transition-colors duration-300 ${
                    currentView === 'historical'
                        ? 'bg-white shadow text-blue-600'
                        : 'text-slate-500 hover:bg-slate-200'
                }`}
            >
                Históricas
            </button>
        </div>
    );
};