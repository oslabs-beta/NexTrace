import React, { useState, useRef } from 'react';

export default function Table({name, path, button, setTableData}) {
    const vscode = window.vscodeApi;

    const handleClick = (cmd) => {
      if(path){
        //Toggles button text to start / stop
        if (cmd === 'startServer' && button === 'Start') setTableData({ name: name, path: path, button: 'Stop' });
        else if (cmd === 'stopServer' && button === 'Stop') setTableData({ name: name, path: path, button: 'Start' });
      
        // Send a message to your extension with the command
        if (cmd === 'startServer') vscode.postMessage('NexTrace.startServer');
        if (cmd === 'stopServer') vscode.postMessage('NexTrace.stopServer');
        if (cmd === 'transformCode') vscode.postMessage({ command: 'transformCode', path: path });
        if (cmd === 'detransformCode') vscode.postMessage({ command: 'detransformCode', path: path });
        if (cmd === 'saveState') vscode.postMessage({ command: 'NexTrace.saveState', path: path, name: name, button: button === 'Start' ? 'Stop' : 'Start'});
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
    //Sets name / Path state to selected file
    function handleFile(e) {
        const file = e.target.files[0];
        if (file) {
          setTableData({ name: file.name, path: file.path, button: button }); 
        }

    }
    //Reset name / Path state to '' for X button
    function resetFile() {
      setTableData({ name: '', path: '', button: button }); 
      vscode.postMessage({ command: 'NexTrace.saveState', path: '', name: '', button: button });
    }
    
    return (
        <div className='panel'>
          <button
            className={`serverButton ${button === 'Start' ? 'startButton' : 'stopButton'}`}
            onClick={(e) => {
            button === 'Start' ? handleClick('startServer') : handleClick('stopServer');
            button === 'Start' ? handleClick('transformCode') : handleClick('detransformCode');
            handleClick('saveState');
            }}
          >{button === 'Start' ? (<><i className="fas fa-play"></i> Start</>) : (<><i className="fas fa-stop"></i> Stop</>)}
          </button>

          <p style={{textAlign:"center", marginBottom:'0.15em'}}>{button === 'Start' ? name !== '' ? 'Selected File:' : `Select root file.....` : `NexTrace running on port: 3695.....`}</p>

          <div className='chooseFile'>
            <button type="button" className='chooseButton' onClick={handleFileButtonClick} disabled={button === 'Stop'}>{name ? name : 'Choose File'}</button>
            {/* <button type="button" className="chooseButton" onClick={handleFileButtonClick} disabled={button === 'Stop'}>
              <img className="chooseButtonImage" />
              <span className="chooseButtonText">{fileName ? fileName : 'Choose File'}</span>
            </button> */}
            {name && <button type="button" className={button === 'Stop' ? 'xButtonHide' : 'xButton'} onClick={resetFile} disabled={button === 'Stop'}>X</button>}
            <input type="file" id="fileInput" name="fileInput" onChange={handleFile} ref={fileInputRef} style={{ display: 'none' }}></input>
          </div>
          
          <button className='buttonOne' onClick={e => {handleClick('openMetrics')}}></button>
          <button className='buttonOne' onClick={e => {handleClick('openConsole')}}></button>
          <button className='buttonOne'></button>
        </div>
    )
}