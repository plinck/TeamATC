const ORG=process.env.REACT_APP_FIREBASE_ORG ? process.env.REACT_APP_FIREBASE_ORG : "ATC";
const ENV=process.env.REACT_APP_FIREBASE_ENV ? process.env.REACT_APP_FIREBASE_ENV : "prod";
let CHALLENGE="9uxEvhpHM2cqCcn1ESZg";

// Set *default* challegne based on env
if (ENV === "prod") {
    CHALLENGE="ndqmG6qixVYrSoek4qJL";
} else {
    CHALLENGE="mFpSMP7oWvriDwIehwzB" 
}

console.log(`Using global environment ORG: ${ORG}, ENV: ${ENV}`);  

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
export { ORG, ENV, CHALLENGE };