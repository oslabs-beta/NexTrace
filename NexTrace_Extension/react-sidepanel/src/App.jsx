import React, { useState, useEffect } from 'react';
import Table from './components/table';

export default function App() {
  const [tableData, setTableData] = useState({ name: '', path: '', rootDir: [], button: 'Start' });
  const vscode = window.vscodeApi;
  
  useEffect(() => {
    vscode.postMessage('NexTrace.getState');

    const handleMessage = (event) => {
      const message = event.data;
      if (message.command === 'NexTrace.getStateResponse') {
        // Access the saved state from the message and update the state variable
        const savedState = message.data;
        if (savedState){
          setTableData(savedState);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);


  return <Table name={tableData.name} path={tableData.path} rootDir={tableData.rootDir} button={tableData.button} setTableData={setTableData}/>;
}