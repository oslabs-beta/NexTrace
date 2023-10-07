import React, { useState } from 'react';



export default function Table() {
    const [originFileContent, setOriginalFileContent] = useState('');
    const [filePath, setFilePath] = useState('');
    const [buttonState, setButtonState] = useState('Start')
    const vscode = window.vscodeApi;

    const handleClick = (cmd) => {
        //Toggles button text to start / stop
        if (cmd === 'startServer' || cmd === 'stopServer' && buttonState === 'Start') setButtonState('Stop')
        else if (cmd === 'startServer' || cmd === 'stopServer') setButtonState('Start');

        // Send a message to your extension with the command
        if (cmd === 'startServer') vscode.postMessage('NexTrace.startServer');
        if (cmd === 'stopServer') vscode.postMessage('NexTrace.stopServer');
        if (cmd === 'openMetrics') vscode.postMessage('NexTrace.openTable');
        if (cmd === 'transformCode' && filePath !== '') vscode.postMessage({ command: 'transformCode', path: filePath });
        if (cmd === 'detransformCode' && filePath !== '') vscode.postMessage({ command: 'detransformCode', path: filePath });
    };

    function handleFile() {
        console.log('im in handleFile')
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const fileContent = event.target.result;
                setOriginalFileContent(fileContent);
                setFilePath(file.path);
            }
            reader.readAsText(file);
        }
    }

    return (
        <div className='panel'>
            <button
                className={`serverButton ${buttonState === 'Start' ? 'startButton' : 'stopButton'}`}
                onClick={(e) => {
                    buttonState === 'Start' ? handleClick('startServer') : handleClick('stopServer')
                    buttonState === 'Start' ? handleClick('transformCode') : handleClick('detransformCode');
                }}
            >{buttonState === 'Start' ? (<><i className="fas fa-play"></i> Start</>) : (<> <i className="fas fa-stop"></i>  Stop</>)}
            </button>
            <p>NexTrace running on port: 3695....</p>
            <input type="file" id="fileInput" name="fileInput" onChange={handleFile}></input>
            <button className='buttonOne' onClick={e => { handleClick('openMetrics') }}></button>
            <button className='buttonOne'></button>
            <button className='buttonOne'></button>

        </div>
    )
}

