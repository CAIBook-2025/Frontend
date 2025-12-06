export type UserProfile = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string | null;
  is_representative: boolean;
  is_moderator: boolean;
  createdAt: string;
  updatedAt: string;
  auth0_id: string;
  career: string | null;
  phone: string | null;
  student_number: string | null;
};