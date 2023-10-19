import { useEffect, useState } from 'react';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import WaterfallChart from './WaterfallChart'
import PieChartComponent from './PieChart';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontSize: 22,
    fontFamily: 'Merriweather',

  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 16,
    fontFamily: 'Merriweather',
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

function createNewData(name, status, method, type, duration, rendering, start) {
  return { name, status, method, type, duration, rendering, start };
}

export default function CustomizedTables() {
  const [awaitedData, setAwaitedData] = useState([]);
  const socket = new WebSocket('ws://localhost:3695');

  useEffect(() => {
    socket.onopen = () => {
      console.log('Metrics connection opened with ws://localhost:3695.');
      socket.send(JSON.stringify({ socketId: 'Metric' }))
    };

    socket.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      const transformedData = receivedData.map(arr =>
        createNewData(arr.name.split(' ').pop(), arr.status, arr.method, arr.type, arr.duration, arr.rendering, arr.start)
      );
      setAwaitedData(transformedData);
    };

    socket.onclose = (event) => { console.log('WebSocket connection closed:', event.code, event.reason) };
    socket.onerror = (error) => {
      console.error('WebSocket error from Metrics component:', error.message);
    };
  }, []);

  return (<>
    <PieChartComponent />
    <WaterfallChart data={awaitedData} />
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 450 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell sx={{ width: 275 }}>Endpoint</StyledTableCell>
            <StyledTableCell align="right">Status</StyledTableCell>
            <StyledTableCell align="right">Method</StyledTableCell>
            <StyledTableCell align="right">Type</StyledTableCell>
            <StyledTableCell align="right">Duration (ms)</StyledTableCell>
            <StyledTableCell align="right">Rendering</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {awaitedData.map((row) => (
            <StyledTableRow sx={{ width: 275 }} key={row.name}>
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
