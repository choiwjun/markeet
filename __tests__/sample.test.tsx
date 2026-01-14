import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Sample Test', () => {
  it('should render text', () => {
    render(<div>Test</div>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
