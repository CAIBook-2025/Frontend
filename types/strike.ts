import { UserProfile } from "./userProfile";
export type StrikeType = 'NO_SHOW' | 'DAMAGE' | 'MISUSE' | 'OTHER';

export interface Strike {
    id: number;
    student_id: number;
    description: string | null;
    date: string;
    type: StrikeType;
    admin_id: number;
    createdAt: string;
    updatedAt: string;
    admin?: UserProfile;
    student?: UserProfile;
}
