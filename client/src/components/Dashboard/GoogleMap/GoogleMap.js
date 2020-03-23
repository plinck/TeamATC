import React from 'react';
import Map from './Map'
import { Card, CardContent, Grid } from '@material-ui/core';
const GoogleMap = (props) => {
    const handlePress = (e) => {
        e.stopPropagation();
        props.callbackParent({ isDraggable: false });
    }

    return (
        <Card style={{ height: '100%' }}>
            <CardContent style={{ height: '100%' }} >
                <Grid container style={{ height: '100%' }}>
                    <Grid stlye={{ height: "100%" }} item xs={9} onMouseDown={(e) => handlePress(e)}>
                        <Map
                            id="myMap"
                            options={{
                                center: { lat: 37.0902, lng: -95.7129 },
                                zoom: 8
                            }}
                            start={props.start}
                            end={props.end}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

}

export default GoogleMap