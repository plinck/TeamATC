import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { APP_CONFIG } from "./FirebaseEnvironment";

import { Activity } from "./interfaces/Activity";
import { Result } from "./interfaces/Result";
import { AllResults } from "./Interfaces/Result.Types";
import { Challenge } from "./interfaces/Challenge";

class Leaderboard {
    private static firstoreListenerRunning: boolean = false;
    private static isRunning: boolean = false;
    private static overallResults: Result = new Result();
    private static teamResults: Array<Result> = [];
    private static userResults: Array<Result> = [];
    private static challenge:Challenge = new Challenge("5XuThS03PcQQ1IasPQif");

    public calculateLeaderboards() {
        console.log("Leaderboard.calculateLeaderboards() started ...");
        return new Promise<any>((resolve:any, reject:any) => {

            if (!Leaderboard.isRunning) {
                Leaderboard.isRunning = true;
                console.log("Leaderboard.calculateLeaderboards() running ...");
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
            
                    console.log(`Nbr Overall Activities: ${Leaderboard.overallResults.nbrActivities}`);
                    console.log(`Nbr Team Results: ${Leaderboard.userResults.length}`);
                    console.log(`Nbr User Results: ${Leaderboard.teamResults.length}`);

                    console.log(`Saving all results to challenge ${results.challengeUid}`);
                    this.saveResults(results).then (() => {
                        console.log(`Saved all results to challenge ${results.challengeUid}`);
                        Leaderboard.isRunning = false;
                        resolve();
                    }).catch ((err1: Error) => {
                        const error = new Error(`Error saving results for challenge ${Leaderboard.challenge.id} -- ${err1} : "Leaderboard.ts", line: 50`);
                        console.error(error);
                        Leaderboard.isRunning = false;  
                        reject(error);  
                    });
                }).catch((err: Error) => {
                    console.error(err);
                    Leaderboard.isRunning = false;
                    reject(err);
                });
            } else {
                console.log("Leaderboard.calculateLeaderboards() already running -- so not started ...");
                resolve();
            }
        }); // Promise
    }

    private saveResults(allResults:AllResults) {
        return new Promise<any>((resolve:any, reject:any) => {
            const dbResultsRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("results");
            // must convert all results to regualr json object or firestore gives errors
            dbResultsRef.doc(allResults.challengeUid).set(JSON.parse(JSON.stringify(allResults))).then (() => {
                resolve();
            }).catch (err => {
                const error = new Error(`Error saving results for challenge ${allResults.challengeUid} -- ${err} : "Leaderboard.ts", line: 73`);
                console.error(error);
                reject(error);
            });
        });//promsie
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
    
        const allResults: AllResults = {challengeUid: challenge.id, overallResults, teamResults, userResults};
    
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
        // Assign the challnge to make sure totals apply to correct one
        newResult.challengeUid = challenge.id;

        return newResult;
    }    

    public calulateNewResults(challenge:Challenge, activity:Activity):any {
        if (!Leaderboard.isRunning) {
            if (Leaderboard.overallResults.challengeUid === challenge.id) {
                console.log(`previous challengeUid: ${Leaderboard.overallResults.challengeUid}`);
                console.log(`previous nbr: ${Leaderboard.overallResults.nbrActivities}`);
                console.log(`previous distance: ${Leaderboard.overallResults.distanceTotal}`);
                console.log(`previous pointsTotal: ${Leaderboard.overallResults.pointsTotal}`);
                console.log(`previous durationTotal: ${Leaderboard.overallResults.durationTotal}`);
            
                const overallResults = this.calulateOverallResults(challenge, Leaderboard.overallResults, activity);
                Leaderboard.overallResults = overallResults;
                // teamResults = calulateTeamResults(challenge, g_teamResults, activity);
                // userResults = calulateUserResults(challenge, g_userResults, activity);
            
                console.log(`new challengeUid: ${Leaderboard.overallResults.challengeUid}`);
                console.log(`new nbr: ${Leaderboard.overallResults.nbrActivities}`);
                console.log(`new distance: ${Leaderboard.overallResults.distanceTotal}`);
                console.log(`new pointsTotal: ${Leaderboard.overallResults.pointsTotal}`);
                console.log(`new durationTotal: ${Leaderboard.overallResults.durationTotal}`);
            } else {
                const error = new Error(`Leaderboard challenge is: ${Leaderboard.overallResults.challengeUid}, passed challenge is ${challenge.id}, refetching from DB. "file: Leaderboard.ts", line: 265`);
                console.error(error);
                }
        } else {
            const error = new Error(`Leaderboard.isRunning--cant update totals--check if added "file: Leaderboard.ts", line: 261`);
            console.error(error);
        }
    }

    public static getResults(challenge:Challenge):AllResults {
        // only get resukts if challenge matches
        if (Leaderboard.overallResults.challengeUid === challenge.id) {
            console.log(`passed challenge.id: ${challenge.id}`);
            console.log(`challengeUid: ${Leaderboard.overallResults.challengeUid}`);

            const overallResults = Leaderboard.overallResults;
            const teamResults = Leaderboard.teamResults;
            const userResults = Leaderboard.userResults;

            return ({challengeUid: overallResults.challengeUid, overallResults, teamResults, userResults});
        } else {
            const error = new Error(`Leaderboard challenge is: ${Leaderboard.overallResults.challengeUid}, passed challenge is ${challenge.id}, refetching from DB. "file: Leaderboard.ts", line: 286`);
            console.error(error);

            const overallResults = new Result();
            const teamResults = new Array<Result>();
            const userResults = new Array<Result>();

            return ({challengeUid: challenge.id, overallResults, teamResults, userResults});
        }
    }

    public static listenForActivityUpdates(challenge:Challenge):any {

        return new Promise<any>((resolve:any, reject:any) => {
            let challengeUid: string;
            if (challenge.id) {
                challengeUid = challenge.id;
            } else {
                reject(`Error listening for activities - no challenge provided, Leaderboard.ts, line: 307`);
            }
            // if (!Leaderboard.firstoreListenerRunning) {
                Leaderboard.firstoreListenerRunning = true;
                console.log(`firing onCreate Listener ${Leaderboard.firstoreListenerRunning}`);
                functions.firestore.document(`${APP_CONFIG.ORG}/${APP_CONFIG.ENV}/challenges/${challengeUid}/activities/{activityId}`)
                    .onCreate((doc: functions.firestore.DocumentSnapshot, context: functions.EventContext):any => {
                        // Get an object representing the document
                        // e.g. {'name': 'Marie', 'age': 66}
                        const docData:FirebaseFirestore.DocumentData = doc.data();
                        docData.id = doc.id;
                        docData.activityDateTime = docData.activityDateTime.toDate();
                        const newActivity:Activity = docData as Activity;
                        console.log(`new activity: ${newActivity}`);

                        const leaderboard:Leaderboard = new Leaderboard();
                        const newChallenge = new Challenge(challengeUid);
                        leaderboard.calulateNewResults(newChallenge, newActivity);
                        resolve(true);
                });
            // }
        }); // Promise
    }


}//class

export { Leaderboard }