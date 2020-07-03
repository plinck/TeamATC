/*tslint:disable:prefer-conditional-expression*/
class HillRepeat {
    id?: string;
    
    repeatDateTime: Date;
    description?: string;
    displayName: string;
    elevationGainPerRepeat: number;
    email?: string;
    repeats: number;
    uid: string;

    lastUpdateDateTime: Date;

    constructor(hillRepeatId?: string) {
        if (hillRepeatId) {
            this.id = hillRepeatId;
        } else {
            this.id = "";
        }
        this.repeatDateTime = new Date();
        this.description = "";
        this.displayName = "";
        this.elevationGainPerRepeat = 0;
        this.email = "";
        this.repeats = 0;
        this.uid = "";

        this.lastUpdateDateTime = new Date();
    }
}

export { HillRepeat };