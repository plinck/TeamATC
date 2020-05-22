import { Result } from "./Result";

class Leaderboard {

    static calculateLeaderboards(activities, teamUid, teamName, uid, displayName) {

        console.log(`Leaderboard.calculateLeaderboards running ...`);
        // get All Activities for challenge
        const allResuts = Leaderboard.totals(activities);

        return (allResuts);
    }

    static totals(activities) {
        let overallResults = new Result();
        let userResults = [];
        let teamResults =[];
    
        // loop through array counting by team
        // for (let i = 0; i < activities.length; i++) {
        for (const activity of activities) {
            // get resulsts
            overallResults = Leaderboard.calulateOverallResults(overallResults, activity, "create");
            teamResults = Leaderboard.calulateTeamResults(teamResults, activity, "create" );
            userResults = Leaderboard.calulateUserResults(userResults, activity, "create" );
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
    
        const allResults = {overallResults, teamResults, userResults};
    
        return (allResults);
    }    

    static calulateOverallResults(result, activity, updateType) {    
        let newResult = result;
        newResult.overallRecord = true;
    
        newResult = Leaderboard.computeRecordTotals(newResult, activity, updateType);

        return (newResult);
    }    
    // Calculate team results
    static calulateTeamResults(results, activity, updateType) {
        // console.log("calulateUserResults() started ...");

        let newResult = new Result();
        const idx = results.findIndex((result) => {
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

        newResult = Leaderboard.computeRecordTotals(newResult, activity, updateType);

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
    static calulateUserResults(results, activity, updateType) {
        // console.log("calulateUserResults() started ...");

        let newResult = new Result();
        const idx = results.findIndex((result) => {
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

        newResult = Leaderboard.computeRecordTotals(newResult, activity, updateType);

        // Updated the array of users results - each user has a record
        const newResultsArray = results;
        if (idx > -1) {       // Found, results for this oone so add to it
            newResultsArray[idx] = newResult;
        } else {
            newResultsArray.push(newResult);
        }

        return (newResultsArray);
    }

    static computePoints(distance, activityType) {
        let points = 0;

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
    static computeRecordTotals(newResult, activity, updateType) {
        // console.log("computeRecordTotals() started ...");
        let distanceInMiles = activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
        let durationInHours = activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;
        let points;
        let nbrActivities;

        // This helps us do the *net* of an activity
        switch (updateType) {
            case "create" :
                points = Leaderboard.computePoints(distanceInMiles, activity.activityType);
                nbrActivities = 1;

                // Overall for this OA, Team or User
                newResult.distanceTotal += distanceInMiles;
                newResult.durationTotal += durationInHours;
                newResult.pointsTotal += points;
                newResult.nbrActivities += 1;
                break;
            case "update":
                points = Leaderboard.computePoints(distanceInMiles, activity.activityType);
                nbrActivities = 0;

                // Overall for this OA, Team or User
                newResult.distanceTotal += distanceInMiles;
                newResult.durationTotal += durationInHours;
                newResult.pointsTotal += points;
                newResult.nbrActivities = 0;
                break;
            case "delete":
                points = Leaderboard.computePoints(distanceInMiles, activity.activityType);
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

        return newResult;
    }    

}//class

export { Leaderboard }