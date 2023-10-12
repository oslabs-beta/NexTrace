import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.common.black,
      fontSize: 18,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 16,
    },
  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      // border : 0 before
      border: 1,
    },
  }));
  

function createData(name, path) {
  return { name, path };
}

export default function ConsoleComponent() {
    const [logs, setLogs] = useState([]);
    const socket = new WebSocket('ws://localhost:3695');
    const vscode = window.vscodeApi;


    function jumpToFile(path) {
      vscode.postMessage({ command:'NexTrace.fileNav', path: path });
    }
    
    useEffect(() => {
      socket.onopen = () => {
        console.log('Console connection opened with ws://localhost:3695.');
        socket.send(JSON.stringify({socketId: 'Console'}))
      };
  
      socket.onmessage = (event) => {
        console.log('IM BACK IN CONSOLE COMPONENT!!!')
        const receivedData = JSON.parse(event.data);
        console.log('received data of console',receivedData);
        setLogs(receivedData.map(item => createData(item.consoleLog, item.path)));

        console.log('LOGS', logs);
      };
  
      socket.onclose = (event) => {console.log('WebSocket connection closed:', event.code, event.reason)};
      socket.onerror = (error) => {
        console.error('WebSocket error from Metrics component:', error.message);
      };
    }, []);

    return (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 500 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Console Logs</StyledTableCell>
                {/* <StyledTableCell>File</StyledTableCell> */}
                <StyledTableCell sx={{ width: 160 }}>Link</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((row, i) => (
                <StyledTableRow key={row.name}>
                  <StyledTableCell component="th" scope="row">
                    {row.name}
                  </StyledTableCell>
                  {/* <StyledTableCell id={i}>
                    {row.path.split('/').pop()}
                  </StyledTableCell> */}
                  <StyledTableCell>
                    {/* <button id={i} onClick={e => jumpToFile(row.path)}>Go to File</button> */}
                    <Button variant="contained" id={i} onClick={e => jumpToFile(row.path)}>Go to {row.path.split('/').pop()}</Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
}
