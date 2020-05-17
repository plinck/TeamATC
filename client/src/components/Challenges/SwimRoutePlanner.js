import React, { useState, useEffect } from "react";
import Script from "react-load-script";
import { FB_CONFIG } from "../Environment/Environment";
import { withStyles } from "@material-ui/core/styles";

import { Typography, TextField, Button } from "@material-ui/core";

const styles = () => ({
  searchBar: {
    zIndex: 10000,
    margin: "-20px 0px 0px 0px",
    position: "relative",
    top: 39,
    width: "100%",
    background: "rgba(255,255,255, 0.9)",
  },
});

const SwimRoutePlanner = (props) => {
  const { classes } = props;

  const options = {
    center: { lat: 37.0902, lng: -95.7129 },
    zoom: 4,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
  };

  const [map, setMap] = useState();
  const [polyline, setPolyline] = useState();
  const [drawingManager, setDrawingManager] = useState();

  useEffect(() => {
    if (drawingManager && map) {
      window.google.maps.event.addListener(
        drawingManager,
        "polylinecomplete",
        (polygon) => onDrawComplete(polygon)
      );
      window.google.maps.event.addListener(drawingManager, "set_at", () =>
        console.log("triggered")
      );
      console.log(map);
    }
  }, [map, polyline, drawingManager]);

  const onDrawComplete = (polygon) => {
    for (var i = 0; i < polygon.getPath().getLength(); i++) {
      let point = polygon.getPath().getAt(i).toUrlValue(6);
      console.log(point);
    }
    drawingManager.setDrawingMode(null);
    drawingManager.setOptions({
      drawingControl: false
    });
    setPolyline(polygon);
  };

  const handleScriptLoad = async () => {
    // Initialize map
    const map = await new window.google.maps.Map(
      document.getElementById("swimMap"),
      options
    );
    setMap(map);

    // Initialize search input
    const input = document.getElementById("swim-search-input");
    const searchBox = await new window.google.maps.places.SearchBox(input);

    // Initalize drawing manager
    const drawingManager = await new window.google.maps.drawing.DrawingManager({
      drawingMode: window.google.maps.drawing.OverlayType.null,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.BOTTOM_CENTER,
        drawingModes: ["polyline"],
      },
    });
    drawingManager.setMap(map);
    setDrawingManager(drawingManager);

    searchBox.addListener("places_changed", function () {
      let places = searchBox.getPlaces();
      if (places.length == 0) {
        return;
      }

      // For each place, get the icon, name and location.
      let bounds = new window.google.maps.LatLngBounds();
      places.forEach(function (place) {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
  };

  const clearMap = () => {
    if (polyline){
      polyline.setMap(null);
      setPolyline(null);
      drawingManager.setOptions({
        drawingControl: true
      });
    }
  };

  return (
    <>
      <Script
        url={`https://maps.googleapis.com/maps/api/js?key=${FB_CONFIG.API_KEY}&libraries=places,drawing`}
        onLoad={handleScriptLoad}
      />
      <br></br>
      <Typography variant="h5">Draw Swim Route</Typography>
      <TextField
        className={classes.searchBar}
        id="swim-search-field"
        name="fieldValue"
        variant="filled"
        placeholder="Search"
        inputProps={{
          style: { padding: "10px" },
          id: "swim-search-input",
        }}
      />
      <div id="swimMap" style={{ height: "500px", width: "100%" }} />
      <Button variant="contained" color="primary" onClick={clearMap}>
        Clear Map
      </Button>
    </>
  );
};

export default withStyles(styles)(SwimRoutePlanner);
