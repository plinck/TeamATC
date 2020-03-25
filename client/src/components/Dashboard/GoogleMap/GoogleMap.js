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

    return (
        <Card style={{ height: '100%' }}>
            <CardContent style={{ height: '100%' }} >
                <Box style={{ marginBottom: "10px" }} fontStyle="oblique" fontWeight="fontWeightBold">
                    <span style={{ color: 'grey' }}>{props.title ? props.title : 'Challenge Map'}</span>
                </Box>
                <Grid container style={{ height: '100%' }} spacing={2}>
                    <Grid style={{ height: "100%", padding: "5px 0px" }} item xs={12} sm={9} onMouseDown={(e) => handlePress(e)}>
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
                    <Grid item xs={false} sm={3} style={{ textAlign: "center" }}>
                        <Typography variant="h5">Leaders</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontWeight: "bold" }}>Team</TableCell>
                                    <TableCell style={{ fontWeight: "bold" }}>Total Miles</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {props.teamTotals.sort((x, y) => y.bikeDistanceTotal - x.bikeDistanceTotal).map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell component="th" scope="row">
                                            {result.userOrTeamName}
                                        </TableCell>
                                        <TableCell>{result.bikeDistanceTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

}

export default GoogleMap