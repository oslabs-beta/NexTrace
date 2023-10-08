import React from 'react';
import Console from './components/Console';
import Metrics from './components/Metrics';
import './style.css';

const App = (props) => {
  const routePath = document.getElementById('route').getAttribute('data-route-path');

  return (
    <div className='router'>
      <main>
        {routePath === '/metrics' && <Metrics />}
        {routePath === '/console' && <Console />}
      </main>
    </div>
  );
};

export default App;