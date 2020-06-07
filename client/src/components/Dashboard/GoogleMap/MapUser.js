import React, { Component } from "react";
import createEpoly from "./eploy.js";
import { FB_CONFIG } from "../../Environment/Environment";
import bikeIcon from "./pin.svg";
import GoogleMapReact from "google-map-react";
import CustomMarker from "./CustomMarker/CustomMarker";

class Map extends Component {
  constructor(props) {
    super(props);
    this.onScriptLoad = this.onScriptLoad.bind(this);
    // this.computeTotalDistance = this.computeTotalDistance.bind(this);
    this.state = {
      markers: [],
      map: null,
      directionsDisplay: null,
      directionsService: null,
    };
  }

  style = {
    width: "100%",
    height: "100%",
  };

  putMarkerOnRoute(polyline, distance, name, photo) {
    if (distance > this.props.totalDist) {
      distance = this.props.totalDist;
    }
    let meters = distance * 1000 * 1.609344;
    let totalMeters = this.props.totalDist * 1000 * 1.609344;
    let label = {
      distance: parseInt(distance),
      complete: parseInt((distance / this.props.totalDist) * 100),
    };
    let title = `${name} - Dist: ${parseInt(distance)} `;
    this.createMarker(
      polyline.GetPointAtDistance(meters, totalMeters),
      label,
      name,
      title,
      photo
    );
  }

  calcRoute() {
    let directionsDisplay = this.state.directionsDisplay;
    let polyline = this.state.polyline;
    let map = this.state.map;
    var start = this.props.start;
    var end = this.props.end;
    let fullWaypoints = this.props.waypoints;
    let waypoints = [];
    fullWaypoints.forEach((waypoint) => {
      waypoints.push({ location: waypoint.location });
    });
    var travelMode = window.google.maps.DirectionsTravelMode.DRIVING;
    var request = {
      origin: start,
      destination: end,
      waypoints: waypoints,
      travelMode: travelMode,
    };
    this.state.directionsService.route(request, (response, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        polyline.setPath([]);
        var bounds = new window.google.maps.LatLngBounds();
        let startLocation = {};
        let endLocation = {};
        directionsDisplay.setDirections(response);

        // For each route, display summary information.
        var legs = response.routes[0].legs;
        for (let i = 0; i < legs.length; i++) {
          if (i === 0) {
            startLocation.latlng = legs[i].start_location;
            startLocation.address = legs[i].start_address;
          }
          endLocation.latlng = legs[i].end_location;
          endLocation.address = legs[i].end_address;
          var steps = legs[i].steps;
          for (let j = 0; j < steps.length; j++) {
            var nextSegment = steps[j].path;
            for (let k = 0; k < nextSegment.length; k++) {
              polyline.getPath().push(nextSegment[k]);
              bounds.extend(nextSegment[k]);
            }
          }
        }

        polyline.setMap(map);

        // calc next leg info calls the parent to attach the next leg info
        // to each of the result records
        this.props.calcNextLegInfo(response.routes[0].legs, this.props.results);
        this.props.computeTotalDistance(response);
        console.log(this.props.results);
        this.props.results.forEach((result) => {
          let includedDistanceTotal = 0;
          includedDistanceTotal += this.props.challenge.isSwim
            ? result.swimPointsTotal
            : 0;
          includedDistanceTotal += this.props.challenge.isBike
            ? result.bikeDistanceTotal
            : 0;
          includedDistanceTotal += this.props.challenge.isRun
            ? result.runPointsTotal
            : 0;
          this.putMarkerOnRoute(
            polyline,
            includedDistanceTotal,
            result.userRecord ? result.displayName : result.teamName,
            result.photoUrl
          );
        });
      } else {
        alert("directions response " + status);
      }
    });
  }

  createMarker(latlng, label, name, title, photo) {
    let infowindow = this.state.infowindow;
    let data = {
      infowindow,
      latlng,
      label,
      name,
      photo,
    };
    let marks = this.state.markers;
    marks.push(data);
    this.setState({ markers: marks });
  }

  // addWaypointMarkers(waypoints) {
  //     let map = this.state.map
  //     let infowindow = this.state.infowindow
  //     waypoints.forEach((waypoint, index) => {
  //         var contentString = `<b>${index + 1}. ${waypoint.location}</>`;
  //         var marker = new window.google.maps.Marker({
  //             position: waypoint.latlng,
  //             label: `${index + 1}`,
  //             map: map,
  //             title: waypoint.location,
  //             // zIndex: Math.round(latlng.lat() * -100000) << 5,
  //             contentString: contentString
  //         });
  //         window.google.maps.event.addListener(marker, 'click', function () {
  //             infowindow.setContent(contentString);
  //             infowindow.open(map, marker);
  //         });
  //     })

  // }

  async onMapLoad(map, maps) {
    const [
      directionsDisplay,
      infowindow,
      directionsService,
      polyline,
    ] = await Promise.all([
      new maps.DirectionsRenderer({ suppressMarkers: false }),
      new maps.InfoWindow(),
      new maps.DirectionsService(),
      new maps.Polyline({
        path: [],
        strokeColor: "#0099ff",
        strokeWeight: 3,
      }),
    ]);
    this.setState({
      directionsDisplay,
      infowindow,
      directionsService,
      map,
      polyline,
    });
    directionsDisplay.setMap(map);
    // this.addWaypointMarkers(this.props.waypoints)
    this.calcRoute();
  }

  onScriptLoad(map, maps) {
    createEpoly();
    this.onMapLoad(map, maps);
  }

  render() {
    return (
      <GoogleMapReact
        bootstrapURLKeys={{ key: FB_CONFIG.API_KEY }}
        defaultCenter={this.props.options.center}
        defaultZoom={this.props.options.zoom}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => this.onScriptLoad(map, maps)}
        hoverDistance={30}
      >
        {this.state.markers.length > 0
          ? this.state.markers.map((marker, index) => {
              return (
                <CustomMarker
                  key={index}
                  lat={marker.latlng.lat()}
                  lng={marker.latlng.lng()}
                  name={marker.name}
                  photo={marker.photo}
                  label={marker.label}
                />
              );
            })
          : null}
      </GoogleMapReact>
    );
  }
}
export default Map;
