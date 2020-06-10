class Activity {
    id:string;
    activityName:string;
    activityDateTime:Date;
    activityType:string;
    challengeUid:string;
    displayName:string;
    distance:number;
    distanceUnits:string;
    duration:number;
    durationUnits:string;
    email:string;
    stravaActivity:boolean = false;
    stravaActivityId:string;
    teamUid:string;
    teamName:string;
    uid:string;

    constructor(activityId?: string) {
        if (activityId) {
            this.id = activityId;
        } else {
            this.id = "";
        }
        this.activityName = "";
        this.activityDateTime = new Date();
        this.activityType = "";
        this.challengeUid = "";
        this.displayName = "";
        this.distance = 0;
        this.distanceUnits = "";
        this.duration = 0;
        this.durationUnits = "Hours";
        this.email = "";
        this.stravaActivity = false;
        this.stravaActivityId = "";
        this.teamUid = "";
        this.teamName = "";
        this.uid = "";    
    }
}

export { Activity };