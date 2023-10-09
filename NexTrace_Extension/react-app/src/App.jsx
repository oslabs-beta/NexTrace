import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import WaterfallChart from './components/WaterfallChart'

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

    useEffect(() => {
      const fetchData = () => {
        setTimeout(() => {
          fetch('http://localhost:3695/getData')
            .then(response => {
              if (!response.ok) {
                throw new Error('Network error');
              }
              return response.json();
            })
            .then(data => {
              const transformedData = data.map(arr =>
                createNewData(arr.name, arr.status, arr.method, arr.type, arr.duration, arr.rendering)
              );
              setAwaitedData(transformedData);
              console.log('Request Data:', data);
              console.log('Transformed Data:', transformedData);
            })
            .catch(error => {
              console.error('Error:', error);
            });
        }, 10000); 
      };
    
      fetchData();
    }, []);
    
  
    return (<>
      <h1>Waterfall Chart</h1>
      <WaterfallChart/>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <TableCell>Endpoint</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Method</TableCell>
              <TableCell align="right">Type</TableCell>
              <TableCell align="right">Duration(ms)</TableCell>
              <TableCell align="right">Rendering</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {awaitedData.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.status}</TableCell>
                <TableCell align="right">{row.method}</TableCell>
                <TableCell align="right">{row.type}</TableCell>
                <TableCell align="right">{row.duration}</TableCell>
                <TableCell align="right">{row.rendering}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>);
  }