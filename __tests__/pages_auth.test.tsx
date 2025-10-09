import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompleteProfilePage from '@/app/CompleteProfile/page';
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

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock('@auth0/nextjs-auth0', () => ({
  useUser: () => ({
    user: { sub: 'auth0|123', email: 'user@uc.cl' },
    error: null,
    isLoading: false,
  }),
  getAccessToken: jest.fn().mockResolvedValue('fake-token'),
}));

describe('CompleteProfilePage', () => {
  it('renders form and shows validation errors when submitting empty fields', async () => {
    render(<CompleteProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    expect(await screen.findByText(/El nombre es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/El apellido es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/La carrera es requerida/i)).toBeInTheDocument();
    expect(screen.getByText(/tel[eé]fono es requerido/i)).toBeInTheDocument();
  });
});

describe('LoginPage', () => {
  let mathRandomSpy: jest.SpyInstance<number, []>;

  beforeEach(() => {
    pushMock.mockReset();
  });

  afterEach(() => {
    if (mathRandomSpy) {
      mathRandomSpy.mockRestore();
    }
    jest.useRealTimers();
  });

  it('logs in successfully and redirects to student dashboard', async () => {
    mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1);
    jest.useFakeTimers();
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Correo Institucional/i), {
      target: { value: 'user@uc.cl' },
    });
    fireEvent.change(screen.getByLabelText(/Contrase/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Iniciar/i }));

    await act(async () => {
      jest.runAllTimers();
    });

    expect(pushMock).toHaveBeenCalledWith('/Student');
  });

  it('shows error when fake API rejects login', async () => {
    mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.95);
    jest.useFakeTimers();
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Correo Institucional/i), {
      target: { value: 'user@uc.cl' },
    });
    fireEvent.change(screen.getByLabelText(/Contrase/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Iniciar/i }));

    await act(async () => {
      jest.runAllTimers();
    });

    expect(
      screen.getByText(/El correo o la contraseña son incorrectos/i)
    ).toBeInTheDocument();
  });
});
