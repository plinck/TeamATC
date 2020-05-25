import Util from "../Util/Util";

class ResultsDB {

    getAll(challengeUid) {
        return new Promise((resolve, reject) => {
            if (!challengeUid || challengeUid === "") {
                const error = new Error(`Error challengeUid not valid - Get all results failed for challenge: ${challengeUid}, ResultsDB.ts, line: 12`);
                console.error(error);    
                reject(error);
            }
        
            let allDBRefs = Util.getChallengeDependentRefs(challengeUid);
            const dbResultsRef = allDBRefs.dbResultsRef;

            console.log(`ResultsDB.getAll() started for challenge ${challengeUid} ...`);
            dbResultsRef.where("challengeUid", "==", challengeUid).get().then((snap) => {
                let overallResults;
                let foundResults = false;
                const teamResults = [];
                const userResults = [];
                snap.forEach(doc => {
                    const result = doc.data();
                    if (result.overallRecord) {
                        foundResults = true;
                        overallResults = result;
                    } else if (result.teamRecord) {
                        teamResults.push(result);     
                    } else if (result.userRecord) {
                        userResults.push(result);     
                    }
                });
                if (foundResults) {
                    const allResults = {challengeUid: challengeUid, overallResults: overallResults, teamResults: teamResults, userResults: userResults};
                    // console.log(`getResults allResults: ${JSON.stringify(allResults, null,2)}`);
                    resolve(allResults);
                } else {
                    console.log(`Warning Didnt find any results for challenge : ${challengeUid}, ResultsDB.ts, line: 73`);
                    reject(`Warning Didnt find any results for challenge : ${challengeUid}, ResultsDB.ts, line: 73`);
                }
            }).catch((err) => {
                console.log(`Warning ${err} retrieving results for challenge : ${challengeUid}, ResultsDB.ts, line: 77`);
                reject(`Warning ${err} retrieving results for challenge : ${challengeUid}, ResultsDB.ts, line: 77`);
            });    
        }); //promise
    }
}
export { ResultsDB }