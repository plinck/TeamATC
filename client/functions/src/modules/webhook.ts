import * as functions from 'firebase-functions';
import * as request from 'request';
import * as express from 'express';
import { FUNCTIONS_CONFIG } from "./FirebaseEnvironment";
import { IncomingStravaEventType, StravaEvent } from "./interfaces/StravaEvent";
import { StravaEventDB } from "./db/StravaEventDB";

const app = express();

app.get('/strava', (req, res) => {
        console.log("In Strava webhook get API");
     // Your verify token. Should be a random string.
        const VERIFY_TOKEN = "STRAVA";
        // Parses the query params
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        // Checks if a token and mode is in the query string of the request
        if (mode && token) {
            // Verifies that the mode and token sent are valid
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {     
            // Responds with the challenge token from the request
                console.log('WEBHOOK_VERIFIED');
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
    const event: IncomingStravaEventType = req.body as IncomingStravaEventType;
    console.log(`[STRAVA] Event: {
        aspect_type:${event.aspect_type}
        @event_time:${event.event_time}
        object_id:${event.object_id}
        object_type:${event.object_type}
        owner_id:${event.owner_id}
        subscription_id:${event.subscription_id}
        updates:${JSON.stringify(event.updates)} 
        }`);
    // save event for later processing
    const newEvent:StravaEvent = new StravaEvent(event);

    const stravaEventDB: StravaEventDB = new StravaEventDB();
    stravaEventDB.save(newEvent).then((savedEvent:StravaEvent) => {
        console.log(`Success saving event`);
        res.status(200).json({ success: true });
        return;
    }).catch(err => {
        console.log(`Error ${err} saving event`);
        res.status(200).json({ success: true });
        return;
    });
    // saveStravaEvent(event).then(() => {
    //     //return res.status(200).json({ success: true });
    // }).catch(err => {
    //     //return res.status(200).json({ success: true });
    // });
    // // I think i need to return quickly from this so strava knows it worked. ...
    // return res.status(200).json({ success: true });
});

app.get('/subscribe', (req, res) => {
        console.log(`called webhooks subscribe`);
        const callbackURL = req.query.callback_url ? req.query.callback_url : FUNCTIONS_CONFIG.strava.callback_url;

        const params = {
            client_id: FUNCTIONS_CONFIG.strava.client_id,
            client_secret: FUNCTIONS_CONFIG.strava.client_secret,
            callback_url: callbackURL,
            verify_token: 'STRAVA',
        };

        const URIRequest = "https://www.strava.com/api/v3/push_subscriptions?" + 
            `client_id=${params.client_id}` +
            `&client_secret=${params.client_secret}` +
            `&callback_url=${params.callback_url}` +
            `&verify_token=${params.verify_token}`
            ;

        // console.log(`URIRequest: ${URIRequest}`);
        request.post(
            URIRequest,null,
            (error: any, response: any, body: any) => {
              if (error) {
                console.error("Error from POST: ", error)
              }
            //   console.log(`statusCode: ${response.statusCode}`)
            //   console.log("Body from POST: ", body)
            }
        )
        res.status(200).json({ success: true });

});
exports.strava = functions.https.onRequest(app);
