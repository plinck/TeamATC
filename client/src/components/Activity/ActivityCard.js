import React from 'react';
import './Activity.css'

import moment from "moment";

class ActivityCard extends React.Component {

    render() {
        const {
            firstName,
            lastName,
            email,
            team,
            activityDateTime,
            activityName, // swim, bike, run
            activityType, // swim, bike, run
            distance,
            distanceUnits,
            duration
        } = this.props.activity;
        let jsDate = new Date(activityDateTime);
        const displayDateTime = moment(jsDate).format("YYYY-MM-DD");
        let displayDistance = distance.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    
        // Truncate Nane for easy view
        var trimmedActivityName = displayActivityNameAndType.length < 20 ? displayActivityNameAndType : `${displayActivityNameAndType.substring(0, 20)}...` ;
    
        return (
            <div className="row">
                <div className="col s1 m1">
                    <img style={{maxHeight: '20px'}} src={activityIcon} alt={activityType} />
                   </div>
                <div className="col s11 m4">
                    <p>{trimmedActivityName}</p>
                </div>
                <div className="col s7 m4">
                    <p>{displayDateTime}</p>
                </div>
                <div className="col s2 m2 offset-s2 offset-m1">
                    <p>{displayDistance}</p>
                </div>
            </div>
        ); // Return
    } // render()
} // class def

export default ActivityCard;