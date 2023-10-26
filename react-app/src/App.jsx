import React from 'react';
import Console from './components/Console';
import Metrics from './components/Metrics';

const App = (props) => {
  let routePath;
  if (props.propRoutePath) routePath = props.propRoutePath; 
  else routePath = document.getElementById('route').getAttribute('data-route-path');

  return (
    <div className='router'>
      <main>
        {/* Routes to either metrics or console panel based on routePath element in extension.js webview html content */}
        {/* {routePath === '/metrics' && <Metrics />}
        {routePath === '/console' && <Console />} */}
      </main>
    </div>
  );
};

export default App;
