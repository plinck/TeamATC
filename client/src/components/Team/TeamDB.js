import Util from "../Util/Util";

class TeamDB {

    // Everything from top down must be async or awaits do NOT wait
    static getTeams = () => {
        return new Promise((resolve, reject) => {
            const dbTeamsRef = Util.getDBRefs().dbTeamsRef;

            dbTeamsRef.orderBy("name").get().then((querySnapshot) => {
                let teams = [];
                querySnapshot.forEach(doc => {
                    let team = {};
                    team = doc.data();
                    team.id = doc.id;

                    teams.push(team);
                });
                // console.log(users);
                return (resolve(teams));
            }).catch(err => {
                reject(err);
            });
        });
    }

    // -------------------------------------------------------------------------------------------------
    // Activities : getUserWithActivity - get all actiities with their firstName lastName
    // This isnt SUPER effecient since it gets all users even if they havent had an activity
    static getTeamsWithActivities = () => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            let teams = {} ;
            let activityArray = [];

            const dbTeamsRef = Util.getDBRefs().dbTeamsRef;

            dbTeamsRef.orderBy("name").get().then((results) => {
                results.forEach((doc) => {
                    teams[doc.id] = doc.data();
                });
                
                const dbActivitiesRef = Util.getDBRefs().dbActivitiesRef;

                const ref = dbActivitiesRef.orderBy("time", "desc");
                ref.get().then((docSnaps) => {
                    docSnaps.forEach((doc) => {
                        const activity = doc.data();
                        activity.id = doc.id;
                        activity.activityDateTime = activity.activityDateTime.toDate();
                        activity.teamName = teams[doc.data().uid].name;
                        activity.teamDescription = teams[doc.data().uid].description;
                        activityArray.push(activity);
                    });
                    resolve(activityArray);
                }).catch((err) => {
                    console.error("Error in TeamDB.getTeamsWithActivities(): ", err);
                    reject(`Error in TeamDB.getTeamsWithActivities(): ${err}`);
                });
            }).catch((err) => {
                console.error("Error in ActivityDB.getUserWithActivity user : ", err);
                reject(`Error in ActivityDB.getUserWithActivity user: ${err}`);
            });
        }); // promise
    }// method

    // get team base on uid (id and uid are same)
    static get = (id) => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            // then get from firestore
            const dbTeamsRef = Util.getDBRefs().dbTeamsRef;

            let docRef = dbTeamsRef.doc(id);
            docRef.get().then((doc) => {
                if (doc.exists) {
                    // update
                    let team = doc.data();
                    return(resolve(team));
                }
                console.error("Team not found in firestore");
                return(resolve());
            }).catch(err => {
                reject(`Error getting team in TeamDB.get ${err}`);
            });
        });
    }

    // Get Users for a team
    static getTeamUsers = (id) => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            // then get from firestore
            const dbTeamsRef = Util.getDBRefs().dbTeamsRef;

            let docRef = dbTeamsRef.doc(id);
            docRef.get().then((doc) => {
                if (doc.exists) {
                    // update
                    let team = doc.data();
                    let teamUid = doc.id;
                    let userArray = []

                    const dbUsersRef = Util.getDBRefs().dbUsersRef;
                    const docRef = dbUsersRef.orderBy("lastName", "desc");
                    docRef.get().then((docSnaps) => {
                        docSnaps.forEach((doc) => {
                            const user = doc.data();
                            user.id = doc.id;

                            user.teamUid = teamUid;
                            user.teamName = team.name;
                            user.teamDescription = team.description;
                            
                            userArray.push(user);
                        });
                        resolve(userArray);
                    }).catch((err) => {
                        console.error("Error in TeamDB.getTeamsWithActivities(): ", err);
                        reject(`Error in TeamDB.getTeamsWithActivities(): ${err}`);
                    });
                    return(resolve(team));
                }
                console.error("Team not found in firestore");
                return(resolve());

            }).catch(err => {
                reject(`Error getting team in TeamDB.get ${err}`);
            });
        });
    }

    // delete team
    static delete = (uid) => {
        return new Promise((resolve, reject) => {
            const dbTeamsRef = Util.getDBRefs().dbTeamsRef;

            dbTeamsRef.doc(uid).delete().then(() => {
                console.log("Firestore Team successfully deleted!");
                return resolve();
            }).catch((err) => {
                console.error("Error deleting firestore team in TeamDB.delete(:uid:) ", err);
                return reject(err);
            });

        });
    }

    // Update Existing team
    // NOTE: - I purposely do not update uid since that is essentially the primary key
    // I think this will add if it does nort exist so use for add
    static update =  (team) => {
        console.log(`trying to update team in firestore: ${team}`);
        return new Promise(async (resolve, reject) => {

            // we always want uid = id to keep auth and firestore in sync
            const dbTeamsRef = Util.getDBRefs().dbTeamsRef;

            dbTeamsRef.doc(team.uid).set({
                name: team.name ? team.name : "No Name",
                description: team.description ? team.description : ""
            },{ merge: true }).then(() => {
                resolve();
            }).catch(err => {
                console.error(`error updating team: ${err}`);
                reject(err);
            });
        });
    }
}//class

export default TeamDB;