const functions = require('firebase-functions');
const request = require('request');
const cors = require('cors')({origin: true});
const express = require('express');
const ENV = require("./FirebaseEnvironment.js");
const events = require("./events");

const app = express();

app.get('/strava', (req, res) => {
        console.log("In Strava webhook get API");
     // Your verify token. Should be a random string.
        const VERIFY_TOKEN = "STRAVA";
        // Parses the query params
        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];

        // Checks if a token and mode is in the query string of the request
        if (mode && token) {
            // Verifies that the mode and token sent are valid
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {     
            // Responds with the challenge token from the request
                console.log('WEBHOOK_VERIFIED');
                console.log('hub.challenge', challenge);
                res.json({"hub.challenge":challenge});
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                console.error(`mode !== subscribe and / or token !=  VERIFY_TOKEN`);
                res.sendStatus(403).json({"Error" : "mode !== subscribe and / or token !=  VERIFY_TOKEN"});      
            }
        } else {
            console.error(`mode and token not present`);
            res.sendStatus(404).json({"Error" : "mode and token not presen"});;
        }
});

app.post('/strava', async (req, res) => {
  const event = req.body;
  console.log('[STRAVA] Event ' + event.aspect_type + ': ' + event.object_type + ' (' + event.object_id + ') for ' + event.owner_id + ' (updates: ' + JSON.stringify(event.updates) + ' @ ' + event.event_time);
  // save event as activity
  events.saveStravaEvent(event);

  return res.status(200).json({ success: true });
});

app.get('/subscribe', (req, res) => {
        console.log(`called webhooks subscribe`);
        const callbackURL = req.query.callback_url ? req.query.callback_url : ENV.FUNCTIONS_CONFIG.strava.callback_url;
        console.log(`callbackURL: ${callbackURL}`)

        const params = {
            client_id: ENV.FUNCTIONS_CONFIG.strava.client_id,
            client_secret: ENV.FUNCTIONS_CONFIG.strava.client_secret,
            callback_url: callbackURL,
            verify_token: 'STRAVA',
        };

        const URIRequest = "https://www.strava.com/api/v3/push_subscriptions?" + 
            `client_id=${params.client_id}` +
            `&client_secret=${params.client_secret}` +
            `&callback_url=${params.callback_url}` +
            `&verify_token=${params.verify_token}`
            ;

        console.log(`URIRequest: ${URIRequest}`);
        request.post(
            URIRequest,null,
            (error, res, body) => {
              if (error) {
                console.error("Error from POST: ", error)
              }
              console.log(`statusCode: ${res.statusCode}`)
              console.log("Body from POST: ", body)
            }
        )
        res.status(200).json({ success: true });

});
exports.strava = functions.https.onRequest(app);
