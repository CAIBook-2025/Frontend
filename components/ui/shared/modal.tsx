"use client"

import { XIcon } from "lucide-react"
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react"

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ")

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function Modal({ isOpen, onClose, children, className, contentClassName }: ModalProps) {
  if (!isOpen) return null

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  return (
    <div
      className={cx(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4",
        className,
      )}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cx(
          "bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col",
          contentClassName,
        )}
        onClick={stopPropagation}
      >
        {children}
      </div>
    </div>
  )
}

interface ModalHeaderProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function ModalHeader({ title, subtitle, actions, className }: ModalHeaderProps) {
  return (
    <div className={cx("flex items-center justify-between p-6 border-b border-gray-200", className)}>
      <div>
        {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {actions}
    </div>
  )
}

interface ModalBodyProps {
  children: ReactNode
  className?: string
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cx("p-6", className)}>{children}</div>
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cx("p-6 border-t border-gray-200 flex justify-end gap-3", className)}>
      {children}
    </div>
  )
}

interface ModalCloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClose: () => void
}

export function ModalCloseButton({
  onClose,
  className,
  onClick,
  type = "button",
  "aria-label": ariaLabel,
  ...rest
}: ModalCloseButtonProps) {
  const handleClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"] = (event) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      onClose()
    }
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      className={cx("p-2 hover:bg-gray-100 rounded-lg transition-colors", className)}
      aria-label={ariaLabel ?? "Cerrar"}
      {...rest}
    >
      <XIcon className="w-4 h-4 text-gray-500" />
    </button>
  )
}
