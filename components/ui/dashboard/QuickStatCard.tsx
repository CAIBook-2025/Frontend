import type React from "react"
import { Calendar } from "lucide-react"

export const StatCard = ({
  icon,
  value,
  label,
  footer,
  variant = "blue",
}: {
  icon: React.ReactNode
  value: string | number
  label: string
  footer: string
  variant?: "blue" | "yellow" | "red"
}) => {
  const colorVariants = {
    blue: {
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
    },
    yellow: {
      iconBg: "bg-yellow-100",
      iconText: "text-yellow-600",
    },
    red: {
      iconBg: "bg-red-100",
      iconText: "text-red-600",
    },
  }

  const colors = colorVariants[variant]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`${colors.iconBg} ${colors.iconText} rounded-full p-3 w-12 h-12 flex items-center justify-center flex-shrink-0`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mb-1 text-3xl font-bold text-gray-800">{value}</div>
          <div className="mt-2 text-xs text-slate-400">{footer}</div>
        </div>
      </div>
    </div>
  )
}
