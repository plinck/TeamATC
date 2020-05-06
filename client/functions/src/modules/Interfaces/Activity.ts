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
    stravaAcvitiy:boolean = false;
    stravaAcvitiyId:string;
    teamUid:string;
    teamName:string;
    uid:string;

    constructor() {
        this.id = "";
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
        this.stravaAcvitiy = false;
        this.stravaAcvitiyId = "";
        this.teamUid = "";
        this.teamName = "";
        this.uid = "";    
    }
}

export default Activity;