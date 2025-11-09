// app/components/common/ConfirmationModal.tsx
'use client';

import { X } from 'lucide-react';

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isLoading?: boolean;
  children: React.ReactNode;
};

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  isLoading = false,
  children,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    // Overlay de fondo
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 bg-opacity-50 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      {/* Contenedor del Modal */}
      <div
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl transition-transform transform scale-95"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
      >
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="mt-4 text-slate-600">{children}</div>

        {/* Botones de Acción */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200"
            disabled={isLoading}
          >
            Volver
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
            disabled={isLoading}
          >
            {isLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
          </button>
        </div>
      </div>
    </div>
  );
};
