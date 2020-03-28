const Util = require("./Util.js");

class Users {

    static updateAll () {
        let nbrUsers= 0;
        let users = [];

        return new Promise((resolve, reject) => {
            const allRefs = Util.getBaseDBRefs()
            const challengeUid = allRefs.challengeUid;

            const dbUsersRef = allRefs.dbUsersRef;
            dbUsersRef.get().then (snapshot => {
                snapshot.forEach(doc => {
                    nbrUsers += 1;
                    //console.log(doc.id, '=>', JSON.stringify(doc.data()));
                    let user = doc.data();
                    user.id = doc.id;
                    users.push(user)
                }); 
                return (users);
            }).then (users => {
                users.forEach (user => {
                    dbUsersRef.doc(user.id).set({challengeUid: challengeUid, teamUid: "", teamName: ""}, {merge: true}).then ( () => {
                        //console.log(`Updated user : ${JSON.stringify(user, null, 2)}`);
                    }).catch (err =>  {
                        console.error(`Error updating User: ${user.displayName} with error ${err}`);
                        throw Error(`Error updating User: ${user.displayName} with error ${err}`);
                    });
                })
                resolve(nbrUsers);
            }).catch (err =>  {
                console.error(`Error getting  Users: ${err}`);
                reject(`Error getting  Users: ${err}`);
            });
        }); // Promist
    }

}    

module.exports = Users;
