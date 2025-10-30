// app/components/common/InfoModal.tsx
'use client';

import { X } from 'lucide-react';

type InfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export const InfoModal = ({ isOpen, onClose, title, children }: InfoModalProps) => {
  if (!isOpen) return null;

  return (
    // Overlay de fondo translúcido y con desenfoque
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
    >
      {/* Contenedor del Modal */}
      <div
        className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl transition-transform transform scale-95 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del Modal */}
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="mt-4 text-slate-600">
          {children}
        </div>

        {/* Pie del Modal con un solo botón */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-500 px-5 py-2 font-semibold text-white hover:bg-blue-600 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};