import * as admin from 'firebase-admin';
import { APP_CONFIG } from "./FirebaseEnvironment";

import Activity from "./interfaces/Activity";
import Result from "./interfaces/Result";
import Challenge from "./interfaces/Challenge";

// type ClientResult = {
//     refresh_token: string;
//     access_token: string;
// };

type AllResults = {
    overallResults: Result,
    teamResults: Array<Result>,
    userResults: Array<Result>
};

class Leaderboard {
    private static isRunning: boolean = false;
    private static overallResults: Result = new Result();
    private static teamResults: Array<Result> = [];
    private static userResults: Array<Result> = [];
    private static challenge:Challenge = new Challenge("5XuThS03PcQQ1IasPQif");

    public calculateLeaderboards() {
        console.log("calculateLeaderboards() started ...");
        return new Promise<any>((resolve:any, reject:any) => {

            if (!Leaderboard.isRunning) {
                Leaderboard.isRunning = true;
                console.log("calculateLeaderboards() running ...");
                // get All Activities for challenge
                const dbActivitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(Leaderboard.challenge.id).collection(`activities`);
                dbActivitiesRef.get().then((querySnapshot) => {
                    const activities = Array<Activity>();
                    querySnapshot.forEach(doc => {
                        const docData:FirebaseFirestore.DocumentData = doc.data();
                        docData.id = doc.id;
                        docData.activityDateTime = docData.activityDateTime.toDate();
                        const activity:Activity = docData as Activity;
                        activities.push(activity);
                    });
                    console.log(`Nbr of Activities: ${activities.length}`);
                    const results = this.totals(Leaderboard.challenge, activities);
                    Leaderboard.overallResults = results.overallResults;
                    Leaderboard.userResults = results.teamResults;
                    Leaderboard.teamResults = results.teamResults;
            
                    console.log(`Overall Results: ${JSON.stringify(Leaderboard.overallResults, null, 2)}`);
                    console.log(`Nbr Team Results: ${Leaderboard.userResults.length}`);
                    console.log(`Nbr User Results: ${Leaderboard.teamResults.length}`);
        
                    Leaderboard.isRunning = false;
                    resolve();
                }).catch((err: Error) => {
                    const error = new Error(`Error retrieving activities for challenge ${Leaderboard.challenge.id} -- ${err} : "Leaderboard.ts", 51`);
                    console.error(error);
                    Leaderboard.isRunning = false;
                    reject(error);
                });
            } else {
                console.log("calculateLeaderboards() already running -- so not started ...");
                resolve();
            }
        }); // Promise
    }

    private totals(challenge: Challenge, activities:Array<Activity>): AllResults {
        // console.log("totals() started ...");
        let overallResults = new Result();
        let userResults: Array<Result> = Array<Result>();
        let teamResults: Array<Result> = Array<Result>();
    
        // loop through array counting by team
        // for (let i = 0; i < activities.length; i++) {
        for (const activity of activities) {
            // get resulsts
            overallResults = this.calulateOverallResults(challenge, overallResults, activity);
            teamResults = this.calulateTeamResults(challenge, teamResults, activity);
            userResults = this.calulateUserResults(challenge, userResults, activity);
        }
    
        // Sort the team and user results based on total points DESC          
        userResults.sort((a:Result, b:Result) => {
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
    
        teamResults.sort((a:Result, b:Result) => {
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
    
        const allResults: AllResults = { overallResults, teamResults, userResults };
    
        return (allResults);
    }    

    private calulateOverallResults(challenge: Challenge, result:Result, activity:Activity): Result {
        // console.log("totals() started ...");
    
        let newResult = result;
        newResult.overalRecord = true;
    
        newResult = this.computeRecordTotals(challenge, newResult, activity);
    
        return (newResult);
    }    
    // Calculate team results
    private calulateTeamResults(challenge:Challenge, results:Array<Result>, activity:Activity): Array<Result> {
        // console.log("calulateUserResults() started ...");

        let newResult: Result = new Result();
        const idx = results.findIndex((result:Result) => {
            const foundIdx = result.teamUid === activity.teamUid;
            return foundIdx;
        });

        if (idx > -1) {       // Found, results for this oone so add to it
            newResult = results[idx];
        }
        // Record Type Info
        newResult.teamRecord = true;
        newResult.teamUid = activity.teamUid;
        newResult.teamName = activity.teamName;

        newResult = this.computeRecordTotals(challenge, newResult, activity);

        // Updated the array of users results - each user has a record
        const newResultsArray = results;
        if (idx > -1) {       // Found, results for this oone so add to it
            newResultsArray[idx] = newResult;
        } else {
            newResultsArray.push(newResult);
        }

        return (newResultsArray);
    }
    // Calculate user results
    private calulateUserResults(challenge:Challenge, results:Array<Result>, activity:Activity): Array<Result> {
        // console.log("calulateUserResults() started ...");

        let newResult: Result = new Result();
        const idx = results.findIndex((result:Result) => {
            const foundIdx = result.uid === activity.uid;
            return foundIdx;
        });

        if (idx > -1) {       // Found, results for this oone so add to it
            newResult = results[idx];
        }
        // Record Type Info
        newResult.userRecord = true;
        newResult.uid = activity.uid;
        newResult.displayName = activity.displayName;

        newResult = this.computeRecordTotals(challenge, newResult, activity);

        // Updated the array of users results - each user has a record
        const newResultsArray = results;
        if (idx > -1) {       // Found, results for this oone so add to it
            newResultsArray[idx] = newResult;
        } else {
            newResultsArray.push(newResult);
        }

        return (newResultsArray);
    }

    private computeRecordTotals(challenge:Challenge, newResult:Result, activity:Activity):Result {
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

    public calulateNewResults(challenge:Challenge, activity:Activity):any {
        console.log(`previous nbr: ${Leaderboard.overallResults.nbrActivities}`);
        console.log(`previous distance: ${Leaderboard.overallResults.distanceTotal}`);
        console.log(`previous pointsTotal: ${Leaderboard.overallResults.pointsTotal}`);
        console.log(`previous durationTotal: ${Leaderboard.overallResults.durationTotal}`);
    
        const overallResults = this.calulateOverallResults(challenge, Leaderboard.overallResults, activity);
        Leaderboard.overallResults = overallResults;
        // teamResults = calulateTeamResults(challenge, g_teamResults, activity);
        // userResults = calulateUserResults(challenge, g_userResults, activity);
    
        console.log(`new nbr: ${Leaderboard.overallResults.nbrActivities}`);
        console.log(`new distance: ${Leaderboard.overallResults.distanceTotal}`);
        console.log(`new pointsTotal: ${Leaderboard.overallResults.pointsTotal}`);
        console.log(`new durationTotal: ${Leaderboard.overallResults.durationTotal}`);
    }

    public getResults(challenge:Challenge, activity:Activity):AllResults {
        const overallResults = Leaderboard.overallResults;
        const teamResults = Leaderboard.teamResults;
        const userResults = Leaderboard.userResults;

        return ({overallResults, teamResults, userResults});
    }

}//class

export { Leaderboard }