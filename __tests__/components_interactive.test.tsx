import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InteractiveImageShowcase } from '@/components/InteractiveImageShowcase';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

describe('InteractiveImageShowcase', () => {
  const baseProps = {
    beforeImageSrc: '/before.png',
    afterImageSrc: '/after.png',
    beforeTitle: 'Antes',
    beforeText: 'Proceso manual',
    afterTitle: 'Después',
    afterText: 'Proceso digital',
  };

  it('renders both before and after states', () => {
    render(<InteractiveImageShowcase {...baseProps} />);

    expect(screen.getByRole('img', { name: /manual/i })).toHaveAttribute('src', '/before.png');
    expect(screen.getByRole('img', { name: /computador/i })).toHaveAttribute('src', '/after.png');
    expect(screen.getByRole('heading', { name: /Antes/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Después/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByText(/Proceso manual/i)).toBeInTheDocument();
    expect(screen.getByText(/Proceso digital/i)).toBeInTheDocument();
  });
});
