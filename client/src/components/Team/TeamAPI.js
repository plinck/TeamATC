import GLOBAL_ENV from "../Environment/Environment";
import Util from "../Util/Util";

class TeamAPI {

    // Everything from top down must be async or awaits do NOT wait
    static getTeams = () => {
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();

            db.collection("teams").orderBy("name").get().then((querySnapshot) => {
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
            const db = Util.getFirestoreDB();
            let teams = {} ;
            let activityArray = [];
            db.collection("teams").orderBy("name").get().then((results) => {
                results.forEach((doc) => {
                    teams[doc.id] = doc.data();
                });
                const ref = db.collection("activities").orderBy("time", "desc");
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
                    console.error("Error in TeamAPI.getTeamsWithActivities(): ", err);
                    reject(`Error in TeamAPI.getTeamsWithActivities(): ${err}`);
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
            const db = Util.getFirestoreDB();

            // then get from firestore
            let docRef = db.collection("teams").doc(id);
            docRef.get().then((doc) => {
                if (doc.exists) {
                    // update
                    let team = doc.data();
                    return(resolve(team));
                }
                console.error("Team not found in firestore");
                return(resolve());
            }).catch(err => {
                reject(`Error getting team in TeamAPI.get ${err}`);
            });
        });
    }

    // Get Users for a team
    static getTeamUsers = (id) => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();

            // then get from firestore
            let docRef = db.collection("teams").doc(id);
            docRef.get().then((doc) => {
                if (doc.exists) {
                    // update
                    let team = doc.data();
                    let teamUid = doc.id;
                    let userArray = []

                    let dbUserRef = db.collection("users");
                    if (GLOBAL_ENV.ORG && GLOBAL_ENV.ENV && GLOBAL_ENV.USERS_DB) {
                        dbUserRef = db.collection(`${GLOBAL_ENV.ORG}`).doc(`${GLOBAL_ENV.ENV}`).collection(`${GLOBAL_ENV.USERS_DB}`)
                    }
                
                    const docRef = dbUserRef.orderBy("lastName", "desc");
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
                        console.error("Error in TeamAPI.getTeamsWithActivities(): ", err);
                        reject(`Error in TeamAPI.getTeamsWithActivities(): ${err}`);
                    });
                    return(resolve(team));
                }
                console.error("Team not found in firestore");
                return(resolve());

            }).catch(err => {
                reject(`Error getting team in TeamAPI.get ${err}`);
            });
        });
    }

    // delete team
    static delete = (uid) => {
        return new Promise((resolve, reject) => {
            const db = Util.getFirestoreDB();
            db.collection("teams").doc(uid).delete().then(() => {
                console.log("Firestore Team successfully deleted!");
                return resolve();
            }).catch((err) => {
                console.error("Error deleting firestore team in TeamAPI.delete(:uid:) ", err);
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
            const db = Util.getFirestoreDB();

            // we always want uid = id to keep auth and firestore in sync
            db.collection('teams').doc(team.uid).set({
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

export default TeamAPI;