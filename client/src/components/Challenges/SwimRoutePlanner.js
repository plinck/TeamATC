import React, { useState, useEffect } from "react";
import Script from "react-load-script";
import { FB_CONFIG } from "../Environment/Environment";
import { withStyles } from "@material-ui/core/styles";
import createEpoly from "../Dashboard/GoogleMap/eploy";
import { Typography, TextField, Divider } from "@material-ui/core";

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
  const { classes, handleAddSwimRoute } = props;

  const options = {
    center: { lat: 37.0902, lng: -95.7129 },
    zoom: 4,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
  };

  const [map, setMap] = useState();
  const [polyline, setPolyline] = useState();
  const [distance, setDistance] = useState();
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (polyline && map) {
      map.addListener("click", addLatLng);
    }
  }, [map, polyline]);

  const removeMarker = (marker) => {
    for (var i = 0; i < markers.length; i++) {
      if (markers[i] === marker) {
        let tempMark = markers;
        tempMark[i].setMap(null);
        tempMark.splice(i, 1);
        polyline.getPath().removeAt(i);
        onDrawComplete(polyline, tempMark);
      }
    }
  };

  const addLatLng = (event) => {
    // Add a new marker at the new plotted point on the polyline.
    let marker = new window.google.maps.Marker({
      position: event.latLng,
      map: map,
    });
    let marks = markers;
    marks.push(marker);
    polyline.getPath().push(event.latLng);
    window.google.maps.event.addListener(marker, "click", (event) =>
      removeMarker(marker)
    );
    onDrawComplete(polyline, marks);
  };

  const onDrawComplete = (polygon, marks) => {
    const meters = polygon.Distance();
    const miles = meters / 1000 / 1.609344; //m ro km to miles
    console.log(miles);
    setDistance(miles);
    setMarkers(marks);
    handleAddSwimRoute(marks);
  };

  const handleScriptLoad = async () => {
    createEpoly();
    // Initialize map
    const map = await new window.google.maps.Map(
      document.getElementById("swimMap"),
      options
    );
    setMap(map);

    // Initialize search input
    const input = document.getElementById("swim-search-input");
    const searchBox = await new window.google.maps.places.SearchBox(input);

    let poly = await new window.google.maps.Polyline({
      strokeColor: "#000000",
      strokeOpacity: 1.0,
      strokeWeight: 3,
    });
    poly.setMap(map);
    setPolyline(poly);

    searchBox.addListener("places_changed", function () {
      let places = searchBox.getPlaces();
      if (places.length === 0) {
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

  return (
    <>
      <Script
        url={`https://maps.googleapis.com/maps/api/js?key=${FB_CONFIG.API_KEY}&libraries=places`}
        onLoad={handleScriptLoad}
      />
      <br />
      <Divider />
      <br />
      <Typography variant="h5">Draw Swim Route</Typography>
      <Typography variant="body1">
        Use the Search Bar to find a stating point. Add waypoints to the route
        by clicking on the map. Click a waypoint again to remove it. Select Save
        Route when done.
      </Typography>
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
      <Typography variant="h6">
        Route Distance:{" "}
        {distance
          ? distance
              .toFixed(0)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          : 0}{" "}
        miles
      </Typography>
    </>
  );
};

export default withStyles(styles)(SwimRoutePlanner);
