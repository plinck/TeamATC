const admin = require('firebase-admin');
const axios = require('axios');
const ENV = require("./FirebaseEnvironment.js");
const rt = require("./refreshToken");
const refreshToken = rt.refreshToken;

// ===============================================================
// 
// ===============================================================
exports.saveStravaEvent = (async (event) => {
    console.log(`In saveStravaEvent with: ORG: ${ENV.APP_CONFIG.ORG}, ENV: ${ENV.APP_CONFIG.ENV}`);
    console.log(JSON.stringify(event,null,4));

    // make sure its an activity create event
    if (event.aspect_type !== "create" || event.object_type !== "activity") {
        return;
    }
    let stravaAthleteId = event.owner_id;
    let stravaActivityId = event.object_id;
    // convert UTC EPOCH date (seconds since epoch) to JS Date
    let stravaActivityDate = new Date(event.event_time * 1000);

    let dbUsersRef = admin.firestore().collection(ENV.APP_CONFIG.ORG).doc(ENV.APP_CONFIG.ENV).collection("users");

    let foundUser = false;
    dbUsersRef.where("stravaAthleteId", "==", stravaAthleteId).limit(1).get().then(async (snapshop) => {
        snapshow.foreach (doc => {
            foundUser = true;
            let user = doc.data();
            user.id = doc.id;
            user.stravaExpiresAt = user.stravaExpiresAt ? user.stravaExpiresAt.toDate() : null;
            console.log(`Found User with Athlete Id ${stravaAthleteId}, displayName: ${user.displayName}`);
        });
        if (foundUser) {
            // check to make sure access token not expired
            let today = new Date();
            let stravaAccessToken = null;
            if (!user.stravaExpiresAt || today > user.stravaExpiresAt) {
                // Must refresh users access token
                let req = {"uid" : user.id, "refresh_token" : user.stravaRefreshToken};
                const stravaInfo = await refreshToken(req);
                stravaAccessToken = stravaInfo.access_token;
            } else {
                stravaAccessToken = user.stravaAccessToken;
            }
            // get the activity
            if (stravaAccessToken) {
                const URIRequest = `https://www.strava.com/api/v3/activities/${stravaActivityId}`;
                try {
                    const activity = await axios.get(URIRequest,
                        { headers: { 'Authorization': `Bearer ${stravaAccessToken}` } }
                    );          
                    console.log(`activity from Strava: ${JSON.stringify(activity, null, 4)}`);
                } catch (err) {
                    console.error(`Error getting activity from strava`); 
                }
            } else {
                console.error(`Invalid access_token for user:${user.displayName}`); 
            }
        } else {
            console.error(`Can not find user with stravaAthleteId:${stravaAthleteId}`);
        }
    }).catch((err) =>{
        console.error(`Error retrieving user with stravaAthleteId:${stravaAthleteId} , error: ${err}`);
    });

    return;
});
