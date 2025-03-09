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
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

function getRankingData() {
  // Get data from API when is available

  // Example data
    data = [
        { username: "Pedro", points: 1200 },
        { username: "Juan", points: 1300 },
        { username: "María", points: 1800 },
        { username: "Diana", points: 900 },
        { username: "Ernesto", points: 1300 },
        { username: "Sandra", points: 1700 },
        { username: "Carla", points: 1000 },
    ]

    sortedData = data.sort((a, b) => b.points - a.points)
    return sortedData
}

export default function RankingTable() {
    return (
        <TableContainer component={Paper}>
        <Table sx={{ maxWidth: "100%"}} aria-label="ranking table">
            <TableHead>
            <TableRow>
                <StyledTableCell>Username</StyledTableCell>
                <StyledTableCell align="right">Points</StyledTableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {getRankingData().map((row) => (
                <StyledTableRow key={row.username}>
                <StyledTableCell component="th" scope="row">
                    {row.username}
                </StyledTableCell>
                <StyledTableCell align="right">{row.points}</StyledTableCell>
                </StyledTableRow>
            ))}
            </TableBody>
        </Table>
        </TableContainer>
    );
}
