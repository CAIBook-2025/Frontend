// app/__tests__/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '@/app/Landing/page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const mockInteractive = jest.fn((props) => <div data-testid="interactive-showcase" />);
jest.mock('@/components/InteractiveImageShowcase', () => ({
  InteractiveImageShowcase: (props: any) => mockInteractive(props),
}));

describe('LandingPage', () => {
  beforeEach(() => {
    mockInteractive.mockClear();
  });

  it('renderiza el hero con título, descripción y CTA a /dashboard', () => {
    render(<LandingPage />);

    const heroHeading = screen.getByRole('heading', {
      name: /la gestión de espacios de ingeniería, .*simplificada/i,
      level: 1,
    });
    expect(heroHeading).toBeInTheDocument();

    expect(
      screen.getByText(/CAIBook centraliza la reserva de salas de estudio/i)
    ).toBeInTheDocument();

    const ctaDashboard = screen.getByRole('link', { name: /acceder a la plataforma/i });
    expect(ctaDashboard).toBeInTheDocument();
    expect(ctaDashboard).toHaveAttribute('href', '/dashboard');
  });

  it('monta InteractiveImageShowcase con las props esperadas', () => {
    render(<LandingPage />);

    // El mock se debe haber llamado una vez
    expect(mockInteractive).toHaveBeenCalledTimes(1);

    // Verifica props claves
    expect(mockInteractive).toHaveBeenCalledWith(
      expect.objectContaining({
        beforeImageSrc: '/ProcesoManual.png',
        afterImageSrc: '/LandingImage.png',
        beforeTitle: 'El Proceso Manual',
        beforeText: 'Viajes, filas y la incertidumbre de encontrar una sala disponible.',
        afterTitle: 'La Solución Digital',
        afterText: 'Reserva desde donde estés, en segundos. Tu tiempo es valioso.',
      }),
    );
  });

  it('renderiza la sección de características con 4 FeatureCards y sus títulos', () => {
    render(<LandingPage />);

    const featuresHeading = screen.getByRole('heading', {
      name: /todo lo que necesitas para organizarte/i,
      level: 2,
    });
    expect(featuresHeading).toBeInTheDocument();

    const titles = [
      /agilidad inmediata/i,
      /total transparencia/i,
      /comunidad conectada/i,
      /eficiencia y orden/i,
    ];

    titles.forEach((title) => {
      expect(screen.getByRole('heading', { name: title, level: 3 })).toBeInTheDocument();
    });

    // Podemos contar tarjetas por sus headings (nivel 3)
    const featureCards = screen.getAllByRole('heading', { level: 3 });
    expect(featureCards).toHaveLength(7); 
  });

  it('renderiza la sección "Fácil de empezar" con pasos 1-2-3', () => {
    render(<LandingPage />);

    const howHeading = screen.getByRole('heading', {
      name: /fácil de empezar/i,
      level: 2,
    });
    expect(howHeading).toBeInTheDocument();

    // Tres pasos con sus headings
    expect(screen.getByRole('heading', { name: /encuentra tu espacio/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /reserva al instante/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /colabora y participa/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByText(/^1$/)).toBeInTheDocument();
    expect(screen.getByText(/^2$/)).toBeInTheDocument();
    expect(screen.getByText(/^3$/)).toBeInTheDocument();
  });

  it('renderiza el CTA final que apunta a /login', () => {
    render(<LandingPage />);

    const ctaLogin = screen.getByRole('link', { name: /comenzar ahora/i });
    expect(ctaLogin).toBeInTheDocument();
    expect(ctaLogin).toHaveAttribute('href', '/login');

    expect(
      screen.getByRole('heading', { name: /¿listo para optimizar tu tiempo\?/i, level: 2 })
    ).toBeInTheDocument();
  });

  it('usa estructura semántica con headings principales de secciones', () => {
    render(<LandingPage />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const names = h2s.map((h) => h.textContent?.toLowerCase() || '');

    expect(names).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/todo lo que necesitas/i),
        expect.stringMatching(/fácil de empezar/i),
        expect.stringMatching(/¿listo para optimizar tu tiempo\?/i),
      ])
    );
  });
});
