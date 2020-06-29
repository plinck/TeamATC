class HillRepeat {
    id: string;
    
    date: Date;
    description?: string;
    displayName: string;
    elevationGainPerRepeat: number;
    repeats: number;
    totalElevationGain: number;
    uid: string;

    lastUpdateDateTime: Date;

    constructor(hillRepeatId?: string) {
        if (hillRepeatId) {
            this.id = hillRepeatId;
        } else {
            this.id = "";
        }
        this.date = new Date();
        this.description = "";
        this.displayName = "";
        this.elevationGainPerRepeat = 0;
        this.repeats = 0;
        this.totalElevationGain = 0;
        this.uid = "";

        this.lastUpdateDateTime = new Date();
    }
}

export { HillRepeat };