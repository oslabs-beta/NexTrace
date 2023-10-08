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

    const fetchData = () => {
      fetch('http://localhost:3695/getData')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network error');
          }
          return response.json();
        })
        .then(data => {
          const transformedData = data.map(arr =>
            createNewData(arr.name.split(' ').pop(), arr.status, arr.method, arr.type, arr.duration, arr.rendering)
          );
          setAwaitedData(transformedData);
          console.log('Request Data:', data);
          console.log('Transformed Data:', transformedData);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    };
    
    setInterval(fetchData, 2000);
    
    
  
    return (
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
    );
  }