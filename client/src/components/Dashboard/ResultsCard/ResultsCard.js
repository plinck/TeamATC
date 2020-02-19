import React from 'react';

import './ResultsCard.css'

const ResultsCard = (props) => {
    // wait for props
    if (!props.result) {
        return(null);
    }

    console.log(`${JSON.stringify(props.result)}`);

    return (
        <div>
            {/*<-- Leaderboad row -->*/}
            {/* One Row for each result in leaderboard */}
            <div className="row">
                <div className="col s1 m1">
                    { props.result.isThisMine ?
                        <img style={{maxHeight: '20px'}} src={"/images/me.png"} alt={"me"} />
                        :  props.result.isThisMine
                    }
                </div>
                <div className="col s3 m3 truncate">
                    {props.result.userOrTeamName}
                </div>
                <div className="black-text col m2 m2 truncate">
                    {props.result.pointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div className="blue-text col m2 m2 truncate">
                    {props.result.swimPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div className="red-text col m2 m2 truncate">
                    {props.result.bikePointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div className="green-text col m2 m2 truncate">
                    {props.result.runPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
            </div>
            {/* End Row */}         
        </div>
    )
}

export default ResultsCard;