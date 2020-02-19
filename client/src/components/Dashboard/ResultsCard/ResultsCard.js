import React from 'react';

import './ResultsCard.css'

const ResultsCard = (props) => {
    // wait for props
    if (!props.result) {
        return(null);
    }

    return (
        <div>
            {/*<-- Leaderboad -->*/}
            {/*
                            uid: null,
                            displayName: "",
                            isThisMe: false,
                            distanceTotal : 0,
                            pointsTotal : 0,
                            swimDistanceTotal : 0,
                            swimPointsTotal : 0,
                            bikeDistanceTotal : 0,
                            bikePointsTotal : 0,
                            runDistanceTotal : 0,
                            runPointsTotal : 0,
                            durationTotal: 0,
                            nbrActivities: 0,
                            swimNbrActivities: 0,
                            swimDurationTotal: 0,
                            bikeNbrActivities: 0,
                            bikeDurationTotal: 0,
                            runNbrActivities: 0,
                            runDurationTotal: 0
            */}

            {/* One Row for each result in leaderboard */}
            <div className="row">
                <div className="col s1 m1">
                    <img style={{maxHeight: '20px'}} src={"/images/me.png"} alt={"me"} />
                </div>
                <div className="col s3 m3 truncate">
                    {props.result.displayName}
                </div>
                <div className="black-text col m2 m2 truncate">
                    {props.result.pointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Points
                </div>
                <div className="blue-text col m2 m2 truncate">
                    {props.result.swimPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Points
                </div>
                <div className="red-text col m2 m2 truncate">
                    {props.result.bikePointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Points
                </div>
                <div className="green-text col m2 m2 truncate">
                    {props.result.runPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Points
                </div>
            </div>
            {/* End Row */}         
        </div>
    )
}

export default ResultsCard;