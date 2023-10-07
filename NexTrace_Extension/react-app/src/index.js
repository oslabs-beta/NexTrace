import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import App from './App.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
  <App />
);

// ReactDOM.render(<App/>, document.getElementById('root'));