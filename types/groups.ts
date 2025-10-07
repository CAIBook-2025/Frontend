export interface BaseGroupRequest {
  id: string
  groupName: string
  description: string
  date: string
}

export interface PendingGroupRequest extends BaseGroupRequest {
  type: "pending"
  applicantName: string
  applicantEmail: string
  status: "Pendiente"
}

export interface ApprovedGroupRequest extends BaseGroupRequest {
  type: "approved"
  responsibleName: string
  responsibleEmail: string
  approvalDate: string
  members: number
  events: number
}

export interface RejectedGroupRequest extends BaseGroupRequest {
  type: "rejected"
  applicantName: string
  applicantEmail: string
  rejectionDate: string
  reason: string
}

export type GroupRequest = PendingGroupRequest | ApprovedGroupRequest | RejectedGroupRequest
