import * as admin from 'firebase-admin';
import { APP_CONFIG } from "./FirebaseEnvironment";

// ===============================================================
// Local - non-exported functions
// ===============================================================
const addStravaActivity = ((user : any, stravaActivity : any) => {
    
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
    return new Promise((resolve, reject) => {
        const activity = {
            activityDateTime: new Date(stravaActivity.start_date),
            activityName: stravaActivity.name,
            activityType: stravaActivityType,
            challengeUid: user.challengeUid ? user.challengeUid : null,
            displayName: user.displayName ? user.displayName : "",
            distance: stravaActivityDistance,
            distanceUnits: stravaActivityDistanceUnits,
            duration: stravaActivity.elapsed_time / 3600,
            email: user.email ? user.email : "",
            stravaActivity : true,
            stravaActivityId : stravaActivity.id,
            teamName: user.teamName ? user.teamName : "",
            teamUid: user.teamUid ? user.teamUid : null,
            uid: user.id,
        }
        if (user.challengeUid) {
            activity.challengeUid = user.challengeUid;
        } else {
            reject(`Error - user: ${user.displayName} is not in a challenge, can not add acvitity`)
        }
    
        console.log(`In addStravaActivity with userid ${user.id}, stravaActivity.id: ${stravaActivity.id}`);

        const dbActivitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(user.challengeUid).collection(`activities`);

        // USe set so as not to duplicste activities
        // PAULTODO : --- Addd check to ensure activity is in challenge date range -- if not dump to user activity collection
        const activityKey = `${stravaActivity.athlete.id}-${stravaActivity.id}`;
        dbActivitiesRef.doc(activityKey).set(activity).then(() => {
            console.log(`Firestore activity successfully added with id ${activityKey} for user: ${user.displayName}`);
            resolve();
        }).catch((err : any) => {
            console.error(`Firestore activity add failed`);
            reject(`Firestore activity add failed with error: ${err}`);
        });

    }); // Promise
    
});

export { addStravaActivity };