import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '@/app/page';
import AboutPage from '@/app/About/page';

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

describe('HomePage', () => {
  it('renders hero section and CTA links', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', {
        name: /gestión de espacios/i,
        level: 1,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Acceder a la Plataforma/i })).toHaveAttribute(
      'href',
      '/dashboard'
    );
    expect(screen.getByRole('link', { name: /Comenzar ahora/i })).toHaveAttribute('href', '/login');
  });
});

describe('AboutPage', () => {
  it('shows team information and image', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: /Nuestro Equipo/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Mapocho/i })).toBeInTheDocument();
  });
});
