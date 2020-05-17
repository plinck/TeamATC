import React, { useState } from "react";
import Script from "react-load-script";
import { FB_CONFIG } from "../Environment/Environment";
import { withStyles } from "@material-ui/core/styles";

import {
  Typography,
  FormControl,
  Input,
  InputLabel,
  TextField,
} from "@material-ui/core";

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

  const handleScriptLoad = async () => {
    const map = await new window.google.maps.Map(
      document.getElementById("swimMap"),
      options
    );

    var input = document.getElementById("swim-search-input");
    var searchBox = await new window.google.maps.places.SearchBox(input);
    setMap(map);
    // Create the search box and link it to the UI element.
    // map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", function () {
      var places = searchBox.getPlaces();
  
      if (places.length == 0) {
        return;
      }
  
      // For each place, get the icon, name and location.
      var bounds = new window.google.maps.LatLngBounds();
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
 

  return (
    <>
      <Script
        url={`https://maps.googleapis.com/maps/api/js?key=${FB_CONFIG.API_KEY}&libraries=places`}
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
          id: 'swim-search-input'
        }}
      />
      <div id="swimMap" style={{ height: "400px", width: "100%" }} />
    </>
  );
};

export default withStyles(styles)(SwimRoutePlanner);
