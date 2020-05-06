import * as functions from 'firebase-functions';
import * as fs from "fs";

let FUNCTIONS_CONFIG = functions.config().env;

// This is for running FB functions locally
if (process.env.REACT_APP_RUN_FUNCTIONS_LOCALLY === 'local') {
  if (fs.existsSync('../.env-strava-config.json')) {
    const env = require('../.env-strava-config.json');
    console.log("running functions locally");
    FUNCTIONS_CONFIG = env;
  }
}

const APP_CONFIG = {
    ORG : functions.config().env.app.org,
    ENV : functions.config().env.app.env,
    CHALLENGEUID : ""    
}

// Set env vars
const envSet = (org:string, env:string, challengeUid:string) => {
    APP_CONFIG.ORG = org;
    APP_CONFIG.ENV = env;
    APP_CONFIG.CHALLENGEUID = challengeUid;
    
    console.log(`Using global environment: ${JSON.stringify(APP_CONFIG, null, 2)}`);  
    return;
};

const getFunctionsConfig = () => {
    return FUNCTIONS_CONFIG;
};
const getAppConfig = () => {
    return APP_CONFIG;
};

export { envSet, getFunctionsConfig, getAppConfig, FUNCTIONS_CONFIG, APP_CONFIG };
