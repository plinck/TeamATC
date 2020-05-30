import React from 'react';
import { Table, TableHead, TableBody, TableCell, TableRow, Card, CardContent } from '@material-ui/core';
import moment from "moment";
import Box from '@material-ui/core/Box';
import { Link } from "react-router-dom";
import Tooltip from '@material-ui/core/Tooltip';
import LaunchIcon from '@material-ui/icons/Launch';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    tableCell: {
        textOverflow: "ellipsis",
        maxWidth: "100%",
        minWidth: "55px"
    }
}))

const ActivitiesCard = (props) => {

    const classes = useStyles();

    const activityTitleRow =
        <Box className="row" fontStyle="oblique" fontWeight="fontWeightBold">
            <Link style={{ textDecoration: "none", color: "grey" }}
                to={{
                    pathname: "/activities",
                    state: {
                        filterByString: "Mine"
                    }
                }}>My Activities
            </Link>
            <div style={{ float: 'right' }}>
                <Tooltip title="Show All">
                    <Link style={{ textDecoration: "none", color: "black" }}
                        to={{
                            pathname: "/activities",
                            state: { filterByString: "Mine" }
                        }}>
                        <LaunchIcon />
                    </Link>
                </Tooltip>
            </div>
        </Box>
    return (
        <Card style={{ height: "100%" }}>
            <CardContent>
                {activityTitleRow}
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableCell} style={{ fontWeight: "bold" }}>Name</TableCell>
                            <TableCell className={classes.tableCell} style={{ fontWeight: "bold" }} padding="none" size="small" align="right">Date</TableCell>
                            <TableCell className={classes.tableCell} style={{ fontWeight: "bold" }} padding="none" size="small" align="right">Time</TableCell>
                            <TableCell className={classes.tableCell} style={{ fontWeight: "bold" }} padding="none" size="small" align="right">Distance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.activities.slice(0, 10).map((activity, index) => {
                            const {
                                activityDateTime,
                                activityName, // swim, bike, run
                                activityType, // swim, bike, run
                                duration,
                                distance,
                                distanceUnits
                            } = activity;
                            let jsDate = new Date(activityDateTime);
                            const displayDateTime = moment(jsDate).format("MM-DD-YYYY");

                            let distanceDecimalPlaces = 1;
                            if (activityType.toLowerCase() === "swim") {
                                distanceDecimalPlaces = 0;
                            }
                            let displayDistance = distance.toFixed(distanceDecimalPlaces).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            let displayDuration = duration.toFixed(distanceDecimalPlaces).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                            let displayActivityName = activityName !== "" ? activityName : activityType;

                            let activityIcon = "";

                            if (activityType.toLowerCase() === "swim") {
                                activityIcon = "/images/icons8-swimming-50.png";
                            } else if ((activityType.toLowerCase() === "bike")) {
                                activityIcon = "/images/icons8-triathlon-50.png";
                            } else if ((activityType.toLowerCase() === "run")) {
                                activityIcon = "/images/icons8-running-50.png";
                            } else {
                                activityIcon = "/images/icons8-triathlon-50.png";      // unknown
                            }
                            return (
                                <TableRow key={index}>
                                    <TableCell padding="none" className={classes.tableCell} component="th" scope="row">
                                        <Tooltip className={classes.tableCell} title={displayActivityName}>
                                            <div>
                                                <img style={{ maxHeight: '18px' }} src={activityIcon} alt={activityType} />
                                                {displayActivityName}
                                            </div>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell className={classes.tableCell} padding="none" size="small" align="right">{displayDateTime}</TableCell>
                                    <TableCell className={classes.tableCell} padding="none" size="small" align="right">{displayDuration} H</TableCell>
                                    <TableCell className={classes.tableCell} padding="none" size="small" align="right">{displayDistance} {distanceUnits}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default ActivitiesCard;