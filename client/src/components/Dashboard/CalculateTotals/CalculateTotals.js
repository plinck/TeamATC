// Class - CalculateTotals 
// This class goes through the entiure array and calculates all the totals, subtiotals, rtesults
// etc by team and by uuser and by all
// refactor to pull out of dashboard.
class CalculateTotals {
    // Set the totals for a team calculated from activity listener, based on team name
    // need to check about switching to teamUid since better
    //for now, this gets triggered on all listener changes in activity which is ineffient as heck
    // but all I got for now
    // I will get it working and then optimize

    static totals (activities, teamUid, teamName, uid, displayName) {
        // console.log(`CalculateTotals.totals. teamUid:${teamUid} teamName:${teamName} uid:${uid} displayName:${displayName}`);

        let newTotals = {
            nbrActivities: 0,
            distanceTotal: 0,
            durationTotal: 0,
            swimNbrActivities: 0,
            swimDistanceTotal: 0,
            swimDurationTotal: 0,
            bikeNbrActivities: 0,
            bikeDistanceTotal: 0,
            bikeDurationTotal: 0,
            runNbrActivities: 0,
            runDistanceTotal: 0,
            runDurationTotal: 0,
            otherNbrActivities: 0,
            otherDistanceTotal: 0,
            otherDurationTotal: 0,
        };

        let newTeamTotals = {
            teamUid: teamUid,
            teamName: teamName,
            nbrActivities: 0,
            distanceTotal: 0,
            durationTotal: 0,
            swimNbrActivities: 0,
            swimDistanceTotal: 0,
            swimDurationTotal: 0,
            bikeNbrActivities: 0,
            bikeDistanceTotal: 0,
            bikeDurationTotal: 0,
            runNbrActivities: 0,
            runDistanceTotal: 0,
            runDurationTotal: 0,
            otherNbrActivities: 0,
            otherDistanceTotal: 0,
            otherDurationTotal: 0,
        };

        let newUserTotals = {
            uid: uid,
            displayName: displayName,
            nbrActivities: 0,
            distanceTotal: 0,
            durationTotal: 0,
            swimNbrActivities: 0,
            swimDistanceTotal: 0,
            swimDurationTotal: 0,
            bikeNbrActivities: 0,
            bikeDistanceTotal: 0,
            bikeDurationTotal: 0,
            runNbrActivities: 0,
            runDistanceTotal: 0,
            runDurationTotal: 0,
            otherNbrActivities: 0,
            otherDistanceTotal: 0,
            otherDurationTotal: 0,
        };

        let newUserResults = [];
        let newTeamResults = [];

        let userResults = [];
        let teamResults = [];

        // loop through array counting by team
        for (let i = 0; i < activities.length; i++) {
            // get resulsts
            newUserResults = this.calulateUserResults(userResults, activities[i], uid);
            newTeamResults = this.calulateTeamResults(teamResults, activities[i], teamUid);

            // Add everything for totals
            newTotals.nbrActivities += 1;
            newTotals.distanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
            newTotals.durationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
            switch (activities[i].activityType) {
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
                    newTotals.otherNbrActivities += 1;
                    newTotals.otherDistanceTotal += activities[i].distance;
                    newTotals.otherPointsTotal = newTotals.otherDistanceTotal;
                    newTotals.otherDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                    break;
            }

            // only add for this team
            if (teamUid === activities[i].teamUid) {
                newTeamTotals.nbrActivities += 1;
                newTeamTotals.distanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;
                newTeamTotals.durationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                switch (activities[i].activityType) {
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
                        newTeamTotals.otherNbrActivities += 1;
                        newTeamTotals.otherDistanceTotal += activities[i].distance;
                        newTeamTotals.otherPointsTotal = newTeamTotals.otherDistanceTotal;
                        newTeamTotals.otherDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                        break;
                }
            }
            if (uid === activities[i].uid) {
                newUserTotals.nbrActivities += 1;
                newUserTotals.distanceTotal += activities[i].distanceUnits === "Yards" ? activities[i].distance / 1760 : activities[i].distance;;
                newUserTotals.durationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                switch (activities[i].activityType) {
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
                        newUserTotals.otherNbrActivities += 1;
                        newUserTotals.otherDistanceTotal += activities[i].distance;
                        newTeamTotals.otherPointsTotal = newUserTotals.otherDistanceTotal;
                        newUserTotals.otherDurationTotal += activities[i].durationUnits === "Minutes" ? activities[i].duration / 60 : activities[i].duration;
                        break;
                }
            }
        }

        // Sort the team and user results based on total points DESC          
        newUserResults.sort((a, b) => {
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

        newTeamResults.sort((a, b) => {
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

        let totalsAndResults = { all: newTotals, team: newTeamTotals, user: newUserTotals, userR: newUserResults, teamR: newTeamResults };
        // console.log(`User Results User: ${JSON.stringify(newUserResults, null, 2)}`);
        // console.log(`Team Results Team: ${JSON.stringify(newTeamResults, null, 2)}`);

        return (totalsAndResults);
    }

        // Calculate Current results/standings for each user
    static calulateUserResults(userResults, activity, uid) {
        let newUserResult =
        {
            userOrTeamUid: null,
            userOrTeamName: "",
            isThisMine: false,
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
            teamName: "",
            teamRecord: false,
            otherDistanceTotal: 0,
            otherPointsTotal: 0,
            otherNbrActivities: 0,
            otherDurationTotal: 0,
        }

        let idx = userResults.findIndex((uResult) => {
            const isFound = uResult.userOrTeamUid === activity.uid;
            return isFound;
        });

        if (idx > -1) {       // Found, results for this oone so add to it
            newUserResult = userResults[idx];

            newUserResult.isThisMine = activity.uid === uid ? true : false;

            const distanceInMiles = activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
            newUserResult.distanceTotal += distanceInMiles;
            newUserResult.durationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

            switch (activity.activityType) {
                case "Swim":
                    newUserResult.pointsTotal += distanceInMiles * 10;

                    newUserResult.swimNbrActivities += 1;
                    newUserResult.swimDistanceTotal += activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
                    newUserResult.swimDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.swimPointsTotal = newUserResult.swimDistanceTotal * 10;
                    break;
                case "Bike":
                    newUserResult.pointsTotal += distanceInMiles;

                    newUserResult.bikeNbrActivities += 1;
                    newUserResult.bikeDistanceTotal += activity.distance;
                    newUserResult.bikeDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.bikePointsTotal = newUserResult.bikeDistanceTotal;
                    break;
                case "Run":
                    newUserResult.pointsTotal += distanceInMiles * 3;

                    newUserResult.runNbrActivities += 1;
                    newUserResult.runDistanceTotal += activity.distance;
                    newUserResult.runDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.runPointsTotal = newUserResult.runDistanceTotal * 3;
                    break;
                default:
                    newUserResult.pointsTotal += distanceInMiles;

                    newUserResult.otherNbrActivities += 1;
                    newUserResult.otherDistanceTotal += activity.distance;
                    newUserResult.otherDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.otherPointsTotal = newUserResult.otherDistanceTotal;
                    break;
            }
            userResults[idx] = newUserResult;

        } else {              // Didnt find results for this oone so push it
            newUserResult.isThisMine = activity.uid === uid ? true : false;
            newUserResult.userOrTeamUid = activity.uid;
            newUserResult.userOrTeamName = activity.displayName;
            newUserResult.teamName = activity.teamName;
            newUserResult.teamRecord = false;

            const distanceInMiles = activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
            newUserResult.distanceTotal += distanceInMiles;
            newUserResult.durationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

            switch (activity.activityType) {
                case "Swim":
                    newUserResult.pointsTotal += distanceInMiles * 10;

                    newUserResult.swimNbrActivities += 1;
                    newUserResult.swimDistanceTotal += activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
                    newUserResult.swimDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.swimPointsTotal = newUserResult.swimDistanceTotal * 10;
                    break;
                case "Bike":
                    newUserResult.pointsTotal += distanceInMiles;

                    newUserResult.bikeNbrActivities += 1;
                    newUserResult.bikeDistanceTotal += activity.distance;
                    newUserResult.bikeDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.bikePointsTotal = newUserResult.bikeDistanceTotal;
                    break;
                case "Run":
                    newUserResult.pointsTotal += distanceInMiles * 3;

                    newUserResult.runNbrActivities += 1;
                    newUserResult.runDistanceTotal += activity.distance;
                    newUserResult.runDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.runPointsTotal = newUserResult.runDistanceTotal * 3;
                    break;
                default:
                    newUserResult.pointsTotal += distanceInMiles;

                    newUserResult.otherNbrActivities += 1;
                    newUserResult.otherDistanceTotal += activity.distance;
                    newUserResult.otherDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newUserResult.otherPointsTotal = newUserResult.otherDistanceTotal;
                    break;
            }
            userResults.push(newUserResult);
        }

        let newResults = userResults;
        return (newResults);
    }
    // End calulateUserResults

    // Calculate Current results/standings for each team
    static calulateTeamResults(teamResults, activity, teamUid) {
        let newTeamResult =
        {
            userOrTeamUid: null,
            userOrTeamName: "",
            isThisMine: false,
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
            teamName: "",
            teamRecord: false,
            otherDistanceTotal: 0,
            otherPointsTotal: 0,
            otherNbrActivities: 0,
            otherDurationTotal: 0,
        }

        let idx = teamResults.findIndex((uResult) => {
            const isFound = uResult.userOrTeamUid === activity.teamUid;
            return isFound;
        });
        // if (activity.displayName === "Tim Myers" || activity.displayName === "Stephanie Tobben") {
        //     console.log(`Tim/Steph Activity: teamUid: "${activity.teamUid}", idx:${idx}, passed teamUid: "${teamUid}"`);
        // }

        if (idx > -1) {       // Found, results for this oone so add to it
            // console.log(`found team: ${teamResults[idx].userOrTeamName} at idx: ${idx}`)
            newTeamResult = teamResults[idx];

            newTeamResult.isThisMine = activity.teamUid === teamUid ? true : false;

            const distanceInMiles = activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
            newTeamResult.distanceTotal += distanceInMiles;
            newTeamResult.durationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

            switch (activity.activityType) {
                case "Swim":
                    newTeamResult.pointsTotal += distanceInMiles * 10;

                    newTeamResult.swimNbrActivities += 1;
                    newTeamResult.swimDistanceTotal += activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
                    newTeamResult.swimDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newTeamResult.swimPointsTotal = newTeamResult.swimDistanceTotal * 10;
                    break;
                case "Bike":
                    newTeamResult.pointsTotal += distanceInMiles;

                    newTeamResult.bikeNbrActivities += 1;
                    newTeamResult.bikeDistanceTotal += activity.distance;
                    newTeamResult.bikeDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newTeamResult.bikePointsTotal = newTeamResult.bikeDistanceTotal;
                    break;
                case "Run":
                    newTeamResult.pointsTotal += distanceInMiles * 3;

                    newTeamResult.runNbrActivities += 1;
                    newTeamResult.runDistanceTotal += activity.distance;
                    newTeamResult.runDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newTeamResult.runPointsTotal = newTeamResult.runDistanceTotal * 3;
                    break;
                default:
                    newTeamResult.pointsTotal += distanceInMiles;

                    newTeamResult.otherNbrActivities += 1;
                    newTeamResult.otherDistanceTotal += activity.distance;
                    newTeamResult.otherDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newTeamResult.otherPointsTotal = newTeamResult.otherDistanceTotal;
                    break;
            }
            teamResults[idx] = newTeamResult;

        } else {              // Didnt find results for this oone so push it

            newTeamResult.isThisMine = activity.teamUid === teamUid ? true : false;
            newTeamResult.userOrTeamUid = activity.teamUid;
            newTeamResult.userOrTeamName = activity.teamName;
            newTeamResult.teamName = activity.teamName;
            newTeamResult.teamRecord = true;

            const distanceInMiles = activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
            newTeamResult.distanceTotal += distanceInMiles;
            newTeamResult.durationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

            switch (activity.activityType) {
                case "Swim":
                    newTeamResult.pointsTotal += distanceInMiles * 10;

                    newTeamResult.swimNbrActivities += 1;
                    newTeamResult.swimDistanceTotal += activity.distanceUnits === "Yards" ? activity.distance / 1760 : activity.distance;
                    newTeamResult.swimDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newTeamResult.swimPointsTotal = newTeamResult.swimDistanceTotal * 10;
                    break;
                case "Bike":
                    newTeamResult.pointsTotal += distanceInMiles;

                    newTeamResult.bikeNbrActivities += 1;
                    newTeamResult.bikeDistanceTotal += activity.distance;
                    newTeamResult.bikeDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newTeamResult.bikePointsTotal = newTeamResult.bikeDistanceTotal;
                    break;
                case "Run":
                    newTeamResult.pointsTotal += distanceInMiles * 3;

                    newTeamResult.runNbrActivities += 1;
                    newTeamResult.runDistanceTotal += activity.distance;
                    newTeamResult.runDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newTeamResult.runPointsTotal += newTeamResult.runDistanceTotal * 3;
                    break;
                default:
                    newTeamResult.pointsTotal += distanceInMiles;

                    newTeamResult.otherNbrActivities += 1;
                    newTeamResult.otherDistanceTotal += activity.distance;
                    newTeamResult.otherDurationTotal += activity.durationUnits === "Minutes" ? activity.duration / 60 : activity.duration;

                    newTeamResult.otherPointsTotal = newTeamResult.otherDistanceTotal;
                    break;
            }
            teamResults.push(newTeamResult);
        }

        let newResults = teamResults;
        return (newResults);
    }
    // End calulateTeamResults    

} // class

export default CalculateTotals;