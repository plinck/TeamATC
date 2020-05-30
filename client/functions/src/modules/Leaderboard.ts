import * as admin from 'firebase-admin';
import { APP_CONFIG } from "./FirebaseEnvironment";

import { Activity } from "./interfaces/Activity";
import { Result } from "./interfaces/Result";
import { AllResults } from "./interfaces/Result.Types";
import { Challenge } from "./interfaces/Challenge";
import { ResultsDB } from './db/ResultsDB';
import { ActivityUpdateType } from "./interfaces/Common.Types";
class Leaderboard {

    public calculateLeaderboards(challenge: Challenge) {
        return new Promise<any>((resolve:any, reject:any) => {
            // console.log("Leaderboard.calculateLeaderboards() started ...");

                console.log(`Leaderboard.calculateLeaderboards(${challenge.id}) running ...`);
                // get All Activities for challenge
                const dbActivitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(challenge.id).collection(`activities`);
                dbActivitiesRef.get().then((querySnapshot) => {
                    console.log(`dbActivitiesRef.get() completed ...`);
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
            
                    // console.log(`Nbr Overall Activities: ${allResuts.overallResults.nbrActivities}`);
                    // console.log(`Nbr Team Results: ${allResuts.userResults.length}`);
                    // console.log(`Nbr User Results: ${allResuts.teamResults.length}`);

                    // console.log(`Saving all results to challenge ${allResuts.challengeUid}`);
                    // Must Save now
                    console.log(`Trying to save resultsDB.save(`);
                    const resultsDB:ResultsDB = new ResultsDB();
                    resultsDB.save(allResuts).then (() => {
                        console.log(`Saved all results to challenge ${allResuts.challengeUid}`);
                        resolve(allResuts);
                    }).catch ((err1: Error) => {
                        const error = new Error(`Error saving results for challenge ${challenge.id} -- ${err1} : "Leaderboard.ts", line: 44`);
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
        let overallResults = new Result(challenge.id);
        let userResults: Array<Result> = Array<Result>();
        let teamResults: Array<Result> = Array<Result>();
    
        // loop through array counting by team
        // for (let i = 0; i < activities.length; i++) {
        for (const activity of activities) {
            // get resulsts
            overallResults = this.calulateOverallResults(challenge, overallResults, activity, ActivityUpdateType.create);
            teamResults = this.calulateTeamResults(challenge, teamResults, activity, ActivityUpdateType.create);
            userResults = this.calulateUserResults(challenge, userResults, activity, ActivityUpdateType.create);
        }
    
        // Sort the team and user results based on total points DESC 
        userResults = this.sortResultsAndAddRank(userResults);
        teamResults = this.sortResultsAndAddRank(teamResults);
            
        const allResults: AllResults = {challengeUid: challenge.id, overallResults, teamResults, userResults};
    
        return (allResults);
    }    

    private calulateOverallResults(challenge: Challenge, result:Result, activity:Activity, updateType: ActivityUpdateType): Result {    
        let newResult = result;
        newResult.overallRecord = true;
    
        newResult = this.computeRecordTotals(challenge, newResult, activity, updateType);

        return (newResult);
    }    
    // Calculate team results
    private calulateTeamResults(challenge:Challenge, results:Array<Result>, activity:Activity, updateType: ActivityUpdateType): Array<Result> {
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

        newResult = this.computeRecordTotals(challenge, newResult, activity, updateType);

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
    private calulateUserResults(challenge:Challenge, results:Array<Result>, activity:Activity, updateType: ActivityUpdateType): Array<Result> {
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
        newResult.teamUid = activity.teamUid;
        newResult.teamName = activity.teamName;

        newResult = this.computeRecordTotals(challenge, newResult, activity, updateType);

        // Updated the array of users results - each user has a record
        const newResultsArray = results;
        if (idx > -1) {       // Found, results for this oone so add to it
            newResultsArray[idx] = newResult;
        } else {
            newResultsArray.push(newResult);
        }

        return (newResultsArray);
    }

    private computePoints(distance: number, activityType: string) : number {
        let points: number = 0;

        switch (activityType) {
            case "Swim":
                points = distance * 10;
                break;
            case "Bike":
                points = distance * 1;
                break;
            case "Run":
                points = distance * 3;
                break;
            case "Other":
                points = distance * 1;
                break;
            default:
                points = distance * 1;
                break;
        }

        return points;
    }
    // note : on a change the activity will not be the ACTUAL activity but a net of the old and the new in miles and duration
    private computeRecordTotals(challenge:Challenge, newResult:Result, activity:Activity, updateType: ActivityUpdateType):Result {
        // console.log("computeRecordTotals() started ...");
        let distanceInMiles:number = activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
        let durationInHours:number = activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;
        let points: number;
        let nbrActivities: number;

        // This helps us do the *net* of an activity
        switch (updateType) {
            case ActivityUpdateType.create:
                points = this.computePoints(distanceInMiles, activity.activityType);
                nbrActivities = 1;
                distanceInMiles = distanceInMiles;
                durationInHours = durationInHours;

                // Overall for this OA, Team or User
                newResult.distanceTotal += distanceInMiles;
                newResult.durationTotal += durationInHours;
                newResult.pointsTotal += points;
                newResult.nbrActivities += 1;
                break;
            case ActivityUpdateType.update:
                points = this.computePoints(distanceInMiles, activity.activityType);
                nbrActivities = 0;
                distanceInMiles = distanceInMiles;
                durationInHours = durationInHours;

                // Overall for this OA, Team or User
                newResult.distanceTotal += distanceInMiles;
                newResult.durationTotal += durationInHours;
                newResult.pointsTotal += points;
                newResult.nbrActivities = 0;
                break;
            case ActivityUpdateType.delete:
                points = this.computePoints(distanceInMiles, activity.activityType);
                points = -points;
                nbrActivities = -1;
                distanceInMiles = -distanceInMiles;
                durationInHours = -durationInHours;

                // Overall for this OA, Team or User
                newResult.distanceTotal += distanceInMiles;
                newResult.durationTotal += durationInHours;
                newResult.pointsTotal += points;
                newResult.nbrActivities += nbrActivities;
                break;
            default:
                break;
        }
        
        switch (activity.activityType) {
            case "Swim":
                newResult.swimPointsTotal += points;
                newResult.swimNbrActivities += nbrActivities;
                newResult.swimDistanceTotal += distanceInMiles;
                newResult.swimDurationTotal += durationInHours;
                break;
            case "Bike":    
                newResult.bikePointsTotal += points;
                newResult.bikeNbrActivities += nbrActivities;
                newResult.bikeDistanceTotal += distanceInMiles;
                newResult.bikeDurationTotal += durationInHours;
                break;
            case "Run":
                newResult.runPointsTotal += points;
                newResult.runNbrActivities += nbrActivities;
                newResult.runDistanceTotal += distanceInMiles;
                newResult.runDurationTotal += durationInHours;
                break;
            default:
                newResult.otherPointsTotal += points;
                newResult.otherNbrActivities += nbrActivities;
                newResult.otherDistanceTotal += distanceInMiles;
                newResult.otherDurationTotal += durationInHours;
                break;
        }
        // Assign the challnge to make sure totals apply to correct one
        newResult.challengeUid = challenge.id;

        return newResult;
    }    

    private sortResultsAndAddRank(results: Array<Result>): Array<Result> {
        // Sort the results based on total points DESC    
        const newResults = results;      
        newResults.sort((a:Result, b:Result) => {
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
        
        for (let i = 0; i < newResults.length; i++) {
            newResults[i].rank = i+1;
        }

        return newResults;

    }

    public calculateNewResults(challenge:Challenge, activity:Activity, updateType: ActivityUpdateType):any {
        return new Promise<any>((resolve:any, reject:any) => {
            // DONT update new one if you have to recalc since somehow it gets it
            const resultsDB: ResultsDB = new ResultsDB();
            resultsDB.getAll(challenge).then((allResults: AllResults) => {
                // console.log(`getResults allResults: ${JSON.stringify(allResults.overallResults, null,2)}`);
                // if found results, just update them - create adds, delete subtracts, modify adds (must pass net)
                const newAllResults = allResults;
                newAllResults.challengeUid = challenge.id;
                newAllResults.overallResults = this.calulateOverallResults(challenge, allResults.overallResults, activity, updateType);
                newAllResults.teamResults = this.calulateTeamResults(challenge, allResults.teamResults, activity, updateType);
                newAllResults.userResults = this.calulateUserResults(challenge, allResults.userResults, activity, updateType);
                // Sort the team and user results based on total points DESC 
                newAllResults.userResults = this.sortResultsAndAddRank(newAllResults.userResults);
                newAllResults.teamResults = this.sortResultsAndAddRank(newAllResults.teamResults);
                console.log(`newAllResults.userResults with rank: ${JSON.stringify(newAllResults.userResults)}`);

                const saveResultsDB:ResultsDB = new ResultsDB();
                saveResultsDB.save(newAllResults).then (() => {
                    console.log(`Saved all results to challenge ${newAllResults.challengeUid}`);
                    resolve(newAllResults);
                }).catch ((err1: Error) => {
                    const error = new Error(`Error saving results for challenge ${challenge.id} -- ${err1} : "Leaderboard.ts", line: 295`);
                    console.error(error);
                    reject(error);  
                });
            }).catch(_ => {
                // Couldnt find - recalc and get
                this.calculateLeaderboards(challenge).then((allResults: AllResults) => {
                    // Send back null so doesnt add new activity
                    resolve(allResults);
                }).catch((err2: Error) => {
                    reject(err2);
                });
            }); 
        });
    }

    public getResults(challenge:Challenge) {
        return new Promise<any>((resolve:any, reject:any) => {
            const resultsDB: ResultsDB = new ResultsDB();

            resultsDB.getAll(challenge).then((allResults: AllResults) => {
                // console.log(`getResults allResults: ${JSON.stringify(allResults.overallResults, null,2)}`);
                // if found rssults, just return
                resolve(allResults);
            }).catch(_ => {
                // Couldnt find - recalc and get
                this.calculateLeaderboards(challenge).then((allResults: AllResults) => {
                    // Send back null so doesnt add new activity
                    resolve(allResults);
                }).catch((err2: Error) => {
                    reject(err2);
                });
            }); 
        });
    }

}//class

export { Leaderboard }