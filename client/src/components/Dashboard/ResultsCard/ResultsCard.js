import React from 'react';
import Box from '@material-ui/core/Box';
import { Link } from "react-router-dom";
import Tooltip from '@material-ui/core/Tooltip';
import LaunchIcon from '@material-ui/icons/Launch';
import './Result.css'
import { Table, TableHead, TableBody, TableCell, TableRow, Card, CardContent, Grid } from '@material-ui/core';
import TeamResultsModal from './TeamResultsModal';

class ResultsCard extends React.Component {
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
            return (null);
        }

        let teamTotals = this.props.teamTotals;
        let userTotals = this.props.userTotals;
        let onlyTeams = this.props.onlyTeams;

        const leaderboardTitleRow =
            <Box className="row" fontStyle="oblique" fontWeight="fontWeightBold">
                <Link style={{ textDecoration: "none", color: "grey" }}
                    to={{
                        pathname: "/activities",
                        state: {
                            filterByString: "Mine"
                        }
                    }}>{onlyTeams ? "Team Leaderboard" : "Individual Leaders"}
                </Link>
                <div style={{ float: 'right' }}>
                    <Tooltip title="Show Results">
                        <div onClick={this.handleClickTeamResults.bind(this)}>
                            <LaunchIcon />
                        </div>
                    </Tooltip>
                </div>
            </Box>

        let totals = userTotals;
        if (onlyTeams) {
            totals = teamTotals;
        }

        return (
            <Card style={{ height: '100%' }}>
                <CardContent>
                    <TeamResultsModal id="TeamResultsModal" open={this.state.openTeamResults} teamTotals={teamTotals} userTotals={userTotals} />
                    {leaderboardTitleRow}
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: "bold" }}>Name</TableCell>
                                <TableCell style={{ fontWeight: "bold" }}>Total</TableCell>
                                <TableCell style={{ fontWeight: "bold" }} padding="none" align="right">Swim</TableCell>
                                <TableCell style={{ fontWeight: "bold" }} padding="none" align="right">Bike</TableCell>
                                <TableCell style={{ fontWeight: "bold" }} padding="none" align="right">Run</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {totals.slice(0, 10).map((result, index) => (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row">
                                        {result.userOrTeamName}
                                    </TableCell>
                                    <TableCell>{result.pointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                                    <TableCell padding="none" align="right">{result.swimPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                                    <TableCell padding="none" align="right">{result.bikePointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                                    <TableCell padding="none" align="right">{result.runPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )
    }
}

export default ResultsCard;