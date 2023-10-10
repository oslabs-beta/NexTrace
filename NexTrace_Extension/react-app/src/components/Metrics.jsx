import { useEffect, useState } from 'react';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import WaterfallChart from './WaterfallChart'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function createNewData(name, status, method, type, duration, rendering) {
    return { name, status, method, type, duration, rendering };
}

export default function CustomizedTables() {
  const [awaitedData, setAwaitedData] = useState([]);
  const socket = new WebSocket('ws://localhost:3695');
  
  useEffect(() => {
    socket.onopen = () => {
      console.log('WebSocket connection opened with ws://localhost:3695.');
    };

    socket.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      const transformedData = receivedData.map(arr =>
        createNewData(arr.name.split(' ').pop(), arr.status, arr.method, arr.type, arr.duration, arr.rendering)
      );
      setAwaitedData(transformedData);
    };

    socket.onclose = (event) => {console.log('WebSocket connection closed:', event.code, event.reason)};
    socket.onerror = (error) => {
      console.error('WebSocket error from Metrics component:', error.message);
    };
  }, []);

  return (<>
    <WaterfallChart/>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Endpoint</StyledTableCell>
            <StyledTableCell align="right">Status</StyledTableCell>
            <StyledTableCell align="right">Method</StyledTableCell>
            <StyledTableCell align="right">Type</StyledTableCell>
            <StyledTableCell align="right">Duration (ms)</StyledTableCell>
            <StyledTableCell align="right">Rendering</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {awaitedData.map((row) => (
            <StyledTableRow key={row.name}>
              <StyledTableCell component="th" scope="row">
                {row.name}
              </StyledTableCell>
              <StyledTableCell align="right">{row.status}</StyledTableCell>
              <StyledTableCell align="right">{row.method}</StyledTableCell>
              <StyledTableCell align="right">{row.type}</StyledTableCell>
              <StyledTableCell align="right">{row.duration}</StyledTableCell>
              <StyledTableCell align="right">{row.rendering}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </>);
}
