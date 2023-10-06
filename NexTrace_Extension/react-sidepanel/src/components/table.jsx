import React from 'react';



export default function Table() {
    const handleClick = () => {
        // Get the vscode object
        // const vscode = acquireVsCodeApi();
        console.log('IM CLICKING RN!!!!!!!')
        console.log(vscode);
        
        // Send a message to your extension with the command
        vscode.postMessage('NexTrace.startServer');
      };
    
    

    return (
        <div className='panel'>
            <button className='startButton' onClick={e => {handleClick()}}>Start</button>
            <p>NexTrace running on port: 3695....</p>

            <button className='buttonOne'></button>
            <button className='buttonOne'></button>
            <button className='buttonOne'></button>
            <button className='buttonOne'></button>
            <button className='buttonOne'></button>

        </div>
    )
}