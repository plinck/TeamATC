const admin = require('firebase-admin');
const axios = require('axios');
const ENV = require("./FirebaseEnvironment.js");
const rt = require("./refreshToken");
const refreshToken = rt.refreshToken;
const { addStravaActivity } = require("./addStravaActivity");
// ===============================================================
// local not exported/helperfunctions
// ===============================================================
const updateActivity = (accessToken => {
    stravaAccessToken = accessToken;
    // get the activity
    console.log(`Refreshed stravaAccessToken: ${stravaAccessToken}`);
    if (stravaAccessToken) {
        const URIRequest = `https://www.strava.com/api/v3/activities/${stravaActivityId}`;
        console.log(`URIRequest: ${URIRequest}`);
        axios.get(URIRequest,
            { headers: { 'Authorization': `Bearer ${stravaAccessToken}` } }
        ).then((res) => {
            // console.log(`activity from Strava: ${JSON.stringify(res.data, null, 4)}`);
            console.log(`Success retrieving activity from Strava`);
            //Now add the activity to DB
            addStravaActivity(user, res.data).then(res => {
                console.log(`Activity added to firestore successful`);
            }).catch(err => {
                console.error(`Error adding activity to firestore err:${err}`);                      
            })
        }).catch (err => {
            console.error(`Error getting activity from strava, err ${err}`); 
        });
    } else {
        console.error(`Invalid access_token for user:${user.displayName}`); 
    }

});

exports.saveStravaEvent = (async (event) => {
    console.log(`In saveStravaEvent with: ORG: ${ENV.APP_CONFIG.ORG}, ENV: ${ENV.APP_CONFIG.ENV}`);
    console.log(JSON.stringify(event,null,4));

    // make sure its an activity create event
    if (event.aspect_type !== "create" || event.object_type !== "activity") {
        console.log(`In saveStravaEvent -- aspect_type and object_type is NOT new activity`);
        return;
    }
    console.log(`In saveStravaEvent -- found new activity`);
    let stravaAthleteId = event.owner_id;
    let stravaActivityId = event.object_id;
    // convert UTC EPOCH date (seconds since epoch) to JS Date
    let stravaActivityDate = new Date(event.event_time * 1000);

    let dbUsersRef = admin.firestore().collection(ENV.APP_CONFIG.ORG).doc(ENV.APP_CONFIG.ENV).collection("users");

    let foundUser = false;
    let user = {};
    dbUsersRef.where("stravaAthleteId", "==", stravaAthleteId).limit(1).get().then((querySnapshot) => {
        querySnapshot.forEach(doc => {
            foundUser = true;
            user = doc.data();
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
                refreshToken(req).then(stravaInfo => {
                    updateActivity(stravaAccessToken);
                }).catch(err => {
                    console.error(`Error in refreshToken - ${err}`);
                });
            } else {
                updateActivity(user.stravaAccessToken);
            }
        } else {
            console.error(`Can not find user with stravaAthleteId:${stravaAthleteId}`);
        }
    }).catch((err) =>{
        console.error(`Error retrieving user with stravaAthleteId:${stravaAthleteId} , error: ${err}`);
    });

    return;
});
