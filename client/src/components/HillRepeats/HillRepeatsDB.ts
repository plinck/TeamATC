import Util from "../Util/Util";
import moment from "moment";

import { HillRepeat } from "../../interfaces/HillRepeat";
// import Firebase from "../Auth/Firebase/Firebase";

class HillRepeatsDB {

    getAll(pFilterByDate?: Date) {
        return new Promise((resolve: any, reject: any): any => {        
            const dbAllRefs = Util.getBaseDBRefs();
            const dbHillRepeatsRef = dbAllRefs.dbHillRepeatsRef;
            let filterByDate: Date;
            let filteredRef: any = dbHillRepeatsRef;

            if (pFilterByDate) { 
                filterByDate = moment(pFilterByDate).startOf("day").toDate();
                           
                filteredRef = dbHillRepeatsRef
                    .where("repeatDateTime", "==", filterByDate)
                    .orderBy("displayName")
            } else {
                filteredRef = dbHillRepeatsRef
                    .orderBy("displayName")        
            }

            const allRepeats: Array<HillRepeat> = [];
            filteredRef.get().then((querySnapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>) => {
                querySnapshot.forEach(doc => {
                    let newRepeat: HillRepeat = new HillRepeat(doc.id);
                    newRepeat = doc.data() as HillRepeat;
                    newRepeat.repeatDateTime = doc.data().repeatDateTime.toDate();
                    newRepeat.repeatDateTime = moment(newRepeat.repeatDateTime).startOf("day").toDate();

                    newRepeat.id = doc.id;
                    allRepeats.push(newRepeat);
                });
                resolve(allRepeats);
            }).catch((err: Error) => {
                console.error(`Error retrieving hill repeats: ${err}`);
                reject(`Error retrieving hill repeats: ${err}`);
            });
        }); // promise
    }

    update(pRepeat: HillRepeat) {
        console.log(`trying to update repeat in fb: ${pRepeat}`);
        const newRepeat = {...pRepeat};
        // Delete the id field since you do not want in db as it is they key
        try {
            delete newRepeat.id
        } catch {
            // no op - dont care
        }

        return new Promise((resolve, reject) => {
            // update
            console.log("Repeat updated, newRepeat=", newRepeat);
            const dbAllRefs = Util.getBaseDBRefs();
            const dbHillRepeatsRef = dbAllRefs.dbHillRepeatsRef;
            dbHillRepeatsRef.doc(pRepeat.id).set(newRepeat, {
                merge: true
            }).then(() => {
                console.log("completed");
                resolve();
            }).catch(err => {
                console.error(`error updating repeat: ${newRepeat}`);
                reject(err);
            });
        });
    }

    add(pRepeat: HillRepeat) {
        console.log(`trying to update repeat in fb: ${pRepeat}`);
        const newRepeat = {...pRepeat};
        // Delete the id field since you do not want in db as it is they key
        try {
            delete newRepeat.id
        } catch {
            // no op - dont care
        }

        return new Promise((resolve, reject) => {
            // update
            console.log("Repeat added, newRepeat=", newRepeat);
            const dbAllRefs = Util.getBaseDBRefs();
            const dbHillRepeatsRef = dbAllRefs.dbHillRepeatsRef;
            dbHillRepeatsRef.add(newRepeat).then(() => {
                console.log("completed");
                resolve();
            }).catch(err => {
                console.error(`error adding repeat: ${newRepeat}`);
                reject(err);
            });
        });
    }
}
export { HillRepeatsDB }