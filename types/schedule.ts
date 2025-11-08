import { Room } from "@/types/room";

export type ScheduleItem = {
  id: number;
  sr_id?: number;
  day: string;
  module: string;
  available: string;
  status?: string;
  attendanceStatus?: string;
  studyRoom: Room | null;
  createdAt?: string;
  updatedAt?: string;
};
