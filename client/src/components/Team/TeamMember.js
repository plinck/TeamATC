import React from 'react';

import { TableCell, TableRow } from '@material-ui/core';

const TeamMember = (props) => {
    // wait for props
    if (!props.user) {
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
                {props.user.isThisMine ?
                    <img style={{ maxHeight: '20px' }} src={"/images/me.png"} alt={"me"} />
                    : props.user.isThisMine
                }
                {props.user.firstName} {props.user.lastName}
            </TableCell>
            <TableCell align="right">
                {props.user.hasActivities}
            </TableCell>
        </TableRow>
    )
}

export default TeamMember;