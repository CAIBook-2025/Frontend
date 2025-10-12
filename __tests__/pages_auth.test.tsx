import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '@/app/LogIn/page';

const pushMock = jest.fn();

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock,
      replace: jest.fn(),
      prefetch: jest.fn(),
    }),
  };
});

jest.mock('@auth0/nextjs-auth0', () => ({
  useUser: () => ({
    user: { sub: 'auth0|123', email: 'user@uc.cl' },
    error: null,
    isLoading: false,
  }),
  getAccessToken: jest.fn().mockResolvedValue('fake-token'),
}));

describe('LoginPage', () => {
  let mathRandomSpy: jest.SpyInstance;
  let setTimeoutMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    pushMock.mockClear();
  });

  afterEach(() => {
    mathRandomSpy?.mockRestore();
    setTimeoutMock?.mockRestore();
  });

  it('redirecciona al dashboard de estudiantes tras un login exitoso', async () => {
    mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1);
    setTimeoutMock = jest.spyOn(global, 'setTimeout').mockImplementation(((
      callback: any,
      _delay?: number,
      ...args: any[]
    ) => {
      callback?.(...args);
      return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as any);

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/correo institucional/i), {
      target: { value: 'user@uc.cl' },
    });
    fireEvent.change(screen.getByLabelText(/contrase/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /iniciar/i }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(pushMock).toHaveBeenCalledWith('/Student');
  });
});
