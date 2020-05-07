class Challenge {
    id: string;
    description: string;
    endDate: Date;
    isCurrentChallenge: boolean;
    name: string;
    photoObj: string;
    startDate: Date;
    startCity: string;
    endCity: string;
    waypoints: Array<any>;
    isSwim: boolean;
    isBike: boolean;
    isRun: boolean;
    isOther: boolean;
    mapCalculation: string;

    // Note - An argument which has a default value is optional by definition, as stated in the docs
    constructor(challengeId:string = "5XuThS03PcQQ1IasPQif") {
        this.id = challengeId;
        this.description = "";
        this.endDate = new Date();
        this.isCurrentChallenge = false;
        this.name = "";
        this.photoObj = "";
        this.startDate = new Date();
        this.startCity = "";
        this.endCity = "";
        this.waypoints = Array<any>();
        this.isSwim = true;
        this.isBike = true;
        this.isRun = true;
        this.isOther = true;
        this.mapCalculation = "all"
    }
}

export { Challenge };