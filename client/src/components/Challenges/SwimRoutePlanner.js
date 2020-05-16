import React, { useState } from 'react'
import Script from 'react-load-script'
import { FB_CONFIG } from "../Environment/Environment";
import { Typography } from '@material-ui/core';

const SwimRoutePlanner = () => {

    const options = {
        center: { lat: 37.0902, lng: -95.7129 },
        zoom: 4,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
    }

    const [map, setMap] = useState()

    const handleScriptLoad = async () => {
        const map = await new window.google.maps.Map(document.getElementById('swimMap'), options)
        setMap(map)
    }

    return (
        <>
            <Script
                url={`https://maps.googleapis.com/maps/api/js?key=${FB_CONFIG.API_KEY}&libraries=places`}
                onLoad={handleScriptLoad}
            />
            <br></br>
            <Typography variant="h5">Draw Swim Route</Typography>
            <div id='swimMap' style={{ height: '200px', width: '100%' }} />
        </>
    )
}

export default SwimRoutePlanner