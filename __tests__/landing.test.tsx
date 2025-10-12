import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '@/app/Landing/page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock('@/components/InteractiveImageShowcase', () => ({
  InteractiveImageShowcase: () => <div data-testid="interactive-showcase" />,
}));

describe('LandingPage', () => {
  // Verifies the hero CTA directs users to the dashboard page
  it('renderiza CTA principal hacia /dashboard', () => {
    render(<LandingPage />);

    const ctaDashboard = screen.getByRole('link', { name: /acceder a la plataforma/i });
    expect(ctaDashboard).toBeInTheDocument();
    expect(ctaDashboard).toHaveAttribute('href', '/dashboard');
  });

  // Ensures the final CTA leads to the login route
  it('renderiza CTA final hacia /login', () => {
    render(<LandingPage />);

    const ctaLogin = screen.getByRole('link', { name: /comenzar ahora/i });
    expect(ctaLogin).toBeInTheDocument();
    expect(ctaLogin).toHaveAttribute('href', '/login');
  });
});
