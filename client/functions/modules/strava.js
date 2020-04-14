const functions = require('firebase-functions');
const axios = require('axios');
const cors = require('cors')({origin: true});
const express = require('express');
const ENV = require("../FirebaseEnvironment.js");

const app = express();
app.get('/stravaauth', async (req, res) => {
    console.log(`called stravaSendAuthorizationRequest with environment ${req}`);
    const redirectURL = req.query.redirect_uri ? req.query.redirect_uri : ENV.FUNCTIONS_CONFIG.strava.redirect_uri;
    console.log(`redirectURL: ${redirectURL}`)
    
    const params = {
        client_id: ENV.FUNCTIONS_CONFIG.strava.client_id,
        redirect_uri: redirectURL,
        response_type: 'code',
        approval_prompt: "auto",
        scope: "activity:read_all",
        state: "STRAVA"
    };

    try {
        const URIRequest = "https://www.strava.com/oauth/authorize?" + 
        `client_id=${params.client_id}` +
        `&redirect_uri=${params.redirect_uri}` +
        `&response_type=${params.response_type}` +
        `&approval_prompt=${params.approval_prompt}` +
        `&scope=${params.scope}` +
        `&state=${params.state}`
        ;

        console.log(`Request to redirect: ${URIRequest}`);
        res.redirect(URIRequest);
        res.end(200);
    } catch (err) {
        console.error(`Error redirecting to URI: ${err}`);
        res.redirect(`${redirect_uri}?error=BadRequest`);
        return res.status(401).json(`Error Caught in OAuth server request: ${err}`);
    }

});
exports.oauth = functions.https.onRequest(app);