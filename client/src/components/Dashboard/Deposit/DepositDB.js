import Util from "../../Util/Util";

class DepositDB {

    // Get all deposits from firestore 
    static get =  (collection) => {
        return new Promise( (resolve, reject) => {
            const db = Util.getFirestoreDB();   // active firestore db ref

            db.collection(collection).get().then((querySnapshot) => {
                let deposits = [];
                querySnapshot.forEach (doc => {
                    let deposit = {};
                    deposit = doc.data();
                    deposit.id = doc.id;
                    deposits.push(deposit); 
                });
                return(resolve(deposits));
            }).catch(err => {
                reject(err);
            });
        });
    }

    // -------------------------------------------------------------------------------------------------
    // Deposits : getWithUser - get all depoists with their firstName lastName
    // This isnt SUPER effecient since it gets all users even if they havent made deposit
    static getWithUser = () => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();
            let users = {} ;
            let depositArray = [];
            db.collection('users').get().then((results) => {
                results.forEach((doc) => {
                    users[doc.id] = doc.data();
                });
                const depRef = db.collection('deposits').orderBy('time', 'desc');
                depRef.get().then((docSnaps) => {
                    docSnaps.forEach((doc) => {
                        const deposit = doc.data();
                        deposit.id = doc.id;
                        deposit.time = deposit.time.toDate();
                        deposit.firstName = users[doc.data().uid].firstName;
                        deposit.lastName = users[doc.data().uid].lastName;
                        depositArray.push(deposit);
                    });
                    resolve(depositArray);
                }).catch((err) => {
                    console.error("Error in DepositDB.getWithUser deposits: ", err);
                    reject(`Error in DepositDBgetWithUser deposits: ${err}`);
                });
            }).catch((err) => {
                console.error("Error in DepositDB.getWithUser user : ", err);
                reject(`Error in DepositDB.getWithUser user: ${err}`);
            });
        }); // promise
    }// method

    // -------------------------------------------------------------------------------------------------
    // Deposits : getWithUser - get all depoists with their firstName lastName
    // This is alternate method that uses promise.all
    static getWithUserAlt = () => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();

            // then get from firestore
            let depositsArchive = [];
            let docRef = db.collection("deposits").orderBy('time', 'desc');
            docRef.get().then((querySnapshot) => {
                const userQueries = [];
                querySnapshot.forEach(doc => {
                    let deposit = doc.data();
                    deposit.id = doc.id;
                    deposit.time = deposit.time.toDate();
                    // get the user ndoc.data().uid;
                    const userRef = db.collection("users").doc(deposit.uid);
                    const userQuery = userRef.get()
                    .then ( user => {
                        if (user.exists) {
                            console.log(`Got user: ${user.data().firstName}`);
                            deposit.firstName = user.data().firstName;
                            deposit.lastName = user.data().lastName;
                            deposit.email = user.data().email;
                        }
                    })
                    .catch(err => console.error(`Error getWithUserAlt.userQuery: ${err}`))
                    .finally(() => {
                        depositsArchive.push(deposit);
                    });
                    userQueries.push(userQuery);
                });
                // This waits until ALL promises in the userQueries array are resolved
                Promise.all(userQueries).then(() => {
                    console.log('All userQueries Resolved');
                    resolve(depositsArchive);
                });
            }).catch(err => {
                reject(`Error depositsDB.getWithUserAlt ${err.message}`);
            });
        });
    }


    // Get all deposits from firestore BY DATE
    // Join user
    static getByDate =  (collection) => {

        return new Promise( (resolve, reject) => {
            const db = Util.getFirestoreDB();   // active firestore db ref

            let deposits = [];
            db.collection("deposits").orderBy("time", "desc").get().then((querySnapshot) => {
                querySnapshot.forEach (doc => {
                    let deposit = {};
                    deposit = doc.data();
                    deposit.id = doc.id;
                    deposits.push(deposit); 
                });
                return(resolve(deposits));
            }).catch(err => {
                reject(err);
            });
        });
    }

    // Delete a single deposit based on id
    static delete = (id) => {
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();   // active firestore db ref

            db.collection("deposits").doc(id).delete().then(() => {
                console.log("Firestore deposit successfully deleted");
                return resolve();
            }).catch((err) => {
                console.error("Error deleting firestor deposit ", err);
                return reject(err);
            });
        });
    }

    // Get cash in safe
    static getInSafeTotal = () => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();

            // then get from firestore
            let total = 0;
            let docRef = db.collection("deposits");
            docRef.get().then((querySnapshot) => {
                querySnapshot.forEach(doc => {
                    total += doc.data().amount;
                });
                resolve(total);
            }).catch(err => {
                reject(`Error getting deposits in getInSafeTotal ${err.message}`);
            });
        });
    }



    // Gets deposits that are not in safe, but havent been settled. 
    static getPendingTotal = () => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();

            // then get from firestore
            let total = 0;
            let docRef = db.collection("depositsarchive").where("awaitingSettlement", "==", true);
            docRef.get().then((querySnapshot) => {
                querySnapshot.forEach(doc => {
                    total += doc.data().amount;
                });
                resolve(total);
            }).catch(err => {
                reject(`Error getting depositsArchive in getAwaitingTotal ${err.message}`);
            });
        });
    }

}

export default DepositDB;