import React, { useState, useRef } from 'react';

export default function Table({ name, path, rootDir, button, setTableData }) {
  const vscode = window.vscodeApi;

  const handleClick = (cmd) => {
    if (path) {
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
        const filePathArr = [];
        for (const file in fileList) {
          filePathArr.push(fileList[file].path);
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
      <button
        className={`serverButton ${button === 'Start' ? 'startButton' : 'stopButton'}`}
        onClick={(e) => {
          button === 'Start' ? handleClick('startServer') : handleClick('stopServer')
          button === 'Start' ? handleClick('transformCode') : handleClick('detransformCode');
          button === 'Start' ? handleClick('gatherFilePaths') : handleClick('removeLogs');
          handleClick('saveState');
        }}
      >{button === 'Start' ? (<><i className="fas fa-play"></i> Start</>) : (<><i className="fas fa-stop"></i> Stop</>)}
      </button>

      <p style={{ textAlign: "center", marginBottom: '0.15em' }}>{button === 'Start' ? name !== '' ? 'Selected File:' : `Select root file.....` : `NexTrace running on port: 3695.....`}</p>

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

      <button className='buttonTwo' onClick={e => { handleClick('openMetrics') }}>Metrics</button>
      <button className='buttonTwo' onClick={e => { handleClick('openConsole') }}>Logs</button>


      <button className="chooseButton" id="cleanFiles" type="button" onClick={() => { handleClick('removeLogs'); handleClick('detransformCode') }} disabled={button === 'Stop'}>Clean Files</button>
    </div>
  )
}