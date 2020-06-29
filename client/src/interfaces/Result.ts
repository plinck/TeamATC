class Result {
    id?: string;

    challengeUid: string;
    overallRecord: boolean;

    teamRecord: boolean;
    teamUid: string;
    teamName: string;

    userRecord: boolean;
    uid: string;
    displayName: string;

    distanceTotal: number;
    durationTotal: number;
    nbrActivities: number;
    photoUrl: string;
    pointsTotal: number;
    rank: number;
    
    bikeDistanceTotal: number;
    bikePointsTotal: number;
    bikeNbrActivities: number;
    bikeDurationTotal: number;
    otherDistanceTotal: number;
    otherDurationTotal: number;
    otherPointsTotal: number;
    otherNbrActivities: number;
    runDistanceTotal: number;
    runPointsTotal: number;
    runNbrActivities: number;
    runDurationTotal: number;
    swimDistanceTotal: number;
    swimPointsTotal: number;
    swimNbrActivities: number;
    swimDurationTotal: number;
    updateDateTime: Date;

    constructor(challengeUid: string) {
        this.id = "";
        this.challengeUid = "";
        if (challengeUid && challengeUid !== "") {
            this.challengeUid = challengeUid;
        }
        this.overallRecord = false;
        this.teamRecord = false;
        this.teamUid = "";
        this.teamName = "";
        this.userRecord = false;
        this.uid = "";
        this.photoUrl = "";
        this.displayName = "";
        this.rank = 0;
        this.distanceTotal = 0;
        this.pointsTotal = 0;
        this.durationTotal = 0;
        this.nbrActivities = 0;
        this.swimDistanceTotal = 0;
        this.swimPointsTotal = 0;
        this.swimNbrActivities = 0;
        this.swimDurationTotal = 0;
        this.bikeDistanceTotal = 0;
        this.bikePointsTotal = 0;
        this.bikeNbrActivities = 0;
        this.bikeDurationTotal = 0;
        this.runDistanceTotal = 0;
        this.runPointsTotal = 0;
        this.runNbrActivities = 0;
        this.runDurationTotal = 0;
        this.otherDistanceTotal = 0;
        this.otherPointsTotal = 0;
        this.otherNbrActivities = 0;
        this.otherDurationTotal = 0;     
        this.updateDateTime = new Date();   
    }
}

export { Result };