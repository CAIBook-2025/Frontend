export type PrismaModelsFixture = {
  studyRooms: Array<{
    id: number;
    name: string;
    capacity: number;
    equipment?: string[] | string | Record<string, unknown> | null;
    location?: string | null;
  }>;
  srScheduling: Array<{
    id: number;
    sr_id: number;
    available: string;
    status: string;
    is_finished: boolean;
    module: number | string;
    day: string;
  }>;
};

type RoomPayload = {
  id: string;
  name: string;
  features: string[];
  location: string;
  capacity: number;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';
  reservationsToday: number;
  utilization: number;
};

export const ROOM_NAMES = {
  sr101: 'SR-101',
  sr204: 'SR-204',
  innovationHub: 'Innovation Hub 3D',
  quietLab: 'SR-410 Quiet Lab',
} as const;

const normalizeFeatures = (equipment: PrismaModelsFixture['studyRooms'][number]['equipment']): string[] => {
  if (!equipment) return [];
  if (Array.isArray(equipment)) {
    return equipment.filter(Boolean).map(String);
  }
  if (typeof equipment === 'string') {
    return [equipment];
  }
  return Object.values(equipment).filter(Boolean).map(String);
};

const buildScheduleRoomPayload = (
  roomId: number,
  studyRooms: PrismaModelsFixture['studyRooms']
): RoomPayload | null => {
  const room = studyRooms.find((candidate) => candidate.id === roomId);

  if (!room) {
    return null;
  }

  return {
    id: String(room.id),
    name: room.name,
    features: normalizeFeatures(room.equipment),
    location: room.location ?? 'Sin ubicación',
    capacity: Number(room.capacity ?? 0),
    status: 'AVAILABLE',
    reservationsToday: 0,
    utilization: 0,
  };
};

export const stubAdminRoomData = () => {
  cy.fixture('prismaModels').then((fixture: PrismaModelsFixture) => {
    cy.wrap(fixture).as('adminRoomFixture');

    cy.intercept('GET', '**/api/sRooms', {
      statusCode: 200,
      body: fixture.studyRooms,
    }).as('getStudyRooms');

    cy.intercept('GET', '**/api/srSchedule*', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          page: 1,
          take: 200,
          total: fixture.srScheduling.length,
          items: fixture.srScheduling.map((item) => ({
            ...item,
            module: String(item.module),
            studyRoom: buildScheduleRoomPayload(item.sr_id, fixture.studyRooms),
          })),
        },
      });
    }).as('getRoomSchedule');
  });
};

export const getQueryInput = () => cy.get('input[placeholder^="Buscar"]');
export const getLocationSelect = () => cy.get('select').first();
export const getStatusSelect = () => cy.get('select').eq(1);
export const getCapacityInput = () => cy.get('input[placeholder^="Capacidad"]');
export const getUtilizationInput = () => cy.get('input[placeholder^="Utilización"]');
export const getReservationsInput = () => cy.get('input[placeholder^="Mín. reservas"]');
export const selectFeatureChip = (label: string) => cy.contains('label', label).click();
export const expectOnlyRoomsVisible = (roomNames: string[]) => {
  cy.get('table tbody tr').should('have.length', roomNames.length);
  roomNames.forEach((name) => {
    cy.get('table tbody').should('contain', name);
  });
};

export const expectRoomsHidden = (roomNames: string[]) => {
  roomNames.forEach((name) => {
    cy.get('table tbody').should('not.contain', name);
  });
};
