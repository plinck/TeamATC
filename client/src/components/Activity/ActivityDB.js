import GLOBAL_ENV from "../Environment/Environment";
import Util from "../Util/Util";

class ActivityDB {
    // Get all activities from firestore
    static getFiltered = (filterObj, resultLimit) => {
        const db = Util.getFirestoreDB(); // active firestore db ref

        resultLimit = resultLimit || 100;

        // default ref gets all
        const dbActivitiesRef = Util.getDBRefs().dbActivitiesRef;

        let ref = dbActivitiesRef
            .orderBy("activityDateTime", "desc")
            .limit(resultLimit);

        if (filterObj && filterObj.filterName) {
            ref = dbActivitiesRef
                .where(filterObj.filterName, "==", filterObj.filterValue)
                .orderBy("activityDateTime", "desc")
                .limit(resultLimit);
        }

        return new Promise((resolve, reject) => {
            ref
                .get()
                .then((querySnapshot) => {
                    let activities = [];
                    querySnapshot.forEach(doc => {
                        let activity = {};
                        activity = doc.data();
                        activity.id = doc.id;
                        activity.activityDateTime = activity
                            .activityDateTime
                            .toDate();
                        activities.push(activity);
                    });
                    return (resolve(activities));
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    static getOrdered = (orderObj, resultLimit) => {
        const db = Util.getFirestoreDB(); // active firestore db ref

        resultLimit = resultLimit || 100;

        // default ref gets all
        const dbActivitiesRef = Util.getDBRefs().dbActivitiesRef;

        let ref = dbActivitiesRef
            .orderBy("activityDateTime", "desc")
            .limit(resultLimit);

        if (orderObj && orderObj.orderName) {
            ref = dbActivitiesRef
                .orderBy(orderObj.orderName)
                .limit(resultLimit);
        } 
        if (orderObj && orderObj.orderName && orderObj.orderValue) {
            ref = dbActivitiesRef
                .orderBy(orderObj.orderName, orderObj.orderValue)
                .limit(resultLimit);
        }

        return new Promise((resolve, reject) => {
            ref
                .get()
                .then((querySnapshot) => {
                    let activities = [];
                    querySnapshot.forEach(doc => {
                        let activity = {};
                        activity = doc.data();
                        activity.id = doc.id;
                        activity.activityDateTime = activity
                            .activityDateTime
                            .toDate();
                        activities.push(activity);
                    });
                    return (resolve(activities));
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    // Listener for all activities from firestore
    static listenAll = () => {
        const db = Util.getFirestoreDB(); // active firestore db ref

        // default ref gets all
        const dbActivitiesRef = Util.getDBRefs().dbActivitiesRef;
        
        let ref = dbActivitiesRef
            .orderBy("activityDateTime", "desc");

        // How can you send back promise and listener?
        return new Promise((resolve, reject) => {

            let activeListener = ref
                .onSnapshot
                .then((querySnapshot) => {
                    let activities = [];
                    querySnapshot.forEach(doc => {
                        let activity = {};
                        activity = doc.data();
                        activity.id = doc.id;
                        activity.activityDateTime = activity
                            .activityDateTime
                            .toDate();
                        activities.push(activity);
                    });
                    return (resolve({activities: activities, activeListener: activeListener}));
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    // -----------------------------------------------------------------------------
    // -------------------- Activities : getUserWithActivity - get all actiities
    // with their firstName lastName This isnt SUPER effecient since it gets all
    // users even if they havent had an activity
    static getUserWithActivity = (resultLimit) => {
        // Default parameters , optional
        resultLimit = resultLimit || 100;

        // its a promise so return
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();
            let users = {};
            let activityArray = [];

            const dbUsersRef = Util.getDBRefs().dbUsersRef;
            const dbActivitiesRef = Util.getDBRefs().dbActivitiesRef;
        
            dbUsersRef
                .get()
                .then((results) => {
                    results.forEach((doc) => {
                        users[doc.id] = doc.data();
                    });
                    const depRef = dbActivitiesRef
                        .orderBy("activityDateTime", "desc")
                        .limit(resultLimit);
                    depRef
                        .get()
                        .then((docSnaps) => {
                            docSnaps.forEach((doc) => {
                                const activity = doc.data();
                                activity.id = doc.id;
                                activity.activityDateTime = activity
                                    .activityDateTime
                                    .toDate();
                                activity.firstName = users[
                                    doc
                                        .data()
                                        .uid
                                ].firstName;
                                activity.lastName = users[
                                    doc
                                        .data()
                                        .uid
                                ].lastName;
                                activity.email = users[
                                    doc
                                        .data()
                                        .uid
                                ].email;
                                activityArray.push(activity);
                            });
                            resolve(activityArray);
                        })
                        .catch((err) => {
                            console.error("Error in ActivityDB.getUserWithActivity activities: ", err);
                            reject(`Error in ActivityDBgetWithUser activities: ${err}`);
                        });
                })
                .catch((err) => {
                    console.error("Error in ActivityDB.getUserWithActivity user : ", err);
                    reject(`Error in ActivityDB.getUserWithActivity user: ${err}`);
                });
        }); // promise
    } // method

    // -----------------------------------------------------------------------------
    // -------------------- Activities : getUserWithActivity - get all depoists
    // with their firstName lastName This is alternate method that uses promise.all
    static getActivityWithUser = () => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();

            // then get from firestore
            let activities = [];
            const dbActivitiesRef = Util.getDBRefs().dbActivitiesRef;

            let docRef = dbActivitiesRef
                .orderBy("activityDateTime", "desc");
            docRef
                .get()
                .then((querySnapshot) => {
                    const userQueries = [];
                    querySnapshot.forEach(doc => {
                        let activity = doc.data();
                        activity.id = doc.id;
                        activity.activityDateTime = activity
                            .activityDateTime
                            .toDate();
                            
                        const dbUsersRef = Util.getDBRefs().dbUsersRef;
                            // get the user doc.data().uid;
                        const userRef = dbUsersRef
                            .doc(activity.uid);

                        const userQuery = userRef
                            .get()
                            .then(user => {
                                if (user.exists) {
                                    activity.firstName = user
                                        .data()
                                        .firstName;
                                    activity.lastName = user
                                        .data()
                                        .lastName;
                                    activity.email = user
                                        .data()
                                        .email;
                                }
                            })
                            .catch(err => console.error(`Error getActivityWithUser.userQuery: ${err}`))
                            . finally(() => {
                                activities.push(activity);
                            });
                        userQueries.push(userQuery);
                    });
                    // This waits until ALL promises in the userQueries array are resolved
                    Promise
                        .all(userQueries)
                        .then(() => {
                            resolve(activities);
                        });
                })
                .catch(err => {
                    reject(`Error activitiesDB.getActivityWithUser ${err.message}`);
                });
        });
    }

    // Get all activities from firestore BY DATE Join user
    static getByDate = (collection) => {

        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB(); // active firestore db ref

            let activities = [];
            const dbActivitiesRef = Util.getDBRefs().dbActivitiesRef;
            
            dbActivitiesRef
                .orderBy("activityDateTime", "desc")
                .get()
                .then((querySnapshot) => {
                    querySnapshot.forEach(doc => {
                        let activity = {};
                        activity = doc.data();
                        activity.id = doc.id;
                        activities.push(activity);
                    });
                    return (resolve(activities));
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    // Get single activities from firestore
    static get = (id) => {
        const db = Util.getFirestoreDB(); // active firestore db ref

        // default ref gets all
        const dbActivitiesRef = Util.getDBRefs().dbActivitiesRef;
            
        let docRef = dbActivitiesRef
            .doc(id);

        return new Promise((resolve, reject) => {

            docRef
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        // update
                        let activity = doc.data();
                        activity.activityDateTime = activity
                            .activityDateTime
                            .toDate();
                        return (resolve(activity));
                    }
                    console.error("Activity not found in firestore");
                    return (resolve());
                })
                .catch(err => {
                    reject(`Error getting activity in ActivityDB.get ${err}`);
                });
        });
    }

    // Add a single activity based on id
    static create = (activity) => {
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB(); // active firestore db ref

            const dbActivitiesRef = Util.getDBRefs().dbActivitiesRef;
            
            dbActivitiesRef
                .add({
                    teamName: activity.teamName,
                    teamUid: activity.teamUid
                        ? activity.teamUid
                        : null,
                    activityName: activity.activityName,
                    activityDateTime: activity.activityDateTime,
                    activityType: activity.activityType,
                    distance: activity.distance,
                    distanceUnits: activity.distanceUnits,
                    duration: activity.duration,
                    email: activity.email,
                    displayName: activity.displayName,
                    uid: activity.uid
                })
                .then(() => {
                    console.log("Firestore activity successfully added");
                    return resolve();
                })
                .catch((error) => {
                    console.error("Firestore activity add failed");
                    return reject(error);
                });
        });
    }

    static update = (activity) => {
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB(); // active firestore db ref

            const dbActivitiesRef = Util.getDBRefs().dbActivitiesRef;
            
            dbActivitiesRef
                .doc(activity.id)
                .set({
                    teamName: activity.teamName,
                    teamUid: activity.teamUid
                        ? activity.teamUid
                        : null,
                    activityName: activity.activityName,
                    activityDateTime: activity.activityDateTime,
                    activityType: activity.activityType,
                    distance: activity.distance,
                    distanceUnits: activity.distanceUnits,
                    duration: activity.duration,
                    email: activity.email,
                    displayName: activity.displayName,
                    uid: activity.uid
                }, {merge: true})
                .then(() => {
                    console.log("Firestore activity successfully updated");
                    return resolve();
                })
                .catch((error) => {
                    console.error("Firestore activity add failed");
                    return reject(error);
                });
        });
    }

    // Delete a single activity based on id
    static delete = (id) => {
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB(); // active firestore db ref

            const dbActivitiesRef = Util.getDBRefs().dbActivitiesRef;
            
            dbActivitiesRef
                .doc(id)
                .delete()
                .then(() => {
                    console.log("Firestore activity successfully deleted");
                    return resolve();
                })
                .catch((err) => {
                    console.error("Error deleting firestor activity ", err);
                    return reject(err);
                });
        });
    }

}

export default ActivityDB;