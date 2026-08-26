import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Footer from '@/components/Footer';

describe('Footer Component', () => {
  it('renders default version v2.5.1 correctly', () => {
    render(<Footer />);
    expect(screen.getByText(/2026 TalentFlow/i)).toBeDefined();
    expect(screen.getByText(/v2.5.1/i)).toBeDefined();
  });

  it('renders custom version prop when passed', () => {
    render(<Footer version="2.2.1-beta" />);
    expect(screen.getByText(/v2.2.1-beta/i)).toBeDefined();
  });
});
