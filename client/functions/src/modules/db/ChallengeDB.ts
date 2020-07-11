import * as admin from 'firebase-admin';
import { APP_CONFIG } from "../FirebaseEnvironment";

import { Challenge } from "../interfaces/Challenge";

class ChallengeDB {
    constructor() {
        // ctor
    }

    public get(challengeUid: string):Promise<Challenge> {
        return new Promise<any>((resolve:any, reject:any) => {
            console.log("ChallengeDB.get() started ...");
            const challengesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges");

            challengesRef.doc(challengeUid).get().then((doc) => {
                //
                if (doc.exists) {
                    const newDoc: FirebaseFirestore.DocumentData = doc.data();
                    newDoc.startDate = newDoc.startDate ? newDoc.startDate.toDate() : new Date();
                    newDoc.endDate = newDoc.endDate ? newDoc.endDate.toDate() : new Date();

                    const challenge = newDoc as Challenge;
                    challenge.id = doc.id;
                    resolve(challenge)
                } else {
                    console.log(`Can not find challenge with id: ${challengeUid}`);
                    reject(`Can not find challenge with id: ${challengeUid}`);
                }
            }).catch((err: Error) => {
                const error = new Error(`Error retrieving challenge with id : ${challengeUid}, ChallengeDB.ts, line: 30`);
                console.error(error);
                reject(error);
            });    
        }); //promise
    }
}

export { ChallengeDB }

