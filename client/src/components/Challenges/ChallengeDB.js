import Util from "../Util/Util";

class ChallengeDB {
    
    // get all challenges
    static getFiltered = () => {
        // default ref gets all
        const dbChallengesRef = Util.getDBRefs().dbChallengesRef;

        const ref = dbChallengesRef
            .orderBy("startDate", "desc")

        return new Promise((resolve, reject) => {
            ref
                .get()
                .then((querySnapshot) => {
                    let challenges = [];
                    querySnapshot.forEach(doc => {
                        let  challenge = {};
                        challenge = doc.data();
                        challenge.id = doc.id;
                        challenge.startDate = challenge.startDate.toDate();
                        challenge.endDate = challenge.endDate.toDate();
                        challenges.push(challenge);
                    });
                    resolve(challenges);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    // get one based on ID challenges
    static get = (id) => {
        // default ref gets all
        const dbChallengesRef = Util.getDBRefs().dbChallengesRef;

        const ref = dbChallengesRef.doc(id)

        return new Promise((resolve, reject) => {
            ref
                .get()
                .then((doc) => {
                    let challenge = {};
                    if (doc.exists) {
                        challenge = doc.data();
                        challenge.id = doc.id;
                        challenge.startDate = challenge.startDate.toDate();
                        challenge.endDate = challenge.endDate.toDate();
                        resolve(challenge);
                    } else {
                        reject(`Challenge not found with id: ${id}`);
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

// Add a single challenge based on id
    static create = (challenge) => {
        return new Promise((resolve, reject) => {
            const dbChallengesRef = Util.getDBRefs().dbChallengesRef;
            
            dbChallengesRef
                .add({
                    description: challenge.description,
                    endDate: challenge.endDate,
                    isCurrentChallenge: challenge.isCurrentChallenge ? challenge.isCurrentChallenge : false,
                    name: challenge.name,
                    startDate: challenge.startDate,
                })
                .then((doc) => {
                    console.log("Firestore challenge successfully added");
                    return resolve(doc.id);
                })
                .catch((error) => {
                    console.error("Firestore challenge add failed");
                    return reject(error);
                });
        });
    }

    static update = (challenge) => {
        return new Promise((resolve, reject) => {
            const dbChallengesRef = Util.getDBRefs().dbChallengesRef;
            
            dbChallengesRef
                .doc(challenge.id)
                .set({
                    description: challenge.description,
                    endDate: challenge.endDate,
                    isCurrentChallenge: challenge.isCurrentChallenge ? challenge.isCurrentChallenge : false,
                    name: challenge.name,
                    startDate: challenge.startDate,
                }, {merge: true})
                .then(() => {
                    console.log("Firestore challenge successfully updated");
                    return resolve();
                })
                .catch((error) => {
                    console.error("Firestore challenge add failed");
                    return reject(error);
                });
        });
    }

    // Delete a single activity based on id
    static delete = (id) => {
        return new Promise((resolve, reject) => {
            const dbChallengesRef = Util.getDBRefs().dbChallengesRef;
            
            dbChallengesRef
                .doc(id)
                .delete()
                .then(() => {
                    console.log("Firestore challenge successfully deleted");
                    return resolve();
                })
                .catch((err) => {
                    console.error("Error deleting firestor challenge ", err);
                    return reject(err);
                });
        });
    }

    // delete challenge
    // Do NOT allow delete if team or actitivity or user is part of challenge
    // right now, activity and team do NOT have challengeUid field but since
    // they are subcollections of challenge you can test
    static delete = (challengeId) => {
        let anyUsers = false;
        let anyActivities = false;
        let anyTeams = false;

        return new Promise((resolve, reject) => {

            const dbUsersRef = Util.getDBRefs().dbUsersRef;
            const docRef = dbUsersRef.where("challengeUid", "==", challengeId).limit(1);
            docRef.get()
            .then((docSnaps) => {
                docSnaps.forEach((doc) => {
                    anyUsers = true;
                });
                if (anyUsers) {
                    throw new Error(`Cant delete, users assigned to this challenge`);
                } 
                const dbActivitiesRef = Util.getChallengesRef(challengeId).dbActivitiesRef;
                // const docRef = dbActivitiesRef.where("challengeUid", "==", challengeId).limit(1);
                const docRef = dbActivitiesRef.limit(1);
                return(docRef.get());
            }).then((docSnaps) => {
                docSnaps.forEach((doc) => {
                    anyActivities = true;
                });
                if (anyActivities) {
                    throw new Error(`Cant delete, activities assigned to this challenge`);
                } 
                const dbTeamsRef = Util.getChallengesRef(challengeId).dbTeamsRef;
                const docRef = dbTeamsRef.limit(1);
                return(docRef.get());
            }).then((docSnaps) => {
                docSnaps.forEach((doc) => {
                    anyTeams = true;
                });
                if (anyTeams) {
                    throw new Error(`Cant delete, teams assigned to this challenge`);
                } 
                const dbChallengesRef = Util.getDBRefs().dbChallengesRef;
                return(dbChallengesRef.doc(challengeId).delete());
            }).then(() => {
                console.log("Firestore Challenge successfully deleted!");
                resolve();    
            }).catch((err) => {
                console.error("Error deleting firestore challenge in ChallengeDB.delete(:uid:) ", err);
                reject(err);
            });
        });
    }



}

export default ChallengeDB;