import * as admin from 'firebase-admin';
import { APP_CONFIG } from "../FirebaseEnvironment";

import { Result } from "../interfaces/Result";
import { AllResults } from "../Interfaces/Result.Types";
import { Challenge } from "../interfaces/Challenge";

class ResultsDB {
    private overallResults: Result = new Result();
    private teamResults: Array<Result> = [];
    private userResults: Array<Result> = [];

    public get(challenge: Challenge) {
        console.log("ResultsDB.get() started ...");
        return new Promise<any>((resolve:any, reject:any) => {
            const resultsRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("results");

            resultsRef.doc(challenge.id).get().then((doc) => {
                //
                if (doc.exists) {
                    const allResults = doc.data() as AllResults;
                    this.overallResults = allResults.overallResults;
                    this.teamResults = allResults.teamResults;
                    this.userResults = allResults.userResults;
                    resolve({overallResults: this.overallResults, teamResults: this.teamResults, userResults: this.userResults})
                } else {
                    console.log(`No results for challenge: ${challenge.id} -- neeed to calculate and create`);
                    reject(`No results for challenge: ${challenge.id}`)
                }
            }).catch((err: Error) => {
                const error = new Error(`Error retrieving results for challnge : ${challenge.id}, ResultsDB.ts, line: 31`);
                console.error(error);
                reject(error);
            });    
        }); //promise
    }

    public save(allResults:AllResults) {
        return new Promise<any>((resolve:any, reject:any) => {
            const dbResultsRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("results");
            // must convert all results to regualr json object or firestore gives errors
            console.log(`ResultsDB.save -- save challenge ${allResults.challengeUid} document as: ${JSON.parse(JSON.stringify(allResults))}`);
            dbResultsRef.doc(allResults.challengeUid).set(JSON.parse(JSON.stringify(allResults))).then (() => {
                resolve();
            }).catch (err => {
                const error = new Error(`Error saving results for challenge ${allResults.challengeUid} -- ${err} : "ResultsDB.ts", line: 45`);
                console.error(error);
                reject(error);
            });
        });//promsie
    }

}
export { ResultsDB }