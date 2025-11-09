import { loginAsAdmin } from '../support/adminFlows';
import type { PrismaModelsFixture } from '../support/adminRoomHelpers';
import {
  ROOM_NAMES,
  stubAdminRoomData,
  getQueryInput,
  getLocationSelect,
  getStatusSelect,
  getCapacityInput,
  getUtilizationInput,
  getReservationsInput,
  selectFeatureChip,
  expectOnlyRoomsVisible,
  expectRoomsHidden,
} from '../support/adminRoomHelpers';

describe('Admin Room Uses', () => {
  beforeEach(() => {
    cy.session('admin-session', loginAsAdmin);
    stubAdminRoomData();
    cy.visit('/Admin/Room');
    cy.wait(['@getStudyRooms', '@getRoomSchedule']);
  });

  it('loads room data from the prismaModels fixture', () => {
    cy.get('@adminRoomFixture').then((fixture) => {
      const adminFixture = fixture as unknown as PrismaModelsFixture;
      cy.get('table tbody tr').should('have.length', adminFixture.studyRooms.length);

      adminFixture.studyRooms.forEach((room) => {
        cy.contains('table tbody tr', room.name).should('exist');
      });
    });
  });

  describe('Room filters', () => {
    it('filters rooms by search query', () => {
      getQueryInput().type('Innovation');

      expectOnlyRoomsVisible([ROOM_NAMES.innovationHub]);
      expectRoomsHidden([ROOM_NAMES.sr101, ROOM_NAMES.sr204, ROOM_NAMES.quietLab]);
    });

    it('filters rooms by location', () => {
      getLocationSelect().select('Library 2F');

      expectOnlyRoomsVisible([ROOM_NAMES.sr204]);
      expectRoomsHidden([ROOM_NAMES.sr101, ROOM_NAMES.innovationHub, ROOM_NAMES.quietLab]);
    });

    it('filters rooms by minimum capacity', () => {
      getCapacityInput().type('11');

      expectOnlyRoomsVisible([ROOM_NAMES.innovationHub]);
    });

    it('filters rooms by status', () => {
      getStatusSelect().select('MAINTENANCE');

      expectOnlyRoomsVisible([ROOM_NAMES.innovationHub]);
      expectRoomsHidden([ROOM_NAMES.sr101, ROOM_NAMES.sr204, ROOM_NAMES.quietLab]);
    });

    it('filters rooms by utilization threshold', () => {
      getUtilizationInput().type('100');

      expectOnlyRoomsVisible([ROOM_NAMES.innovationHub, ROOM_NAMES.quietLab]);
      expectRoomsHidden([ROOM_NAMES.sr101, ROOM_NAMES.sr204]);
    });

    it('filters rooms by minimum reservations for the day', () => {
      getReservationsInput().type('1');

      expectOnlyRoomsVisible([ROOM_NAMES.innovationHub, ROOM_NAMES.quietLab]);
      expectRoomsHidden([ROOM_NAMES.sr101, ROOM_NAMES.sr204]);
    });

    it('filters rooms by selected features', () => {
      selectFeatureChip('Whiteboard');

      expectOnlyRoomsVisible([ROOM_NAMES.sr101]);
      expectRoomsHidden([ROOM_NAMES.sr204, ROOM_NAMES.innovationHub, ROOM_NAMES.quietLab]);
    });

    it('combines all filters together', () => {
      getQueryInput().type('SR-410');
      getLocationSelect().select('Library 4F');
      getCapacityInput().type('4');
      getStatusSelect().select('UNAVAILABLE');
      getUtilizationInput().type('100');
      getReservationsInput().type('1');
      selectFeatureChip('Soundproofing Panels');

      expectOnlyRoomsVisible([ROOM_NAMES.quietLab]);
    });

    it('opens the manage room modal when clicking Gestionar', () => {
      cy.contains('table tbody tr', ROOM_NAMES.sr101).within(() => {
        cy.contains('button', 'Gestionar').click();
      });

      cy.contains('Gestionar Sala').should('be.visible');
    });
  });
});
