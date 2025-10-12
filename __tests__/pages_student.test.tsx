import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentDashboardPage from '@/app/Student/page';
import CreateGroupPage from '@/app/Student/Groups/Form/page';
import StudyRoomBookerPage from '@/app/Student/StudyRoomBooker/page';

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

describe('StudentDashboardPage', () => {
  // Confirms the dashboard toggles between personal and group views
  it('permite alternar entre vista personal y de grupos', () => {
    render(<StudentDashboardPage />);

    expect(screen.getByTestId('personal-view')).toBeInTheDocument();
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
