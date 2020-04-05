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
            query: ''
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
        this.autocomplete.setFields(['address_components', 'formatted_address']);

        // Fire Event when a suggested name is selected
        this.autocomplete.addListener('place_changed', this.handlePlaceSelect);
    }

    handlePlaceSelect = () => {

        // Extract City From Address Object
        const addressObject = this.autocomplete.getPlace();
        const address = addressObject.address_components;

        // Check if address is valid
        if (address) {
            // Set State
            this.props.handleStartCityChange(addressObject.formatted_address);
            this.setState(
                {
                    city: address[0].long_name,
                    query: addressObject.formatted_address,
                }
            );
        }
    }

    render() {
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