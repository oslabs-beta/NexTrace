import React from 'react';



export default function Table() {
    const handleClick = (cmd) => {
        // Get the vscode object
        // const vscode = acquireVsCodeApi();
        console.log('IM CLICKING RN!!!!!!!')        
        
        // Send a message to your extension with the command
        if(cmd === 'startServer') vscode.postMessage('NexTrace.startServer');
        if(cmd === 'openMetrics') vscode.postMessage('NexTrace.openTable');
      };
    
    let filePath;

    const check = () => {
        filePath = document.getElementById("myFile").value;
        console.log(filePath);
    }

    return (
        <div className='panel'>
            <button className='startButton' onClick={e => {handleClick('startServer')}}>Start</button>
            <p>NexTrace running on port: 3695....</p>

            <input type="file" id="myFile" name="filename"></input>


            <input type="file" id="myFile" name="filename" disabled />


            <button className='buttonOne'  onClick={e => {handleClick('openMetrics')}}></button>
            <button className='buttonOne'  onClick={e => {check()}}></button>
            <button className='buttonOne'></button>
            <button className='buttonOne'></button>
            <button className='buttonOne'></button>

        </div>
    )
}