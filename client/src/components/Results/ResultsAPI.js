import Util from "../Util/Util";

class ResultsAPI {

    static getChallengeResults(challengeUid) {
        return new Promise((resolve, reject) => {
            if (!challengeUid || challengeUid === "")
                reject(`Error getChallengeResults - Must pass valid challengeUid`);

            const firebase = Util.getFirebaseAuth();
            const getChallengeResults = firebase.functions.httpsCallable('getChallengeResults');
            const req = {"challengeUid" : challengeUid};
            
            getChallengeResults(req).then( (res) => {
                // Read result of the Cloud Function.
                console.log(`Success getChallengeResults`);
                resolve();
            }).catch(err => {
                console.error(`${err}`);
                reject(err);
            });
        });
    }
}

export default ResultsAPI;