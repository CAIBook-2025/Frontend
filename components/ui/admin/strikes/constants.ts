import type { Strike, UserStrike } from "@/types/strikes"

export const USER_STRIKE_STATUS_STYLES: Record<UserStrike["status"], string> = {
  Activo: "bg-blue-500 text-white",
  Advertencia: "bg-yellow-500 text-white",
  Suspendido: "bg-red-600 text-white",
}

export const STRIKE_TYPE_METADATA: Record<
  Strike["type"],
  {
    label: string
    badgeClass: string
  }
> = {
  "No-show": {
    label: "No Show",
    badgeClass: "bg-red-600 text-white",
  },
  Misuse: {
    label: "Mal Uso",
    badgeClass: "bg-yellow-600 text-white",
  },
  "Late-cancellation": {
    label: "Cancelación Tardía",
    badgeClass: "bg-yellow-500 text-white",
  },
}
