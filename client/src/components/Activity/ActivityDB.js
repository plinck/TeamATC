import Util from "../Util/Util";

class ActivityDB {

    // Get all activities from firestore 
    static getAll =  (resultLimit, teamUid, userUid, startDate, endDate) => {
        const db = Util.getFirestoreDB();   // active firestore db ref
        
        resultLimit = resultLimit || 50;
        startDate = startDate || new Date('1900-01-01');
        endDate = endDate|| new Date();                     // Today
        endDate.setDate(endDate.getDate() + 1);                 // Tomorrow
        
        // default ref gets all
        let ref = db.collection("activities")
            .where("activityDateTime", ">=", startDate)
            .where("activityDateTime", "<=", endDate)
            .orderBy("activityDateTime", "desc").limit(resultLimit)

        if (teamUid) {
            ref = db.collection("activities").where("teamUid", "==", teamUid)
            .where("activityDateTime", ">=", startDate)
            .where("activityDateTime", "<=", endDate)
            .orderBy("activityDateTime", "desc").limit(resultLimit)
        }
        if (userUid) {
            ref = db.collection("activities").where("userUid", "==", userUid)
            .where("activityDateTime", ">=", startDate)
            .where("activityDateTime", "<=", endDate)
            .orderBy("activityDateTime", "desc").limit(resultLimit)
        }
        
        return new Promise( (resolve, reject) => {

            ref.get().then((querySnapshot) => {
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
    static getUserWithActivity = (resultLimit) => {
        // Default parameters , optional
        resultLimit = resultLimit || 50;
        
        // its a promise so return
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();
            let users = {} ;
            let activityArray = [];
            db.collection("users").get().then((results) => {
                results.forEach((doc) => {
                    users[doc.id] = doc.data();
                });
                const depRef = db.collection("activities").orderBy("activityDateTime", "desc").limit(resultLimit);
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
            db.collection("activities").orderBy("activityDateTime", "desc").get().then((querySnapshot) => {
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

    // Get single activities from firestore 
    static get =  (id) => {
        const db = Util.getFirestoreDB();   // active firestore db ref
        
        // default ref gets all
        let docRef = db.collection("activities").doc(id);
    
        return new Promise( (resolve, reject) => {

            docRef.get().then((doc) => {
                if (doc.exists) {
                    // update
                    let activity = doc.data();
                    return(resolve(activity));
                }
                console.log("Activity not found in firestore");
                return(resolve());
            }).catch(err => {
                reject(`Error getting activity in ActivityDB.get ${err}`);
            });
        });
    }
    
    // Add a single activity based on id
    static create = (activity) => {
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();   // active firestore db ref

            db.collection("activities").add({
                teamName: activity.teamName,
                activityName: activity.activityName,
                activityDateTime: activity.activityDateTime,
                activityType: activity.activityType,
                distance: activity.distance,
                distanceUnits: activity.distanceUnits,
                duration: activity.duration,
                email: activity.email,
                displayName: activity.displayName,
                uid: activity.uid
            }).then( () => {
                console.log("Firestore activity successfully added");
                return resolve();
            }).catch( (error) => {
                console.log("Firestore activity add failed");
                return reject(error);
            });
        });
    }
    
    static update = (activityId,activity) => {
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();   // active firestore db ref

            db.collection("activities").doc(activity.id).set({
                teamName: activity.teamName,
                activityName: activity.activityName,
                activityDateTime: activity.activityDateTime,
                activityType: activity.activityType,
                distance: activity.distance,
                distanceUnits: activity.distanceUnits,
                duration: activity.duration,
                email: activity.email,
                displayName: activity.displayName,
                uid: activity.uid
            },{ merge: true }).then( () => {
                console.log("Firestore activity successfully added");
                return resolve();
            }).catch( (error) => {
                console.log("Firestore activity add failed");
                return reject(error);
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