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
        return new Promise<any>((resolve:any, reject:any) => {
            const resultsRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("results");

            console.log(`ResultsDB.getAll() started for challenge ${challenge.id} ...`);
            resultsRef.where("challengeUid", "==", challenge.id).get().then((snap) => {
                let overallResults: Result;
                let foundResults: boolean = false;
                const teamResults: Array<Result> = [];
                const userResults: Array<Result> = [];
                snap.forEach(doc => {
                    const result = doc.data() as Result;
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
                    const allResults: AllResults = {challengeUid: challenge.id, overallResults: overallResults, teamResults: teamResults, userResults: userResults};
                    // console.log(`getResults allResults: ${JSON.stringify(allResults, null,2)}`);
                    resolve(allResults);
                } else {
                    const error = new Error(`Didnt find any results for challenge : ${challenge.id}, ResultsDB.ts, line: 61`);
                    console.error(error);
                    reject(error);
                }
            }).catch((err: Error) => {
                const error = new Error(`Error ${err} retrieving results for challenge : ${challenge.id}, ResultsDB.ts, line: 66`);
                console.error(error);
                reject(error);
            });    
        }); //promise
    }

    public save(allResults:AllResults) {
        return new Promise<any>((resolve:any, reject:any) => {
            // console.log(`ResultsDB.save -- save challenge ${allResults.challengeUid} document as: ${JSON.stringify(allResults)}`);
            const dbResultsRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("results");
            const batch = admin.firestore().batch();

            // Overall results - 1 record
            const overallKey = `${allResults.challengeUid}-OR1`;
            const overallResult = JSON.parse(JSON.stringify(allResults.overallResults));
            const overallDocRef =  dbResultsRef.doc(overallKey);
            batch.set(overallDocRef, overallResult, { merge: true });
            // All teams 
            for (let i = 0; i < allResults.teamResults.length; i++) {
                const resultsKey = `${allResults.challengeUid}-TR${i}`;
                const result = JSON.parse(JSON.stringify(allResults.teamResults[i]));
                const resultDocRef =  dbResultsRef.doc(resultsKey);
                batch.set(resultDocRef, result, { merge: true });
            }
            // All users
            for (let i = 0; i < allResults.userResults.length; i++) {
                const resultsKey = `${allResults.challengeUid}-UR${i}`;
                const result = JSON.parse(JSON.stringify(allResults.userResults[i]));
                const resultDocRef =  dbResultsRef.doc(resultsKey);
                batch.set(resultDocRef, result, { merge: true });
            }
            // Commit the batch
            batch.commit().then(() => {
                console.log(`Batch results update successfully committed for challenge: ${allResults.challengeUid}, ResultsDB.ts, line: 100`);
                resolve();
            }).catch((err: Error) =>{
                const error = new Error(`Error ${err} - Batch user update failed for user: ${allResults.challengeUid}, ResultsDB.ts, line: 103`);
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

    public refSaveOrderPromises(allResults:AllResults) {
        return new Promise<any>((resolve:any, reject:any) => {
            // console.log(`ResultsDB.save -- save challenge ${allResults.challengeUid} document as: ${JSON.stringify(allResults)}`);
            const dbResultsRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("results");

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
                        const error = new Error(`Error ${err1} - Batch user update failed for team result ${i}, ResultsDB.ts, line: 206`);
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
                        const error = new Error(`Error ${err1} - Batch user update failed for user result ${i}, ResultsDB.ts, line: 210`);
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
                console.log(`Batch results update successfully committed for challenge: ${allResults.challengeUid}, ResultsDB.ts, line: 231`);
                resolve();
            }).catch((err: Error) =>{
                const error = new Error(`Error ${err} - Batch user update failed for user: ${allResults.challengeUid}, ResultsDB.ts, line: 234`);
                console.error(error);    
                reject(err);
            });
        });//promsie
    }

    public refTransactionUpdate(allResults:AllResults) {
        return new Promise<any>((resolve:any, reject:any) => {
            const dbResultsRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("results");
            const docRef1 = dbResultsRef.doc('1');
            const docRef2 = dbResultsRef.doc('2');

            // As explained in the documentation for the Node.js Client Library update() method, it returns a Transaction
            // which is "used for chaining method calls." (Note that update() method of the Admin SDK behaves exactly the same way).
            // So, for example, if within the transaction you want to get a value from a doc, 
            // increase it and use it to update two documents from two different collections 
            // you would do as follows:            
            let newNbractivities: number;
            admin.firestore().runTransaction(t1 => {
                return t1.get(docRef1).then(doc => {
                    newNbractivities = doc.data().nbrActivities + 1;  //You calculate the new value
                    return t1.update(docRef1 , {nbrActivities : newNbractivities});
                }).then(t2 => {
                    return t2.update(docRef2 , {nbrActivities : newNbractivities});
                });
            }).then(t3 => {
                console.log('Transaction success!' + t3);
            }).catch((err: Error) => {
                console.log('Transaction failure:', err);
            });
        });
    }
}
export { ResultsDB }