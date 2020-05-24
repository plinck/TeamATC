import React, { Component } from 'react';
import { FormControl, Input, InputLabel } from '@material-ui/core';
import Script from 'react-load-script';
import { FB_CONFIG } from "../Environment/Environment";

class LocationSearchBar extends Component {
    // Define Constructor
    constructor(props) {
        super(props);

        // Declare State
        this.state = {
            city: '',
            query: '',
            lat: 0,
            lng: 0,
            fieldValue: ""
        };

    }

    handleScriptLoad = () => {
        // Declare Options For Autocomplete
        const options = {
            types: ['(cities)'],
        };

        // Initialize Google Autocomplete
        /*global google*/ // To disable any eslint 'google not defined' errors
        this.autocomplete = new google.maps.places.Autocomplete(
            document.getElementById(this.props.id),
            options,
        );

        // Avoid paying for data that you don't need by restricting the set of
        // place fields that are returned to just the address components and formatted
        // address.
        this.autocomplete.setFields(['address_components', 'formatted_address', 'geometry']);

        // Fire Event when a suggested name is selected
        this.autocomplete.addListener('place_changed', this.handlePlaceSelect);
    }

    handlePlaceSelect = () => {

        // Extract City From Address Object
        const addressObject = this.autocomplete.getPlace();
        const address = addressObject.address_components;
        const lat = addressObject.geometry.location.lat();
        const lng = addressObject.geometry.location.lng();
        const geometry = {lat: lat, lng: lng};

        // Check if address is valid
        if (address) {
            // Set State
            this.props.handleCityChange(addressObject.formatted_address, geometry);
            this.setState(
                {
                    city: address[0].long_name,
                    fieldValue: addressObject.formatted_address,
                    lat: lat,
                    lng: lng,
                    query: addressObject.formatted_address,
                }
            );
        }
    }

    handleFieldValueChange = event => {
        console.log(`hanleFieldValueChange: event ${event.target.name}:${event.target.value}`);
        this.setState({ [event.target.name]: event.target.value });
    };

    componentDidMount() {
        // since t hey are auth, uid == id
        if (this.props.value && this.props.value !== "") {
            this.setState({fieldValue: this.props.value});
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.value && this.props.value!== prevProps.value) {
            if (this.props.value && this.props.value !== "") {
                this.setState({fieldValue: this.props.value});
            }
        }
    }

    render() {
        let fieldValue = this.state.fieldValue;

        return (
            <>
                <Script
                    url={`https://maps.googleapis.com/maps/api/js?key=${FB_CONFIG.API_KEY}&libraries=places`}
                    onLoad={this.handleScriptLoad}
                />
                <FormControl style={{ minWidth: "40%", marginRight: '10px' }}>
                    <InputLabel htmlFor={this.props.id}>{this.props.title ? this.props.title : "Search a City"}</InputLabel>
                    <Input
                        id={this.props.id}
                        name="fieldValue"
                        value={fieldValue}
                        onChange={this.handleFieldValueChange}
                        placeholder="Search City"
                        inputProps={{
                            style: { padding: '10px' }
                        }}
                    />
                </FormControl>
            </>
        );
    }
}

export default LocationSearchBar;