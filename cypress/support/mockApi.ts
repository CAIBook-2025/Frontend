/// <reference types="cypress" />

export const setupApiMocks = () => {
  // Load all fixtures first to avoid promise mixing errors
  cy.fixture('groupRequests.json').as('groupRequestsData');
  cy.fixture('eventRequests.json').as('eventRequestsData');
  cy.fixture('roomReservations.json').as('roomReservationsData');
  cy.fixture('users.json').as('usersData');
  cy.fixture('strikes.json').as('strikesData');
  cy.fixture('schedule.json').as('scheduleData');

  // Mock Auth0 profile endpoint
  cy.intercept('GET', '**/auth/profile', {
    statusCode: 200,
    body: {
      email: 'cris.dmaass@gmail.com',
      name: 'Admin User',
      sub: 'auth0|mock-admin-id',
      role: 'admin',
    },
  }).as('getAuthProfile');

  // Mock all possible Auth0 token endpoints
  cy.intercept('GET', '**/api/auth/token', {
    statusCode: 200,
    body: {
      accessToken: 'mock-access-token',
    },
  }).as('getAuthToken');

  cy.intercept('GET', '**/auth/access-token', {
    statusCode: 200,
    body: {
      accessToken: 'mock-access-token',
    },
  }).as('getAccessToken');

  // Catch-all for any auth-related requests
  cy.intercept('**/api/auth/**', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        accessToken: 'mock-access-token',
      },
    });
  }).as('authCatchAll');

  // Mock Group Requests
  cy.get('@groupRequestsData').then((data: any) => {
    // Stateful storage for the test session
    let allRequests = [...data.pending, ...data.approved, ...data.denied];

    cy.intercept('GET', '**/api/group-requests*', (req) => {
      const url = new URL(req.url);
      const status = url.searchParams.get('status');
      const userId = url.searchParams.get('user_id');

      let filtered = allRequests;

      if (status) {
        filtered = filtered.filter((r: any) => r.status === status);
      }
      if (userId) {
        filtered = filtered.filter((r: any) => r.user_id === parseInt(userId));
      }

      req.reply({
        statusCode: 200,
        body: filtered,
      });
    }).as('getGroupRequests');

    cy.intercept('GET', '**/api/group-requests/*', (req) => {
      const requestId = parseInt(req.url.split('/').pop() || '0');
      const request = allRequests.find((r: any) => r.id === requestId);

      if (request) {
        req.reply({
          statusCode: 200,
          body: request,
        });
      } else {
        req.reply({
          statusCode: 404,
          body: { error: 'Group request not found' },
        });
      }
    }).as('getGroupRequest');

    cy.intercept('POST', '**/api/group-requests', (req) => {
      const newRequest = {
        id: Date.now(), // Generate a mock ID
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        ...req.body,
      };
      allRequests.push(newRequest);
      req.reply({
        statusCode: 201,
        body: newRequest,
      });
    }).as('createGroupRequest');

    cy.intercept('PATCH', '**/api/group-requests/*', {
      statusCode: 200,
      body: { message: 'Group request updated successfully' },
    }).as('updateGroupRequest');

    cy.intercept('DELETE', '**/api/group-requests/*', (req) => {
      const requestId = parseInt(req.url.split('/').pop() || '0');
      allRequests = allRequests.filter((r) => r.id !== requestId);
      req.reply({
        statusCode: 200,
        body: { message: 'Group request deleted successfully' },
      });
    }).as('deleteGroupRequest');

    // Mock Groups (Active Groups)
    cy.intercept('GET', '**/api/groups', {
      statusCode: 200,
      body: [], // Return empty list of active groups for now
    }).as('getGroups');

    cy.intercept('GET', '**/api/groups/my-groups', {
      statusCode: 200,
      body: [], // Return empty list of user's groups
    }).as('getMyGroups');
  });

  // Mock Event Requests
  cy.get('@eventRequestsData').then((data: any) => {
    cy.intercept('GET', '**/api/event-requests*', (req) => {
      const url = new URL(req.url);
      const status = url.searchParams.get('status');

      if (status && data[status]) {
        req.reply({
          statusCode: 200,
          body: data[status],
        });
      } else if (!status) {
        const allRequests = [...data.pending, ...data.confirmed, ...data.cancelled];
        req.reply({
          statusCode: 200,
          body: allRequests,
        });
      } else {
        req.reply({
          statusCode: 200,
          body: [],
        });
      }
    }).as('getEventRequests');

    cy.intercept('GET', '**/api/event-requests/*', (req) => {
      const requestId = parseInt(req.url.split('/').pop() || '0');
      const allRequests = [...data.pending, ...data.confirmed, ...data.cancelled];
      const request = allRequests.find((r: any) => r.id === requestId);

      if (request) {
        req.reply({
          statusCode: 200,
          body: request,
        });
      } else {
        req.reply({
          statusCode: 404,
          body: { error: 'Event request not found' },
        });
      }
    }).as('getEventRequest');

    cy.intercept('PATCH', '**/api/event-requests/*', {
      statusCode: 200,
      body: { message: 'Event request updated successfully' },
    }).as('updateEventRequest');

    cy.intercept('DELETE', '**/api/event-requests/*', {
      statusCode: 200,
      body: { message: 'Event request deleted successfully' },
    }).as('deleteEventRequest');
  });

  // Mock Room Reservations
  cy.get('@roomReservationsData').then((data: any) => {
    cy.intercept('GET', '**/api/reservations*', (req) => {
      const url = new URL(req.url);
      const status = url.searchParams.get('status');

      if (status && data[status]) {
        req.reply({
          statusCode: 200,
          body: data[status],
        });
      } else if (!status) {
        const allReservations = [...data.pending, ...data.confirmed, ...data.cancelled];
        req.reply({
          statusCode: 200,
          body: allReservations,
        });
      } else {
        req.reply({
          statusCode: 200,
          body: [],
        });
      }
    }).as('getReservations');

    cy.intercept('GET', '**/api/reservations/*', (req) => {
      const reservationId = parseInt(req.url.split('/').pop() || '0');
      const allReservations = [...data.pending, ...data.confirmed, ...data.cancelled];
      const reservation = allReservations.find((r: any) => r.id === reservationId);

      if (reservation) {
        req.reply({
          statusCode: 200,
          body: reservation,
        });
      } else {
        req.reply({
          statusCode: 404,
          body: { error: 'Reservation not found' },
        });
      }
    }).as('getReservation');

    cy.intercept('POST', '**/api/reservations', {
      statusCode: 201,
      body: { message: 'Reservation created successfully', id: 999 },
    }).as('createReservation');

    cy.intercept('PATCH', '**/api/reservations/*', {
      statusCode: 200,
      body: { message: 'Reservation updated successfully' },
    }).as('updateReservation');

    cy.intercept('DELETE', '**/api/reservations/*', {
      statusCode: 200,
      body: { message: 'Reservation deleted successfully' },
    }).as('deleteReservation');
  });

  // Mock Users
  cy.get('@usersData').then((users: any) => {
    // Specific intercept for /api/users/check MUST come before the wildcard
    cy.intercept('GET', '**/api/users/check', {
      statusCode: 200,
      body: {
        user: {
          id: 101, // Mock as Juan Perez (Student)
          name: 'Test Student',
          email: 'student@example.com',
          role: 'student',
        },
      },
    }).as('checkUser');

    cy.intercept('GET', '**/api/users*', {
      statusCode: 200,
      body: users,
    }).as('getUsers');

    cy.intercept('GET', '**/api/users/*', (req) => {
      const urlParts = req.url.split('/');
      const lastPart = urlParts.pop() || '';
      const userId = parseInt(lastPart);

      // If the last part isn't a number (like 'check' if it fell through), handle gracefully
      if (isNaN(userId)) return;

      const user = users.find((u: any) => u.id === userId);

      if (user) {
        // Return full profile structure as expected by fetchUserProfile
        // We'll attach a mock schedule for this user
        // In a real scenario we'd filter reservations for this user
        const mockSchedule = [
          {
            id: 1,
            day: new Date().toISOString().split('T')[0],
            module: 1,
            status: 'CONFIRMED',
            isFinished: false,
            available: 'OCCUPIED',
            roomName: 'Sala A',
            location: 'Piso 1',
          },
        ];

        req.reply({
          statusCode: 200,
          body: {
            user: user,
            schedule: mockSchedule,
            scheduleCount: 1,
            strikes: [],
            strikesCount: 0,
            upcomingEvents: [],
            upcomingEventsCount: 0,
            attendances: [],
            attendancesCount: 0,
            activeSchedules: 1,
          },
        });
      } else {
        req.reply({
          statusCode: 404,
          body: { error: 'User not found' },
        });
      }
    }).as('getUser');

    cy.intercept('PATCH', '**/api/users/*', {
      statusCode: 200,
      body: { message: 'User updated successfully' },
    }).as('updateUser');

    cy.intercept('DELETE', '**/api/users/*', {
      statusCode: 200,
      body: { message: 'User deleted successfully' },
    }).as('deleteUser');
  });

  // Mock Strikes
  cy.get('@strikesData').then((strikes: any) => {
    cy.intercept('GET', '**/api/strikes*', (req) => {
      const url = new URL(req.url);
      const isActive = url.searchParams.get('is_active');

      if (isActive !== null) {
        const filteredStrikes = strikes.filter((s: any) => s.is_active === (isActive === 'true'));
        req.reply({
          statusCode: 200,
          body: filteredStrikes,
        });
      } else {
        req.reply({
          statusCode: 200,
          body: strikes,
        });
      }
    }).as('getStrikes');

    cy.intercept('GET', '**/api/strikes/*', (req) => {
      const strikeId = parseInt(req.url.split('/').pop() || '0');
      const strike = strikes.find((s: any) => s.id === strikeId);

      if (strike) {
        req.reply({
          statusCode: 200,
          body: strike,
        });
      } else {
        req.reply({
          statusCode: 404,
          body: { error: 'Strike not found' },
        });
      }
    }).as('getStrike');

    cy.intercept('POST', '**/api/strikes', {
      statusCode: 201,
      body: { message: 'Strike created successfully', id: 999 },
    }).as('createStrike');

    cy.intercept('PATCH', '**/api/strikes/*', {
      statusCode: 200,
      body: { message: 'Strike updated successfully' },
    }).as('updateStrike');

    cy.intercept('DELETE', '**/api/strikes/*', {
      statusCode: 200,
      body: { message: 'Strike deleted successfully' },
    }).as('deleteStrike');
  });

  // Mock Schedule and Rooms endpoints
  cy.intercept('GET', '**/api/sRooms', {
    statusCode: 200,
    body: [],
  }).as('getStudyRooms');

  cy.get('@scheduleData').then((scheduleItems: any) => {
    cy.intercept('GET', '**/api/srSchedule*', (req) => {
      const url = new URL(req.url);
      const requestedDay = url.searchParams.get('day') || new Date().toISOString().split('T')[0];

      // 1. Get existing reservations for this day
      const reservationsForDay = scheduleItems.filter((item: any) => item.day === requestedDay);

      // 2. Generate AVAILABLE slots for common rooms (simulating backend logic)
      // We'll create available slots for Sala A (101) and Sala B (102) if they aren't fully occupied
      // For simplicity in mock: Always add some available slots for these rooms
      const availableSlots = [
        {
          id: 9001,
          sr_id: 101, // Sala A
          module: '5', // 12:30 - 13:40
          day: requestedDay,
          available: 'AVAILABLE',
          studyRoom: {
            id: 101,
            name: 'Sala A',
            location: 'Piso 1',
            capacity: 6,
            equipment: ['Proyector', 'Pizarra'],
          },
        },
        {
          id: 9002,
          sr_id: 101, // Sala A
          module: '6', // 14:00 - 15:10
          day: requestedDay,
          available: 'AVAILABLE',
          studyRoom: {
            id: 101,
            name: 'Sala A',
            location: 'Piso 1',
            capacity: 6,
            equipment: ['Proyector', 'Pizarra'],
          },
        },
        {
          id: 9003,
          sr_id: 102, // Sala B
          module: '4',
          day: requestedDay,
          available: 'AVAILABLE',
          studyRoom: {
            id: 102,
            name: 'Sala B',
            location: 'Piso 2',
            capacity: 8,
            equipment: ['Computadoras'],
          },
        },
      ];

      const combinedItems = [...reservationsForDay, ...availableSlots];

      req.reply({
        statusCode: 200,
        body: {
          page: 1,
          take: 100,
          total: combinedItems.length,
          items: combinedItems,
        },
      });
    }).as('getRoomSchedule');
  });
};
