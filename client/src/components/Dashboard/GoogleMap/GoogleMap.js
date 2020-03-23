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
                                center: { lat: 41.0082, lng: 28.9784 },
                                zoom: 8
                            }}
                            onMapLoad={map => {
                                var marker = new window.google.maps.Marker({
                                    position: { lat: 41.0082, lng: 28.9784 },
                                    map: map,
                                    title: 'Hello Istanbul!'
                                });
                            }}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

}

export default GoogleMap