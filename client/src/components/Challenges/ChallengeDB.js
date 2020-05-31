import Util from "../Util/Util.js";
import Photo from "../Util/Photo.js"

class ChallengeDB {

    // get all challenges
    static getFiltered = () => {
        // default ref gets all
        const dbChallengesRef = Util.getBaseDBRefs().dbChallengesRef;

        const ref = dbChallengesRef
            .orderBy("startDate", "desc")

        return new Promise((resolve, reject) => {
            ref.get().then((querySnapshot) => {
                let challenges = [];
                querySnapshot.forEach(doc => {
                    let challenge = {};
                    challenge = doc.data();
                    challenge.id = doc.id;
                    challenge.startDate = challenge.startDate.toDate();
                    challenge.endDate = challenge.endDate.toDate();
                    challenges.push(challenge);
                });
                resolve(challenges);
            }).catch(err => {
                reject(err);
            });
        });
    }

    // get one based on ID challenges
    static get = (id) => {
        // default ref gets all
        const dbChallengesRef = Util.getBaseDBRefs().dbChallengesRef;

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
            const dbChallengesRef = Util.getBaseDBRefs().dbChallengesRef;
            let challengeNew = {
                description: challenge.description,
                challengeDistance: challenge.challengeDistance ? challenge.challengeDistance : 0,
                endDate: challenge.endDate,
                isCurrentChallenge: challenge.isCurrentChallenge ? challenge.isCurrentChallenge : false,
                name: challenge.name,
                startDate: challenge.startDate,
                startCity: challenge.startCity ? challenge.startCity : false,
                startCityGeometry: challenge.startCityGeometry ? challenge.startCityGeometry : {lat:0, lng:0},
                endCity: challenge.endCity ? challenge.endCity : false,
                endCityGeometry: challenge.endCityGeometry ? challenge.endCityGeometry : {lat:0, lng:0},
                waypoints: challenge.waypoints ? challenge.waypoints : false,
                isSwim: challenge.isSwim !== undefined &&  challenge.isSwim !== null ? challenge.isSwim : false,
                isBike: challenge.isBike !== undefined &&  challenge.isBike !== null ? challenge.isBike : false,
                isRun: challenge.isRun !== undefined &&  challenge.isRun !== null ? challenge.isRun : false,
                isOther: challenge.isOther !== undefined &&  challenge.isOther !== null ? challenge.isOther : false,
                mapCalculation: challenge.mapCalculation ? challenge.mapCalculation : "all"
            }
            // do NOT overwrite existing photoOBj
            if (challenge.photoObj && challenge.photoObj != null) {
                challengeNew.photoObj = challenge.photoObj;
            }

            dbChallengesRef.add(challengeNew).then((doc) => {
                console.log("Firestore challenge successfully added");
                return resolve(doc.id);
            }).catch((error) => {
                console.error("Firestore challenge add failed");
                return reject(error);
            });
        });
    }

    static update = (challenge) => {
        return new Promise((resolve, reject) => {
            const dbChallengesRef = Util.getBaseDBRefs().dbChallengesRef;
            let challengeNew = {
                description: challenge.description,
                challengeDistance: challenge.challengeDistance ? challenge.challengeDistance : 0,
                endDate: challenge.endDate,
                isCurrentChallenge: challenge.isCurrentChallenge ? challenge.isCurrentChallenge : false,
                name: challenge.name,
                startDate: challenge.startDate,
                startCity: challenge.startCity ? challenge.startCity : false,
                startCityGeometry: challenge.startCityGeometry ? challenge.startCityGeometry : {lat:0, lng:0},
                endCity: challenge.endCity ? challenge.endCity : false,
                endCityGeometry: challenge.endCityGeometry ? challenge.endCityGeometry : {lat:0, lng:0},
                waypoints: challenge.waypoints ? challenge.waypoints : false,
                isSwim: challenge.isSwim !== undefined &&  challenge.isSwim !== null ? challenge.isSwim : false,
                isBike: challenge.isBike !== undefined &&  challenge.isBike !== null ? challenge.isBike : false,
                isRun: challenge.isRun !== undefined &&  challenge.isRun !== null ? challenge.isRun : false,
                isOther: challenge.isOther !== undefined &&  challenge.isOther !== null ? challenge.isOther : false,
                mapCalculation: challenge.mapCalculation ? challenge.mapCalculation : "all"
            }
            // do NOT overwrite existing photoOBj
            if (challenge.photoObj && challenge.photoObj != null) {
                challengeNew.photoObj = challenge.photoObj;
            }

            dbChallengesRef.doc(challenge.id).set(challengeNew, { merge: true }).then(() => {
                console.log("Firestore challenge successfully updated");
                return resolve();
            }).catch((error) => {
                console.error("Firestore challenge add failed");
                return reject(error);
            });
        });
    }

    // delete challenge
    // Do NOT allow delete if team or actitivity or user is part of challenge
    // right now, activity and team do NOT have challengeUid field but since
    // they are subcollections of challenge you can test
    static delete = (challenge) => {
        let anyUsers = false;
        let anyActivities = false;
        let anyTeams = false;

        return new Promise((resolve, reject) => {
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
            const dbChallengesRef = Util.getBaseDBRefs().dbChallengesRef;
            const dbTeamsRef = Util.getChallengeDependentRefs(challenge.id).dbTeamsRef;
            const dbActivitiesRef = Util.getChallengeDependentRefs(challenge.id).dbActivitiesRef;

            const docRef = dbUsersRef.where("challengeUid", "==", challenge.id).limit(1);
            docRef.get()
                .then((docSnaps) => {
                    docSnaps.forEach((doc) => {
                        anyUsers = true;
                    });
                    if (anyUsers) {
                        throw new Error(`Cant delete, users assigned to this challenge`);
                    }
                    // const docRef = dbActivitiesRef.where("challengeUid", "==", challenge.id).limit(1);
                    const docRef = dbActivitiesRef.limit(1);
                    return (docRef.get());
                }).then((docSnaps) => {
                    docSnaps.forEach((doc) => {
                        anyActivities = true;
                    });
                    if (anyActivities) {
                        throw new Error(`Cant delete, activities assigned to this challenge`);
                    }
                    const docRef = dbTeamsRef.limit(1);
                    return (docRef.get());
                }).then((docSnaps) => {
                    docSnaps.forEach((doc) => {
                        anyTeams = true;
                    });
                    if (anyTeams) {
                        throw new Error(`Cant delete, teams assigned to this challenge`);
                    }
                    // DELETE THE PHOTO
                    return (Photo.deletePhoto(challenge.photoObj ? challenge.photoObj.fileName : ""));
                }).then(() => {
                    return (dbChallengesRef.doc(challenge.id).delete());
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