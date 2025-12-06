'use client';

import { AlertTriangle, X } from 'lucide-react';

interface LiftSuspensionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
    loading?: boolean;
}

export function LiftSuspensionModal({ isOpen, onClose, onConfirm, userName, loading = false }: LiftSuspensionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl transform transition-all">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        ¿Levantar suspensión?
                    </h3>

                    <div className="mt-2">
                        <p className="text-sm text-gray-500">
                            Estás a punto de levantar la suspensión de <span className="font-bold text-gray-900">{userName}</span>.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Esta acción <span className="font-bold text-red-600">eliminará permanentemente</span> todos los strikes asociados a este usuario y no se puede deshacer.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : 'Confirmar y Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
