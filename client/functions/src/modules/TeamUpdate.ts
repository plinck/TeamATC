import * as admin from 'firebase-admin';
import { APP_CONFIG } from "./FirebaseEnvironment";
import { Team } from "./interfaces/Team";

// ===============================================================================================
// Update Team info that was denormalized
// ===============================================================================================
class TeamUpdate {
    // console.log(`In fBFupdateTeam with: req ${JSON.stringify(req)}`);
    public updateUserTeam(team: Team) {
        return new Promise((resolve, reject) => {
            const dbUsersRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("users");

            const batch = admin.firestore().batch();
            const allUsersOnTeamRef = dbUsersRef.where("teamUid", "==", team.id)
            allUsersOnTeamRef.get().then((querySnapshot) => {
                querySnapshot.forEach(doc => {
                    batch.set(doc.ref, {
                        teamName: team.name,
                    }, { merge: true });
                });
                return batch.commit();
            }).then(() => {
                console.log("Update Team Batch successfully committed!");
                resolve();
            }).catch((err) =>{
                console.error("Team Batch failed: ", err);
                reject(err);
            });
        }); // Promise
    }

    public updateActivityTeamName(team:Team, challengeId: string) {
    // console.log(`In fBFupdateActivityTeamName with: req ${JSON.stringify(req)}`);
        const challengeUid = challengeId;

        return new Promise((resolve, reject) => {
            let activitiesRef = undefined;
            if (challengeUid && challengeUid !== "") {
                activitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(challengeUid).collection(`activities`);
            }

            const batch = admin.firestore().batch();
            const allActivitiessOnTeamRef = activitiesRef.where("teamUid", "==", team.id)
            allActivitiessOnTeamRef.get().then((querySnapshot) => {
                querySnapshot.forEach(doc => {
                    batch.set(doc.ref, {
                        teamName: team.name,
                    }, { merge: true });
                });
                return batch.commit();
            }).then(() => {
                console.log("Activity Team Batch successfully committed!");
                resolve();
            }).catch((err) =>{
                console.error("Activity Team Batch failed: ", err);
                reject(err);
            });
        }); // Promise
    }
} // Class

export { TeamUpdate };