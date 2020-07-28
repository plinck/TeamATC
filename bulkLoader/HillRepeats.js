const Util = require("./Util.js");

class HillRepeats {

    static create = (hillrepeat) => {
        return new Promise((resolve, reject) => {
            const dbALLRefs = Util.getBaseDBRefs();
            const dbHillRepeatsRef = dbALLRefs.dbHillRepeatsRef;

            dbHillRepeatsRef.add(hillrepeat).then(() => {
                console.log(`Firestore hillrepeat: ${hillrepeat.repeatDateTime} successfully added`);
                resolve(hillrepeat);
            }).catch((err) => {
                console.error(`Firestore hillrepeat add failed, err ${err}`);
                reject(err);
            });
        });
    }
}    

module.exports = HillRepeats;
