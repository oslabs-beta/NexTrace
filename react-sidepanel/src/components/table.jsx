import React, { useState, useRef } from 'react';

export default function Table({ name, path, rootDir, button, setTableData }) {
  const vscode = window.vscodeApi;
  //Function to fire VS Code commands based on passed in cmd & current button state
  const handleClick = (cmd) => {
    if (path && rootDir.length > 0) {
      //Toggles button text to start / stop
      if (cmd === 'startServer' && button === 'Start') setTableData({ name: name, path: path, rootDir: rootDir, button: 'Stop' });
      else if (cmd === 'stopServer' && button === 'Stop') setTableData({ name: name, path: path, rootDir: rootDir, button: 'Start' });
      // Send a message to your extension with the command
      if (cmd === 'startServer') vscode.postMessage('NexTrace.startServer');
      if (cmd === 'stopServer') vscode.postMessage('NexTrace.stopServer');
      if (cmd === 'transformCode') vscode.postMessage({ command: 'transformCode', path: path });
      if (cmd === 'gatherFilePaths') vscode.postMessage({ command: 'gatherFilePaths', path: rootDir, rootPath: path });
      if (cmd === 'detransformCode') vscode.postMessage({ command: 'detransformCode', path: path });
      if (cmd === 'saveState') vscode.postMessage({ command: 'NexTrace.saveState', path, name, rootDir, button: button === 'Start' ? 'Stop' : 'Start' });
      if (cmd === 'removeLogs') vscode.postMessage({ command: 'removeLogs', path: rootDir });
    }
    //Opens Other Panels for Display
    if (cmd === 'openMetrics') vscode.postMessage('NexTrace.openTable');
    if (cmd === 'openConsole') vscode.postMessage('NexTrace.openConsole');
  };

  //Links Choose File Button functionality to hidden input element
  const fileInputRef = useRef(null);
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
    fileInputRef.current.value = null;
  };
  const fileInputRef2 = useRef(null);
  const handleRootButtonClick = () => {
    fileInputRef2.current.click();
    fileInputRef2.current.value = null;
  };
  //Sets Filename / Path state to selected file
  function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
      if (e.target.name === 'fileInput') {
        setTableData({ name: file.name, path: file.path, rootDir: rootDir, button: button });
      }
      else if (e.target.name === 'rootDir') {
        const fileList = e.target.files;
        if (Object.keys(fileList).length > 100) {
          vscode.postMessage({
            command: 'alert',
            text: 'WARNING: We noticed you selected a folder with a large amount of files. We filter out folders such as .next and node_modules, but consider choosing a smaller directory to reduce unnecessary overhead. Refer to our README for best practices.'
          });
        }
        const filePathArr = [];
        const regex = /(\.next|node_modules|\.git|\.config|\.env|\.json|README|next-env\.d)/;
        for (const file in fileList) {
          if (!regex.test(fileList[file].path)) {
            filePathArr.push(fileList[file].path);
          }
        }
        setTableData({ name, path, rootDir: filePathArr, button })
      }
    }

  }

  //Reset Filename / Path state to '' for X button
  function resetFile() {
    setTableData({ name: '', path: '', rootDir: rootDir, button: button });
    vscode.postMessage({ command: 'NexTrace.saveState', name: '', path: '', rootDir: rootDir, button: button });
  }
  function resetRoot() {
    setTableData({ name: name, path: path, rootDir: [], button: button });
    vscode.postMessage({ command: 'NexTrace.saveState', name: name, path: path, rootDir: [], button: button });
  }

  return (
    <div className='panel'>
      {/* Invokes functions to fire in sequence depending on button State */}
      <button
        className={`serverButton ${button === 'Start' ? 'startButton' : 'stopButton'}`}
        onClick={(e) => {
          button === 'Start' ? handleClick('startServer') : handleClick('stopServer')
          button === 'Start' ? handleClick('transformCode') : handleClick('detransformCode');
          button === 'Start' ? handleClick('gatherFilePaths') : handleClick('removeLogs');
          if ( button === 'Start' && path && rootDir.length > 0 ) handleClick('openMetrics');
          handleClick('saveState');
        }}
      >{button === 'Start' ? (<>Start</>) : (<>Stop</>)}
      </button>
        {/* Selects paragraph to be displayed based on button && file state */}
      <p style={{ textAlign: "center", marginBottom: '0.15em' }}>{button === 'Start' ? name !== '' ? 'Selected File:' : `Select root file.....` : `NexTrace running on port: 3695.....`}</p>
        {/* Functionality for choose file / root button */}
      <div className='chooseFile'>
        <button type="button" className='chooseButton' onClick={handleFileButtonClick} disabled={button === 'Stop'}>{name ? name : 'Choose File'}</button>
        {name && <button type="button" className={button === 'Stop' ? 'xButtonHide' : 'xButton'} onClick={resetFile} disabled={button === 'Stop'}>X</button>}
        <input type="file" id="fileInput" name="fileInput" onChange={handleFile} ref={fileInputRef} style={{ display: 'none' }}></input>
      </div>
      <div className='chooseFile'>
        <button type="button" className='chooseButton' onClick={handleRootButtonClick} disabled={button === 'Stop'}>{rootDir.length > 0 ? 'Root Selected' : 'Choose Root'}</button>
        {rootDir.length > 0 && <button type="button" className={button === 'Stop' ? 'xButtonHide' : 'xButton'} onClick={resetRoot} disabled={button === 'Stop'}>X</button>}
        <input type="file" webkitdirectory="" id="rootDir" name="rootDir" onChange={handleFile} ref={fileInputRef2} style={{ display: 'none' }}></input>
      </div>
        {/* Buttons for opening Metrics / Logs */}
      <button className='buttonTwo' disabled={button === 'Start'} onClick={e => { handleClick('openMetrics') }}>Metrics</button>
      <button className='buttonTwo' disabled={button === 'Start'} onClick={e => { handleClick('openConsole') }}>Logs</button>
        {/* Button for cleaning files */}
      <button className="chooseButton" id="cleanFiles" type="button" onClick={() => { handleClick('removeLogs'); handleClick('detransformCode') }} disabled={button === 'Stop'}>Clean Files</button>
    </div>
  )
}