import GLOBAL_ENV from "../Environment/Environment";

import React from "react";
import { Link } from "react-router-dom";

import "./dashboard.css";
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Redirect } from "react-router";

import SampleClassGraphCard from "./GraphCard/SampleClassGraphCard";
import SampleClassPieChart from "./GraphCard/SampleClassPieChart";

import SummaryTotal from "./SummaryTotal/SummaryTotal";
import ResultsCard from "./ResultsCard/ResultsCard";
import ActivityBubble from "./Graphs/ActivityBubble";
import ActivityByDay from "./Graphs/ActivityByDay";
import ActivityTotalsGraphs from "./Graphs/ActivityTotalsGraphs";
import ActivityTypeBreakdown from "./Graphs/ActivityTypeBreakdown";
import ActivityTeamBreakdown from "./Graphs/ActivityTeamBreakdown";

//Reports
import ActivityCard from '../Activity/ActivityCard.jsx';


import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

import Util from "../Util/Util";
import TeamResultsModal from './ResultsCard/TeamResultsModal';

class Dashboard extends React.Component {
    state = {
        loadingFlag: false,
        openTeamResults: false,
        activities: [],
        myActivities: [],
        nbrActivities: 0,
        distanceTotal: 0,
        durationTotal: 0
    }

    activeListener = undefined;
    totals = {};
    activitiesUpdated = false;

    componentDidMount() {
        this._mounted = true;
        this.setState({loadingFlag: true });

        let allDBRefs = Util.getDBRefs();
        const dbActivitiesRef = allDBRefs.dbActivitiesRef;

        let ref = dbActivitiesRef
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
                        distanceTotal += activity.distance;
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
                    // console.log(`Changed Activity: ${change.doc.id}`);
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
                            ? (oldActivity.distance)
                            : (oldActivity.distance);
                        let newDistanceInMiles =  (activity.distanceUnits && activity.distanceUnits === "Yards")
                            ? (activity.distance)
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
                    // console.log(`Removed Activity: ${change.doc.id}`);
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
                            distanceTotal -= activity.distance;
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
            // console.log(`Detached listener`);
        }
    }

    handleClickTeamResults() {
        if (this._mounted) {
            this.setState({ openTeamResults: true });
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

        let newUserResults = [];
        let newTeamResults = [];

        let userResults = [];
        let teamResults = [];

        let activities = this.state.activities;
        
        // loop through array counting by team
        for (let i = 0; i < activities.length; i++) {
            // get resulsts
            newUserResults = this.calulateUserResults(userResults, activities[i]);
            newTeamResults = this.calulateTeamResults(teamResults, activities[i]);

            // Add everything for totals
            newTotals.nbrActivities += 1;
            newTotals.distanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
            newTotals.durationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
            switch(activities[i].activityType) {
                case "Swim":
                    newTotals.swimNbrActivities += 1;
                    newTotals.swimDistanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
                    newTotals.swimPointsTotal = newTotals.swimDistanceTotal * 10;
                    newTotals.swimDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                    break;
                case "Bike":                            
                    newTotals.bikeNbrActivities += 1;
                    newTotals.bikeDistanceTotal += activities[i].distance;
                    newTotals.bikePointsTotal = newTotals.bikeDistanceTotal;
                    newTotals.bikeDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                    break;
                case "Run":
                    newTotals.runNbrActivities += 1;
                    newTotals.runDistanceTotal += activities[i].distance;
                    newTotals.runPointsTotal += newTotals.runDistanceTotal * 3;
                    newTotals.runDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                    break;
                default:
                    // NADA
            }

            // only add for this team
            if (this.props.user.teamUid === activities[i].teamUid) {
                newTeamTotals.nbrActivities += 1;
                newTeamTotals.distanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
                newTeamTotals.durationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                switch(activities[i].activityType) {
                    case "Swim":
                        newTeamTotals.swimNbrActivities += 1;
                        newTeamTotals.swimDistanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
                        newTeamTotals.swimPointsTotal = newTeamTotals.swimDistanceTotal * 10;
                        newTeamTotals.swimDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                        break;
                    case "Bike":                            
                        newTeamTotals.bikeNbrActivities += 1;
                        newTeamTotals.bikeDistanceTotal += activities[i].distance;
                        newTeamTotals.bikePointsTotal = newTeamTotals.bikeDistanceTotal;
                        newTeamTotals.bikeDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                        break;
                    case "Run":
                        newTeamTotals.runNbrActivities += 1;
                        newTeamTotals.runDistanceTotal += activities[i].distance;
                        newTeamTotals.runPointsTotal = newTeamTotals.runDistanceTotal * 3;
                        newTeamTotals.runDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
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
                        newUserTotals.swimDistanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
                        newTeamTotals.swimPointsTotal = newUserTotals.swimDistanceTotal * 10;
                        newUserTotals.swimDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                        break;
                    case "Bike":                            
                        newUserTotals.bikeNbrActivities += 1;
                        newUserTotals.bikeDistanceTotal += activities[i].distance;
                        newTeamTotals.bikePointsTotal = newUserTotals.bikeDistanceTotal;
                        newUserTotals.bikeDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                        break;
                    case "Run":
                        newUserTotals.runNbrActivities += 1;
                        newUserTotals.runDistanceTotal += activities[i].distance;
                        newTeamTotals.runPointsTotal = newUserTotals.runDistanceTotal * 3;
                        newUserTotals.runDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                        break;
                    default:
                        // NADA
                }     
            }
        }

        // Sort the team and user results based on total points DESC          
        newUserResults.sort((a,b) => {
            const totalA = a.pointsTotal;
            const totalB = b.pointsTotal;

            let comparison = 0;
            if (totalA > totalB) {
            comparison = 1;
            } else if (totalA < totalB) {
            comparison = -1;
            }
            return comparison * -1;  // Invert so it will sort in descending order
        });
        newTeamResults.sort((a,b) => {
            const totalA = a.pointsTotal;
            const totalB = b.pointsTotal;

            let comparison = 0;
            if (totalA > totalB) {
            comparison = 1;
            } else if (totalA < totalB) {
            comparison = -1;
            }
            return comparison * -1;  // Invert so it will sort in descending order
        });

        let totalsAndResults = {all: newTotals, team : newTeamTotals, user : newUserTotals, userR : newUserResults, teamR : newTeamResults};
        // console.log(`User Results User: ${JSON.stringify(newUserResults, null, 2)}`);
        // console.log(`Team Results Team: ${JSON.stringify(newTeamResults, null, 2)}`);

        return(totalsAndResults);
    }

    // Calculate Current results/standings for each user
    calulateUserResults(userResults, activity) {
        let newUserResult =
        {
            userOrTeamUid: null,
            userOrTeamName: "",
            isThisMine: false,
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
            runDurationTotal: 0,
            teamName: "",
            teamRecord: false
        }

        let idx = userResults.findIndex( (uResult) => { 
            const isFound = uResult.userOrTeamUid === activity.uid;
            return isFound;
        });

        if (idx > -1) {       // Found, results for this oone so add to it
            newUserResult = userResults[idx];

            newUserResult.isThisMine = activity.uid === this.props.user.uid ? true : false;

            const distanceInMiles = activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
            newUserResult.distanceTotal +=  distanceInMiles;
            newUserResult.durationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration ;  
            
            switch(activity.activityType) {
                case "Swim":
                    newUserResult.pointsTotal +=  distanceInMiles * 10;
                    
                    newUserResult.swimNbrActivities += 1;
                    newUserResult.swimDistanceTotal += activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
                    newUserResult.swimDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.swimPointsTotal =  newUserResult.swimDistanceTotal * 10;
                    break;
                case "Bike":                            
                    newUserResult.pointsTotal +=  distanceInMiles;
                    
                    newUserResult.bikeNbrActivities += 1;
                    newUserResult.bikeDistanceTotal += activity.distance;
                    newUserResult.bikeDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;
                    
                    newUserResult.bikePointsTotal = newUserResult.bikeDistanceTotal;
                    break;
                case "Run":
                    newUserResult.pointsTotal +=  distanceInMiles * 3;
                    
                    newUserResult.runNbrActivities += 1;
                    newUserResult.runDistanceTotal += activity.distance;
                    newUserResult.runDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.runPointsTotal = newUserResult.runDistanceTotal *3 ;
                    break;
                default:
                    // NADA
            }
            userResults[idx] = newUserResult;

        } else {              // Didnt find results for this oone so push it
            newUserResult.isThisMine = activity.uid === this.props.user.uid ? true : false;
            newUserResult.userOrTeamUid = activity.uid;
            newUserResult.userOrTeamName = activity.displayName;
            newUserResult.teamName = activity.teamName;
            newUserResult.teamRecord = false;

            const distanceInMiles = activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
            newUserResult.distanceTotal +=  distanceInMiles;
            newUserResult.durationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration ;  
            
            switch(activity.activityType) {
                case "Swim":
                    newUserResult.pointsTotal +=  distanceInMiles * 10;
                    
                    newUserResult.swimNbrActivities += 1;
                    newUserResult.swimDistanceTotal += activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
                    newUserResult.swimDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.swimPointsTotal =  newUserResult.swimDistanceTotal * 10;
                    break;
                case "Bike":                            
                    newUserResult.pointsTotal +=  distanceInMiles;
                    
                    newUserResult.bikeNbrActivities += 1;
                    newUserResult.bikeDistanceTotal += activity.distance;
                    newUserResult.bikeDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;
                    
                    newUserResult.bikePointsTotal = newUserResult.bikeDistanceTotal;
                    break;
                case "Run":
                    newUserResult.pointsTotal +=  distanceInMiles * 3;
                    
                    newUserResult.runNbrActivities += 1;
                    newUserResult.runDistanceTotal += activity.distance;
                    newUserResult.runDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.runPointsTotal =  newUserResult.runDistanceTotal * 3;
                    break;
                default:
                    // NADA
            }
            userResults.push(newUserResult);
        }

        let newResults = userResults;
        return(newResults);
    }
    // End calulateUserResults
    
    // Calculate Current results/standings for each team
    calulateTeamResults(teamResults, activity) {
        let newTeamResult =
        {
            userOrTeamUid: null,
            userOrTeamName: "",
            isThisMine: false,
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
            runDurationTotal: 0,
            teamName: "",
            teamRecord: true
        }        

        let idx = teamResults.findIndex( (uResult) => { 
            const isFound = uResult.userOrTeamUid === activity.teamUid;
            return isFound;
        });

        if (idx > -1) {       // Found, results for this oone so add to it
            // console.log(`found team: ${teamResults[idx].userOrTeamName} at idx: ${idx}`)
            newTeamResult = teamResults[idx];

            newTeamResult.isThisMine = activity.teamUid === this.props.user.teamUid ? true : false;

            const distanceInMiles = activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
            newTeamResult.distanceTotal +=  distanceInMiles;
            newTeamResult.durationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration ;  
            
            switch(activity.activityType) {
                case "Swim":
                    newTeamResult.pointsTotal +=  distanceInMiles * 10;
                    
                    newTeamResult.swimNbrActivities += 1;
                    newTeamResult.swimDistanceTotal += activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
                    newTeamResult.swimDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newTeamResult.swimPointsTotal =  newTeamResult.swimDistanceTotal * 10;
                    break;
                case "Bike":                            
                    newTeamResult.pointsTotal +=  distanceInMiles;
                    
                    newTeamResult.bikeNbrActivities += 1;
                    newTeamResult.bikeDistanceTotal += activity.distance;
                    newTeamResult.bikeDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;
                    
                    newTeamResult.bikePointsTotal =  newTeamResult.bikeDistanceTotal;
                    break;
                case "Run":
                    newTeamResult.pointsTotal +=  distanceInMiles * 3;
                    
                    newTeamResult.runNbrActivities += 1;
                    newTeamResult.runDistanceTotal += activity.distance;
                    newTeamResult.runDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newTeamResult.runPointsTotal = newTeamResult.runDistanceTotal * 3;
                    break;
                default:
                    // NADA
            }
            teamResults[idx] = newTeamResult;

        } else {              // Didnt find results for this oone so push it

            newTeamResult.isThisMine = activity.teamUid === this.props.user.teamUid ? true : false;
            newTeamResult.userOrTeamUid = activity.teamUid;
            newTeamResult.userOrTeamName = activity.teamName;
            newTeamResult.teamName = activity.teamName;
            newTeamResult.teamRecord = true;
            
            const distanceInMiles = activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
            newTeamResult.distanceTotal +=  distanceInMiles;
            newTeamResult.durationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration ;  
            
            switch(activity.activityType) {
                case "Swim":
                    newTeamResult.pointsTotal +=  distanceInMiles * 10;
                    
                    newTeamResult.swimNbrActivities += 1;
                    newTeamResult.swimDistanceTotal += activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
                    newTeamResult.swimDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newTeamResult.swimPointsTotal = newTeamResult.swimDistanceTotal * 10;
                    break;
                case "Bike":                            
                    newTeamResult.pointsTotal +=  distanceInMiles;
                    
                    newTeamResult.bikeNbrActivities += 1;
                    newTeamResult.bikeDistanceTotal += activity.distance;
                    newTeamResult.bikeDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;
                    
                    newTeamResult.bikePointsTotal =  newTeamResult.bikeDistanceTotal;
                    break;
                case "Run":
                    newTeamResult.pointsTotal +=  distanceInMiles *3;
                    
                    newTeamResult.runNbrActivities += 1;
                    newTeamResult.runDistanceTotal += activity.distance;
                    newTeamResult.runDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newTeamResult.runPointsTotal +=  newTeamResult.runDistanceTotal * 3;
                    break;
                default:
                    // NADA
            }
            teamResults.push(newTeamResult);
        }

        let newResults = teamResults;
        return(newResults);
    }
    // End calulateTeamResults

    async myActivitiesFilter() {
        const activities = this.state.activities;
        let myActivities = [];

        myActivities = activities.filter (activity => {
            if (activity.uid === this.props.user.uid) {
                return activity;
            }
        });
        this.setState({myActivities: myActivities});
    }

    render() {
        // Some props take time to get ready so return null when uid not avaialble
        if (this.props.user.uid === null || this.props.user.teamUid === null) {
            return null;
        }
        
        // if the listener updated the state
        if (this.activitiesUpdated) {
            this.totals = this.calculateTotalsForTeamAndUser();
            this.myActivitiesFilter(); 
            this.activitiesUpdated = false;
        }

        // Some need to catch up for some reason - I had to refresh browser after going to activities page
        if (!this.totals || !this.totals.userR || !this.totals.teamR) {
            return null;
        }

        let activities = this.state.activities;
        let myActivities = this.state.myActivities;

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

        const activityBreakdownTitleRow = 
        <Box className="row" fontStyle="oblique" fontWeight="fontWeightBold" marginTop={1}>
            <div className="col s9 m9">Activity Type Breakdown</div>
            <div className="col s2 offset-s1 m2 offset-m1">
                <Tooltip title="Show Activities">
                    <Link to={{
                        pathname: "/activities",
                        state: {filterByString: "Mine"}
                        }}>
                        <i style={{cursor: 'pointer', marginTop: 1, marginRight: 1}}
                            className="material-icons indigo-text text-darken-4">launch
                        </i>{" "}
                    </Link>
                </Tooltip>
            </div>
        </Box>

        // header row for results
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
                
        const activityTitleRow = 
            <Box className="row" fontStyle="oblique" fontWeight="fontWeightBold" marginTop={1}>
                <Link className="col s9 m9" to={{
                    pathname: "/activities",
                    state: {
                        filterByString: "Mine"
                    }
                    }}>Latest Activities ({"Mine"}) : {this.props.user.displayName} 
                </Link>
                <div className="col s2 offset-s1 m2 offset-m1">
                    <Tooltip title="Add Activity">
                        <Link  to="/activityform">
                            <i style={{cursor: 'pointer', marginTop: 1, marginRight: 1}}
                                className="material-icons indigo-text text-darken-4">add
                            </i>{" "}
                        </Link>
                    </Tooltip>
                    <Tooltip title="Show Activities">
                        <Link to={{
                            pathname: "/activities",
                            state: {filterByString: "Mine"}
                            }}>
                            <i style={{cursor: 'pointer', marginTop: 1, marginRight: 1}}
                                className="material-icons indigo-text text-darken-4">launch
                            </i>{" "}
                        </Link>
                    </Tooltip>
                </div>
            </Box>

        const activityCardHeaderRow = 
            <Box className="row"  fontStyle="oblique" bgcolor={"white"} fontWeight="fontWeightBold" border={1} margin={0} padding={0}>
                <div className="col s1 m1">
                </div>
                <div className="col s4 m4 truncate">
                    Name
                </div>
                <div className="black-text col m2 m2 truncate">
                    Date
                </div>
                <div className="blue-text col s2 offset-s1 m2 offset-m1 truncate">
                    Time
                </div>
                <div className="red-text col s2 m2 fontWeight=fontWeightBold truncate">
                    Distance
                </div>
            </Box>
        
        if (this.props.user.authUser) {
            return (
                <div>
                    <TeamResultsModal id="TeamResultsModal" open={this.state.openTeamResults} teamTotals={this.totals.teamR} userTotals={this.totals.userR}/>

                    {this.state.loadingFlag ?
                        <Grid container justify="center">
                            <CircularProgress /> <p>Loading ...</p>
                        </Grid>
                        :
                        <div className="container">
                            {/*  OVERALL standings by user and TEAM */}
                            <div className="row">                 
                                {/* Team standings/results card */}
                                <div className="col s12 m6" margin={2}>
                                    <Box className="grey lighten-3" padding={2} margin={0} borderRadius={8} boxShadow={4}>
                                        {leaderboardTitleRow}
                                        <Box className="white" margin={2} paddingLeft={1} paddingRight={1}> 
                                            {leaderBoardHeaderRow}
                                            {this.totals.teamR.map((teamResult, index) => {
                                                return (
                                                    <div key={index}>
                                                        <ResultsCard result={teamResult} index={index} onlyTeams={true}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </Box>
                                    </Box>
                                </div>
                                {/* End Team standings/results card */}          
                         
                                {/* User standings/results card */}
                                <div className="col s12 m6" margin={2}>
                                    <Box className="grey lighten-3" padding={2} margin={0} borderRadius={8} boxShadow={4}>
                                        {leaderboardTitleRow}
                                        <Box className="white" margin={2} paddingLeft={1} paddingRight={1}> 
                                        {leaderBoardHeaderRow}
                                            {this.totals.userR.map((userResult, index) => {
                                                return (
                                                    (index > 14) ?
                                                    ""
                                                    :
                                                    <div key={index}>
                                                        <ResultsCard result={userResult} index={index}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </Box>
                                    </Box>
                                </div>
                                {/* End User standings/results card */}
                            </div>
                            {/*  END OVERALL standings by user and TEAM */}

                            {/* Breakdowns */}
                            <div className="row">
                                <div className="col s12 m4">
                                    <Box className="grey lighten-3" padding={1} margin={0} borderRadius={8} boxShadow={4}>
                                        {activityBreakdownTitleRow}
                                        <ActivityTypeBreakdown
                                            title={`All Athletes`}
                                            currentTotalsShare={this.totals.all}
                                        />
                                    </Box>
                                </div>
                                <div className="col s12 m4">
                                    <Box className="grey lighten-3" padding={1} margin={0} borderRadius={8} boxShadow={4}>
                                        {activityBreakdownTitleRow}
                                        <ActivityTypeBreakdown
                                            title={`${this.props.user.displayName}`}
                                            currentTotalsShare={this.totals.user}
                                        />
                                    </Box>
                                </div>   
                                <div className="col s12 m4" margin={2}>
                                    <Box className="grey lighten-3" padding={1} margin={0} borderRadius={8} boxShadow={4}>
                                        {activityBreakdownTitleRow}
                                        <ActivityTypeBreakdown
                                            title={`Team ${this.props.user.teamName}`}
                                            currentTotalsShare={this.totals.team}
                                        />
                                    </Box>
                                </div>   
                            </div>
                            {/* End Breakdowns */}

                            {/* My Activities and heatmap */}
                            <div className="row">
                                <div className="col s12 m6" margin={2}>
                                    <Box className="grey lighten-3" padding={2} margin={0} borderRadius={8} boxShadow={4}>
                                        {activityTitleRow}
                                        <Box className="white" margin={2} paddingLeft={1} paddingRight={1}> 
                                            {activityCardHeaderRow}
                                            {myActivities.map((activity, index) => {                                         
                                                return (
                                                    (index > 14) ?
                                                    ""
                                                    :
                                                    <ActivityCard
                                                    key={activity.id} activity={activity} index={index}
                                                    />
                                                )                                          
                                            })} 
                                        </Box>
                                    </Box>
                                </div>
                                <div className="col s12 m6" margin={2}>
                                    <Box className="grey lighten-3" padding={1} margin={0} borderRadius={8} boxShadow={4}>
                                        <Box className="white" margin={2} paddingLeft={0} paddingRight={0}> 
                                            <ActivityBubble
                                                title={"Heatmap (All Athletes)"}
                                                activities={this.state.activities}
                                            />
                                        </Box>
                                    </Box>
                                </div>
                            </div>
                             {/* END Activities by day and heatmap */}

                            {/* All User Totals Cards Stack Bar Graphs - Activities etc*/}
                            <div className="row">
                                <div className="col s12 m4">
                                    <ActivityTotalsGraphs
                                        title={`All Totals (Adjusted)`}
                                        currentTotalsShare={this.totals.all}  graphType="All"
                                        />
                                </div>                            
                                <div className="col s12 m4">
                                    <ActivityTotalsGraphs
                                        title={`${this.props.user.displayName} (Adjusted)`}
                                        currentTotalsShare={this.totals.user} graphType="User"
                                    />
                                </div>                            
                                <div className="col s12 m4">
                                    <ActivityTotalsGraphs
                                        title={`${this.props.user.teamName} (Adjusted)`}
                                        currentTotalsShare={this.totals.team}  graphType="Team"
                                    />
                                </div>                            
                            </div>
                            {/* End All User Totals Cards Stack Bar Graphs - Activities etc*/}

                            {/*  Activities  by day*/}
                            <div className="row">
                                <div className="col s12 m6">
                                    <ActivityByDay
                                    title={"Activity By Day"}
                                    activities={this.state.activities}
                                    />
                                </div>                            
                            </div>
                            {/* END Current User"s Activities */}

                            {/* Sumary Display */}
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
                            {/* END Sumary Display */}

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