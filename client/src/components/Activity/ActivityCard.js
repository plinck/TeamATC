import React from 'react';
import Box from '@material-ui/core/Box';
import './Activity.css'

import moment from "moment";

class ActivityCard extends React.Component {

    render() {
        const {
            activityDateTime,
            activityName, // swim, bike, run
            activityType, // swim, bike, run
            duration,
            distance,
            distanceUnits
        } = this.props.activity;
        let jsDate = new Date(activityDateTime);
        const displayDateTime = moment(jsDate).format("MM-DD-YY");

        let distanceDecimalPlaces = 1;
        if (activityType.toLowerCase() === "swim") {
            distanceDecimalPlaces = 0;
        }
        let displayDistance = distance.toFixed(distanceDecimalPlaces).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        let displayDuration = duration.toFixed(distanceDecimalPlaces).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        let displayActivityName = activityName !== "" ? activityName  : activityType;
    
        let activityIcon = "";
    
        if (activityType.toLowerCase() === "swim") {
            activityIcon = "/images/icons8-swimming-50.png";
        } else if ((activityType.toLowerCase() === "bike")) {
            activityIcon = "/images/icons8-triathlon-50.png";
        } else if ((activityType.toLowerCase() === "run")){
            activityIcon = "/images/icons8-running-50.png";
        } else {
            activityIcon = "/images/icons8-triathlon-50.png";      // unknown
        }

        // Band odd rows for clarity
        let rowBg = "";
        let rowFg = ""
        if (this.props.index % 2 !== 0) {
            rowBg = "info.main";
            rowFg = "white";
        }

        return (
            <Box className="row" color={rowFg} bgcolor={rowBg} m={0}>
                <div className="col s1 m1">
                    <img style={{maxHeight: '20px'}} src={activityIcon} alt={activityType} />
                </div>
                <div className="col s4 m4 truncate">
                    {displayActivityName}
                </div>
                <div className="col s2 m2 truncate">
                    {displayDateTime}
                </div>
                <div className="col s2 offset-s1 m2 offset-m1 truncate">
                    {displayDuration} Hours
                </div>
                <div className="col s2 m2 truncate">
                    {displayDistance} {distanceUnits}
                </div>
            </Box>
        ); // Return
    } // render()
} // class def

export default ActivityCard;