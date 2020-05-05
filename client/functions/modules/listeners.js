const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { APP_CONFIG } = require("./FirebaseEnvironment.js");
const challenge = {
    id : "5XuThS03PcQQ1IasPQif",
}

exports.listenForCreateActivity = functions.firestore
    .document(`${APP_CONFIG.ORG}/${APP_CONFIG.ENV}/challenges/${challenge.id}/activities/{activityId}`)
    .onCreate((snap, context) => {
        // Get an object representing the document
        // e.g. {'name': 'Marie', 'age': 66}
        let newActivity = {};
        newActivity = snap.data();
        newActivity.id = snap.id;
        newActivity.activityDateTime = newActivity.activityDateTime.toDate();
        console.log(`new activity: ${JSON.stringify(newActivity, null,2)}`)
});
