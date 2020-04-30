const admin = require('firebase-admin');
const axios = require('axios');
const { APP_CONFIG } = require("./FirebaseEnvironment.js");
const { refreshToken } = require("./refreshToken");;
const { addStravaActivity } = require("./addStravaActivity");
// ===============================================================
// local not exported/helperfunctions
// ===============================================================
const updateActivity = ((user, accessToken, stravaActivityId) => {
    const stravaAccessToken = accessToken;
    // get the activity
    console.log(`In updateActivity for strava activity id: ${stravaActivityId}`);
    if (stravaAccessToken) {
        const URIRequest = `https://www.strava.com/api/v3/activities/${stravaActivityId}`;
        console.log(`URIRequest: ${URIRequest}`);
        axios.get(URIRequest,
            { headers: { 'Authorization': `Bearer ${stravaAccessToken}` } }
        ).then((res) => {
            // console.log(`activity from Strava: ${JSON.stringify(res.data, null, 4)}`);
            // console.log(`Success retrieving activity from Strava`);
            console.log(`Success retrieving activity from Strava Type: ${res.data}, id: ${res.data.id}`);

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

exports.saveStravaEvent = ( (event) => {
    // console.log(`In saveStravaEvent with: ORG: ${APP_CONFIG.ORG}, ENV: ${APP_CONFIG.ENV}`);
    // console.log(JSON.stringify(event,null,4));

    // make sure its an activity create event
    if (event.aspect_type !== "create" || event.object_type !== "activity") {
        console.log(`In saveStravaEvent -- aspect_type and object_type is NOT new activity`);
        return;
    }
    console.log(`In saveStravaEvent -- found new activity`);
    let stravaAthleteId = event.owner_id;
    let stravaActivityId = event.object_id;
  
    let foundUser = false;
    let user = {};
    let dbUsersRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("users");
    dbUsersRef.where("stravaAthleteId", "==", stravaAthleteId).limit(1).get().then((querySnapshot) => {
        console.log(`saveStravaEvent - "dbUsersRef after where clause" before foreach()`);
        querySnapshot.forEach(doc => {
            foundUser = true;
            user = doc.data();
            user.id = doc.id;
            user.stravaExpiresAt = user.stravaExpiresAt ? user.stravaExpiresAt.toDate() : null;
        });
        if (foundUser) {
            console.log(`Found User with Athlete Id ${stravaAthleteId}, displayName: ${user.displayName}`);
            // check to make sure access token not expired
            let today = new Date();
            if (!user.stravaExpiresAt || today > user.stravaExpiresAt) {
                // Must refresh users access token
                let req = {"uid" : user.id, "refresh_token" : user.stravaRefreshToken};
                console.log(`Calling refreshToken with stravaRefreshToken: ${user.stravaRefreshToken}, stravaAccessToken: ${user.stravaAccessToken}`);

                refreshToken(req).then(stravaInfo => {
                    // console.log(`Refreshed stravaInfo.access_token: ${stravaInfo.access_token}`);
                    updateActivity(user, stravaInfo.access_token, stravaActivityId);
                }).catch(err => {
                    console.error(`Error in refreshToken - ${err}`);
                });
            } else {
                // console.log(`Used user.stravaAccessToken: ${user.stravaAccessToken}`);
                updateActivity(user, user.stravaAccessToken, stravaActivityId);
            }
        } else {
            console.error(`Can not find user with stravaAthleteId:${stravaAthleteId}`);
        }
    }).catch((err) =>{
        console.error(`Error retrieving user with stravaAthleteId:${stravaAthleteId} , error: ${err}`);
    });

    return;
});
