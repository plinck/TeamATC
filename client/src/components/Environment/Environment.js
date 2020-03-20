const ORG=process.env.REACT_APP_FIREBASE_ORG ? process.env.REACT_APP_FIREBASE_ORG : "ATC";
const ENV=process.env.REACT_APP_FIREBASE_ENVIRONMENT ? process.env.REACT_APP_FIREBASE_ENVIRONMENT : "dev";
const CHALLENGE="9uxEvhpHM2cqCcn1ESZg";

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