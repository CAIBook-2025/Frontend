export type StrikeType = "No-show" | "Misuse" | "Late-cancellation"

export interface Strike {
  id: string
  userId: string
  userName: string
  userEmail: string
  type: StrikeType
  reason: string
  appliedBy: string
  date: string
}

export type UserStrikeStatus = "Activo" | "Advertencia" | "Suspendido"

export interface UserStrike {
  id: string
  name: string
  email: string
  strikes: number
  maxStrikes: number
  lastStrike: string
  status: UserStrikeStatus
  suspendedUntil?: string
  strikesHistory: Strike[]
}

export interface ApplyStrikePayload {
  email: string
  type: StrikeType
  description: string
}
