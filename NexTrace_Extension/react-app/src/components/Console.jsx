import React from "react";
import { useEffect, useState } from 'react';


export default function ConsoleComponent() {
  const [consoleData, setConsoleData] = useState([]);
  const socket = new WebSocket('ws://localhost:3695');
  
  useEffect(() => {
    socket.onopen = () => {
      console.log('Console connection opened with ws://localhost:3695.');
      socket.send(JSON.stringify({socketId: 'Console'}))
    };

    socket.onmessage = (event) => {
      console.log('IM BACK IN CONSOLE COMPONENT!!!')
      const receivedData = JSON.parse(event.data);
      console.log('received data of console',receivedData);
    };

    socket.onclose = (event) => {console.log('WebSocket connection closed:', event.code, event.reason)};
    socket.onerror = (error) => {
      console.error('WebSocket error from Metrics component:', error.message);
    };
  }, []);


    return (
    <div>IM RETURNING ANOTHER REACT COMPONENT{consoleData}</div>
    
    )
}