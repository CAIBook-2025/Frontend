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
  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
  variant?: 'danger' | 'primary';
};

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  isLoading = false,
  children,
  confirmText = 'Confirmar Cancelación',
  cancelText = 'Volver',
  loadingText = 'Cancelando...',
  variant = 'danger',
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const buttonColor =
    variant === 'danger'
      ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
      : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400';

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
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex items-center justify-center rounded-lg px-4 py-2 font-semibold text-white disabled:cursor-not-allowed ${buttonColor}`}
            disabled={isLoading}
          >
            {isLoading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
