import * as admin from 'firebase-admin';
import { APP_CONFIG } from "../FirebaseEnvironment";

import { User } from "../interfaces/User";

class UserDB {
    constructor() {
        // ctor
    }

    public get(userId: string):Promise<User> {
        return new Promise<any>((resolve:any, reject:any) => {
            console.log("UserDB.get() started ...");
            const userRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("users");

            userRef.doc(userId).get().then((doc) => {
                //
                if (doc.exists) {
                    const newDoc: FirebaseFirestore.DocumentData = doc.data();
                    newDoc.stravaExpiresAt = newDoc.stravaExpiresAt ? newDoc.stravaExpiresAt.toDate() : new Date();

                    const user = newDoc as User;
                    user.uid = doc.id;
                    resolve(user)
                } else {
                    console.log(`Can not find user with id: ${userId}`);
                    reject(`Can not find user with id: ${userId}`);
                }
            }).catch((err: Error) => {
                const error = new Error(`Error retrieving user with id : ${userId}, UserDB.ts, line: 27`);
                console.error(error);
                reject(error);
            });    
        }); //promise
    }

    // Go thorugh the user and fix all the display names for their activities
    public updateUserActivityDisplayNameWithUid(userId: string):Promise<any> {            
        return new Promise<any>((resolve:any, reject:any) => {
            console.log("updateUsersActivityName() started ...");
            this.get(userId).then((user) => {
                let activitiesRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
                if (user.challengeUid && user.challengeUid !== "") {
                    activitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(user.challengeUid ).collection(`activities`);
                }
                const batch = admin.firestore().batch();
                activitiesRef.where("uid", "==", userId).get().then((snapshop) => {
                    snapshop.forEach(doc => {
                        batch.set(doc.ref, {
                            displayName: user.displayName,
                        }, { merge: true });
                    });
                    return batch.commit();
                }).then(() => {
                    console.log("Batch user successfully committed!");
                    resolve();
                }).catch((err: Error) =>{
                    const error = new Error(`Error ${err} - Batch user update failed for use: ${userId}, UserDB.ts, line: 57`);
                    console.error(error);    
                    reject(err);
                });
            }).catch((err2: Error) => {
                const error = new Error(`Error ${err2} retrieving user with id : ${userId}, UserDB.ts, line: 63`);
                console.error(error);
                reject(error);
            });    
        }); //promise
    }

    // Go thorugh the user and fix all the display names for their activities
    public updateUserActivityDisplayNameWithUser(user: User):Promise<any> {            
        return new Promise<any>((resolve:any, reject:any) => {
            console.log(`updateUsersActivityName() started for user with id: ${user.uid}, displayName: ${user.displayName} ...`);
            let activitiesRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
            if (user.challengeUid && user.challengeUid !== "") {
                activitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(user.challengeUid).collection(`activities`);
            }
            const batch = admin.firestore().batch();
            activitiesRef.where("uid", "==", user.uid).get().then((snapshop) => {
                snapshop.forEach(doc => {
                    batch.set(doc.ref, {
                        displayName: user.displayName,
                    }, { merge: true });
                });
                return batch.commit();
            }).then(() => {
                console.log(`Batch user update successfully committed for user: ${user.uid}, UserDB.ts, line: 87`);
                resolve();
            }).catch((err: Error) =>{
                const error = new Error(`Error ${err} - Batch user update failed for user: ${user.uid}, UserDB.ts, line: 90`);
                console.error(error);    
                reject(err);
            });
        }); //promise
    }
}

export { UserDB }

