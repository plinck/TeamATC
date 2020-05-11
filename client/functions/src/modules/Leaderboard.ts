import * as admin from 'firebase-admin';
import { APP_CONFIG } from "./FirebaseEnvironment";

import { Activity } from "./interfaces/Activity";
import { Result } from "./interfaces/Result";
import { AllResults } from "./Interfaces/Result.Types";
import { Challenge } from "./interfaces/Challenge";
import { ResultsDB } from './db/ResultsDB';

class Leaderboard {

    public calculateLeaderboards(challenge: Challenge) {
        return new Promise<any>((resolve:any, reject:any) => {
            console.log("Leaderboard.calculateLeaderboards() started ...");

                console.log(`Leaderboard.calculateLeaderboards(${challenge.id}) running ...`);
                // get All Activities for challenge
                const dbActivitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(challenge.id).collection(`activities`);
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
                    const allResuts = this.totals(challenge, activities);
            
                    console.log(`Nbr Overall Activities: ${allResuts.overallResults.nbrActivities}`);
                    console.log(`Nbr Team Results: ${allResuts.userResults.length}`);
                    console.log(`Nbr User Results: ${allResuts.teamResults.length}`);

                    console.log(`Saving all results to challenge ${allResuts.challengeUid}`);
                    // Must Save now
                    const resultsDB:ResultsDB = new ResultsDB();
                    resultsDB.save(allResuts).then (() => {
                        console.log(`Saved all results to challenge ${allResuts.challengeUid}`);
                        resolve(allResuts);
                    }).catch ((err1: Error) => {
                        const error = new Error(`Error saving results for challenge ${challenge.id} -- ${err1} : "Leaderboard.ts", line: 42`);
                        console.error(error);
                        reject(error);  
                    });

                }).catch((err: Error) => {
                    console.error(err);
                    reject(err);
                });
        }); // Promise
    }

    private totals(challenge: Challenge, activities:Array<Activity>): AllResults {
        // console.log("totals() started ...");
        let overallResults = new Result(challenge.id);
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
        newResult.overallRecord = true;
    
        newResult = this.computeRecordTotals(challenge, newResult, activity);

        return (newResult);
    }    
    // Calculate team results
    private calulateTeamResults(challenge:Challenge, results:Array<Result>, activity:Activity): Array<Result> {
        // console.log("calulateUserResults() started ...");

        let newResult: Result = new Result(challenge.id);
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

        let newResult: Result = new Result(challenge.id);
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

    public calculateNewResults(challenge:Challenge, activity:Activity):any {
        return new Promise<any>((resolve:any, reject:any) => {
            const leaderboard: Leaderboard = new Leaderboard();
            leaderboard.getResults(challenge).then((allResults:AllResults) => {
                const newAllResults = allResults;
                console.log(`calculateNewResults newAllResults: ${JSON.stringify(newAllResults.overallResults, null,2)}`);

                newAllResults.challengeUid = challenge.id;
                newAllResults.overallResults = this.calulateOverallResults(challenge, allResults.overallResults, activity);
                newAllResults.teamResults = this.calulateTeamResults(challenge, allResults.teamResults, activity);
                newAllResults.userResults = this.calulateUserResults(challenge, allResults.userResults, activity);

                // Must Save now
                const resultsDB:ResultsDB = new ResultsDB();
                resultsDB.save(newAllResults).then (() => {
                    console.log(`Saved all results to challenge ${newAllResults.challengeUid}`);
                    resolve(newAllResults);
                }).catch ((err1: Error) => {
                    const error = new Error(`Error saving results for challenge ${challenge.id} -- ${err1} : "Leaderboard.ts", line: 235`);
                    console.error(error);
                    reject(error);  
                });
    
                resolve(newAllResults);
            }).catch(err => {
                reject(err);
            });
        });
    }

    public getResults(challenge:Challenge) {
        return new Promise<any>((resolve:any, reject:any) => {
            const resultsDB: ResultsDB = new ResultsDB();

            resultsDB.getAll(challenge).then((allResults: AllResults) => {
                console.log(`getResults allResults: ${JSON.stringify(allResults.overallResults, null,2)}`);
                resolve(allResults);
            }).catch(_ => {
                // Couldnt find - recalc and get
                this.calculateLeaderboards(challenge).then((allResults: AllResults) => {
                    // Send back
                    resolve(allResults);
                }).catch((err2: Error) => {
                    reject(err2);
                });
            }); 
        });
    }

}//class

export { Leaderboard }