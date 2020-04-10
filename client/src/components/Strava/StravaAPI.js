import Util from "../Util/Util";
import { FB_CONFIG } from "../Environment/Environment.js"
import axios from "axios";

class StravaAPI {
    static refreshToken(code, state) {
        console.log(`Refreshing Token with code: ${code} state: ${state}`);
    }

    static sendAuthRequestExpress() {
        const URIRequest=`https://us-central1-${FB_CONFIG.PROJECT_ID}.cloudfunctions.net/oauth/stravaauth`;
        window.location.replace(URIRequest);
    }

    static getOAuthToken(code) {
        return new Promise((resolve, reject) => {
            const firebase = Util.getFirebaseAuth();
            const stravaGetToken = firebase.functions.httpsCallable('stravaGetToken');
            const req = {"code": code};
            
            stravaGetToken(req).then( (res) => {
                // Read result of the Cloud Function.
                console.log(`Success gettng token, response.data: ${JSON.stringify(res.data)}`);
                resolve(res.data);
            }).catch(err => {
                console.error(`${err}`);
                reject(err);
            });
        });

    }

    static sendOAuthRequestFromClient() {
        console.log(`called sendOAuthRequestFromClient from client`);

        const client_id = "45739";
        const redirect_uri = "http://localhost:3000/oauthredirect";
        const response_type = "code";
        const approval_prompt = "auto"
        const scope = "activity:read_all";
        const state = "STRAVA";
        const myToken = "be7573b7721ba4a5987fea739f28d1d596b89b38";
    
        const URIRequest = `https://www.strava.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&approval_prompt=${approval_prompt}&scope=${scope}&state=${state}`;
    
        // axios.get(URIRequest, {
        //     headers: {
        //         'Authorization': `Bearer ${myToken}`
        //     }
        // });

        window.location.replace(URIRequest);

    
        return;
    
    }
}

export default StravaAPI;