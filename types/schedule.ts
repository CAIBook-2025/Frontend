import { Room } from "@/types/room";
import { UserProfile } from "@/types/userProfile";

export type ScheduleItem = {
  id: number;
  sr_id?: number;
  day: string;
  module: number;
  available: string;
  status?: string;
  attendanceStatus?: string;
  studyRoom: Room | null;
  user?: UserProfile | null;
  createdAt?: string;
  updatedAt?: string;
};
