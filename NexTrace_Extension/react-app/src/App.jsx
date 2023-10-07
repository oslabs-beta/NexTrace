import React, { useEffect, useState } from 'react';
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
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

// function createData(name, calories, fat, carbs, protein) {
//   return { name, calories, fat, carbs, protein };
// }
// const rows = [
//     createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
//     createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
//     createData('Eclair', 262, 16.0, 24, 6.0),
//     createData('Cupcake', 305, 3.7, 67, 4.3),
//     createData('Gingerbread', 356, 16.0, 49, 3.9),
//   ];


function createNewData(name, status, method, type, duration, rendering) {
    return { name, status, method, type, duration, rendering };
  }
  
  export default function CustomizedTables() {
    const [awaitedData, setAwaitedData] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 20000));
  
          const response = await fetch('http://localhost:3695/getData');
  
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
  
          const data = await response.json();
  
          const transformedData = data.map((arr) =>
            createNewData(arr.name, arr.status, arr.method, arr.type, arr.duration, arr.rendering)
          );
  
          setAwaitedData(transformedData);
  
          console.log('Request Data:', data);
          console.log('Transformed Data:', transformedData);
        } catch (error) {
          console.error('Error:', error);
        }
      };
  
      fetchData();
    }, []); 
  
    return (
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
    );
  }