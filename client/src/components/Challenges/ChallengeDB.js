import Util from "../Util/Util";

class ChallengeDB {
    
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
                .then(() => {
                    console.log("Firestore challenge successfully added");
                    return resolve();
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

}

export default ChallengeDB;