import React from 'react';
import Box from '@material-ui/core/Box';

import './ResultsCard.css'

const ResultsCard = (props) => {
    // wait for props
    if (!props.result) {
        return(null);
    }

    //console.log(`${JSON.stringify(props.result)}`);

    // Band odd rows for clarity
    let rowBg = "";
    let rowFg = ""
    if (props.index % 2 === 0) {
        rowBg = "info.main";
        rowFg = "white";
    }
    if (props.result.teamRecord && !props.onlyTeams) {
        rowBg = "yellow";
        rowFg = "black";
    }

    return (
        <div>
            {/*<-- Leaderboad row -->*/}
            {/* One Row for each result in leaderboard */}
            <Box className="row" color={rowFg} bgcolor={rowBg} m={0}>
                {/* If its teamRecord display non-indednted, otherwise just indent user record as normal*/}
                {props.result.teamRecord ?
                    <div className="col s4 m4 truncate">
                        {props.result.userOrTeamName}
                    </div>
                :  
                    <div>
                        <div className="col s1 m1">
                            { props.result.isThisMine ?
                                <img style={{maxHeight: '20px'}} src={"/images/me.png"} alt={"me"} />
                                :  props.result.isThisMine
                            }
                        </div>
                        <div className="col s3 m3 truncate">
                            {props.result.userOrTeamName}
                        </div>
                    </div>
                }
                <div className="col s2 m2 truncate">
                    {props.result.pointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div className="col s2 m2 truncate">
                    {props.result.swimPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div className="col s2 m2 truncate">
                    {props.result.bikePointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div className="col s2 m2 truncate">
                    {props.result.runPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
            </Box>
            {/* End Row */}         
        </div>
    )
}

export default ResultsCard;