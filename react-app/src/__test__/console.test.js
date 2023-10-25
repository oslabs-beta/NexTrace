import React from 'react';
import { render, screen } from '@testing-library/react';
import ConsoleComponent from '../components/Console';
import '@testing-library/jest-dom'



test('loads and displays tableHead headers', async () => {
  render(<ConsoleComponent />)

  expect(screen.getByTestId('console-header')).toHaveTextContent('Console Logs')
  expect(screen.getByTestId('link-header')).toHaveTextContent('Link')

})
