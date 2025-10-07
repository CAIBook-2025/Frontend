"use client"

import { useState } from "react"

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/shared/modal"
import { STRIKE_TYPE_METADATA } from "@/components/ui/admin/strikes/constants"
import type { ApplyStrikePayload, StrikeType } from "@/types/strikes"

interface ApplyStrikeModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (payload: ApplyStrikePayload) => void
}

const STRIKE_OPTIONS = Object.entries(STRIKE_TYPE_METADATA) as Array<
  [StrikeType, { label: string; badgeClass: string }]
>

export function ApplyStrikeModal({ isOpen, onClose, onApply }: ApplyStrikeModalProps) {
  const [email, setEmail] = useState("")
  const [infractionType, setInfractionType] = useState<StrikeType | "">("")
  const [description, setDescription] = useState("")

  const resetForm = () => {
    setEmail("")
    setInfractionType("")
    setDescription("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email || !infractionType || !description) return

    onApply({
      email,
      type: infractionType,
      description,
    })
    resetForm()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} contentClassName="max-w-lg w-full">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <ModalHeader
          title="Aplicar Strike"
          subtitle="Aplica una sanción a un usuario por incumplimiento de reglas"
          actions={<ModalCloseButton onClose={handleClose} aria-label="Cerrar modal de aplicar strike" />}
        />

        <ModalBody className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
              Email del Usuario
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@uc.cl"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-900 mb-2">
              Tipo de Infracción
            </label>
            <select
              id="type"
              value={infractionType}
              onChange={(event) => setInfractionType(event.target.value as StrikeType)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona el tipo</option>
              {STRIKE_OPTIONS.map(([type, metadata]) => (
                <option key={type} value={type}>
                  {metadata.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe la infracción cometida..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Importante:</span> Al llegar a 3 strikes, el usuario será suspendido por 1
              semana automáticamente.
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
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
            Aplicar Strike
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
