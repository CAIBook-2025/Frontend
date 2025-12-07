export type GroupRequest = {
  id: number;
  name: string;
  goal: string;
  description: string;
  logo: string | null;
  status: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  group_created: boolean;
  group_id: number | null;
  createdAt: string;
  updatedAt: string;
};
