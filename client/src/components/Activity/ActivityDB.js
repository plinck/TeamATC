import Util from "../Util/Util";

class ActivityDB {
    
    // Get all activities from firestore
    static getFiltered = (filterObj, resultLimit, startAfter) => {
        resultLimit = resultLimit || 100;

        // default ref gets all
        return new Promise((resolve, reject) => {
            Util.promiseGetChallengeDBRefs().then ( dbRefs => {
                const dbActivitiesRef = dbRefs.dbActivitiesRef;

                let ref = undefined;
                if (startAfter) {
                    ref = dbActivitiesRef
                        .orderBy("activityDateTime", "desc")
                        .limit(resultLimit)
                        .startAfter(startAfter);
                } else {
                    ref = dbActivitiesRef
                        .orderBy("activityDateTime", "desc")
                        .limit(resultLimit);
                }

                if (filterObj && filterObj.filterName) {
                    if (startAfter) {
                        ref = dbActivitiesRef
                            .where(filterObj.filterName, "==", filterObj.filterValue)
                            .orderBy("activityDateTime", "desc")
                            .limit(resultLimit)
                            .startAfter(startAfter);
                    } else {
                        ref = dbActivitiesRef
                            .where(filterObj.filterName, "==", filterObj.filterValue)
                            .orderBy("activityDateTime", "desc")
                            .limit(resultLimit);
                    }
                }

                ref.get().then((querySnapshot) => {
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
                    startAfter = querySnapshot.docs[querySnapshot.docs.length-1];
                    return (resolve({activities: activities, lastActivityDoc: startAfter}));
                })
                .catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err); 
            })
        });
    }

    static getOrdered = (orderObj, resultLimit) => {
        resultLimit = resultLimit || 100;

        return new Promise((resolve, reject) => {
            Util.promiseGetChallengeDBRefs().then ( dbRefs => {
                const dbActivitiesRef = dbRefs.dbActivitiesRef;

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

                ref.get().then((querySnapshot) => {
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
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            });
        });
    }

    // Listener for all activities from firestore
    static listenAll = () => {
        // default ref gets all
        return new Promise((resolve, reject) => {
            Util.promiseGetChallengeDBRefs().then ( dbRefs => {
                const dbActivitiesRef = dbRefs.dbActivitiesRef;
        
                let ref = dbActivitiesRef.orderBy("activityDateTime", "desc");
                let activeListener = ref.onSnapshot.then((querySnapshot) => {
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
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            });
        }); // Promise
    }

    // Get single activities from firestore
    static get = (id) => {
        // default ref gets all
        return new Promise((resolve, reject) => {
            Util.promiseGetChallengeDBRefs().then ( dbRefs => {
                const dbActivitiesRef = dbRefs.dbActivitiesRef;
            
                let docRef = dbActivitiesRef.doc(id);
                docRef.get().then((doc) => {
                    if (doc.exists) {
                        // update
                        let activity = doc.data();
                        activity.id = doc.id;
                        activity.activityDateTime = activity
                            .activityDateTime
                            .toDate();
                        return (resolve(activity));
                    }
                    console.error("Activity not found in firestore");
                    return (resolve());
                }).catch(err => {
                    reject(`Error getting activity in ActivityDB.get ${err}`);
                });
            }).catch(err => {
                reject(`Error getting dbRefs in activity in ActivityDB.get ${err}`);
            });
        });// promise
    }

    // Add a single activity based on id
    static create = (activity) => {
        return new Promise((resolve, reject) => {
            let newActivity = {...activity};
            // Delete the id field since you do not want in db as it is they key
            try {
                delete newActivity.id;
            } catch {
                // no op - dont care
            }
    
            Util.promiseGetChallengeDBRefs().then ( dbRefs => {
                const dbActivitiesRef = dbRefs.dbActivitiesRef;
            
                dbActivitiesRef.add(newActivity).then(() => {
                    console.log("Firestore activity successfully added");
                    return resolve();
                }).catch((error) => {
                    console.error("Firestore activity add failed");
                    return reject(error);
                });
            }).catch((error) => {
                console.error("Firestore activity add failed getting Dbrefs");
                return reject(error);
            });         
        });
    }

    static update = (activity) => {
        return new Promise((resolve, reject) => {
            let newActivity = {...activity};
            // Delete the id field since you do not want in db as it is they key
            try {
                delete newActivity.id;
            } catch {
                // no op - dont care
            }

            Util.promiseGetChallengeDBRefs().then ( dbRefs => {
                const dbActivitiesRef = dbRefs.dbActivitiesRef;
            
                dbActivitiesRef.doc(activity.id).set(newActivity, {merge: true}).then(() => {
                    console.log("Firestore activity successfully updated");
                    return resolve();
                }).catch((error) => {
                    console.error("Firestore activity add failed");
                    return reject(error);
                });
            }).catch((error) => {
                console.error("Firestore activity add failed getting dbRefs");
                return reject(error);
            });
        });//promise
    }

    // Delete a single activity based on id
    static delete = (id) => {
        return new Promise((resolve, reject) => {
            Util.promiseGetChallengeDBRefs().then ( dbRefs => {
                const dbActivitiesRef = dbRefs.dbActivitiesRef;
            
                dbActivitiesRef.doc(id).delete().then(() => {
                    console.log("Firestore activity successfully deleted");
                    return resolve();
                }).catch((err) => {
                    console.error("Error deleting firestore activity ", err);
                    return reject(err);
                });
            }).catch((err) => {
                console.error("Error deleting firestore activity getting dbRefs", err);
                return reject(err);
            });
        });
    }

}

export default ActivityDB;