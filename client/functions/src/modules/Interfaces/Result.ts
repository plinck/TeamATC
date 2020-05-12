class Result {
    challengeUid: string;
    overallRecord: boolean;
    teamRecord: boolean;
    teamUid: string;
    teamName: string;
    userRecord: boolean;
    uid: string;
    displayName: string;
    distanceTotal: number;
    pointsTotal: number;
    durationTotal: number;
    nbrActivities: number;
    swimDistanceTotal: number;
    swimPointsTotal: number;
    swimNbrActivities: number;
    swimDurationTotal: number;
    bikeDistanceTotal: number;
    bikePointsTotal: number;
    bikeNbrActivities: number;
    bikeDurationTotal: number;
    runDistanceTotal: number;
    runPointsTotal: number;
    runNbrActivities: number;
    runDurationTotal: number;
    otherDistanceTotal: number;
    otherPointsTotal: number;
    otherNbrActivities: number;
    otherDurationTotal: number;

    constructor(challengeUid: string) {
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
        this.displayName = "";
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
    }
}

export { Result };