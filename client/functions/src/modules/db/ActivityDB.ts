
import * as admin from 'firebase-admin';
import { APP_CONFIG } from "../FirebaseEnvironment";
import { Activity } from "../interfaces/Activity";

class ActivityDB {
    
    public set(activity: Activity):Promise<Activity> {
        return new Promise<Activity>((resolve:any, reject:any) => {

            const dbActivitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(activity.challengeUid).collection(`activities`);
            dbActivitiesRef.doc(activity.id).set(activity, {merge: true}).then(() => {
                console.log("Firestore activity successfully saved in challenge");
                return resolve();
            }).catch((err) => {
                console.error("Firestore activity save for challenge failed");
                return reject(err);
            });

        });//promise
    }

    // Add the activity undser the user it belongs to vs in the challenge - they can be applied to correct challenge later
    public setUserActivity(activity: Activity):Promise<Activity> {
        return new Promise<Activity>((resolve:any, reject:any) => {

            const dbUserActivitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("users").doc(activity.uid).collection(`activities`);
            dbUserActivitiesRef.doc(activity.id).set(activity, {merge: true}).then(() => {
                console.log("Firestore activity successfully saved in user");
                return resolve();
            }).catch((err) => {
                console.error("Firestore activity save for user failed");
                return reject(err);
            });

        });//promise
    }
}

export default ActivityDB;