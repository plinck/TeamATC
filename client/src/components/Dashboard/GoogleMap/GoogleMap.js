import React, { useState } from 'react';
import Map from './Map'
import { Card, CardContent, Grid, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';


const GoogleMap = (props) => {
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
                <Grid container style={{ height: '100%' }} spacing={2}>
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
                                <li>Challenge Ends: {props.endDate ? props.endDate : "N/A"}</li>
                            </ul>
                        </Grid>
                        <Grid item xs={12} style={{ textAlign: "center" }}>
                            <Typography variant="h5">Team Leaders</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ fontWeight: "bold" }}>Team</TableCell>
                                        <TableCell style={{ fontWeight: "bold" }}>Total Distance (mi)</TableCell>
                                        <TableCell style={{ fontWeight: "bold" }}>Completion (%)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.teamTotals.sort((x, y) => y.bikeDistanceTotal - x.bikeDistanceTotal).map((result, index) => (
                                        <TableRow key={index}>
                                            <TableCell component="th" scope="row">
                                                {result.userOrTeamName}
                                            </TableCell>
                                            <TableCell>{result.bikeDistanceTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                                            <TableCell>{calcCompletion(result.bikeDistanceTotal)}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

}

export default GoogleMap