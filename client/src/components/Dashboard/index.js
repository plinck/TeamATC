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
        activitiesUpdated: false,
        activities: [],
        nbrActivities: 0,
        distanceTotal: 0,
        durationTotal: 0,
        currentUser: null,

        currentAllTotals: {
            nbrActivities : 0,
            distanceTotal : 0,
            durationTotal : 0
        },
        
        currentTeamTotals: {
            teamUid: null,
            teamName: null,
            nbrActivities : 0,
            distanceTotal : 0,
            durationTotal : 0
        },

        currenUserTotals: {
            uid: null,
            displayName: "",
            nbrActivities : 0,
            distanceTotal : 0,
            durationTotal : 0
        }
    }
    activeListener = undefined;

    // Get the users info
    fetchCurrentUser() {
        UserAPI.getCurrentUser().then(user => {
            this.setState({
                currentUser: {"teamName" : user.teamName,
                    "uid" : user.uid,
                    "displayName" : user.displayName
                }
            });
        }).catch((err) => {
            alert(`Error: ${err}, trying to get current user: ${this.props.user ? this.props.user.uid : "unknown"}`);
        });
    }

    componentDidMount() {
        this._mounted = true;
        this.setState({ activitiesUpdated: false, loadingFlag: true });
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
                    }
                }
            });
            this.setState({ activities: activities,
                loadingFlag: false, activitiesUpdated: true,
                nbrActivities: nbrActivities, distanceTotal: distanceTotal,  durationTotal: durationTotal
            });
        }, (error) => {
            console.error(`Error attaching listener: ${error}`);
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
            console.log(`Detached listener`);
        }
    }

    // Set the totals for a team calculated from activity listener, based on team name
    // need to check about switching to teamUid since better
    //for now, this gets triggered on all listener changes in activity which is ineffient as heck
    // but all I got for now
    // I will get it working and then optimize
    calculateTotalsForTeamAndUser () {
        let newTeamTotals = {
            teamUid: null,
            teamName: null,
            nbrActivities : 0,
            distanceTotal : 0,
            durationTotal : 0
        };
        
        let newUserTotals = {
            uid: null,
            displayName: "",
            nbrActivities : 0,
            distanceTotal : 0,
            durationTotal : 0
        };

        if (this.state.currentUser === null) {
            return;
        }

        let activities = this.state.activities;
        let currentTeamName = this.state.currentUser.teamName;
        let currentUserUid = this.state.currentUser.uid;
        let currentUserDisplayName = this.state.currentUser.displayName;
        
        // loop through array counting by team
        for (let i = 0; i < activities.length; i++) {
            // only add for this team
            console.log(`Found activity: ${activities[0]}
                team: ${activities[i].teamName} uid:activities[i].uid  in calcTotals`);
            if (currentTeamName && currentTeamName === activities[i].teamName) {
                newTeamTotals.teamUid = activities[i].teamUid ? activities[i].teamUid : null;
                newTeamTotals.teamName = activities[i].currentTeamName;
                newTeamTotals.nbrActivities += 1;
                newTeamTotals.distanceTotal += activities[i].distance;
                newTeamTotals.durationTotal += activities[i].duration;
            }
            if (currentUserUid && currentUserUid === activities[i].uid) {
                newUserTotals.uid = currentUserUid;
                newUserTotals.displayName = currentUserDisplayName;
                newUserTotals.nbrActivities += 1;
                newUserTotals.distanceTotal += activities[i].distance;
                newUserTotals.durationTotal += activities[i].duration;
            }
        }
        console.log(newTeamTotals);
        console.log(newUserTotals);
        this.setState({currentTeamTotals: newTeamTotals}, {currentUserTotals: newUserTotals}, {activitiesUpdated : false});
        // none found
    }

    render() {
        // Some props take time to get ready so return null when uid not avaialble
        if (this.props.user.uid === null) {
            return null;
        }

        if (!this.state.currentUser || this.state.currentUser === null) {
            this.fetchCurrentUser();
        }
        
        if (this.state.activitiesUpdated) {
            this.calculateTotalsForTeamAndUser();
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
                                <SummaryTotal
                                    nbrActivities={this.state.nbrActivities}
                                    distanceTotal={this.state.distanceTotal}
                                    durationTotal={this.state.durationTotal}
                                    disabled={this.props.user.isAdmin ? false : this.props.user.isCashier ? false : true}
                                    
                                    currentTeamTotals={this.state.currentTeamTotals}
                                
                                    currentUserTotals={this.state.currenUserTotals}
                                
                                />
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