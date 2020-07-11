import { ChallengeDB } from "./db/ChallengeDB";
import { Challenge } from "./Interfaces/Challenge"; 
import { Activity } from './interfaces/Activity';
import { User } from './interfaces/User';
import ActivityDB from './db/ActivityDB';

// ===============================================================
// Local - non-exported functions
// ===============================================================
const addStravaActivity = ((user: User, stravaActivity: any) => {
    return new Promise((resolve, reject) => {

        let stravaActivityDistanceUnits = "Miles";
        let stravaActivityDistance = 0.0;
        let stravaActivityType = "";
        console.log(`Strava Activity. Type: ${stravaActivity.type.toLowerCase()}, id: ${stravaActivity.id}`);
        console.log(`addStravaActivity. Athlete Id ${user.stravaAthleteId},displayName: ${user.displayName},challengeUid: ${user.challengeUid},teamName: ${user.teamName},strava ActivyId: ${stravaActivity.id},Type: ${stravaActivity.type.toLowerCase()},Time: ${new Date(stravaActivity.start_date)}`);

        switch (stravaActivity.type.toLowerCase()) {
            case "swim":
                stravaActivityType = "Swim";
                stravaActivityDistanceUnits = "Yards";
                //convert meters to yards
                stravaActivityDistance = stravaActivity.distance * 1.09361;
                break;
            case "ride":
                stravaActivityType = "Bike";
                // meters to miles
                stravaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
                break;
            case "virtualride":
                stravaActivityType = "Bike";
                stravaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
                break;
            case "handcycle":
                stravaActivityType = "Bike";
                stravaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
                break;
            case "run":
                stravaActivityType = "Run";
                stravaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
                break;
            case "virtualrun":
                stravaActivityType = "Run";
                stravaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
                break;
            case "walk":
                stravaActivityType = "Run";
                stravaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
                break;
            default:
                stravaActivityType = "Other";
                stravaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
        }

        stravaActivityDistance = Math.round((stravaActivityDistance + Number.EPSILON) * 100) / 100

        console.log(`In addStravaActivity with userid ${user.id}, stravaActivity.id: ${stravaActivity.id}`);
        
        let activity:Activity = new Activity();
        // Use strava info as key and use db.set vs add so as not to duplicate activities
        const activityKey = `${stravaActivity.athlete.id}-${stravaActivity.id}`;
        activity = {
            id: activityKey,
            activityDateTime: new Date(stravaActivity.start_date),
            activityName: stravaActivity.name,
            activityType: stravaActivityType,
            challengeUid: user.challengeUid ? user.challengeUid : null,
            displayName: user.displayName ? user.displayName : "",
            distance: stravaActivityDistance,
            distanceUnits: stravaActivityDistanceUnits,
            duration: stravaActivity.elapsed_time / 3600,
            durationUnits: "Hours",
            email: user.email ? user.email : "",
            stravaActivity : true,
            stravaActivityId : stravaActivity.id,
            teamName: user.teamName ? user.teamName : "",
            teamUid: user.teamUid ? user.teamUid : null,
            uid: user.id
        }

        // now add to user activities and challenge activities
        const activityDB = new ActivityDB();
        activityDB.setUserActivity(activity).then(() => {
            console.log(`Firestore activity successfully saved with id ${activity.id} for and under user: ${user.displayName}`);
            // TODO: - actually look for this in array of challenges for this user
            addActivityToChallenge(user, activity).then(() => {
                resolve()
            }).catch((err2 : Error) => {
                reject(err2);
            });
        }).catch((err : Error) => {
            // Still try to add to challenge - REFACTOR later 
            console.error(`Firestore activity save for user in user/activities failed, still trying to save to challenge`);
            addActivityToChallenge(user, activity).then(() => {
                resolve()
            }).catch((err1 : Error) => {
                reject(err1);
            });
        });

    }); // Promise
});

const addActivityToChallenge = ((user : User, activity : Activity) => {
    return new Promise((resolve, reject) => {
        // TODO: - actually look for this in array of challenges for this user
        if (user.challengeUid) {
            activity.challengeUid = user.challengeUid;
            
            const challengeDB = new ChallengeDB();
            challengeDB.get(user.challengeUid).then((challenge: Challenge) => {
                // if valid date, store in challenge activities
                if (activity.activityDateTime >= challenge.startDate && activity.activityDateTime <= challenge.endDate) {
                    const activityDB = new ActivityDB();
                    activityDB.set(activity).then(() => {
                        console.log(`Firestore activity successfully added with id ${activity.id} for user: ${user.displayName}`);
                        resolve();
                    }).catch((err : any) => {
                        console.error(`Firestore activity add failed`);
                        reject(`Firestore activity add failed with error: ${err}`);
                    });
                } else {
                    console.log(`Info message - Firestore activity out of challenge range`);
                    resolve();
                }
            }).catch((err1: Error) => {
                console.error(`Warninng - Cant get challenge for user so activity not added to challenge: ${err1}`);
                resolve();
            });
        } else {
            console.log(`Warning message - User is not in a challenge so activity not added to challenge`);
            resolve();
        }
    }); // Promise
});

export { addStravaActivity };