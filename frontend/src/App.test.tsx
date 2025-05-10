import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App component', () => {
  beforeEach(() => {
    // Mock fetch to return a single image
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 'foo.jpg', url: '/images/foo.jpg', timestamp: '2023-01-01T00:00:00Z' }
        ])
      } as any)
    ));
  });

  it('renders images fetched from API', async () => {
    render(<App />);
    // Expect image to appear
    const img = await screen.findByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/foo.jpg');
    // Expect filename text
    expect(await screen.findByText('foo.jpg')).toBeInTheDocument();
  });
});