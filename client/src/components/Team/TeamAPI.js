import Util from "../Util/Util";

class TeamAPI {
    // Cloud Functions
    static updateUserAndActivityTeams(challengeUid, team) {
        const firebase = Util.getFirebaseAuth();
        const request = {challengeUid: challengeUid, team: team};
        
        const fBFupdateTeam = firebase.functions.httpsCallable('fBFupdateTeam');
        fBFupdateTeam(request).then( (res) => {
            // Read result of the Cloud Function.
            console.log(`updated users with team.id ${team.id} to team name: ${team.name} from cloud function`);
        }).catch(err => {
            console.error(`${err}`);
        });

        const fBFupdateActivityTeamName = firebase.functions.httpsCallable('fBFupdateActivityTeamName');
        fBFupdateActivityTeamName(request).then( (res) => {
            // Read result of the Cloud Function.
            console.log(`updated activities with team.id ${team.id} to team name: ${team.name} from cloud function`);
        }).catch(err => {
            console.error(`${err}`);
        });

    }

}
export default TeamAPI;