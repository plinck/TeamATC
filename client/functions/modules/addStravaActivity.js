const admin = require('firebase-admin');
const ENV = require("./FirebaseEnvironment.js");

// ===============================================================
// Local - non-exported functions
// ===============================================================
const addStravaActivity = ((user, stravaActivity) => {
    console.log(`In addStravaActivity with: ORG: ${ENV.APP_CONFIG.ORG}, ENV: ${ENV.APP_CONFIG.ENV}`);

    let stavaActivityDistanceUnits = "Miles";
    let stavaActivityDistance = 0.0;
    if (stravaActivity.type.toLowerCase() === "swim") {
        stavaActivityDistanceUnits = "Yards";
        //convert meters to yards
        stavaActivityDistance = stravaActivity.distance * 1.09361;
    } else {
        // meters to miles
        stavaActivityDistance = stravaActivity.distance * 1.09361 / 1760;   
    }
    
    return new Promise((resolve, reject) => {
        let activity = {
            teamName: user.teamName ? user.teamName : "",
            teamUid: user.teamUid ? user.teamUid : null,
            activityName: stravaActivity.name,
            activityDateTime: new Date(stravaActivity.start_date),
            activityType: stravaActivity.type,
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

        const dbActivitiesRef = admin.firestore().collection(ENV.APP_CONFIG.ORG).doc(ENV.APP_CONFIG.ENV).collection("challenges").doc(user.challengeUid).collection(`activities`);

        // USe set so as not to duplicste activities
        const activityKey = `${stravaActivity.athlete.id}-${stravaActivity.id}`;
        dbActivitiesRef.doc(activityKey).set(activity).then(() => {
            console.log("Firestore activity successfully added");
            resolve();
        }).catch((err) => {
            console.err(`Firestore activity add failed`);
            reject(`Firestore activity add failed with error: ${err}`);
        });

    }); // Promise
    
});

module.exports = { addStravaActivity };