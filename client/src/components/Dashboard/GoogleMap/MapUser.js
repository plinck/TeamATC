import React, { Component } from "react";
import createEpoly from "./eploy.js";
import { FB_CONFIG } from "../../Environment/Environment";
import bikeIcon from "./pin.svg";
import createCustomMarkers from "./CustomMarker/CustomMarker";
import './CustomMarker/CustomMarker.css'

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
    let label = `<b>Dist: ${parseInt(distance)} </b><br><b> ${parseInt(
      (distance / this.props.totalDist) * 100
    )}% Complete </b>`;
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
    let map = this.state.map;
    let infowindow = this.state.infowindow;
    var contentString = "<b>" + name + "</b><br>" + label;
    let icon = "";
    if (photo) {
      let data = {
        infowindow,
        latlng,
        contentString,
        photo
      };
      createCustomMarkers(data, map);
    } else {
      icon = bikeIcon;
      var marker = new window.google.maps.Marker({
        position: latlng,
        map: map,
        title: title,
        icon: bikeIcon,
        zIndex: Math.round(latlng.lat() * -100000) << 5,
        contentString: contentString,
      });
      marker.myname = label;
      window.google.maps.event.addListener(marker, "click", function () {
        infowindow.setContent(contentString);
        infowindow.open(map, marker);
      });
      return marker;
    }
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

  async onMapLoad() {
    const [
      directionsDisplay,
      infowindow,
      directionsService,
      map,
      polyline,
    ] = await Promise.all([
      new window.google.maps.DirectionsRenderer({ suppressMarkers: false }),
      new window.google.maps.InfoWindow(),
      new window.google.maps.DirectionsService(),
      new window.google.maps.Map(
        document.getElementById(this.props.id),
        this.props.options
      ),
      new window.google.maps.Polyline({
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

  onScriptLoad() {
    createEpoly();
    this.onMapLoad();
  }

  componentDidMount() {
    if (!window.google) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = `https://maps.googleapis.com/maps/api/js?key=${FB_CONFIG.API_KEY}&libraries=places`;
      var x = document.getElementsByTagName("script")[0];
      x.parentNode.insertBefore(s, x);
      // Below is important.
      //We cannot access google.maps until it's finished loading
      s.addEventListener("load", (e) => {
        this.onScriptLoad();
      });
    } else {
      this.onScriptLoad();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.updatedResults &&
      this.props.updatedResults !== prevProps.updatedResults
    ) {
      if (!window.google) {
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.src = `https://maps.googleapis.com/maps/api/js?key=${FB_CONFIG.API_KEY}&libraries=places`;
        var x = document.getElementsByTagName("script")[0];
        x.parentNode.insertBefore(s, x);
        // Below is important.
        //We cannot access google.maps until it's finished loading
        s.addEventListener("load", (e) => {
          this.onScriptLoad();
        });
      } else {
        this.onScriptLoad();
      }
    }
  }

  render() {
    return <div style={this.style} id={this.props.id} />;
  }
}
export default Map;
