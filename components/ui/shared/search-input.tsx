"use client"

import { Search } from "lucide-react"
import type { InputHTMLAttributes, ReactNode } from "react"

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ")

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string
  onChange: (value: string) => void
  wrapperClassName?: string
  inputClassName?: string
  iconClassName?: string
  icon?: ReactNode
  hideIcon?: boolean
}

export function SearchInput({
  value,
  onChange,
  wrapperClassName,
  inputClassName,
  iconClassName,
  icon,
  hideIcon = false,
  ...props
}: SearchInputProps) {
  return (
    <div className={cx("relative", wrapperClassName)}>
      {!hideIcon && (
        <span
          className={cx(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",
            iconClassName,
          )}
        >
          {icon ?? <Search className="w-4 h-4" />}
        </span>
      )}
      <input
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cx(
          "w-full pr-4 py-3 rounded-lg border border-slate-200 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          hideIcon ? "pl-4" : "pl-10",
          inputClassName,
        )}
      />
    </div>
  )
}
