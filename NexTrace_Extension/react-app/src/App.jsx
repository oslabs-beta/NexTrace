import React, { useState, useEffect } from 'react';

export default function App() {
    const [lightSwitch, setLightSwitch] = useState('On');
    
    return (<Table />)
}

function Table() {
    const [data, setData] = useState([{name: 'nameField', type: 'typeField', method: 'methodField', duration: 'durationField', status: 'statusField'}]);

    function getData() {
        fetch('http://localhost:9999/getData')
          .then(d => d.json())
          .then(d => setData([...data, d]));
    }

    // setInterval(getData, 1000);

    return (
        <div>
            <h2>Requests</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Method</th>
                        <th>Duration</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        data.map((object, i) => {
                          return (  <tr key={i}>
                                <td>{object.name}</td>
                                <td>{object.type}</td>
                                <td>{object.method}</td>
                                <td>{object.duration}</td>
                                <td>{object.status}</td>
                            </tr>
                          )
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}