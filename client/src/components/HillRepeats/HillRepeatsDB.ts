import Util from "../Util/Util";
import moment from "moment";

import { HillRepeat } from "../../interfaces/HillRepeat";
// import Firebase from "../Auth/Firebase/Firebase";

class HillRepeatsDB {

    getAll(filterByDate?: Date) {
        return new Promise((resolve: any, reject: any): any => {        
            const dbAllRefs = Util.getBaseDBRefs();
            const dbHillRepeatsRef = dbAllRefs.dbHillRepeatsRef;
            let filteredRef: any = dbHillRepeatsRef;

            if (filterByDate) { 
                filterByDate = moment(filterByDate).startOf("day").toDate();
                           
                filteredRef = dbHillRepeatsRef
                    .where("repeatDateTime", "==", filterByDate)
                    .orderBy("displayName")
            } else {
                filteredRef = dbHillRepeatsRef
                    .orderBy("displayName")        
            }

            let allRepeats: Array<HillRepeat> = [];
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
        }); //promise
    }
}
export { HillRepeatsDB }