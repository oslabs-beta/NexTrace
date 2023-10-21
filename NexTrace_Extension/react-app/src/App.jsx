import React from 'react';
import Console from './components/Console';
import Metrics from './components/Metrics';
import './style.css';

const App = (props) => {
  let routePath;
  if (props.propRoutePath) routePath = props.propRoutePath; // for integration testing
  else routePath = document.getElementById('route').getAttribute('data-route-path');

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
