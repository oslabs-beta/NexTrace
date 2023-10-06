import React, { useState } from 'react';

export default function Table() {
    const [filePath, setFilePath] = useState('')

    function handleFile() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const fileContent = event.target.result;
                const vscode = window.vscodeApi;
                vscode.postMessage({ command: 'transformCode', path: file.path });
            }
            reader.readAsText(file);
        }
    }

    return (
        <div className='panel'>
            <label htmlFor='file-path'>File Path:</label>
            <input id='file-path' type='text' value={filePath} onChange={(e) => setFilePath(e.target.value)}></input>
            <button className='startButton' onClick={handleFile}>Start</button>
            <input type='file' id='fileInput' />
            <p>NexTrace running on port: 3695....</p>

            <button className='buttonOne'></button>
            <button className='buttonOne'></button>
            <button className='buttonOne'></button>
            <button className='buttonOne'></button>
            <button className='buttonOne'></button>

        </div>
    )
}