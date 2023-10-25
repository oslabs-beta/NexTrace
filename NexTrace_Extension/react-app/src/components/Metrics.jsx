import * as React from 'react';
import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import WaterfallChart from './WaterfallChart';
import PieChartSum from './PieChartSum';
import PieChartStatus from './PieChartStatus';
import PieChartDuration from './PieChartDuration';

//Styling of Table with material UI
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

//Function to parse out incoming data
function createNewData(name, status, method, type, duration, rendering, start) {
  return { name, status, method, type, duration, rendering, start };
}

export default function CustomizedTables() {
  const [awaitedData, setAwaitedData] = useState([]);
  //Initialize websocket connection for metrics Panel
  const socket = new WebSocket('ws://localhost:3695');

  useEffect(() => {
    socket.onopen = () => {
      //On connection open, send to websocket server socketId
      console.log('Metrics connection opened with ws://localhost:3695.');
      socket.send(JSON.stringify({ socketId: 'Metric' }))
    };
    //Listens for messages and sets logs state to received data
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
    {/* <div className='pieChartContainer'>
    <PieChartDuration reqData={awaitedData} />
    <PieChartSum reqData={awaitedData} />
    <PieChartStatus  reqData={awaitedData} />
    </div>
    <WaterfallChart data={awaitedData} />
    <TableContainer component={Paper} data-testid='metrics'>
      <Table sx={{ minWidth: 450 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell sx={{ width: 275 }} data-testid={'endpoint-header'}>Endpoint</StyledTableCell>
            <StyledTableCell align="right" data-testid={'status-header'}>Status</StyledTableCell>
            <StyledTableCell align="right" data-testid={'method-header'}>Method</StyledTableCell>
            <StyledTableCell align="right" data-testid={'type-header'}>Type</StyledTableCell>
            <StyledTableCell align="right" data-testid={'duration-header'}>Duration (ms)</StyledTableCell>
            <StyledTableCell align="right" data-testid={'rendering-header'}>Rendering</StyledTableCell>
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
    </TableContainer> */}
  </>);
}
