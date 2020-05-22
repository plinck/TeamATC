import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import { Link } from "react-router-dom";
import LaunchIcon from '@material-ui/icons/Launch';
import './Result.css'
import { Table, TableHead, TableBody, TableCell, TableRow, Card, CardContent, Tooltip } from '@material-ui/core';
import TeamResultsModal from './TeamResultsModal.jsx';
import UserResultsModal from './UserResultsModal.jsx';

const ResultsCard = (props) => {
    const [openTeamResults, setOpenTeamResults] = useState(false)
    const [openUserResults, setOpenUserResults] = useState(false)

    const handleClickTeamResults = () => {
        setOpenTeamResults(true)
    }
    const handleClickUserResults = () => {
        setOpenUserResults(true)
    }

    const handleClose = () => {
        setOpenTeamResults(false)
    }

    const handleCloseUser = () => {
        setOpenUserResults(false)
    }

    // wait for props
    if (!props.teamTotals) {
        return (null);
    }

    let teamTotals = props.teamTotals;
    let userTotals = props.userTotals;
    let onlyTeams = props.onlyTeams;

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
                {onlyTeams ? 
                    <Tooltip title="Show Results">
                        <div onClick={handleClickTeamResults}>
                            <LaunchIcon />
                        </div>
                    </Tooltip>
                    :
                    <Tooltip title="Show Results">
                    <div onClick={handleClickUserResults}>
                        <LaunchIcon />
                    </div>
                    </Tooltip>
                }
            </div>
        </Box>

    let totals = userTotals;
    if (onlyTeams) {
        totals = teamTotals;
    }

    let uid = props.user ? props.user.uid : null

    const includedTotals = (result) => {
        let includedDistanceTotal = 0;
        if (props.challenge) {
            includedDistanceTotal += props.challenge.isSwim ? result.swimPointsTotal : 0;
            includedDistanceTotal += props.challenge.isBike ? result.bikePointsTotal : 0;
            includedDistanceTotal += props.challenge.isRun ? result.runPointsTotal : 0;
            includedDistanceTotal += props.challenge.isOther ? result.otherPointsTotal : 0;
        }
        return includedDistanceTotal;
    }

    return (
        <Card style={{ height: '100%' }}>
            <CardContent>
                <TeamResultsModal id="TeamResultsModal" handleClose={handleClose} open={openTeamResults} teamTotals={teamTotals} userTotals={userTotals} />
                <UserResultsModal id="UserResultsModal" handleClose={handleCloseUser} open={openUserResults} userTotals={userTotals} />
                {leaderboardTitleRow}
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ fontWeight: "bold" }}>Name</TableCell>
                            <TableCell style={{ fontWeight: "bold" }}>Total</TableCell>
                            {props.challenge && props.challenge.isSwim ? <TableCell style={{ fontWeight: "bold" }} padding="none" align="right">Swim</TableCell> : ""}
                            {props.challenge && props.challenge.isBike ? <TableCell style={{ fontWeight: "bold" }} padding="none" align="right">Bike</TableCell> : ""}
                            {props.challenge && props.challenge.isRun ? <TableCell style={{ fontWeight: "bold" }} padding="none" align="right">Run</TableCell> : ""}
                            {props.challenge && props.challenge.isOther ? <TableCell style={{ fontWeight: "bold" }} padding="none" align="right">Other</TableCell> : ""}
                        
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {totals.slice(0, 10).map((result, index) => (
                            <TableRow key={index}>
                                <TableCell component="th" scope="row">
                                    {uid === (result.userRecord ? result.uid : result.teamUid)  ? <Tooltip title={"This is me"}>
                                        <img style={{ maxHeight: '18px' }} src={"/images/me.png"} alt={"me"} />
                                    </Tooltip> : null}  {result.userRecord ? result.displayName : result.teamName}
                                </TableCell>
                                <TableCell>{includedTotals(result).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                                {props.challenge && props.challenge.isSwim ? <TableCell padding="none" align="right">{result.swimPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell> : ""}
                                {props.challenge && props.challenge.isBike ? <TableCell padding="none" align="right">{result.bikePointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell> : ""}
                                {props.challenge && props.challenge.isRun ? <TableCell padding="none" align="right">{result.runPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell> : ""}
                                {props.challenge && props.challenge.isOther ? <TableCell padding="none" align="right">{result.otherPointsTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell> : ""}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default ResultsCard;