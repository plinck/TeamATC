type PhotoObj = {
    url: string,
    fileName: string,
    fileTitle: string
}

export type UserChallenge = {
    challengeUid: string,
    teamUid: string
}

class User {
    id?:  string;

    challenges?: Array<UserChallenge>;
    challengeUid:  string;
    displayName:  string;
    email: string;
    firstName: string;
    isAdmin: boolean;
    isTeamLead: boolean;
    isModerator: boolean;
    isUser: boolean;
    lastName: string;
    phoneNumber: string;
    photoObj?: PhotoObj;
    primaryRole: string;
    stravaAccessToken: string;
    stravaAthleteId:  string;
    stravaExpiresAt: Date;
    stravaRefreshToken: string;
    stravaUserAuth:  boolean;
    teamName: string;
    teamUid: string;
    uid: string;

    constructor() {
        this.id = "";

        this.challenges = [];
        this.challengeUid = "";
        this.displayName = "";
        this.email = "";
        this.firstName = "";
        this.isAdmin = false;
        this.isTeamLead = false;
        this.isModerator = false;
        this.isUser = false;
        this.lastName = "";
        this.phoneNumber = "";
        this.photoObj = {url: "", fileName: "", fileTitle: ""};
        this.primaryRole = "";
        this.stravaAccessToken = "";
        this.stravaAthleteId = "";
        this.stravaExpiresAt = new Date();
        this.stravaRefreshToken = "";
        this.stravaUserAuth = false;
        this.teamName = "";
        this.teamUid = "";
        this.uid = "";
    }
}

export { User };
