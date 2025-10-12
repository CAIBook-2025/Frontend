import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentDashboardPage from '../app/Student/page';
import CreateGroupPage from '../app/Student/Groups/Form/page';
import StudyRoomBookerPage from '../app/Student/StudyRoomBooker/page';

const getAccessTokenMock = jest.fn();
const mockFetch = jest.fn();
const searchParamsMock = new URLSearchParams({ userId: '1' });

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => searchParamsMock,
}));

const personalViewMock = jest.fn();
const groupsViewMock = jest.fn();

jest.mock('@/components/dashboard/PersonalView', () => ({
  PersonalView: (props: any) => {
    personalViewMock(props);
    return <div data-testid="personal-view">PersonalView</div>;
  },
}));

jest.mock('@/components/dashboard/GroupsView', () => ({
  GroupsView: (props: any) => {
    groupsViewMock(props);
    return <div data-testid="groups-view">GroupsView</div>;
  },
}));

const daySelectorMock = jest.fn();
jest.mock('@/components/book-room/DaySelector', () => ({
  DaySelector: (props: any) => {
    daySelectorMock(props);
    return <div data-testid="day-selector">Selector</div>;
  },
}));

const roomCardMock = jest.fn();
jest.mock('@/components/book-room/RoomCard', () => ({
  RoomCard: (props: any) => {
    roomCardMock(props);
    return <div data-testid="room-card">Room {props.room.name}</div>;
  },
}));

jest.mock('@/components/book-room/ViewToggler', () => ({
  ViewToggler: ({ viewMode, setViewMode }: any) => (
    <div>
      <button onClick={() => setViewMode('list')} data-testid="toggle-list">
        Lista
      </button>
      <button onClick={() => setViewMode('map')} data-testid="toggle-map">
        Mapa
      </button>
      <span data-testid="current-view">{viewMode}</span>
    </div>
  ),
}));

jest.mock('@/components/ui/SearchInput', () => ({
  SearchInput: () => <div data-testid="search-input">SearchInput</div>,
}));

jest.mock('@auth0/nextjs-auth0', () => ({
  useUser: () => ({
    user: { sub: 'auth0|123', email: 'user@uc.cl', given_name: 'Juan', family_name: 'Perez' },
    error: null,
    isLoading: false,
  }),
  getAccessToken: () => getAccessTokenMock(),
}));

const mockProfile = {
  user: { id: 1, first_name: 'Juan', last_name: 'Perez', email: 'user@uc.cl' },
  schedule: [],
  scheduleCount: 0,
  strikes: [],
  strikesCount: 0,
};

beforeAll(() => {
  process.env.NEXT_PUBLIC_API_URL = 'https://example.com';
  globalThis.fetch = mockFetch as unknown as typeof fetch;
});

beforeEach(() => {
  getAccessTokenMock.mockResolvedValue('fake-token');
  mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;

    if (url.includes('/api/users/profile')) {
      return {
        ok: true,
        json: async () => mockProfile,
      } as Response;
    }

    if (url.includes('/api/srSchedule')) {
      return {
        ok: true,
        json: async () => ({
          items: [
            {
              id: 1,
              day: '2025-10-12',
              module: 'M1',
              available: 'AVAILABLE',
              studyRoom: {
                id: 101,
                name: 'Sala Estudio A',
                location: 'Biblioteca Central',
                capacity: 6,
                equipment: ['Pizarra', 'Proyector'],
              },
            },
          ],
        }),
      } as Response;
    }

    return {
      ok: true,
      json: async () => ({}),
    } as Response;
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('StudentDashboardPage', () => {
  // Confirms the dashboard toggles between personal and group views
  it('permite alternar entre vista personal y de grupos', async () => {
    render(<StudentDashboardPage />);
    await act(async () => {});

    expect(await screen.findByTestId('personal-view')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Grupos/i }));
    expect(screen.getByTestId('groups-view')).toBeInTheDocument();
  });
});

describe('CreateGroupPage', () => {
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it('avanza por todas las etapas del formulario', () => {
    render(<CreateGroupPage />);

    expect(screen.getByRole('heading', { level: 2, name: /información general/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));

    expect(screen.getByRole('heading', { level: 2, name: /detalles y objetivos/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));

    expect(screen.getByRole('heading', { level: 2, name: /finalizar y enviar/i })).toBeInTheDocument();
  });
});

describe('StudyRoomBookerPage', () => {
  let mathRandomSpy: jest.SpyInstance<number, []>;

  afterEach(() => {
    jest.useRealTimers();
    if (mathRandomSpy) {
      mathRandomSpy.mockRestore();
    }
  });

  // Ensures rooms are shown after the simulated load completes
  it('muestra las salas disponibles despues de cargar', async () => {
    mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.6);
    jest.useFakeTimers();
    render(<StudyRoomBookerPage />);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(roomCardMock).toHaveBeenCalled();
    expect(screen.getAllByTestId('room-card').length).toBeGreaterThan(0);
  });
});
