"use client"

import type React from "react"

import { useState } from "react"

interface ApplyStrikeModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (email: string, type: string, description: string) => void
}

export function ApplyStrikeModal({ isOpen, onClose, onApply }: ApplyStrikeModalProps) {
  const [email, setEmail] = useState("")
  const [infractionType, setInfractionType] = useState("")
  const [description, setDescription] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && infractionType && description) {
      onApply(email, infractionType, description)
      // Reset form
      setEmail("")
      setInfractionType("")
      setDescription("")
    }
  }

  const handleClose = () => {
    setEmail("")
    setInfractionType("")
    setDescription("")
    onClose()
  }

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
              <option value="No Show">No Show</option>
              <option value="Mal Uso">Mal Uso</option>
              <option value="Cancelación Tardía">Cancelación Tardía</option>
            </select>
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

          {/* Warning box */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Importante:</span> Al llegar a 3 strikes, el usuario será suspendido por 1
              semana automáticamente.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
