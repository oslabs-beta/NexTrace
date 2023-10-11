import React, { useState, useRef } from 'react';


export default function Table() {
  //CHECK IF SERVER IS STARTED ALREADY - This is needed to save state of start&stop button/file information in case user clicks on other activity bar items
  // async function checkServerStatus() {
  //   try {
  //     const response = await fetch('http://localhost:3695/');

  //     if (response.status === 200) {
  //       // The server is running (status code 200)
  //       console.log('Server is running.');
  //     } else {
  //       // The server is not running (status code is not 200)
  //       console.log('Server is not running.');
  //     }
  //   } catch (error) {
  //     // An error occurred, indicating that the server is not running or another issue occurred
  //     console.error('Error checking server status:', error);
  //   }
  // }
  // checkServerStatus();

  const [fileName, setFileName] = useState(''); //ping server to set state
  const [filePath, setFilePath] = useState(''); //ping server to set state
  const [rootDir, setRootDir] = useState([]);
  const [buttonState, setButtonState] = useState('Start') //ping server to set state

  const vscode = window.vscodeApi;

  const handleClick = (cmd) => {
    if (filePath) {
      //Toggles button text to start / stop
      if (cmd === 'startServer' && buttonState === 'Start') setButtonState('Stop')
      else if (cmd === 'stopServer' && buttonState === 'Stop') setButtonState('Start');

      // Send a message to your extension with the command
      if (cmd === 'startServer') vscode.postMessage('NexTrace.startServer');
      if (cmd === 'stopServer') vscode.postMessage('NexTrace.stopServer');
      if (cmd === 'transformCode') vscode.postMessage({ command: 'transformCode', path: filePath });
      if (cmd === 'gatherFilePaths') vscode.postMessage({ command: 'gatherFilePaths', path: rootDir });
      if (cmd === 'detransformCode') vscode.postMessage({ command: 'detransformCode', path: filePath });
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
  //Sets Filename / Path state to selected file
  function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
      if (e.target.name === 'fileInput') {
        setFileName(file.name);
        setFilePath(file.path);
      }
      else if (e.target.name === 'rootDir') {
        const fileList = e.target.files;
        const filePathArr = [];
        for (const file in fileList) {
          console.log('the current file: ', fileList[file]);
          filePathArr.push(fileList[file].path);
        }
        setRootDir(filePathArr);
      }
    }

  }

  //Reset Filename / Path state to '' for X button
  function resetFile() {
    setFileName('');
    setFilePath('');
  }
  return (
    <div className='panel'>
      <button
        className={`serverButton ${buttonState === 'Start' ? 'startButton' : 'stopButton'}`}
        onClick={(e) => {
          buttonState === 'Start' ? handleClick('startServer') : handleClick('stopServer')
          buttonState === 'Start' ? handleClick('transformCode') : handleClick('detransformCode');
          buttonState === 'Start' ? handleClick('gatherFilePaths') : handleClick('removeLogs');

        }}
      >{buttonState === 'Start' ? (<><i className="fas fa-play"></i> Start</>) : (<><i className="fas fa-stop"></i> Stop</>)}
      </button>

      <p style={{ textAlign: "center", marginBottom: '0.15em' }}>{buttonState === 'Start' ? fileName !== '' ? 'Selected File:' : `Select root file.....` : `NexTrace running on port: 3695.....`}</p>

      <div className='chooseFile'>
        <button type="button" className='chooseButton' onClick={handleFileButtonClick} disabled={buttonState === 'Stop'}>{fileName ? fileName : 'Choose File'}</button>
        {/* <button type="button" className="chooseButton" onClick={handleFileButtonClick} disabled={buttonState === 'Stop'}>
              <img className="chooseButtonImage" />
              <span className="chooseButtonText">{fileName ? fileName : 'Choose File'}</span>
            </button> */}
        {fileName && <button type="button" className={buttonState === 'Stop' ? 'xButtonHide' : 'xButton'} onClick={resetFile} disabled={buttonState === 'Stop'}>X</button>}
        <input type="file" id="fileInput" name="fileInput" onChange={handleFile} ref={fileInputRef} style={{ display: 'none' }}></input>
      </div>

      <button className='buttonOne' onClick={e => { handleClick('openMetrics') }}></button>
      <button className='buttonOne' onClick={e => { handleClick('openConsole') }}></button>
      <button className='buttonOne'></button>
      <input type="file" webkitdirectory="" id="rootDir" name="rootDir" onChange={handleFile} ></input>
    </div>
  )
}

