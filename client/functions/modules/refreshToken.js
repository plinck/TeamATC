const axios = require('axios');
const {FUNCTIONS_CONFIG} = require("./FirebaseEnvironment.js");
const {updateUserWithStrava} = require("./updateUserWithStrava");

const refreshToken = ((req, res) => {
    return new Promise((resolve, reject) => {
        console.log(`called stravaRefreshToken with request`);
        console.log(req);
        let refresh_token = undefined;
        let uid = undefined;
        if (req && req.refresh_token && req.uid) {
            refresh_token = req.refresh_token;
            uid = req.uid;
        } else {
            return reject(`Error oin stravaRefreshToken - invalid parm - must provide uid and refresh_token`);
        }

        const params = {
            client_id: FUNCTIONS_CONFIG.strava.client_id,
            client_secret: FUNCTIONS_CONFIG.strava.client_secret,
            refresh_token: refresh_token,
            grant_type: "refresh_token"
        };

        const URIRequest = "https://www.strava.com/api/v3/oauth/token?" + 
            `client_id=${params.client_id}` +
            `&client_secret=${params.client_secret}` +
            `&refresh_token=${params.refresh_token}` +
            `&grant_type=${params.grant_type}`
            ;

        console.log(`URIRequest: ${URIRequest}`);

        axios.post(URIRequest).then((res) => {
            console.log("Successfully sent strava token refresh srequest.  response info");

            // MJUST break up response since FB functions can not resolve this complex
            // res object as it has circular reference.  It causes an error;
            // Unhandled error RangeError: Maximum call stack size exceeded
            const clientResponse = {
                refresh_token: res.data.refresh_token,
                access_token: res.data.access_token,
                expires_at: res.data.expires_at,
                expires_in: res.data.expires_in,
            }

            // NOW, save the strava info to the user account, maybe do in client
            // Must Save access_toke, refresh_token, expires_at, accepted_scopes
            updateUserWithStrava(uid, clientResponse).then (() => {
                resolve(clientResponse);
            }).catch((err) => {
                console.error(`FB Func: stravaRefreshToken in updateUserWithStrava -- Error : ${err}`);
                reject(`FB Func: stravaRefreshToken in updateUserWithStrava -- Error : ${err}`); 
            });
        }).catch((err) => {
            console.error(`FB Func: stravaRefreshToken axios.post(URIRequest) failed -- Error : ${err}`);
            reject(`FB Func: stravaRefreshToken axios.post(URIRequest) failed -- Error : ${err}`); 
        });
    });
});

module.exports = { refreshToken };