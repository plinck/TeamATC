import React from 'react';
import './dashboard.css';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { Redirect } from 'react-router';

import SummaryTotal from './SummaryTotal/SummaryTotal';
import Activities from "../Activity/Activities";
import ActivityByDay from "./Graphs/ActivityByDay";

// import ActivityByUser from "./Graphs/ActivityByUser";
// import DepositBubble from "./Graphs/DepositBubble";
// import DepositByDenomination from "./Graphs/DepositByDenomination";
// import ProvisionalCreditOverTime from "./Graphs/ProvisionalCreditOverTime"

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Util from '../Util/Util';
import UserAPI from "../User/UserAPI";
import ActivityDB from '../Activity/ActivityDB';

class Dashboard extends React.Component {
    state = {
        loadingFlag: false,
        activities: [],
        nbrActivities: 0,
        distanceTotal: 0,
        durationTotal: 0,
        currentUser: undefined,
        teamTotals: [
            {
                teamUid: null,
                teamName: "",
                nbrActivities : 0,
                distanceTotal : 0,
                durationTotal : 0
            } 
        ]
    }
    activeListener = undefined;

    // Get the users info
    fetchCurrentUser() {
        UserAPI.getCurrentUser().then(user => {
            this.setState({
                currentUser: user
            });
        });
    }

    componentDidMount() {
        this._mounted = true;
        this.setState({ loadingFlag: true })
        const db = Util.getFirestoreDB();   // active firestore db ref

        let ref = db.collection("activities")
            .orderBy("activityDateTime", "desc");
        this.activeListener = ref.onSnapshot((querySnapshot) => {
            let activities = this.state.activities;
            let nbrActivities = this.state.nbrActivities;
            let distanceTotal = this.state.distanceTotal;
            let durationTotal = this.state.durationTotal;
            
            let activity = {};
            querySnapshot.docChanges().forEach( change => {               
                if (change.type === "added") {
                    activity = change.doc.data();
                    activity.id = change.doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();
                    activities.push(activity); 
                    nbrActivities += 1;
                    if (activity.distanceUnits && activity.distanceUnits === "Yards") {
                        distanceTotal += activity.distance / 1760;
                    } else {
                        distanceTotal += activity.distance;
                    }
                    if (activity.durationUnits && activity.durationUnits === "Minutes") {
                        durationTotal += activity.duration / 60;
                    } else {
                        durationTotal += activity.duration;    
                    }
                    this.setState({
                        nbrActivities: nbrActivities,
                        distanceTotal: distanceTotal,
                        durationTotal: durationTotal
                    })    
                }
                if (change.type === "modified") {
                    console.log(`Changed Activity: ${change.doc.id}`);
                    activity = change.doc.data();
                    activity.id = change.doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();
                    
                    // Delete activity from array and update totals
                    let oldActivityAndIndex = this.searchForActivity(activity.id, "id", activities);
                    if (oldActivityAndIndex) {
                        // replace current activity in array with new one
                        activities[oldActivityAndIndex.index] = activity;
                        let oldActivity = oldActivityAndIndex.activity; // extract object from returned object 

                        // Subtract old and add new distance
                        let oldDistanceInMiles =  (oldActivity.distanceUnits && oldActivity.distanceUnits === "Yards")
                            ? (oldActivity.distance) / 1760
                            : (oldActivity.distance);
                        let newDistanceInMiles =  (activity.distanceUnits && activity.distanceUnits === "Yards")
                            ? (activity.distance) / 1760
                            : (activity.distance);
                        distanceTotal = distanceTotal - oldDistanceInMiles + newDistanceInMiles;

                        // Subtract old and add new duration
                        let oldDurationInHours =  (oldActivity.durationUnits && oldActivity.durationUnits === "Minutes")
                            ? (oldActivity.duration) / 60
                            : (oldActivity.duration);
                        let newDurationInHours =  (activity.durationUnits && activity.durationUnits === "Minutes")
                            ? (activity.duration) / 60
                            : (activity.duration);
                        durationTotal = durationTotal - oldDurationInHours + newDurationInHours;

                        this.setState({
                            nbrActivities: nbrActivities,
                            distanceTotal: distanceTotal,
                            durationTotal: durationTotal
                        })   
                    }
                }
                if (change.type === "removed") {
                    console.log(`Removed Activity: ${change.doc.id}`);
                    activity = change.doc.data();
                    activity.id = change.doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();
                    
                    // Delete activity from array and update totals
                    let oldActivityAndIndex = this.searchForActivity(activity.id, "id", activities);
                    if (oldActivityAndIndex) {
                        // remove it
                        activities.splice(oldActivityAndIndex.index, 1);  

                        nbrActivities -= 1;
                        if (activity.distanceUnits && activity.distanceUnits === "Yards") {
                            distanceTotal -= activity.distance / 1760;
                        } else {
                            distanceTotal -= activity.distance;
                        }
                        if (activity.durationUnits && activity.durationUnits === "Minutes") {
                            durationTotal -= activity.duration / 60;
                        } else {
                            durationTotal -= activity.duration;    
                        }
                        this.setState({
                            nbrActivities: nbrActivities,
                            distanceTotal: distanceTotal,
                            durationTotal: durationTotal
                        })   
                    }
                }
            });
            this.setState({ activities: activities })
            this.setState({ loadingFlag: false })
        }, (error) => {
            console.error(`Error attaching listener: ${error}`)
        });
    }
    // Search for object in array based on key using uniqure ID
    searchForActivity(keyValue, keyName, searchArray) {
        for (var i=0; i < searchArray.length; i++) {
            if (searchArray[i][keyName] === keyValue) {
                return ({activity: searchArray[i], index: i});
            }
        }
        return undefined;
    }

    componentWillUnmount() {
        this._mounted = false;
        
        // kill the listener
        if (this.activeListener) {
            this.activeListener();
            console.log(`Detached listener`)
        }
    }

    // Set the totals for a team calculated from activity listener, based on team name
    // need to check about switching to teamUid since better
    // maynbe keep the totals in the team database and listen on that
    setTotalsForTeam (teamInfo) {
        let myTeam = this.state.teamTotals;
        let newTeamTotals = {};

        // get by teamName if exists
        if (teamInfo.teamName) {
            let arrayIndex = myTeam.findIndex( team => {
                return (teamInfo.teamName === teamTotals.name);
            });
            // if existing, add to current totals and replace state with new
            if (arrayIndex > -1) {
                let currentTeamTotals = myTeam[arrayIndex];

                let newTeamTotals = {};
                newTeamTotals.teamUid = teamInfo.teamUid;
                newTeamTotals.teamName = teamInfo.teamName;
                newTeamTotals.nbrActivities += teamInfo.nbrActivities;
                newTeamTotals.distanceTotal += teamInfo.distanceTotal;
                newTeamTotals.durationTotal += teamInfo.durationTotal;

                myTeam[arrayIndex] = newTeamTotals;
                this.setState(myTeam);
                
            } else { // if doesnt exist, just push to end of state array
                let newTeamTotals = {};
                newTeamTotals.teamUid = teamInfo.teamUid;
                newTeamTotals.teamName = teamInfo.teamName;
                newTeamTotals.nbrActivities = teamInfo.nbrActivities;
                newTeamTotals.distanceTotal = teamInfo.distanceTotal;
                newTeamTotals.durationTotal = teamInfo.durationTotal;

                myTeam.push(newTeamTotals);
                this.setState(myTeam);
            }

            // existing data
            if (arrayIndex > -1) {
                newTeamTotals.teamUid = null;
                newTeamTotals.teamName = selectedData.teamName;
                newTeamTotals.nbrActivities = selectedData.nbrActivities;
                newTeamTotals.distanceTotal = selectedData.distanceTotal;
                newTeamTotals.durationTotal = selectedData.durationTotal;
            
                console.log(newTeamTotals);
                return true;
            }
        }
        // none found
        return false;
    }

    // Get the totals rom teams calculated from activity listener
    getTotalsByTeam (teamUid, teamName) {
        let currentTeamTotals = {};
        let myTeam = this.state.teamTotals;
        
        // get by teamName if exists
        if (teamName) {
            let selectedData = myTeam[myTeam.map( (item) => { return item.Id; }).indexOf(teamName)];
            if (selectedData && selectedData != null) {
                currentTeamTotals.teamName = selectedData.teamName;
                currentTeamTotals.nbrActivities = selectedData.nbrActivities;
                currentTeamTotals.distanceTotal = selectedData.distanceTotal;
                currentTeamTotals.durationTotal = selectedData.durationTotal;
            
                console.log(currentTeamTotals);
                return currentTeamTotals;
            }
        }
        // none found
        return undefined;
    }

    render() {
        // Some props take time to get ready so return null when uid not avaialble
        if (this.props.user.uid === null) {
            return null;
        }

        if (!this.state.currentUser) {
            this.fetchCurrentUser();
        }
        
        if (this.props.user.authUser) {
            return (
                <div>
                    {this.state.loadingFlag ?
                        <Grid container justify="center">
                            <CircularProgress /> <p>Loading ...</p>
                        </Grid>
                        :
                        <div className="container">
                            <div className="row">
                                <SummaryTotal>
                                    {/*<-- All -->*/}
                                    nbrActivities={this.state.nbrActivities}
                                    distanceTotal={this.state.distanceTotal}
                                    durationTotal={this.state.durationTotal}
                                    disabled={this.props.user.isAdmin ? false : this.props.user.isCashier ? false : true}
                                    
                                    {/* Curent Team Totals */}
                                    let totals = getTotalsByTeam(undefined, this.state.currentUser.teamName)
                                    nbrActivities={this.state.teamTotals.nbrActivities}
                                    distanceTotal={this.state.teamTotals.distanceTotal}
                                    durationTotal={this.state.teamTotals.durationTotal}
                                    disabled={this.props.user.isAdmin ? false : this.props.user.isCashier ? false : true}
                                
                                    {/* Curent User Totals */}
                                    nbrActivities={this.state.nbrActivities}
                                    distanceTotal={this.state.distanceTotal}
                                    durationTotal={this.state.durationTotal}
                                    disabled={this.props.user.isAdmin ? false : this.props.user.isCashier ? false : true}
                                
                                </SummaryTotal>
                            </div>

                            <div className="row">
                            <ActivityByDay
                                title={"Total Activities By Day"}
                                activities={this.state.activities}
                            />
                            </div>
                            
                            <Activities filterByString="Mine" layoutType="userCard"/>
                        </div>

                    }
                </div>
            );
        } else {
            return (
                <Redirect to="/signin" />
            );
        }

    }
}

export default withAuthUserContext(Dashboard);