import Util from "../Util/Util";

class MemberDB {
    // Everything from top down must be async or awaits do NOT wait
    static get() {
        return new Promise((resolve, reject) => {

            const dbATCMembersRef = Util.getBaseDBRefs().dbATCMembersRef;
            dbATCMembersRef.get().then((querySnapshot) => {
                let members = [];
                querySnapshot.forEach(doc => {
                    let member = {};
                    member = doc.data();
                    member.id = doc.id;

                    members.push(member);
                });
                // console.log(members);
                return (resolve(members));
            }).catch(err => {
                reject(err);
            });
        });
    }

    // get member by email
    static getByEmail(email) {
        // its a promise so return
        return new Promise((resolve, reject) => {

            // then get from firestore
            let member = {};
            let foundUser = false;

            const dbATCMembersRef = Util.getBaseDBRefs().dbATCMembersRef;
            let docRef = dbATCMembersRef.where("email", "==", email.toLowerCase()).limit(1);
            docRef.get().then((querySnapshot) => {
                querySnapshot.forEach(doc => {
                    foundUser = true;
                    console.log(doc.data());
                    member = doc.data();
                    member.id = doc.id;
                });

                if (foundUser) {
                    console.log(`Member with email: ${email} found!, displayName: ${member.displayName}`);
                    resolve(member);
                } else {
                    let err = `Member with email: ${email} not found in firestore`;
                    console.log(err);
                    reject(err);
                }
            }).catch(err => {
                reject(`Error getting member in MemberDB.getByEmail ${err.message}`);
            });
        });
    }
    
}

export default MemberDB;