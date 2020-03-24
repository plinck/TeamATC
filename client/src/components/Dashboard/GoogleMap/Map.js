import React, { Component } from 'react';
import { render } from 'react-dom';
import { Card, CardContent } from '@material-ui/core';

class GoogleMap extends Component {
    constructor(props) {
        super(props);
        this.onScriptLoad = this.onScriptLoad.bind(this);
        // this.computeTotalDistance = this.computeTotalDistance.bind(this);
        this.state = {
            totalDist: 0,
            marker: null,
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
        totalDist = totalDist / 1000.
        this.setState({ totalDist })
    }

    putMarkerOnRoute(distance, team, time) {
        if (distance > this.state.totalDist) {
            distance = this.state.totalDist
        }

        if (!this.state.marker) {
            this.state.marker = this.createMarker(this.state.polyline.GetPointAtDistance(distance), "time: " + time, team);
        } else {
            let marker = this.state.marker
            marker.setPosition(this.state.polyline.GetPointAtDistance(distance));
            marker.setTitle("time:" + time);
            marker.contentString = "<b>time: " + time + "</b><br>distance: " + (distance / 1000).toFixed(2) + " km<br>marker";
            window.google.maps.event.trigger(marker, "click");
        }
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
                    // putMarkerOnRoute(parseFloat(document.getElementById('time').value));
                } else {
                    alert("directions response " + status);
                }
            });
        }
    }

    createMarker(latlng, label, map, infowindow) {
        // alert("createMarker("+latlng+","+label+","+html+","+color+")");
        var contentString = '<b>' + label + '</b><br>';
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
        const infowindow = new window.google.maps.InfoWindow();
        let directionsService = new window.google.maps.DirectionsService();
        this.setState({ directionsService })
        const map = new window.google.maps.Map(
            document.getElementById(this.props.id),
            this.props.options);
        this.setState({ map: map })
        this.onMapLoad(map, infowindow)
    }

    componentDidMount() {
        if (!window.google) {
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = `https://maps.google.com/maps/api/js?key=AIzaSyD-d6RgZojUTghWcqpTxicyCN5MdgEYFTI`;
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