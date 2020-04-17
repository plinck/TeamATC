const admin = require('firebase-admin');
const ENV = require("./FirebaseEnvironment.js");

// ===============================================================
// Local - non-exported functions
// ===============================================================
const addStravaActivity = ((user, stravaActivity) => {
    console.log(`In addStravaActivity with: ORG: ${ENV.APP_CONFIG.ORG}, ENV: ${ENV.APP_CONFIG.ENV}`);
    
    return new Promise((resolve, reject) => {
        let activity = {
            teamName: user.teamName ? user.teamName : "",
            teamUid: user.teamUid ? user.teamUid : null,
            activityName: stravaActivity.activityName,
            activityDateTime: stravaActivity.activityDateTime,
            activityType: stravaActivity.activityType,
            distance: stravaActivity.distance,
            distanceUnits: stravaActivity.distanceUnits,
            duration: stravaActivity.duration,
            email: user.email ? user.email : "",
            displayName: user.displayName ? user.displayName : "",
            uid: user.id,
            stravaActivity : true,
            stravaActivityId : stravaActivity.id
        }
    
        console.log(`In addStravaActivity with userid ${user.id}, stravaActivity.id: ${stravaActivity.id}`);

        const dbActivitiesRef = admin.firestore().collection(ORG).doc(ENV).collection("challenges").doc(user.challengeUid).collection(`activities`);

        // dbActivitiesRef.add(activity).then(() => {
        //     console.log("Firestore activity successfully added");
        //     return resolve();
        // }).catch((error) => {
        //     console.error("Firestore activity add failed");
        //     return reject(error);
        // });

    }); // Promise
    
});

module.exports = { addStravaActivity };