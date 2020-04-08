import React from 'react';

import { TableCell, TableRow } from '@material-ui/core';

const TeamMember = (props) => {
    // wait for props
    if (!props.teamMember) {
        return (null);
    }

    console.log(props)

    // Band odd rows for clarity
    let rowBg = "";
    if (props.index % 2 === 0) {
        rowBg = "info.main";
    }

    return (
        <TableRow key={props.index} style={{ backgroundColor: `${rowBg}` }}>
            <TableCell component="th" scope="row" style={{ paddingLeft: "50px" }}>
                {props.isThisMine ?
                    <img style={{ maxHeight: '20px' }} src={"/images/me.png"} alt={"me"} />
                    : props.isThisMine
                }
                {props.teamMember.firstName} {props.teamMember.lastName}
            </TableCell>
            <TableCell align="right">
                <a href={"mailto:" + props.teamMember.email}>{props.teamMember.email}</a>
            </TableCell>
            <TableCell align="right">
                {props.teamMember.hasActivities ? "Yes" : "No"}
            </TableCell>
        </TableRow>
    )
}

export default TeamMember;