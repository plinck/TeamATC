import Util from "../Util/Util";
import TeamAPI from "./TeamAPI";

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
            Util.promiseGetChallengeDBRefs().then ( allDBRefs => {
                const dbTeamsRef = allDBRefs.dbTeamsRef;
                const dbActivitiesRef = allDBRefs.dbActivitiesRef;
                
                let teams = {} ;
                let activityArray = [];

                dbTeamsRef.orderBy("name").get().then((results) => {
                    results.forEach((doc) => {
                        teams[doc.id] = doc.data();
                    });
                    
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
            }).catch((err) => {
                console.error("Error in ActivityDB.getTeamsWithActivities: ", err);
                reject(`Error in ActivityDB.getTeamsWithActivities getting dbRefs: ${err}`);
            });
        }); // promise
    }// method

    // get team base on uid (id and uid are same)
    static get = (id) => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            Util.promiseGetChallengeDBRefs().then ( allDBRefs => {
                const dbTeamsRef = allDBRefs.dbTeamsRef;

                let docRef = dbTeamsRef.doc(id);
                docRef.get().then((doc) => {
                    if (doc.exists) {
                        // update
                        let team = doc.data();
                        team.id = doc.id;
                        return(resolve(team));
                    }
                    console.error("Team not found in firestore");
                    return(resolve());
                }).catch(err => {
                    reject(`Error getting team in TeamDB.get ${err}`);
                });
            }).catch(err => {
                reject(`Error getting team dbRefs in TeamDB.get ${err}`);
            });
        });
    }

    // Get Users for a team
    // TODO : - Fix this - the users promise isnt done when team is returned so this wont work as expected
    // TODO:  Test this as I dont think it works.  I need to get chaining better as lots of uses
    static getTeamUsersAlt = (teamId) => {
        let user = {};
        let users = [];

        // its a promise so return
        return new Promise((resolve, reject) => {
            Util.promiseGetChallengeDBRefs().then ( allDBRefs => {
                const dbActivitiesRef = allDBRefs.dbActivitiesRef;
                const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;

                dbUsersRef.where("teamUid", "==", teamId).orderBy("lastName").get().then((docSnaps) => {
                    docSnaps.forEach((doc) => {
                        // update
                        user = doc.data();
                        user.id = doc.id;
                        user.hasActivities = false;
                        users.push(user);
                    });
                    return(users);
                }).then( users => {
                    users.forEach((user) => {
                        dbActivitiesRef.where("uid", "==", user.id).orderBy("lastName", "desc").limit(1).then(activity => {
                            if (activity.exists) {
                                user.hasActivities = true;
                            }    
                        })
                    }); 
                    resolve(users);       
                }).catch (err => {
                    console.error(`Error getting users for team in TeamDB.getTeamUsers ${err}`);
                    reject(`Error getting users for team in TeamDB.getTeamUsers ${err}`);
                });
            }).catch(err => {
                console.error(`Error getting team dbRefs in TeamDB.get ${err}`);
                reject(`Error getting team dbRefs in TeamDB.get ${err}`);
            });
        });
    }

    static getTeamUsers = (teamId) => {
        let users = [];
        
        // its a promise so return
        return new Promise((resolve, reject) => {
            Util.promiseGetChallengeDBRefs().then ( allDBRefs => {
                const dbActivitiesRef = allDBRefs.dbActivitiesRef;
                const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;

                dbUsersRef.where("teamUid", "==", teamId).orderBy("lastName").get().then((querySnapshot) => {
                    const activityQueryPromises = [];
                    querySnapshot.forEach(doc => {
                        let user = doc.data();
                        user.id = doc.id;
                        user.hasActivities = false;
                        // get the user ndoc.data().uid;
                        const activityQuery = dbActivitiesRef.where("uid", "==", user.id).limit(1).get().then ( activitiesSnap => {
                            activitiesSnap.forEach(doc => {
                                //console.log(`Got activity for user: ${user.lastName}`);
                                user.hasActivities =true;
                            });
                            if (!user.hasActivities) {
                                console.error(`User ${user.firstName} ${user.lastName} posted no activties`);
                            }
                        }).catch(err => {
                            console.error(`Error getTeamUsersAlt.activityQuery: ${err}`)
                        }).finally(() => {
                            users.push(user);
                        });
                        activityQueryPromises.push(activityQuery);
                    });
                    // This waits until ALL promises in the activityQueryPromises array are resolved
                    Promise.all(activityQueryPromises).then(() => {
                        console.log('All activityQueryPromises Resolved');
                        resolve(users);
                    });
                }).catch(err => {
                    reject(`Error TeamDB.getTeamUsersAlt ${err.message}`);
                });
            }).catch(err => {
                console.error(`Error getting team dbRefs in TeamDB.get ${err}`);
                reject(`Error getting team dbRefs in TeamDB.getTeamUsers ${err}`);
            });
        });
    }



    // delete team
    // Do NOT allow delete if team is part of any activity or user
    static delete = (teamId) => {
        let anyUsers = false;
        let anyActivities = false;

        return new Promise((resolve, reject) => {
            Util.promiseGetChallengeDBRefs().then ( allDBRefs => {
                const dbTeamsRef = allDBRefs.dbTeamsRef;
                const dbActivitiesRef = allDBRefs.dbActivitiesRef;
                const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
                
                const docRef = dbUsersRef.where("teamUid", "==", teamId).limit(1);
                docRef.get()
                .then((docSnaps) => {
                    docSnaps.forEach((doc) => {
                        anyUsers = true;
                    });
                    if (anyUsers) {
                        throw new Error(`Cant delete, users assigned to this team`);
                    } 
                    const docRef = dbActivitiesRef.where("teamUid", "==", teamId).limit(1);
                    return(docRef.get());
                }).then((docSnaps) => {
                    docSnaps.forEach((doc) => {
                        anyActivities = true;
                    });
                    if (anyActivities) {
                        throw new Error(`Cant delete, activities assigned to this team`);
                    } 
                    return(dbTeamsRef.doc(teamId).delete());
                }).then(() => {
                    console.log("Firestore Team successfully deleted!");
                    resolve();    
                }).catch((err) => {
                    console.error("Error deleting firestore team in TeamDB.delete(:uid:) ", err);
                    reject(err);
                });
            }).catch((err) => {
                console.error("Error deleting firestore team getting dbRefs in TeamDB.delete(:uid:) ", err);
                reject(err);
            });
        });
    }
    // Add a single team 
    static create = (team) => {
        return new Promise((resolve, reject) => {
            Util.promiseGetChallengeDBRefs().then ( allDBRefs => {
                const dbTeamsRef = allDBRefs.dbTeamsRef;
            
                dbTeamsRef.add({
                        description: team.description,
                        name: team.name,
                }).then((doc) => {
                    console.log("Firestore team successfully added");
                    return resolve(doc.id);
                }).catch((error) => {
                    console.error("Firestore team add failed");
                    return reject(error);
                });

            }).catch((error) => {
                console.error("Firestore team add failed getting dbRefs");
                return reject(error);
            });
        });
    }

    // Update Existing team
    // NOTE: - I purposely do not update uid since that is essentially the primary key
    // I think this will add if it does nort exist so use for add
    static update =  (team) => {
        console.log(`trying to update team in firestore: ${team}`);
        return new Promise((resolve, reject) => {
            Util.promiseGetChallengeDBRefs().then ( allDBRefs => {
                const dbTeamsRef = allDBRefs.dbTeamsRef;
                const challengeUid = allDBRefs.challengeUid;

                dbTeamsRef.doc(team.id).set({
                    name: team.name ? team.name : "No Name",
                    description: team.description ? team.description : ""
                },{ merge: true }).then(() => {
                    // update teams but do no wait - no reason to
                    TeamAPI.updateUserAndActivityTeams(challengeUid, team);
                    resolve();
                }).catch(err => {
                    console.error(`error updating team: ${err}`);
                    reject(err);
                });

            }).catch(err => {
                console.error(`error updating team: ${err}`);
                reject(err);
            });
        });
    }
}//class

export default TeamDB;