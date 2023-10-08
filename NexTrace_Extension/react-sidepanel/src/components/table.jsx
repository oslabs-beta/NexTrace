import React, { useState, useRef } from 'react';



export default function Table() {
    const [fileName, setFileName] = useState('');
    const [filePath, setFilePath] = useState('');
    const [buttonState, setButtonState] = useState('Start')
    const vscode = window.vscodeApi;

    const handleClick = (cmd) => {
        //Toggles button text to start / stop
        if (cmd === 'startServer' && buttonState === 'Start' && filePath !== '') setButtonState('Stop')
        else if (cmd === 'stopServer' && buttonState === 'Stop' && filePath !== '') setButtonState('Start');

        // Send a message to your extension with the command
        if (cmd === 'startServer') vscode.postMessage('NexTrace.startServer');
        if (cmd === 'stopServer') vscode.postMessage('NexTrace.stopServer');
        if (cmd === 'openMetrics') vscode.postMessage('NexTrace.openTable');
        if (cmd === 'transformCode' && filePath !== '') vscode.postMessage({ command: 'transformCode', path: filePath });
        if (cmd === 'detransformCode' && filePath !== '') vscode.postMessage({ command: 'detransformCode', path: filePath });
    };

    const fileInputRef = useRef(null);
    const handleFileButtonClick = () => {
      fileInputRef.current.click();
      fileInputRef.current.value = null;
    };
  
    function handleFile(e) {
      console.log('im in handleFile')
        const file = e.target.files[0];
        if (file) {
                setFileName(file.name);
                setFilePath(file.path);
        }

    }

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
            }}
          >{buttonState === 'Start' ? (<><i className="fas fa-play"></i> Start</>) : (<> <i className="fas fa-stop"></i> Stop</>)}
          </button>
            <p>{buttonState === 'Start' ? `Choose a root file to monitor.` : `NexTrace running on port: 3695.....`}</p>
            <div>
              <button type="button" onClick={handleFileButtonClick} disabled={buttonState === 'Stop'}>{fileName ? fileName : 'Choose File'}</button>
              {fileName && <button type="button" onClick={resetFile} disabled={buttonState === 'Stop'}>X</button>}
              <input type="file" id="fileInput" name="fileInput" onChange={handleFile} ref={fileInputRef} style={{ display: 'none' }}></input>
            </div>
          
            <button className='buttonOne'  onClick={e => {handleClick('openMetrics')}}></button>
            <button className='buttonOne'></button>
            <button className='buttonOne'></button>

        </div>
    )
}

