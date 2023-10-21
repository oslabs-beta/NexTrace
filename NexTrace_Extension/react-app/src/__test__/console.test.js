import React from 'react';
import { render, screen } from '@testing-library/react';
import ConsoleComponent from '../components/Console';

const mockJumpToFile = jest.fn();

describe('ConsoleComponent', () => {
  it('should render a list of console logs', () => {
    const logs = [
      { consoleLog: 'Log 1', path: '/path/to/file1.js' },
      { consoleLog: 'Log 2', path: '/path/to/file2.js' },
    ];

    render(<ConsoleComponent logs={logs} jumpToFile={mockJumpToFile} />);

    expect(screen.getByText('Log 1')).toBeInTheDocument();
    expect(screen.getByText('Log 2')).toBeInTheDocument();
  });

  it('should call the `jumpToFile` function when a button is clicked', () => {
    const logs = [
      { consoleLog: 'Go to file1.js', path: '/path/to/file1.js' },
    ];

    render(<ConsoleComponent logs={logs} jumpToFile={mockJumpToFile} />);

    const button = screen.getByText('Go to file1.js');
    button.click();

    expect(mockJumpToFile).toHaveBeenCalledWith('/path/to/file1.js');
  });
});
