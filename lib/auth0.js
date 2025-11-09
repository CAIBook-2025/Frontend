import { Auth0Client } from '@auth0/nextjs-auth0/server';

const auth0 = new Auth0Client({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  appBaseUrl: process.env.APP_BASE_URL,
  secret: process.env.AUTH0_SECRET,

  authorizationParameters: {
    scope: process.env.AUTH0_SCOPE,
    audience: process.env.AUTH0_AUDIENCE,
  },
});

if (process.env.NEXT_PUBLIC_API_MODE === 'mock') {
  const mockSession = {
    user: {
      sub: 'auth0|local-mock-user',
      email: 'admin@example.com',
      name: 'Mock Admin',
      nickname: 'mock-admin',
    },
    tokenSet: {
      accessToken: 'mock-admin-access-token',
      access_token: 'mock-admin-access-token',
    },
  };

  const originalGetSession = auth0.getSession.bind(auth0);

  auth0.getSession = async (...args) => {
    try {
      const session = await originalGetSession(...args);
      if (session) {
        return session;
      }
    } catch (error) {
      console.warn('Auth0 getSession failed, falling back to mock session in mock mode', error);
    }
    return mockSession;
  };
}

export { auth0 };
