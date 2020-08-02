/*tslint:disable:prefer-conditional-expression*/
class HillRepeat {
    id?: string;
    
    checkin: boolean;
    checkout: boolean;
    description?: string;
    displayName: string;
    elevationGainPerRepeat: number;
    email?: string;
    repeatDateTime: Date;
    repeats: number;
    uid: string;

    lastUpdateDateTime: Date;

    constructor(hillRepeatId?: string) {
        if (hillRepeatId) {
            this.id = hillRepeatId;
        } else {
            this.id = "";
        }
        this.checkin = false;
        this.checkout = false;   
        this.description = "";
        this.displayName = "";
        this.elevationGainPerRepeat = 0;
        this.email = "";
        this.repeatDateTime = new Date();
        this.repeats = 0;
        this.uid = "";

        this.lastUpdateDateTime = new Date();
    }
}

export { HillRepeat };