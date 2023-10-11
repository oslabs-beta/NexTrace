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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.common.black,
      fontSize: 20,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 20,
    },
  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));
  

function createData(name) {
  return { name };
}

export default function ConsoleComponent() {
    const [logs, setLogs] = useState([]);
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
        setLogs(receivedData.map(item => createData(item)));
      };
  
      socket.onclose = (event) => {console.log('WebSocket connection closed:', event.code, event.reason)};
      socket.onerror = (error) => {
        console.error('WebSocket error from Metrics component:', error.message);
      };
    }, []);

    return (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Console Logs</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((row) => (
                <StyledTableRow key={row.name}>
                  <StyledTableCell component="th" scope="row">
                    {row.name}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
}
