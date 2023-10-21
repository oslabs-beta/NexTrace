import React from 'react';
import { render, screen } from '@testing-library/react';
import CustomizedTables from '../components/Metrics';
import '@testing-library/jest-dom'



test('loads and displays tableHead headers', async () => {

  render(<CustomizedTables />)

  expect(screen.getByTestId('endpoint-header')).toHaveTextContent('Endpoint')
  expect(screen.getByTestId('status-header')).toHaveTextContent('Status')
  expect(screen.getByTestId('method-header')).toHaveTextContent('Method')
  expect(screen.getByTestId('type-header')).toHaveTextContent('Type')
  expect(screen.getByTestId('duration-header')).toHaveTextContent('Duration')
  expect(screen.getByTestId('rendering-header')).toHaveTextContent('Rendering')

})
