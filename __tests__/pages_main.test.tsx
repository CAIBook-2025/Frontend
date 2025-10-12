import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '@/app/page';

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
  // Ensures the home CTA links point to the correct destinations
  it('expone los enlaces principales hacia dashboard y login', () => {
    render(<HomePage />);

    expect(screen.getByRole('link', { name: /Acceder a la Plataforma/i })).toHaveAttribute(
      'href',
      '/dashboard'
    );
    expect(screen.getByRole('link', { name: /Comenzar ahora/i })).toHaveAttribute('href', '/login');
  });
});
