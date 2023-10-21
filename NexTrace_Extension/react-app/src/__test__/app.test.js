import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('should render the Metrics component when the route path is /metrics', () => {
    const routePath = '/metrics';

    render(<App routePath={routePath} />);

    expect(screen.getByTestId('metrics')).toBeInTheDocument();
  });

  it('should render the Console component when the route path is /console', () => {
    const routePath = '/console';

    render(<App routePath={routePath} />);

    expect(screen.getByTestId('console')).toBeInTheDocument();
  });
});
