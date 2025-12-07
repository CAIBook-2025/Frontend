'use client';

import type React from 'react';
import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { postStrike } from '@/lib/strikes/postStrike';

interface ApplyStrikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  onSuccess: () => void;
}

export function ApplyStrikeModal({ isOpen, onClose, accessToken, onSuccess }: ApplyStrikeModalProps) {
  const { user } = useUser();
  const [email, setEmail] = useState('');
  const [infractionType, setInfractionType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !infractionType || !description || !date) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (!accessToken) {
      setError('No se pudo autenticar la sesión (falta token)');
      return;
    }

    if (!user?.email) {
      setError('No se pudo identificar al administrador');
      return;
    }

    try {
      setLoading(true);
      await postStrike(accessToken, {
        student_email: email,
        type: infractionType,
        description,
        date,
        admin_email: user.email,
      });

      // Reset form and close
      setEmail('');
      setInfractionType('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear el strike');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setInfractionType('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Cerrar"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Aplicar Strike</h2>
          <p className="mt-1 text-sm text-gray-600">Aplica una sanción a un usuario por incumplimiento de reglas</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
              Email del Usuario
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@uc.cl"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Infraction type dropdown */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-900 mb-2">
              Tipo de Infracción
            </label>
            <select
              id="type"
              value={infractionType}
              onChange={(e) => setInfractionType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona el tipo</option>
              <option value="NO_SHOW">No Show</option>
              <option value="MISUSE">Mal Uso</option>
              <option value="DAMAGE">Daño</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          {/* Date field */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-900 mb-2">
              Fecha de Infracción
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description textarea */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la infracción cometida..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Aplicando...' : 'Aplicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
