import React, { useState } from 'react';
import Map from './Map'
import { Card, CardContent, Grid, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import moment from "moment";

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
    header: {
        marginBottom: "-10px",
        fontWeight: "bold"
    },
    mobile: {
        [theme.breakpoints.down('sm')]: {
            display: "none"
        }
    }
})

const GoogleMap = (props) => {
    const { classes } = props
    
    const handlePress = (e) => {
        e.stopPropagation();
        props.callbackParent({ isDraggable: false });
    }

    const [totalDist, setTotalDist] = useState(0);
    // teamLegTotals is a copy to teamTotals with the next leg info added to it
    const [teamLegTotals, setTeamLegTotals] = useState(props.teamTotals);

    const computeTotalDistance = (result) => {
        let totalDist = 0;
        var myroute = result.routes[0];
        for (let i = 0; i < myroute.legs.length; i++) {
            totalDist += myroute.legs[i].distance.value;
        }
        totalDist = totalDist / 1000 / 1.609344  //km to miles
        setTotalDist(totalDist)
    }

    const calcCompletion = (distance) => {
        if (distance >= totalDist) {
            return 100
        } else {
            return parseInt(distance / totalDist * 100)
        }
    }

    // Using the teamTotals array, attach the leg info to each teams record
    // legs come from the map component and atre computed after the route is drawn
    // This function goes through each team and sees whwere they are on the route, then
    // attaches next legh info to their teamTotals record
    // TODO :- Right now the function state values are not displayed on the dashboard
    // unless you go into the debugger.  It must be a timing issuie with state vars but
    // I have yet to figure it out
    const calcNextLegInfo = (legs) => {
        //Loop through each team
        for (let k = 0; k < teamLegTotals.length; k++) {
            let totalDistance = 0;
            let nextLegName = "";
            let distanceToNextLeg = 0;
            let nextLegCompletionPercent = 0;
            let nextLegIdx = 0;

            let i = 0;
            // Loop until you find the next leg based on your distance
            // This loop will end where you are "in between" two legs
            // Then you just need to extract the leg info an attach to team record
            for (i = 0; i < legs.length && totalDistance < teamLegTotals[k].bikeDistanceTotal ; i++) {
                let legDistance = legs[i].distance.value / 1000 / 1.609344;  // to miles
                totalDistance += legDistance;
                nextLegIdx = i;
            }
            // now the next leg should be at i

            nextLegName = legs[nextLegIdx].end_address;
            distanceToNextLeg = totalDistance - teamLegTotals[k].bikeDistanceTotal;
            if (distanceToNextLeg <= 0) {
                nextLegCompletionPercent = 100;
            } else {
                nextLegCompletionPercent = parseInt((1 - (distanceToNextLeg / teamLegTotals[k].bikeDistanceTotal))  * 100);
            }

            teamLegTotals[k].nextLegName = nextLegName;
            teamLegTotals[k].distanceToNextLeg = distanceToNextLeg.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            teamLegTotals[k].nextLegCompletionPercent = nextLegCompletionPercent;
        }
        setTeamLegTotals(teamLegTotals);

    }

    return (
        <Card style={{ height: '100%' }}>
            <CardContent style={{ height: '100%' }} >
                <Box style={{ marginBottom: "10px" }} fontStyle="oblique" fontWeight="fontWeightBold">
                    <span style={{ color: 'grey' }}>{props.title ? props.title : 'Challenge Map'}</span>
                </Box>
                <Grid container style={{ height: '91%' }} spacing={2}>
                    <Grid style={{ height: "100%", padding: "5px 0px" }} item xs={12} sm={9} md={8} onMouseDown={(e) => handlePress(e)}>
                        <Map
                            id="myMap"
                            options={{
                                center: { lat: 37.0902, lng: -95.7129 },
                                zoom: 8,
                                streetViewControl: false,
                                fullscreenControl: false,
                                mapTypeControl: false,
                            }}
                            teamTotals={props.teamTotals}
                            start={props.start}
                            end={props.end}
                            waypoints={props.waypoints}
                            computeTotalDistance={computeTotalDistance}
                            calcNextLegInfo={calcNextLegInfo}
                            totalDist={totalDist}
                        />
                    </Grid>
                    <Grid container item xs={false} sm={3} md={4}>
                        <Grid item xs={12}>
                            <Typography variant="h5" style={{ textAlign: "center" }}>Challenge Details</Typography>
                            <ul style={{ margin: "5px 10px" }}>
                                <li>Start Point: {props.start} </li>
                                <li>End Point: {props.end} </li>
                                <li>Total Distance: {totalDist.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} mi</li>
                                <li>Challenge Ends: {props.endDate ? moment(props.endDate).format("MM-DD-YYYY") : "N/A"}</li>
                            </ul>
                        </Grid>
                        <Grid item xs={12} style={{ textAlign: "center" }}>
                            <Typography variant="h5">Team Leaders</Typography>
                                <Grid
                                    container
                                    justify="space-between"
                                    alignItems="center"
                                    >
                                    <Grid style={{ textAlign: "left" }} className={classes.mobile} item xs md={5}>
                                        <Typography className={classes.header}>Team</Typography>
                                    </Grid>
                                    <Grid className={classes.mobile} item xs={false} md={3}>
                                        <Typography className={classes.header}>Distance (mi)</Typography>
                                    </Grid>
                                    <Grid className={classes.mobile} item xs={false} md={3}>
                                        <Typography className={classes.header}>Completion (%)</Typography>
                                    </Grid>
                                </Grid>
                                <hr></hr>
                                {teamLegTotals.sort((x, y) => y.bikeDistanceTotal - x.bikeDistanceTotal).map((result, index) => (
                                    <Grid container key={index}
                                        justify="space-between"
                                        alignItems="center"
                                        >{console.log(`LegInfo: ${result.nextLegName}, ${result.distanceToNextLeg}, ${result.nextLegCompletionPercent}`)}
                                
                                        <Grid style={{ textAlign: "left" }} className={classes.noWrap} item xs md={5}>
                                            <Typography className={classes.text}>{result.userOrTeamName}</Typography>
                                            <Typography className={classes.caption} variant="caption">Next:{result.nextLegName}</Typography>
                                        </Grid>
                                        <Grid className={classes.mobile} item xs={false} md={3}>
                                            <Typography className={classes.text}>{result.bikeDistanceTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Typography>
                                            <Typography className={classes.caption} variant="caption">{result.distanceToNextLeg}</Typography>
                                        </Grid>
                                        <Grid className={classes.mobile} item xs={false} md={3}>
                                            <Typography className={classes.text}>{calcCompletion(result.bikeDistanceTotal)}%</Typography>
                                            <Typography className={classes.caption} variant="caption">{result.nextLegCompletionPercent}%</Typography>
                                        </Grid>
                                    </Grid>
                                ))}
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

}

export default withStyles(styles)(GoogleMap)