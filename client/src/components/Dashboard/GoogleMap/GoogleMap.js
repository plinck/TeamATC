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

    const [totalDist, setTotalDist] = useState(0)

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
                                    <Grid  fontWeight="fontWeightBold" className={classes.mobile} item xs={false} md={3}>
                                        <Typography className={classes.header}>Distance (mi)</Typography>
                                    </Grid>
                                    <Grid  fontWeight="fontWeightBold" className={classes.mobile} item xs={false} md={3}>
                                        <Typography className={classes.header}>Completion (%)</Typography>
                                    </Grid>
                                </Grid>
                                <hr></hr>
                                {props.teamTotals.sort((x, y) => y.bikeDistanceTotal - x.bikeDistanceTotal).map((result, index) => (
                                    <div>
                                    <Grid
                                        container
                                        justify="space-between"
                                        alignItems="center"
                                        >
                                        <Grid style={{ textAlign: "left" }} className={classes.noWrap} item xs md={5}>
                                            <Typography className={classes.text}>{result.userOrTeamName}</Typography>
                                            <Typography className={classes.caption} variant="caption">Next: CDA</Typography>
                                        </Grid>
                                        <Grid className={classes.mobile} item xs={false} md={3}>
                                            <Typography className={classes.text}>{result.bikeDistanceTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Typography>
                                            <Typography className={classes.caption} variant="caption">distnxt</Typography>
                                        </Grid>
                                        <Grid className={classes.mobile} item xs={false} md={3}>
                                            <Typography className={classes.text}>{calcCompletion(result.bikeDistanceTotal)}%</Typography>
                                            <Typography className={classes.caption} variant="caption">cmpnxt%</Typography>
                                        </Grid>
                                    </Grid>
                                    </div>
                                ))}
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

}

export default withStyles(styles)(GoogleMap)