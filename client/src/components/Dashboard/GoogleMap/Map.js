import React, { Component } from 'react';
import createEpoly from './eploy.js';
import { render } from 'react-dom';
import { Card, CardContent } from '@material-ui/core';

class GoogleMap extends Component {
    constructor(props) {
        super(props);
        this.onScriptLoad = this.onScriptLoad.bind(this);
        // this.computeTotalDistance = this.computeTotalDistance.bind(this);
        this.state = {
            totalDist: 0,
            markers: [],
            map: null,
            directionsDisplay: null,
            directionsService: null

        }
    }

    style = {
        width: "100%",
        height: "100%"
    }

    contentString = null

    computeTotalDistance(result) {
        let totalDist = 0;
        var myroute = result.routes[0];
        for (let i = 0; i < myroute.legs.length; i++) {
            totalDist += myroute.legs[i].distance.value;
        }
        totalDist = totalDist / 1000 / 1.609344  //km to miles
        this.setState({ totalDist })
    }

    putMarkerOnRoute(polyline, distance, team) {
        console.log("team: " + team + " distance: " + distance)
        if (distance > this.state.totalDist) {
            distance = this.state.totalDist
        }
        let meters = distance * 1000 * 1.609344
        this.createMarker(polyline.GetPointAtDistance(meters), "distance: " + parseInt(distance), team)
    }

    calcRoute() {
        let directionsDisplay = this.state.directionsDisplay
        let polyline = this.state.polyline;
        let map = this.state.map
        var start = this.props.start;
        var end = this.props.end;
        var travelMode = window.google.maps.DirectionsTravelMode.DRIVING
        if (polyline && map && directionsDisplay) {

            var request = {
                origin: start,
                destination: end,
                travelMode: travelMode
            };
            this.state.directionsService.route(request, (response, status) => {
                if (status == window.google.maps.DirectionsStatus.OK) {
                    polyline.setPath([]);
                    var bounds = new window.google.maps.LatLngBounds();
                    let startLocation = new Object();
                    let endLocation = new Object();
                    directionsDisplay.setDirections(response);
                    var route = response.routes[0];

                    // For each route, display summary information.
                    var path = response.routes[0].overview_path;
                    var legs = response.routes[0].legs;
                    for (let i = 0; i < legs.length; i++) {
                        if (i == 0) {
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

                    this.computeTotalDistance(response);
                    this.props.teamTotals.forEach(total => this.putMarkerOnRoute(polyline, total.bikeDistanceTotal, total.userOrTeamName))
                    // this.putMarkerOnRoute(polyline, 1200, "Testy")
                } else {
                    alert("directions response " + status);
                }
            });
        }
    }

    createMarker(latlng, label, team) {
        let map = this.state.map
        let infowindow = this.state.infowindow
        var contentString = '<b>' + label + '</b><br><b>' + team + '</b>';
        var marker = new window.google.maps.Marker({
            position: latlng,
            map: map,
            title: label,
            zIndex: Math.round(latlng.lat() * -100000) << 5,
            contentString: contentString
        });
        marker.myname = label;
        window.google.maps.event.addListener(marker, 'click', function () {
            infowindow.setContent(contentString);
            infowindow.open(map, marker);
        });
        return marker;
    }

    onMapLoad(map, infowindow) {
        const directionsDisplay = new window.google.maps.DirectionsRenderer({ suppressMarkers: true });
        const polyline = new window.google.maps.Polyline({
            path: [],
            strokeColor: '#FF0000',
            strokeWeight: 3
        });
        this.setState({ polyline, directionsDisplay })
        directionsDisplay.setMap(map);
        this.calcRoute();

    }

    onScriptLoad() {
        createEpoly()
        const infowindow = new window.google.maps.InfoWindow();
        let directionsService = new window.google.maps.DirectionsService();
        this.setState({ directionsService })
        const map = new window.google.maps.Map(
            document.getElementById(this.props.id),
            this.props.options);
        this.setState({ map, infowindow })
        this.onMapLoad(map, infowindow)
    }

    componentDidMount() {
        if (!window.google) {
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = `https://maps.google.com/maps/api/js?key=AIzaSyBmeZVx6YKWwqMP8FvsEyoG0eIxcinHYc4`;
            var x = document.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(s, x);
            // Below is important. 
            //We cannot access google.maps until it's finished loading
            s.addEventListener('load', e => {
                this.onScriptLoad()
            })
        } else {
            this.onScriptLoad()
        }
    }

    render() {
        return (
            <div style={this.style} id={this.props.id} />
        );
    }
}
export default GoogleMap