const ORG=process.env.REACT_APP_FIREBASE_ORG;
const ENV=process.env.REACT_APP_FIREBASE_ENV;

// Firebase
// const FB_CONFIG = {
//     API_KEY:process.env.REACT_APP_API_KEY ? process.env.REACT_APP_API_KEY : "AIzaSyBmeZVx6YKWwqMP8FvsEyoG0eIxcinHYc4",
//     AUTH_DOMAIN:process.env.REACT_APP_AUTH_DOMAIN ? process.env.REACT_APP_AUTH_DOMAIN : "teamatc-challenge.firebaseapp.com",
//     DATABASE_URL:process.env.REACT_APP_DATABASE_URL ? process.env.REACT_APP_DATABASE_URL : "https://teamatc-challenge.firebaseio.com",
//     PROJECT_ID:process.env.REACT_APP_PROJECT_ID ? process.env.REACT_APP_PROJECT_ID : "teamatc-challenge",
//     STORAGE_BUCKET:process.env.REACT_APP_STORAGE_BUCKET ? process.env.REACT_APP_STORAGE_BUCKET : "teamatc-challenge.appspot.com",
//     MESSAGING_SENDER_ID:process.env.REACT_APP_MESSAGING_SENDER_ID ? process.env.REACT_APP_MESSAGING_SENDER_ID : "961307717305",
//     APP_ID:process.env.REACT_APP_APP_ID ? process.env.REACT_APP_APP_ID : "1:961307717305:web:faa30c4e8b56dc5c097568",
//     MEASUREMENT_ID:process.env.REACT_APP_MEASUREMENT_ID ? process.env.REACT_APP_MEASUREMENT_ID : "G-FXGMVHS2ZX"
// }

// Firebase
const FB_CONFIG = {
    API_KEY:process.env.REACT_APP_API_KEY,
    AUTH_DOMAIN:process.env.REACT_APP_AUTH_DOMAIN,
    DATABASE_URL:process.env.REACT_APP_DATABASE_URL,
    PROJECT_ID:process.env.REACT_APP_PROJECT_ID,
    STORAGE_BUCKET:process.env.REACT_APP_STORAGE_BUCKET,
    MESSAGING_SENDER_ID:process.env.REACT_APP_MESSAGING_SENDER_ID,
    APP_ID:process.env.REACT_APP_APP_ID,
    MEASUREMENT_ID:process.env.REACT_APP_MEASUREMENT_ID
}

let CHALLENGE="9uxEvhpHM2cqCcn1ESZg";

// Set *default* challegne based on env
if (ENV === "prod") {
    CHALLENGE="ndqmG6qixVYrSoek4qJL";
} else {
    CHALLENGE="mFpSMP7oWvriDwIehwzB" 
}

console.log(`Using global environment ORG: ${ORG}, ENV: ${ENV}  CHALLENGE: ${CHALLENGE}`);  
// console.log(`Using FB_CONFIG: ${JSON.stringify(FB_CONFIG, null, 2)}`);  

class globalEnv {
    // Formats a display money field 
    static get = () => {
        const env = {
            ORG: ORG,
            ENV: ENV,
        };
        console.log(`Using global environment: ${JSON.stringify(env, null, 4)}`);  
        return env;
    };
}

export default globalEnv;
export { ORG, ENV, CHALLENGE, FB_CONFIG };