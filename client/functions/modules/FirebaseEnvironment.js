const functions = require('firebase-functions');
const fs = require('fs')

let FUNCTIONS_CONFIG = functions.config().env;

// This is for running FB functions locally
/*
if (process.env.NODE_ENV !== 'production') {
  if (fs.existsSync('../.env-strava-config.json')) {
    const env = require('../.env-strava-config.json');
    console.log("running functions locally");
    FUNCTIONS_CONFIG = env;
  }
}
*/

let APP_CONFIG = {
    ORG : "ATC",
    ENV : "prod",
    CHALLENGEUID : ""    
}

// Set env vars
const set = (org, env, challengeUid) => {
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

module.exports = { set, getFunctionsConfig, getAppConfig, FUNCTIONS_CONFIG, APP_CONFIG };