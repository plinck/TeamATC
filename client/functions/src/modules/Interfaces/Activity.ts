class Activity {
    id:string = "";
    activityName:string = "";
    activityDateTime:string = "";
    activityType:string = "";
    challengeUid:string = "";
    displayName:string = "";
    distance:string = "";
    distanceUnits:string = "";
    duration:string = "";
    email:string = "";
    stravaAcvitiy:boolean = false;
    stravaAcvitiyId:string = "";
    teamUid:string = "";
    teamName:string = "";
    uid:string = "";

    constructur() {
        this.id = "";
        this.activityName = "";
        this.activityDateTime = "";
        this.activityType = "";
        this.challengeUid = "";
        this.displayName = "";
        this.distance = "";
        this.distanceUnits = "";
        this.duration = "";
        this.email = "";
        this.stravaAcvitiy = false;
        this.stravaAcvitiyId = "";
        this.teamUid = "";
        this.teamName = "";
        this.uid = "";    
    }
}

export default Activity;