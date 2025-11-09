import type { UserProfileResponse } from '@/lib/user/fetchUserProfile';

export const mockUserProfileResponse: UserProfileResponse = {
  user: {
    id: 1,
    email: 'admin@example.com',
    first_name: 'Ada',
    last_name: 'Lovelace',
    role: 'ADMIN',
    is_representative: true,
    is_moderator: true,
    is_deleted: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    auth0_id: 'auth0|local-mock-user',
    career: 'Ingenieria',
    phone: '+56900000000',
    student_number: '20240000',
  },
  schedule: [],
  scheduleCount: 0,
  strikes: [],
  strikesCount: 0,
  upcomingEvents: [],
  upcomingEventsCount: 0,
  attendances: [],
  attendancesCount: 0,
};
