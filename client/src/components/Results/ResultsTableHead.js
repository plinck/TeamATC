import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';

const headCells = [
    { id: 'place', numeric: false, disablePadding: false, label: 'Ranking' },
    { id: 'displayName', numeric: false, disablePadding: false, label: 'Name' },
    { id: 'teamName', numeric: false, disablePadding: false, label: 'Team' },
    { id: 'durationTotal', numeric: true, disablePadding: false, label: 'Time' },
    { id: 'progress', numeric: true, disablePadding: false, label: 'Progress' },
    { id: 'pointsTotal', numeric: true, disablePadding: false, label: 'Total' },
    { id: 'swimDistanceTotal', numeric: true, disablePadding: false, label: 'Swim' },
    { id: 'bikeDistanceTotal', numeric: true, disablePadding: false, label: 'Bike' },
    { id: 'runDistanceTotal', numeric: true, disablePadding: false, label: 'Run' },
    { id: 'otherDistanceTotal', numeric: true, disablePadding: false, label: 'Other' },
  ];


export default function ResultsTableHead(props) {
    const { classes, order, orderBy, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };
  
    return (
      <TableHead>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === headCell.id ? order : false}
              style={{fontWeight: 600}}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
  
  ResultsTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };