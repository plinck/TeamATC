import React from 'react';
import Box from '@material-ui/core/Box';

import './Result.css'
import { TableCell, TableRow } from '@material-ui/core';

const Result = (props) => {
    // wait for props
    if (!props.result) {
        return (null);
    }

    //console.log(`${JSON.stringify(props.result)}`);

    // Band odd rows for clarity
    let rowBg = "";
    let rowFg = ""
    if (props.index % 2 === 0) {
        rowBg = "info.main";
        rowFg = "white";
    }
    if (props.result.teamRecord && !props.onlyTeams) {
        rowBg = "yellow";
        rowFg = "black";
    }

    return (
        <TableRow key={props.index} style={{ backgroundColor: `${rowBg}` }}>
            {props.result.teamRecord ?
                <TableCell component="th" scope="row" style={{ fontWeight: "bold" }}>
                    {props.result.userOrTeamName}
                </TableCell>
                :
                <TableCell component="th" scope="row" style={{ paddingLeft: "50px" }}>
                    {props.result.isThisMine ?
                        <img style={{ maxHeight: '20px' }} src={"/images/me.png"} alt={"me"} />
                        : props.result.isThisMine
                    }
                    {props.result.userOrTeamName}
                </TableCell>
            }
            <TableCell>
                {props.result.pointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </TableCell>
            <TableCell align="right">
                {props.result.swimPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </TableCell>
            <TableCell align="right">
                {props.result.bikePointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </TableCell>
            <TableCell align="right">
                {props.result.runPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </TableCell>
        </TableRow>
    )
}

export default Result;