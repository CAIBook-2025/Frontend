export type UserProfile = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string | null;
  is_representative: boolean;
  is_moderator: boolean;
  is_deleted?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  auth0_id: string;
  career: string | null;
  phone: string | null;
  student_number: string | null;
};