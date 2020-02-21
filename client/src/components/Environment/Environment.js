const ORG=process.env.REACT_APP_FIREBASE_ORG ? process.env.REACT_APP_FIREBASE_ORG : "ATC";
const ENV=process.env.REACT_APP_FIREBASE_ENV ? process.env.REACT_APP_FIREBASE_ENV : "dev";
const USERS_DB="users";


class globalEnv {
    // Formats a display money field 
    static get = () => {
        const env = {
            ORG: ORG,
            ENV: ENV,
            USERS_DB: USERS_DB
        };
        console.log(`using global environment: ${JSON.stringify(env, null, 4)}`);  
        return env;
    };
}

export default { ORG, ENV, USERS_DB, globalEnv };  