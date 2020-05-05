const admin = require('firebase-admin');
const { APP_CONFIG } = require("./FirebaseEnvironment.js");

// ===============================================================
// Local - non-exported functions
// ===============================================================
const addStravaActivity = ((user, stravaActivity) => {
    
    let stavaActivityDistanceUnits = "Miles";
    let stavaActivityDistance = 0.0;
    let stravaActivityType = "";
    console.log(`Strava Activity. Type: ${stravaActivity.type.toLowerCase()}, id: ${stravaActivity.id}`);
    console.log(`addStravaActivity. Athlete Id ${user.stravaAthleteId},displayName: ${user.displayName},challengeUid: ${user.challengeUid},teamName: ${user.teamName},strava ActivyId: ${stravaActivity.id},Type: ${stravaActivity.type.toLowerCase()},Time: ${new Date(stravaActivity.start_date)}`);

    switch (stravaActivity.type.toLowerCase()) {
        case "swim":
            stravaActivityType = "Swim";
            stavaActivityDistanceUnits = "Yards";
            //convert meters to yards
            stavaActivityDistance = stravaActivity.distance * 1.09361;
            break;
        case "ride":
            stravaActivityType = "Bike";
            // meters to miles
            stavaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
            break;
        case "virtualride":
            stravaActivityType = "Bike";
            stavaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
            break;
        case "handcycle":
            stravaActivityType = "Bike";
            stavaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
            break;
        case "run":
            stravaActivityType = "Run";
            stavaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
            break;
        case "virtualrun":
            stravaActivityType = "Run";
            stavaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
            break;
        case "walk":
            stravaActivityType = "Run";
            stavaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
            break;
        default:
            stravaActivityType = "Other";
            stavaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
    }

    return new Promise((resolve, reject) => {
        let activity = {
            teamName: user.teamName ? user.teamName : "",
            teamUid: user.teamUid ? user.teamUid : null,
            activityName: stravaActivity.name,
            activityDateTime: new Date(stravaActivity.start_date),
            activityType: stravaActivityType,
            distance: stavaActivityDistance,
            distanceUnits: stavaActivityDistanceUnits,
            duration: stravaActivity.elapsed_time / 3600,
            email: user.email ? user.email : "",
            displayName: user.displayName ? user.displayName : "",
            uid: user.id,
            stravaActivity : true,
            stravaActivityId : stravaActivity.id
        }
        if (user.challengeUid) {
            activity.challengeUid = user.challengeUid;
        } else {
            reject(`Error - user: ${user.displayName} is not in a challenge, can not add acvitity`)
        }
    
        console.log(`In addStravaActivity with userid ${user.id}, stravaActivity.id: ${stravaActivity.id}`);

        const dbActivitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(user.challengeUid).collection(`activities`);

        // USe set so as not to duplicste activities
        const activityKey = `${stravaActivity.athlete.id}-${stravaActivity.id}`;
        dbActivitiesRef.doc(activityKey).set(activity).then(() => {
            console.log(`Firestore activity successfully added with id ${activityKey} for user: ${user.displayName}`);
            resolve();
        }).catch((err) => {
            console.err(`Firestore activity add failed`);
            reject(`Firestore activity add failed with error: ${err}`);
        });

    }); // Promise
    
});

module.exports = { addStravaActivity };