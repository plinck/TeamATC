import Util from "../Util/Util";

class TeamDB {

    // Everything from top down must be async or awaits do NOT wait
    static getTeams = () => {
        return new Promise((resolve, reject) => {
            Util.promiseGetChallengeDBRefs().then ( allDBRefs => {
                const dbTeamsRef = allDBRefs.dbTeamsRef;

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
            }).catch(err => {
                console.error(`Error in TeamDB.getTeams : ${err}`);
            });
        });
    }

    // -------------------------------------------------------------------------------------------------
    // Activities : getTeamsWithActivities - get all actiities with their firstName lastName
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
                console.error("Error in ActivityDB.getTeamsWithActivities user : ", err);
                reject(`Error in ActivityDB.getTeamsWithActivities user: ${err}`);
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
    // TODO : - Fix this - the users promise isnt done when team is returned so this wont work as expected
    // TODO:  Test this as I dont think it works.  I need to get chaining better as lots of uses
    static getTeamUsers = (id) => {
        let team = {};
        let userArray = [];

        // its a promise so return
        return new Promise((resolve, reject) => {
            // then get from firestore
            const dbTeamsRef = Util.getDBRefs().dbTeamsRef;

            let docRef = dbTeamsRef.doc(id);
            docRef.get().then((doc) => {
                if (doc.exists) {
                    // update
                    team = doc.data();
                    team.id = doc.id;
                    const dbUsersRef = Util.getDBRefs().dbUsersRef;
                    const docRef = dbUsersRef.where("teamUid", "==", team.id).orderBy("lastName", "desc");
                    return(docRef.get());
                } else {
                    throw new Error(`Team not found`);
                }
            }).then(docSnaps => {
                docSnaps.forEach((doc) => {
                    const user = doc.data();
                    user.id = doc.id;

                    user.teamUid = team.id;
                    user.teamName = team.name;
                    
                    userArray.push(user);
                });
                team.users = userArray;
                console.log(`Team with users ${JSON.stringify(team)}`);
                resolve(team);
            }).catch(err => {
                reject(`Error getting team in TeamDB.get ${err}`);
            });
        });
    }

    // delete team
    // Do NOT allow delete if team is part of any activity or user
    static delete = (teamId) => {
        let anyUsers = false;
        let anyActivities = false;

        return new Promise((resolve, reject) => {

            const dbUsersRef = Util.getDBRefs().dbUsersRef;
            const docRef = dbUsersRef.where("teamUid", "==", teamId).limit(1);
            docRef.get()
            .then((docSnaps) => {
                docSnaps.forEach((doc) => {
                    anyUsers = true;
                });
                if (anyUsers) {
                    throw new Error(`Cant delete, users assigned to this team`);
                } 
                const dbActivitiesRef = Util.getDBRefs().dbActivitiesRef;
                const docRef = dbActivitiesRef.where("teamUid", "==", teamId).limit(1);
                return(docRef.get());
            }).then((docSnaps) => {
                docSnaps.forEach((doc) => {
                    anyActivities = true;
                });
                if (anyActivities) {
                    throw new Error(`Cant delete, activities assigned to this team`);
                } 
                const dbTeamsRef = Util.getDBRefs().dbTeamsRef;
                return(dbTeamsRef.doc(teamId).delete());
            }).then(() => {
                console.log("Firestore Team successfully deleted!");
                resolve();    
            }).catch((err) => {
                console.error("Error deleting firestore team in TeamDB.delete(:uid:) ", err);
                reject(err);
            });
        });
    }
    // Add a single team 
    static create = (team) => {
        return new Promise((resolve, reject) => {
            const dbTeamsRef = Util.getDBRefs().dbTeamsRef;
            
            dbTeamsRef
                .add({
                    description: team.description,
                    name: team.name,
                })
                .then((doc) => {
                    console.log("Firestore team successfully added");
                    return resolve(doc.id);
                })
                .catch((error) => {
                    console.error("Firestore team add failed");
                    return reject(error);
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