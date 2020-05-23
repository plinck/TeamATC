import React from 'react';
import { withRouter } from 'react-router-dom';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { TableCell, TableRow } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    text: {
        marginBottom: "-10px"
    },
    noWrap: {
        whiteSpace: "nowrap",
        overflow: 'hidden',
        [theme.breakpoints.down('sm')]: {
            marginRight: "5px"
        }
    },
    caption: {
        fontStyle: "italic"
    },
    mobile: {
        [theme.breakpoints.down('sm')]: {
            display: "none"
        }
    }
})

class Result extends React.Component {
    render() {
        // Deconstruct Props
        const {
            challengeUid,
            overallRecord,
            teamRecord,
            teamUid,
            teamName,
            userRecord,
            uid,
            displayName,
            distanceTotal,
            pointsTotal,
            durationTotal,
            nbrActivities,
            swimDistanceTotal,
            swimPointsTotal,
            swimNbrActivities,
            swimDurationTotal,
            bikeDistanceTotal,
            bikePointsTotal,
            bikeNbrActivities,
            bikeDurationTotal,
            runDistanceTotal,
            runPointsTotal,
            runNbrActivities,
            runDurationTotal,
            otherDistanceTotal,
            otherPointsTotal,
            otherNbrActivities,
            otherDurationTotal,
            updateDateTime,
        } = this.props.result;

        // make sure you have a user before displaying
        if (this.props.user.uid === null) {
            return (null);
        }

        // Band odd rows for clarity
        let rowBg = "";
        if (this.props.index % 2 === 0) {
            rowBg = "info.main";
        }
        if (this.props.result.teamRecord && !this.props.onlyTeams) {
            rowBg = "yellow";
        }

        return (
            <TableRow key={this.props.index} style={{ backgroundColor: `${rowBg}` }}>
                {teamRecord ?
                    <TableCell component="th" scope="row" style={{ fontWeight: "bold" }}>
                        {userRecord ? displayName : teamName}
                    </TableCell>
                    :
                    <TableCell component="th" scope="row" style={{ paddingLeft: "50px" }}>
                        {uid && uid === this.props.user.uid ?
                            <img style={{ maxHeight: '20px' }} src={"/images/me.png"} alt={"me"} />
                            : false
                        }
                        {userRecord ? displayName: teamName}
                    </TableCell>
                }
                <TableCell>
                    {pointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </TableCell>
                <TableCell align="right">
                    {swimPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </TableCell>
                <TableCell align="right">
                    {bikePointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </TableCell>
                <TableCell align="right">
                    {runPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </TableCell>
                <TableCell align="right">
                    {otherPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </TableCell>
            </TableRow>
        ); // return
    } // render()
} // class

export default withAuthUserContext(withRouter(withStyles(styles)(Result)));