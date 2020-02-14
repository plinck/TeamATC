import Util from "../Util/Util";

class ActivityDB {

    // Get all activities from firestore 
    static get =  (collection) => {
        return new Promise( (resolve, reject) => {
            const db = Util.getFirestoreDB();   // active firestore db ref

            db.collection(collection).get().then((querySnapshot) => {
                let activities = [];
                querySnapshot.forEach (doc => {
                    let activity = {};
                    activity = doc.data();
                    activity.id = doc.id;
                    activities.push(activity); 
                });
                return(resolve(activities));
            }).catch(err => {
                reject(err);
            });
        });
    }

    // -------------------------------------------------------------------------------------------------
    // Activities : getUserWithActivity - get all actiities with their firstName lastName
    // This isnt SUPER effecient since it gets all users even if they havent had an activity
    static getUserWithActivity = () => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();
            let users = {} ;
            let activityArray = [];
            db.collection("users").get().then((results) => {
                results.forEach((doc) => {
                    users[doc.id] = doc.data();
                });
                const depRef = db.collection("activities").orderBy("time", "desc");
                depRef.get().then((docSnaps) => {
                    docSnaps.forEach((doc) => {
                        const activity = doc.data();
                        activity.id = doc.id;
                        activity.activityDateTime = activity.activityDateTime.toDate();
                        activity.firstName = users[doc.data().uid].firstName;
                        activity.lastName = users[doc.data().uid].lastName;
                        activity.email = users[doc.data().uid].email;
                        activityArray.push(activity);
                    });
                    resolve(activityArray);
                }).catch((err) => {
                    console.error("Error in ActivityDB.getUserWithActivity activities: ", err);
                    reject(`Error in ActivityDBgetWithUser activities: ${err}`);
                });
            }).catch((err) => {
                console.error("Error in ActivityDB.getUserWithActivity user : ", err);
                reject(`Error in ActivityDB.getUserWithActivity user: ${err}`);
            });
        }); // promise
    }// method

    // -------------------------------------------------------------------------------------------------
    // Activities : getUserWithActivity - get all depoists with their firstName lastName
    // This is alternate method that uses promise.all
    static getActivityWithUser = () => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();

            // then get from firestore
            let activities = [];
            let docRef = db.collection("activities").orderBy("activityDateTime", "desc");
            docRef.get().then((querySnapshot) => {
                const userQueries = [];
                querySnapshot.forEach(doc => {
                    let activity = doc.data();
                    activity.id = doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();
                    // get the user ndoc.data().uid;
                    const userRef = db.collection("users").doc(activity.uid);
                    const userQuery = userRef.get()
                    .then ( user => {
                        if (user.exists) {
                            activity.firstName = user.data().firstName;
                            activity.lastName = user.data().lastName;
                            activity.email = user.data().email;
                        }
                    })
                    .catch(err => console.error(`Error getActivityWithUser.userQuery: ${err}`))
                    .finally(() => {
                        activities.push(activity);
                    });
                    userQueries.push(userQuery);
                });
                // This waits until ALL promises in the userQueries array are resolved
                Promise.all(userQueries).then(() => {
                    resolve(activities);
                });
            }).catch(err => {
                reject(`Error activitiesDB.getActivityWithUser ${err.message}`);
            });
        });
    }


    // Get all activities from firestore BY DATE
    // Join user
    static getByDate =  (collection) => {

        return new Promise( (resolve, reject) => {
            const db = Util.getFirestoreDB();   // active firestore db ref

            let activities = [];
            db.collection("activities").orderBy("time", "desc").get().then((querySnapshot) => {
                querySnapshot.forEach (doc => {
                    let activity = {};
                    activity = doc.data();
                    activity.id = doc.id;
                    activities.push(activity); 
                });
                return(resolve(activities));
            }).catch(err => {
                reject(err);
            });
        });
    }

    // Delete a single activity based on id
    static delete = (id) => {
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();   // active firestore db ref

            db.collection("activities").doc(id).delete().then(() => {
                console.log("Firestore activity successfully deleted");
                return resolve();
            }).catch((err) => {
                console.error("Error deleting firestor activity ", err);
                return reject(err);
            });
        });
    }

}

export default ActivityDB;