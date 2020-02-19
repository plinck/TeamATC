import React from 'react';
import './dashboard.css';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { Redirect } from 'react-router';

import SummaryTotal from './SummaryTotal/SummaryTotal';
import ResultsCard from './ResultsCard/ResultsCard';
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

class Dashboard extends React.Component {
    state = {
        loadingFlag: false,
        activities: [],
        nbrActivities: 0,
        distanceTotal: 0,
        durationTotal: 0
    }

    activeListener = undefined;
    totals = {};
    activitiesUpdated = false;

    // Get the users info
    fetchCurrentUser() {
        if (!this._mounted) {
            return;
        }

        UserAPI.getCurrentUser().then(user => {
            this.setState({
                currentUser: {"teamName" : user.teamName,
                    "displayName" : user.displayName
                }
            });
        }).catch((err) => {
            alert(`Error: ${err}, trying to get current user: ${this.props.user ? this.props.user.uid : "unknown"}`);
        });
    }

    componentDidMount() {
        this._mounted = true;
        this.setState({loadingFlag: true });
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
            this.activitiesUpdated = true;
            this.setState({ loadingFlag: false,
                nbrActivities: nbrActivities,
                distanceTotal: distanceTotal,
                durationTotal: durationTotal
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

    // Search for object in array based on key using uniqure ID
    searchForIndex(keyValue, keyName, searchArray) {
        for (var i=0; i < searchArray.length; i++) {
            if (searchArray[i][keyName] === keyValue) {
                return ({itemFound: searchArray[i], index: i});
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
        let newTotals = {
            nbrActivities : 0,
            distanceTotal : 0,
            durationTotal : 0,
            swimNbrActivities : 0,
            swimDistanceTotal : 0,
            swimDurationTotal : 0,
            bikeNbrActivities : 0,
            bikeDistanceTotal : 0,
            bikeDurationTotal : 0,
            runNbrActivities : 0,
            runDistanceTotal : 0,
            runDurationTotal : 0
        };
        
        let newTeamTotals = {
            teamUid: this.props.user.teamUid,
            teamName: this.props.user.teamName,
            nbrActivities : 0,
            distanceTotal : 0,
            durationTotal : 0,
            swimNbrActivities : 0,
            swimDistanceTotal : 0,
            swimDurationTotal : 0,
            bikeNbrActivities : 0,
            bikeDistanceTotal : 0,
            bikeDurationTotal : 0,
            runNbrActivities : 0,
            runDistanceTotal : 0,
            runDurationTotal : 0
        };
        
        let newUserTotals = {
            uid: this.props.user.uid,
            displayName: this.props.user.displayName,
            nbrActivities : 0,
            distanceTotal : 0,
            durationTotal : 0,
            swimNbrActivities : 0,
            swimDistanceTotal : 0,
            swimDurationTotal : 0,
            bikeNbrActivities : 0,
            bikeDistanceTotal : 0,
            bikeDurationTotal : 0,
            runNbrActivities : 0,
            runDistanceTotal : 0,
            runDurationTotal : 0
        };

        let newResults = [];

        let userResults = [];

        let teamResults = [];

        let activities = this.state.activities;
        
        // loop through array counting by team
        for (let i = 0; i < activities.length; i++) {
            // get resulsts
            newResults = this.calulateResults(userResults, teamResults, activities[i]);

            // Add everything for totals
            newTotals.nbrActivities += 1;
            newTotals.distanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
            newTotals.durationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
            switch(activities[i].activityType) {
                case "Swim":
                    newTotals.swimNbrActivities += 1;
                    newTotals.swimDistanceTotal += activities[i].distanceUnits === "Miles" ? activities[i].distance * 1760 : activities[i].distance;
                    newTotals.swimDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                    break;
                case "Bike":                            
                    newTotals.bikeNbrActivities += 1;
                    newTotals.bikeDistanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
                    newTotals.bikeDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                    break;
                case "Run":
                    newTotals.bikeNbrActivities += 1;
                    newTotals.bikeDistanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
                    newTotals.bikeDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                    break;
                default:
                    // NADA
            }

            // only add for this team
            if (this.props.user.teamName === activities[i].teamName) {
                newTeamTotals.nbrActivities += 1;
                newTeamTotals.distanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
                newTeamTotals.durationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                switch(activities[i].activityType) {
                    case "Swim":
                        newTeamTotals.swimNbrActivities += 1;
                        newTeamTotals.swimDistanceTotal += activities[i].distanceUnits === "Miles" ? activities[i].distance * 1760 : activities[i].distance;
                        newTeamTotals.swimDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                        break;
                    case "Bike":                            
                        newTeamTotals.bikeNbrActivities += 1;
                        newTeamTotals.bikeDistanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
                        newTeamTotals.bikeDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                        break;
                    case "Run":
                        newTeamTotals.bikeNbrActivities += 1;
                        newTeamTotals.bikeDistanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
                        newTeamTotals.bikeDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                        break;
                    default:
                        // NADA
                }     
            }
            if (this.props.user.uid === activities[i].uid) {
                newUserTotals.nbrActivities += 1;
                newUserTotals.distanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;;
                newUserTotals.durationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                switch(activities[i].activityType) {
                    case "Swim":
                        newUserTotals.swimNbrActivities += 1;
                        newUserTotals.swimDistanceTotal += activities[i].distanceUnits === "Miles" ? activities[i].distance * 1760 : activities[i].distance;
                        newUserTotals.swimDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                        break;
                    case "Bike":                            
                        newUserTotals.bikeNbrActivities += 1;
                        newUserTotals.bikeDistanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
                        newUserTotals.bikeDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                        break;
                    case "Run":
                        newUserTotals.bikeNbrActivities += 1;
                        newUserTotals.bikeDistanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
                        newUserTotals.bikeDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                        break;
                    default:
                        // NADA
                }     
            }
        }

        let totalsAndResults = {all: newTotals, team : newTeamTotals, user : newUserTotals, userR : newResults.user, teamR : newResults.user}
        console.log(`Results User: ${JSON.stringify(newResults.user, null, 2)}`);

        return(totalsAndResults);
    }

    calulateResults(userResults, teamResults, activity) {

        let newUserResult =
        {
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
        }
        let newTeamResults =
        {
            teamUid: null,
            teamName: "",
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
        }        

        // let oldUserResult = this.searchForIndex(activity.uid, "uid", userResults);
        // let idx = oldUserResult ? oldUserResult.index : -1;

        let idx = userResults.findIndex( (uResult) => { 
            const isFound = uResult.uid === activity.uid;
            return isFound;
        });

        if (idx > -1) {       // Found, results for this oone so add to it
            console.log(`found user: ${userResults[idx].uid} at idx: ${idx}`)
            newUserResult = userResults[idx];

            newUserResult.isthisMe = activity.uid === this.props.user.uid ? true : false;

            const distanceInMiles = activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
            newUserResult.distanceTotal +=  distanceInMiles;
            newUserResult.durationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration ;  
            
            switch(activity.activityType) {
                case "Swim":
                    newUserResult.pointsTotal +=  distanceInMiles * 10;
                    
                    newUserResult.swimNbrActivities += 1;
                    newUserResult.swimDistanceTotal += activity.distanceUnits === "Miles" ? activity.distance * 1760 : activity.distance;
                    newUserResult.swimDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.swimPointsTotal +=  distanceInMiles * 10;
                    break;
                case "Bike":                            
                    newUserResult.pointsTotal +=  distanceInMiles;
                    
                    newUserResult.bikeNbrActivities += 1;
                    newUserResult.bikeDistanceTotal += activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
                    newUserResult.bikeDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;
                    
                    newUserResult.bikePointsTotal +=  distanceInMiles;
                    break;
                case "Run":
                    newUserResult.pointsTotal +=  distanceInMiles *3;
                    
                    newUserResult.runNbrActivities += 1;
                    newUserResult.runDistanceTotal += activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
                    newUserResult.runDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.runPointsTotal +=  distanceInMiles *3;
                    break;
                default:
                    // NADA
            }
            userResults[idx] = newUserResult;

        } else {              // Didnt find results for this oone so push it
            console.log(`new user: ${activity.uid}`)

            newUserResult.isthisMe = activity.uid === this.props.user.uid ? true : false;
            newUserResult.uid = activity.uid;
            newUserResult.displayName = activity.displayName;

            const distanceInMiles = activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
            newUserResult.distanceTotal +=  distanceInMiles;
            newUserResult.durationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration ;  
            
            switch(activity.activityType) {
                case "Swim":
                    newUserResult.pointsTotal +=  distanceInMiles * 10;
                    
                    newUserResult.swimNbrActivities += 1;
                    newUserResult.swimDistanceTotal += activity.distanceUnits === "Miles" ? activity.distance * 1760 : activity.distance;
                    newUserResult.swimDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.swimPointsTotal +=  distanceInMiles * 10;
                    break;
                case "Bike":                            
                    newUserResult.pointsTotal +=  distanceInMiles;
                    
                    newUserResult.bikeNbrActivities += 1;
                    newUserResult.bikeDistanceTotal += activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
                    newUserResult.bikeDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;
                    
                    newUserResult.bikePointsTotal +=  distanceInMiles;
                    break;
                case "Run":
                    newUserResult.pointsTotal +=  distanceInMiles *3;
                    
                    newUserResult.runNbrActivities += 1;
                    newUserResult.runDistanceTotal += activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
                    newUserResult.runDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.runPointsTotal +=  distanceInMiles *3;
                    break;
                default:
                    // NADA
            }
            userResults.push(newUserResult);
        }

        let newResults = {user: userResults, team : teamResults }
        return(newResults);
    }

    render() {
        // Some props take time to get ready so return null when uid not avaialble
        if (this.props.user.uid === null || this.props.user.teamName === null) {
            return null;
        }
        
        // if the listener updated the state
        if (this.activitiesUpdated) {
            this.totals = this.calculateTotalsForTeamAndUser();
            this.activitiesUpdated = false;
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
                            {/* change fornow to chck compile
                                    teamResults={this.totals.teamR}
                                    userResults={this.totals.userR}
                            */}
                                <ResultsCard
                                    teamResults={this.totals.team}
                                    userResults={this.totals.user}
                                />
                            </div>
                            
                            <div className="row">
                                <SummaryTotal
                                    nbrActivities={this.state.nbrActivities}
                                    distanceTotal={this.state.distanceTotal}
                                    durationTotal={this.state.durationTotal}
                                    
                                    currentAllTotals={this.totals.all}
                                    currentTeamTotals={this.totals.team}
                                    currentUserTotals={this.totals.user}
                                />
                            </div>
                            
                            <Activities filterByString="Mine" layoutType="userCard"/>

                            <div className="row">
                            <ActivityByDay
                                title={"Total Activities By Day"}
                                activities={this.state.activities}
                            />
                            </div>
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