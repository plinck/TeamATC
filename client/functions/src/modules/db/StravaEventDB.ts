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
                const error = new Error(`Error retrieving strava events, StravaEventDB.ts, line: 26`);
                console.error(error);
                reject(error);
            });    
        }); //promise
    }

    public save(stravaEvent: StravaEvent):Promise<StravaEvent> {
        return new Promise<any>((resolve:any, reject:any) => {
            console.log("StravaEventDB.get() started ...");
            const stravaEventRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("stravaevents");
            
            const saveStravaEvent = stravaEvent;
            const saveStravaEventId: string = `${stravaEvent.object_id}`;
            saveStravaEvent.updateDateTime = new Date();
            try {
                // Dont save the id field to DB
                delete saveStravaEvent.id;
            } catch(err) {
                // nada
            }
            
            stravaEventRef.doc(saveStravaEventId).set(stravaEvent).then(() => {
                resolve(stravaEvent)
            }).catch((err: Error) => {
                const error = new Error(`Error retrieving strava events, StravaEventDB.ts, line: 26`);
                console.error(error);
                reject(error);
            });    
        }); //promise
    }
}

export { StravaEventDB }

