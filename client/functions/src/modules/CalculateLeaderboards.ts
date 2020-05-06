// Class - CalculateLeaderboards 
// This class goes through the entiure array and calculates all the totals, subtiotals, rtesults
// etc by team and by uuser and by all
// refactor to pull out of dashboard.
import * as admin from 'firebase-admin';

import { APP_CONFIG } from "./FirebaseEnvironment";

const INITIAL_RECORD =
{
    overalRecord: false,
    teamRecord: false,
    teamUid: "",
    teamName: "",
    userRecord: false,
    uid: "",
    displayName: "",
    distanceTotal: 0,
    pointsTotal: 0,
    durationTotal: 0,
    nbrActivities: 0,
    swimDistanceTotal: 0,
    swimPointsTotal: 0,
    swimNbrActivities: 0,
    swimDurationTotal: 0,
    bikeDistanceTotal: 0,
    bikePointsTotal: 0,
    bikeNbrActivities: 0,
    bikeDurationTotal: 0,
    runDistanceTotal: 0,
    runPointsTotal: 0,
    runNbrActivities: 0,
    runDurationTotal: 0,
    otherDistanceTotal: 0,
    otherPointsTotal: 0,
    otherNbrActivities: 0,
    otherDurationTotal: 0,
}
let g_isRunning = undefined;
let g_overallResults = {...INITIAL_RECORD};
let g_userResults = [];
let g_teamResults = [];
const g_challenge = {
    id : "5XuThS03PcQQ1IasPQif",
}

const calculateLeaderboards = async () => {
    console.log("calculateLeaderboards() started ...");

    if (!g_isRunning) {
        g_isRunning = true;
        console.log("calculateLeaderboards() running ...");
        // get All Activities for challenge
        const dbActivitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(g_challenge.id).collection(`activities`);
        dbActivitiesRef.get().then((querySnapshot) => {
            let activities = [];
            querySnapshot.forEach(doc => {
                let activity = {};
                activity = doc.data();
                activity.id = doc.id;
                activity.activityDateTime = activity
                    .activityDateTime
                    .toDate();
                activities.push(activity);
            });
            console.log(`Nbr of Activities: ${activities.length}`);
            const results = totals(g_challenge, activities);
            g_overallResults = results.overallResults;
            g_userResults = results.teamResults;
            g_teamResults = results.teamResults;
    
            console.log(`Overall Results: ${JSON.stringify(g_overallResults, null, 2)}`);
            console.log(`Nbr Team Results: ${g_userResults.length}`);
            console.log(`Nbr User Results: ${g_teamResults.length}`);

            g_isRunning = false;
            //resolve(activities);
        }).catch((err) => {
            console.error(`Cant retrieve activities for challenge ${g_challenge.id}, ${err}`);
            g_isRunning = false;
            //reject(`Cant retrieve activities for challenge ${g_challenge.id}, ${err}`);
        });
    } else {
        console.log("calculateLeaderboards() already running -- so not started ...");
    }
}

const totals = (challenge, activities) => {
    // console.log("totals() started ...");
    let overallResults = {...INITIAL_RECORD};
    let userResults = [];
    let teamResults = [];

    // loop through array counting by team
    for (let i = 0; i < activities.length; i++) {
        // get resulsts
        overallResults = calulateOverallResults(challenge, overallResults, activities[i]);
        teamResults = calulateTeamResults(challenge, teamResults, activities[i]);
        userResults = calulateUserResults(challenge, userResults, activities[i]);
    }

    // Sort the team and user results based on total points DESC          
    userResults.sort((a, b) => {
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

    teamResults.sort((a, b) => {
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

    let allResults = { overallResults, teamResults, userResults };
    // console.log(`All Results: ${JSON.stringify(allResults, null, 2)}`);

    return (allResults);
}

// Calculate overall results
const calulateOverallResults = (challenge, result, activity) => {
    // console.log("totals() started ...");

    let newResult = result;
    newResult.overalRecord = true;

    newResult = computeRecordTotals(challenge, newResult, activity);

    return (newResult);
}

// Calculate user results
const calulateUserResults = (challenge, results, activity) => {
    // console.log("calulateUserResults() started ...");

    let newResult = {};
    let idx = results.findIndex((result) => {
        const foundIdx = result.uid === activity.uid;
        return foundIdx;
    });

    if (idx > -1) {       // Found, results for this oone so add to it
        newResult = results[idx];
    } else {
        newResult = {...INITIAL_RECORD};
    }
    // Record Type Info
    newResult.userRecord = true;
    newResult.uid = activity.uid;
    newResult.displayName = activity.displayName;

    newResult = computeRecordTotals(challenge, newResult, activity);

    // Updated the array of users results - each user has a record
    let newResultsArray = results;
    if (idx > -1) {       // Found, results for this oone so add to it
        newResultsArray[idx] = newResult;
    } else {
        newResultsArray.push(newResult);
    }

    return (newResultsArray);
}

// Calculate user results
const calulateTeamResults = (challenge, results, activity) => {
    // console.log("calulateTeamResults() started ...");

    let newResult = {};
    let idx = results.findIndex((result) => {
        const foundIdx = result.teamUid === activity.teamUid;
        return foundIdx;
    });

    if (idx > -1) {       // Found, results for this oone so add to it
        newResult = results[idx];
    } else {
        newResult = {...INITIAL_RECORD};
    }
    // Record Type Info
    newResult.teamRecord = true;
    newResult.teamUid = activity.teamUid;
    newResult.teamName = activity.teamName;

    newResult = computeRecordTotals(challenge, newResult, activity);

    // Updated the array of users results - each user has a record
    let newResultsArray = results;
    if (idx > -1) {       // Found, results for this oone so add to it
        newResultsArray[idx] = newResult;
    } else {
        newResultsArray.push(newResult);
    }

    return (newResultsArray);
}

const computeRecordTotals = (challenge, newResult, activity) => {
    // console.log("computeRecordTotals() started ...");

    const distanceInMiles = activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
    newResult.distanceTotal += distanceInMiles;
    newResult.durationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;
    newResult.nbrActivities += 1;

    switch (activity.activityType) {
        case "Swim":
            newResult.pointsTotal += distanceInMiles * 10;

            newResult.swimNbrActivities += 1;
            newResult.swimDistanceTotal += activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
            newResult.swimPointsTotal = newResult.swimDistanceTotal * 10;
            newResult.swimDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;
            break;
        case "Bike":
            newResult.pointsTotal += distanceInMiles;

            newResult.bikeNbrActivities += 1;
            newResult.bikeDistanceTotal += activity.distance;
            newResult.bikePointsTotal = newResult.bikeDistanceTotal;
            newResult.bikeDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;
            break;
        case "Run":
            newResult.pointsTotal += distanceInMiles * 3;

            newResult.runNbrActivities += 1;
            newResult.runDistanceTotal += activity.distance;
            newResult.runPointsTotal = newResult.runDistanceTotal * 3;
            newResult.runDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;
            break;
        default:
            newResult.pointsTotal += distanceInMiles;

            newResult.otherNbrActivities += 1;
            newResult.otherDistanceTotal += activity.distance;
            newResult.otherPointsTotal = newResult.otherDistanceTotal;
            newResult.otherDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;
            break;
    }
    return newResult;
}

const calulateNewResults = (challenge, activity) => {
    console.log(`previous nbr: ${g_overallResults.nbrActivities}`);
    console.log(`previous distance: ${g_overallResults.distanceTotal}`);
    console.log(`previous pointsTotal: ${g_overallResults.pointsTotal}`);
    console.log(`previous durationTotal: ${g_overallResults.durationTotal}`);

    let overallResults = calulateOverallResults(challenge, g_overallResults, activity);
    g_overallResults = overallResults;
    // teamResults = calulateTeamResults(challenge, g_teamResults, activity);
    // userResults = calulateUserResults(challenge, g_userResults, activity);

    console.log(`new nbr: ${g_overallResults.nbrActivities}`);
    console.log(`new distance: ${g_overallResults.distanceTotal}`);
    console.log(`new pointsTotal: ${g_overallResults.pointsTotal}`);
    console.log(`new durationTotal: ${g_overallResults.durationTotal}`);

}

export { calculateLeaderboards, calulateNewResults };