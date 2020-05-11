import * as admin from 'firebase-admin';
import { APP_CONFIG } from "../FirebaseEnvironment";

import { Result } from "../interfaces/Result";
import { AllResults } from "../Interfaces/Result.Types";
import { Challenge } from "../interfaces/Challenge";

class ResultsDB {

    public get(challenge: Challenge) {
        console.log("ResultsDB.get() started ...");
        return new Promise<any>((resolve:any, reject:any) => {
            const resultsRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("results");

            resultsRef.doc(challenge.id).get().then((doc) => {
                //
                if (doc.exists) {
                    const allResults = doc.data() as AllResults;
                    const overallResults = allResults.overallResults;
                    const teamResults = allResults.teamResults;
                    const userResults = allResults.userResults;
                    resolve({overallResults: overallResults, teamResults: teamResults, userResults: userResults})
                } else {
                    console.log(`No results for challenge: ${challenge.id} -- neeed to calculate and create`);
                    reject(`No results for challenge: ${challenge.id}`)
                }
            }).catch((err: Error) => {
                const error = new Error(`Error retrieving results for challnge : ${challenge.id}, ResultsDB.ts, line: 28`);
                console.error(error);
                reject(error);
            });    
        }); //promise
    }

    public getAll(challenge: Challenge) {
        console.log(`ResultsDB.getAll() started for challenge ${challenge.id} ...`);
        return new Promise<any>((resolve:any, reject:any) => {
            const resultsRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("results");

            const overallKey = `${challenge.id}-OR1`;
            resultsRef.doc(overallKey).get().then((doc) => {
                //
                if (doc.exists) {
                    const allResults = doc.data() as AllResults;
                    const overallResults = allResults.overallResults;
                    const teamResults = allResults.teamResults;
                    const userResults = allResults.userResults;
                    resolve({overallResults: overallResults, teamResults: teamResults, userResults: userResults})
                } else {
                    console.log(`No results for challenge: ${challenge.id} -- neeed to calculate and create`);
                    reject(`No results for challenge: ${challenge.id}`)
                }
            }).catch((err: Error) => {
                const error = new Error(`Error retrieving results for challnge : ${challenge.id}, ResultsDB.ts, line: 54`);
                console.error(error);
                reject(error);
            });    
        }); //promise
    }

    public save(allResults:AllResults) {
        return new Promise<any>((resolve:any, reject:any) => {
            console.log(`ResultsDB.save -- save challenge ${allResults.challengeUid} document as: ${JSON.stringify(allResults)}`);
            const dbResultsRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("results");
            // const batch = admin.firestore().batch();

            const overallKey = `${allResults.challengeUid}-OR1`;
            const overallResult = JSON.parse(JSON.stringify(allResults.overallResults));
            // Overall results - 1 record
            dbResultsRef.doc(overallKey).set(overallResult, { merge: true }).then (() => {
                return true;
                // Now do team results
            }).then(() => {
                // All teams 
                for (let i = 0; i < allResults.teamResults.length; i++) {
                    const result = JSON.parse(JSON.stringify(allResults.teamResults[i]));
                    const resultsKey = `${allResults.challengeUid}-TR${i}`;
                    dbResultsRef.doc(resultsKey).set(result, { merge: true }).then (() => {
                        // OK, continue
                    }).catch ((err1: Error) => {
                        const error = new Error(`Error ${err1} - Batch user update failed for team result ${i}, ResultsDB.ts, line: 81`);
                        console.log(error);  
                        // Don worry, continue          
                    });
                }
                return true;
            }).then(() => {
                // All users 
                for (let i = 0; i < allResults.userResults.length; i++) {
                    const result = JSON.parse(JSON.stringify(allResults.userResults[i]));
                    const resultsKey = `${allResults.challengeUid}-UR${i}`;
                    dbResultsRef.doc(resultsKey).set(result, { merge: true }).then (() => {
                        // OK, continue
                    }).catch ((err1: Error) => {
                        const error = new Error(`Error ${err1} - Batch user update failed for user result ${i}, ResultsDB.ts, line: 94`);
                        console.log(error);  
                        // Don worry, continue          
                    });
                }
                return true;
            }).then(() => {
                // Commit the batch
                // return batch.commit();
                return true;
            }).then(() => {
                console.log(`Batch results update successfully committed for challenge: ${allResults.challengeUid}, ResultsDB.ts, line: 104`);
                resolve();
            }).catch((err: Error) =>{
                const error = new Error(`Error ${err} - Batch user update failed for user: ${allResults.challengeUid}, ResultsDB.ts, line: 107`);
                console.error(error);    
                reject(err);
            });
        });//promsie
    }

    public refBatchUpdate() {
        return new Promise<any>((resolve:any, reject:any) => {
            // Get a new write batch
            const dbResultsRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("results");
            const batch = admin.firestore().batch();

            // Set the value
            const overallKey = `${"testkey"}-OR1`;
            const overallResult = {test:"test"};
            const overallDocRef =  dbResultsRef.doc(overallKey);
            // Overall results - 1 record
            batch.set(overallDocRef, overallResult);

            // Set the value
            const teamKey = `${"testkey"}-OR1`;
            const teamResult = {test:"test"};
            const teamDocRef =  dbResultsRef.doc(teamKey);
            // Overall results - 1 record
            batch.set(teamDocRef, teamResult);

            // Set the value
            const userKey = `${"testkey"}-OR1`;
            const userResult = {test:"test"};
            const userDocRef =  dbResultsRef.doc(userKey);
            // Overall results - 1 record
            batch.set(userDocRef, userResult);

            // Commit the batch
            batch.commit().then( () => {
                resolve();
            }).catch ((err: Error) => {
                reject(err);
            });
        });
    }

    public refPromiseAll = () => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            const dbResultsRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("results");

            // then get from firestore
            const results: Array<Result> = [];

            const docRef = dbResultsRef;
            docRef.get().then((querySnapshot) => {
                const resutsQueries:any = [];
                querySnapshot.forEach(doc => {
                    const newDoc = doc.data();
                    newDoc.id = doc.id;

                    const result = newDoc as Result;
                    // get the user ndoc.data().uid;
                    const userRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("results").doc(result.uid);
                    const userQuery = userRef.get().then ( user => {
                        if (user.exists) {
                            result.displayName = user.data().displayName;
                        }
                    }).catch((err: Error) => {
                        console.error(`Error refPromiseAll.userQuery: ${err}`);
                    }).finally(() => {
                        results.push(result);
                    });
                    resutsQueries.push(userQuery);
                });
                // This waits until ALL promises in the resutsQueries array are resolved
                Promise.all(resutsQueries).then(() => {
                    resolve(results);
                }).catch((err2:Error) => {
                    reject(err2);
                });
            }).catch(err => {
                reject(`Error resultsDB.refPromiseAll ${err.message}`);
            });
        });
    }
}
export { ResultsDB }


