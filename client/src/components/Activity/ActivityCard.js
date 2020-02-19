import React from 'react';
import './Activity.css'

import moment from "moment";

class ActivityCard extends React.Component {

    render() {
        const {
            activityDateTime,
            activityName, // swim, bike, run
            activityType, // swim, bike, run
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

        let displayActivityNameAndType = `${activityType}/${activityName}`
    
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

        return (
            <div className="row">
                <div className="col s1 m1">
                    <img style={{maxHeight: '20px'}} src={activityIcon} alt={activityType} />
                </div>
                <div className="col s5 m5 truncate">
                    {displayActivityNameAndType}
                </div>
                <div className="col m2 m2 truncate">
                    {displayDateTime}
                </div>
                <div className="col s2 m2 offset-s1 offset-m1 truncate">
                    {displayDistance} {distanceUnits}
                </div>
            </div>
        ); // Return
    } // render()
} // class def

export default ActivityCard;