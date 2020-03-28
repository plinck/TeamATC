import React, { Component } from 'react';
import { FormControl, Input, InputLabel, Chip } from '@material-ui/core';
import Script from 'react-load-script';

class Waypoints extends Component {
    // Define Constructor
    constructor(props) {
        super(props);

        // Declare State
        this.state = {
            city: '',
            query: '',
            text: ''
        };

    }

    handleInput = (e) => {
        this.setState({ text: e.target.value })
    }

    handleScriptLoad = () => {
        // Declare Options For Autocomplete
        const options = {
            types: ['(cities)'],
        };

        // Initialize Google Autocomplete
        /*global google*/ // To disable any eslint 'google not defined' errors
        this.autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('waypoints'),
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
            this.props.handleAddWaypoint(addressObject.formatted_address);
            this.setState(
                {
                    city: address[0].long_name,
                    query: addressObject.formatted_address,
                    text: ''
                }
            );
        }
    }

    render() {
        return (
            <>
                <Script
                    url="https://maps.googleapis.com/maps/api/js?key=AIzaSyBmeZVx6YKWwqMP8FvsEyoG0eIxcinHYc4&libraries=places"
                    onLoad={this.handleScriptLoad}
                />
                <FormControl style={{ minWidth: "100%" }}>
                    <InputLabel htmlFor='waypoints'>{"Waypoints (In Order)"}</InputLabel>
                    <Input
                        id='waypoints'
                        onChange={(e) => this.handleInput(e)}
                        value={this.state.text}
                        placeholder="Search City"
                        inputProps={{
                            style: { padding: '10px' }
                        }}
                    />
                </FormControl>

                {this.props.waypoints ? this.props.waypoints.map((data, index) => {
                    return (
                        <Chip
                            key={index}
                            label={data.location}
                            onDelete={this.props.handleDelete(data)}
                            style={{ margin: '2px' }}
                        />
                    );
                }) : null}
            </>
        );
    }
}

export default Waypoints;