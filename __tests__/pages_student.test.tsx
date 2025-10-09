import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentDashboardPage from '@/app/Student/page';
import CreateGroupPage from '@/app/Student/Groups/Form/page';
import PartnerPage from '@/app/Student/Groups/Partner/[id]/page';
import RepresentativePage from '@/app/Student/Groups/Representative/[id]/page';
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

const partnerViewMock = jest.fn();
jest.mock('@/components/dashboard/PartnerView', () => ({
  PartnerView: (props: any) => {
    partnerViewMock(props);
    return <div data-testid="partner-view">Partner</div>;
  },
}));

const representativeViewMock = jest.fn();
jest.mock('@/components/dashboard/RepresentativeView', () => ({
  RepresentativeView: (props: any) => {
    representativeViewMock(props);
    return <div data-testid="representative-view">Representative</div>;
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
  it('switches between personal and groups views', () => {
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

  it('progresses through the multi-step form', () => {
    render(<CreateGroupPage />);

    expect(screen.getByText(/Informaci/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(screen.getByText(/Detalles y Objetivos/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(screen.getByText(/Finalizar/i)).toBeInTheDocument();
  });
});

describe('PartnerPage', () => {
  it('passes groupId to PartnerView', () => {
    render(<PartnerPage params={{ groupId: 'abc' }} />);

    expect(partnerViewMock).toHaveBeenCalledWith(expect.objectContaining({ groupId: 'abc' }));
    expect(screen.getByTestId('partner-view')).toBeInTheDocument();
  });
});

describe('RepresentativePage', () => {
  it('passes groupId to RepresentativeView', () => {
    render(<RepresentativePage params={{ groupId: 'rep-1' }} />);

    expect(representativeViewMock).toHaveBeenCalledWith(expect.objectContaining({ groupId: 'rep-1' }));
    expect(screen.getByTestId('representative-view')).toBeInTheDocument();
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

  it('displays rooms after loading', async () => {
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
