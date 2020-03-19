import React from "react";
import { Link } from "react-router-dom";

import CalculateTotals from "./CalculateTotals/CalculateTotals.js"

import "./dashboard.css";
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Redirect } from "react-router";

import SummaryTotal from "./SummaryTotal/SummaryTotal";
import ResultsCard from "./ResultsCard/ResultsCard";
import ActivitiesCard from './ActivitiesCard/ActivitiesCard';
import ActivityBubble from "./Graphs/ActivityBubble";
import ActivityByDay from "./Graphs/ActivityByDay";
import ActivityTotalsGraphs from "./Graphs/ActivityTotalsGraphs";
import ActivityTypeBreakdown from "./Graphs/ActivityTypeBreakdown";
import PointsBreakdownGraph from './Graphs/PointsBreakdown';
//Reports
import { Container, Box, Grid, CircularProgress, Tooltip } from '@material-ui/core'
import Util from "../Util/Util";
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    root: {
        [theme.breakpoints.up('md')]: {
            marginLeft: "57px",
        }
    }
});

class Dashboard extends React.Component {
    state = {
        loadingFlag: true,
        activities: [],
        myActivities: [],
    }
    activeListener = undefined;
    totals = {};
    activitiesUpdated = false;

    componentDidMount() {
        this._mounted = true;
        this.setState({ loadingFlag: true });

        let allDBRefs = Util.getDBRefs();
        const dbActivitiesRef = allDBRefs.dbActivitiesRef;

        let ref = dbActivitiesRef
            .orderBy("activityDateTime", "desc");
        this.activeListener = ref.onSnapshot((querySnapshot) => {
            let activities = this.state.activities;

            let activity = {};
            querySnapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    activity = change.doc.data();
                    activity.id = change.doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();
                    activities.push(activity);
                }
                if (change.type === "modified") {
                    activity = change.doc.data();
                    activity.id = change.doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();

                    // swap activity in array with new
                    let oldActivityAndIndex = this.searchForActivity(activity.id, "id", activities);
                    if (oldActivityAndIndex) {
                        // replace current activity in array with new one
                        activities[oldActivityAndIndex.index] = activity;
                    }
                }
                if (change.type === "removed") {
                    // console.log(`Removed Activity: ${change.doc.id}`);
                    activity = change.doc.data();
                    activity.id = change.doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();

                    // Delete activity from array 
                    let oldActivityAndIndex = this.searchForActivity(activity.id, "id", activities);
                    if (oldActivityAndIndex) {
                        // remove it
                        activities.splice(oldActivityAndIndex.index, 1);
                    }
                }
            });
            this.activitiesUpdated = true;
            this.setState({
                loadingFlag: false
            });
        }, (error) => {
            console.error(`Error attaching listener: ${error}`);
        });
    }
    // Search for object in array based on key using uniqure ID
    searchForActivity(keyValue, keyName, searchArray) {
        for (var i = 0; i < searchArray.length; i++) {
            if (searchArray[i][keyName] === keyValue) {
                return ({ activity: searchArray[i], index: i });
            }
        }
        return undefined;
    }

    // Search for object in array based on key using uniqure ID
    searchForIndex(keyValue, keyName, searchArray) {
        for (var i = 0; i < searchArray.length; i++) {
            if (searchArray[i][keyName] === keyValue) {
                return ({ itemFound: searchArray[i], index: i });
            }
        }
        return undefined;
    }

    componentWillUnmount() {
        this._mounted = false;

        // kill the listener
        if (this.activeListener) {
            this.activeListener();
            // console.log(`Detached listener`);
        }
    }

    async myActivitiesFilter() {
        const activities = this.state.activities;
        let myActivities = [];

        myActivities = activities.filter(activity => {
            if (activity.uid === this.props.user.uid) {
                return activity;
            } else {
                return false;
            }
        });
        this.setState({ myActivities: myActivities });
    }

    render() {
        const { classes } = this.props;
        if (this.state.loadingFlag) {
            return (<Grid container style={{ marginTop: '10px' }} justify="center"><CircularProgress /> <p>Loading ...</p> </Grid>)
        }

        // Some props take time to get ready so return null when uid not avaialble
        if (this.props.user.uid === null || this.props.user.teamUid === null) {
            return null;
        }

        // if the listener updated the state
        if (this.activitiesUpdated) {
            this.totals = CalculateTotals.totals(this.state.activities, this.props.user.teamUid, this.props.user.teamName,
                this.props.user.uid, this.props.user.displayName);
            this.myActivitiesFilter();
            this.activitiesUpdated = false;
        }

        // Some need to catch up for some reason - I had to refresh browser after going to activities page
        if (!this.totals || !this.totals.userR || !this.totals.teamR) {
            return null;
        }

        let myActivities = this.state.myActivities;


        if (this.props.user.authUser) {
            return (
                <div style={{ backgroundColor: "#f2f2f2" }} className={classes.root}>
                    <Container maxWidth="xl" style={{ marginTop: "10px" }}>
                        <Grid container spacing={2}>
                            {/*  OVERALL standings by user and TEAM */}
                            <Grid item xs={12} md={4}>
                                {/* Team standings/results card */}
                                <ResultsCard teamTotals={this.totals.teamR} userTotals={this.totals.userR} onlyTeams={true}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <ActivitiesCard name={this.props.user.displayName} activity={myActivities} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <ResultsCard teamTotals={this.totals.teamR} userTotals={this.totals.userR} onlyTeams={false}
                                />
                            </Grid>
                            {/* End Team standings/results card */}
                            {/*  END OVERALL standings by user and TEAM */}

                            {/* Breakdowns */}
                            <Grid item xs={12} md={4}>
                                <ActivityTypeBreakdown
                                    title={`All Athletes`}
                                    currentTotalsShare={this.totals.all}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <ActivityTypeBreakdown
                                    title={`${this.props.user.displayName}`}
                                    currentTotalsShare={this.totals.user}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <ActivityTypeBreakdown
                                    title={`Team ${this.props.user.teamName}`}
                                    currentTotalsShare={this.totals.team}
                                />
                            </Grid>
                            {/* End Breakdowns */}

                            {/* My Activities and heatmap */}
                            <Grid item xs={12}>
                                <ActivityBubble
                                    title={"Heatmap (All Athletes)"}
                                    activities={this.state.activities}
                                />
                            </Grid>
                            {/* END Activities by day and heatmap */}

                            {/* All User Totals Cards Stack Bar Graphs - Activities etc*/}
                            <Grid item xs={12} md={4}>
                                <PointsBreakdownGraph
                                    title={`Points by Team`}
                                    graphType="Team"
                                    totals={this.totals}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <PointsBreakdownGraph
                                    title={`Top Members`}
                                    graphType="User"
                                    totals={this.totals}
                                />
                            </Grid>
                            {/* End All User Totals Cards Stack Bar Graphs - Activities etc*/}

                            {/*  Activities  by day*/}
                            <Grid item xs={12} md={4}>

                                <ActivityByDay
                                    title={"Activity By Day"}
                                    activities={this.state.activities}
                                />
                            </Grid>
                            {/* END Current User"s Activities */}

                            {/* Sumary Display */}
                            <Grid item xs={12}>
                                <SummaryTotal
                                    nbrActivities={this.totals.all.nbrActivities}
                                    distanceTotal={this.totals.all.distanceTotal}
                                    durationTotal={this.totals.all.durationTotal}

                                    currentAllTotals={this.totals.all}
                                    currentTeamTotals={this.totals.team}
                                    currentUserTotals={this.totals.user}
                                />
                                {/* END Sumary Display */}
                            </Grid>
                        </Grid>
                    </Container>

                </div >
            );
        } else {
            return (
                <Redirect to="/signin" />
            );
        }

    }
}

export default withAuthUserContext(withStyles(styles)(Dashboard));