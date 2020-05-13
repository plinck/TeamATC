import * as admin from 'firebase-admin';
import { APP_CONFIG } from "../FirebaseEnvironment";
import { StravaEvent } from "../interfaces/StravaEvent";

class StravaEventDB {
    constructor() {
        // ctor
    }

    public getAll():Promise<StravaEvent> {
        return new Promise<any>((resolve:any, reject:any) => {
            console.log("StravaEventDB.get() started ...");
            const stravaEventRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("stravaevents");

            const stravaEvents: Array<StravaEvent> = [];
            stravaEventRef.get().then((snap) => {
                snap.forEach(doc => {
                    const newDoc: FirebaseFirestore.DocumentData = doc.data();
                    const stravaEvent:StravaEvent = newDoc as StravaEvent;
                    stravaEvent.id = doc.id;
                    stravaEvents.push(stravaEvent);
                });
                resolve(StravaEvent)
            }).catch((err: Error) => {
                const error = new Error(`Error retrieving strava events, StravaEventDB.ts, line: 25`);
                console.error(error);
                reject(error);
            });    
        }); //promise
    }

    public save(stravaEvent: StravaEvent):Promise<StravaEvent> {
        return new Promise<any>((resolve:any, reject:any) => {
            console.log("StravaEventDB.save() started ...");
            const stravaEventRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("stravaevents");
            
            const saveStravaEvent = stravaEvent;
            const saveStravaEventId: string = `"${stravaEvent.object_id}"`;
            saveStravaEvent.updateDateTime = new Date();

            console.log(`StravaEventDB.save() key:${saveStravaEventId}, data:${JSON.stringify(saveStravaEvent)} saving ...`);
            stravaEventRef.doc(saveStravaEventId).set(
                {
                    aspect_type: saveStravaEvent.aspect_type,
                    event_time: saveStravaEvent.event_time,
                    object_id: saveStravaEvent.object_id,
                    object_type: saveStravaEvent.object_type,
                    owner_id: saveStravaEvent.owner_id,
                    subscription_id: saveStravaEvent.subscription_id,
                    updates: JSON.parse(JSON.stringify(saveStravaEvent.updates))
                }, { merge: true }).then(() => {
                console.log(`Saved stravaEvent`);
                resolve(saveStravaEvent)
            }).catch((err: Error) => {
                const error = new Error(`Error ${err} saving strava events, StravaEventDB.ts, line: 55`);
                console.error(error);
                reject(error);
            });    
        }); //promise
    }

    public delete(id: string):Promise<any> {
        return new Promise<any>((resolve:any, reject:any) => {
            console.log("StravaEventDB.delete() started ...");
            const stravaEventRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("stravaevents");
            
            const key: string = id;
            stravaEventRef.doc(key).delete().then(() => {
                console.log(`Deleting stravaEvent`);
                resolve()
            }).catch((err: Error) => {
                const error = new Error(`Error ${err} deleting strava event, StravaEventDB.ts, line: 72`);
                console.error(error);
                reject(error);
            });    
        }); //promise
    }
}

export { StravaEventDB }

