import React, { Component } from 'react';
import { render } from 'react-dom';
import { Card, CardContent } from '@material-ui/core';

class GoogleMap extends Component {
    constructor(props) {
        super(props);
        this.onScriptLoad = this.onScriptLoad.bind(this)
    }

    style = {
        width: "100%",
        height: "100%"
    }

    directionsService = null
    infowindow
    contentString = null

    calcRoute(map, polyline, directionsDisplay) {
        var start = this.props.start;
        var end = this.props.end;
        var travelMode = window.google.maps.DirectionsTravelMode.DRIVING

        var request = {
            origin: start,
            destination: end,
            travelMode: travelMode
        };
        this.directionsService.route(request, function (response, status) {
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
                        // marker = google.maps.Marker({map:map,position: startLocation.latlng});
                        // marker = createMarker(legs[i].start_location,"start",legs[i].start_address,"green");
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

                // computeTotalDistance(response);
                // putMarkerOnRoute(parseFloat(document.getElementById('time').value));
            } else {
                alert("directions response " + status);
            }
        });
    }

    createMarker(lat, lng, label, map, infowindow) {
        // alert("createMarker("+latlng+","+label+","+html+","+color+")");
        var contentString = '<b>' + label + '</b><br>';
        var marker = new window.google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: label,
            zIndex: Math.round(lat * -100000) << 5,
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
        this.createMarker(41.0082, 28.9784, "Hello Istanbul!", map, infowindow)
        const directionsDisplay = new window.google.maps.DirectionsRenderer({ suppressMarkers: true });
        const polyline = new window.google.maps.Polyline({
            path: [],
            strokeColor: '#FF0000',
            strokeWeight: 3
        });
        directionsDisplay.setMap(map);
        this.calcRoute(map, polyline, directionsDisplay);
    }

    onScriptLoad() {
        const infowindow = new window.google.maps.InfoWindow();
        this.directionsService = new window.google.maps.DirectionsService();
        const map = new window.google.maps.Map(
            document.getElementById(this.props.id),
            this.props.options);
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