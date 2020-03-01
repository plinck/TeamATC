import React from 'react';
import Box from '@material-ui/core/Box';
import { Link } from "react-router-dom";
import Tooltip from '@material-ui/core/Tooltip';

import './ResultsCard.css'
import ResultsCard from "./ResultsCard";
import TeamResultsModal from './TeamResultsModal';

class ResultListCard extends React.Component {
    state = {
        openTeamResults: false,
    }

    handleClickTeamResults() {
        this.setState({ openTeamResults: true });
        console.log("In handleClickTeamResults");
    }

    render() {
        // wait for props
        if (!this.props.teamTotals) {
            return(null);
        }

        let teamTotals = this.props.teamTotals;
        let userTotals = this.props.userTotals;
        let onlyTeams = this.props.onlyTeams;

        const leaderboardTitleRow = 
        <Box className="row" fontStyle="oblique" fontWeight="fontWeightBold" marginTop={1}>
            <Link className="col s9 m9" to={{
                pathname: "/activities",
                state: {
                    filterByString: "Mine"
                }
                }}>Leaderboard 
            </Link>
            <div className="col s2 offset-s1 m2 offset-m1">
                <Tooltip title="Show Results">
                    <div onClick={this.handleClickTeamResults.bind(this)}>
                        <i style={{cursor: 'pointer', marginTop: 1, marginRight: 1}}
                            className="material-icons indigo-text text-darken-4" >launch
                        </i>{" "}
                    </div>
                </Tooltip>
            </div>
        </Box>

        const leaderBoardHeaderRow = 
        <Box className="row"  fontStyle="oblique" fontWeight="fontWeightBold" border={1} margin={0}>
            <div className="col s1 m1">
            </div>
            <div className="col s3 m3 truncate">
                Name
            </div>
            <div className="black-text col m2 m2 truncate">
                Total
            </div>
            <div className="blue-text col m2 m2 truncate">
                Swim
            </div>
            <div className="red-text col m2 m2 truncate">
                Bike
            </div>
            <div className="green-text col m2 m2 truncate">
                Run
            </div>
        </Box>

        let totals = userTotals;
        if (onlyTeams) {
            totals = teamTotals;
        }
        
        return (
            <div>
                <TeamResultsModal id="TeamResultsModal" open={this.state.openTeamResults} teamTotals={teamTotals} userTotals={userTotals}/>
                
                <div className="col s12 m6" margin={2}>
                    <Box className="grey lighten-3" padding={2} margin={0} borderRadius={8} boxShadow={4}>
                        {leaderboardTitleRow}
                        <Box className="white" margin={2} paddingLeft={1} paddingRight={1}> 
                            {leaderBoardHeaderRow}            
                            {totals.map((result, index) => {
                                return (
                                    <div key={index}>
                                        {(index > 9) ?
                                            ""
                                        :
                                            <ResultsCard result={result} index={index} onlyTeams={onlyTeams}
                                        />
                                        }
                                    </div>
                                );
                            })}
                        </Box>
                    </Box>
                </div>    
            </div>
        )
    }
}

export default ResultListCard;