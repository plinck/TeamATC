// For upload fit file
import EasyFit from "easy-fit";
import moment from "moment";

class FitActivity {
    fitFile = undefined;
    activity = {};

    constructor(fitFileToUpload) {
        this.fitFile = fitFileToUpload;
    }

    parseIntoActivity(jsonData) {
        this.activity = {
            activityName: "",
            activityDateTime: null,
            activityDateTimeString: "",
            activityType: "",
            distance: 0,
            distanceUnits: "Miles",
            duration: 0
        }

        let activityDateEST = new Date(jsonData.activity.timestamp).toLocaleString("en-US", {
            timeZone: "America/New_York"
        });
        activityDateEST = new Date(activityDateEST);
        this.activity.activityDateTime = activityDateEST;
        this.activity.activityDateTimeString = moment(activityDateEST).format("MM-DD-YYYY");

        const sport = jsonData.sport.sport;

        this.activity.activityType = "Other";
        if (sport.toLowerCase() === "cycling") {
            this.activity.activityType = "Bike";
        } else if (sport.toLowerCase() === "running") {
            this.activity.activityType = "Run";
        } else if (sport.toLowerCase() === "swimming") {
            this.activity.activityType = "Swim";
        }
        // No name on Fit File???
        this.activity.activityName = `${this.activity.activityType} on ${this.activity.activityDateTimeString}`;

        const total_distance = jsonData.activity.sessions[0].total_distance;
        this.activity.distance = Number(total_distance).toFixed(2);
        this.activity.distanceUnits = "Miles";

        const total_timer_time = jsonData.activity.total_timer_time;
        this.activity.duration = (Number(total_timer_time) / 3600).toFixed(2);

        // const sub_sport = jsonData.sport["sub_sport"];
        // const total_calories = jsonData.activity.sessions[0].total_calories;
        // const avg_speed = jsonData.activity.sessions[0].avg_speed;
        // const avg_power = jsonData.activity.sessions[0].avg_power;
        // const normalized_power = jsonData.activity.sessions[0].normalized_power;
        // const training_stress_score = jsonData.activity.sessions[0].training_stress_score;
        // const intensity_factor = jsonData.activity.sessions[0].intensity_factor;
        // const avg_heart_rate = jsonData.activity.sessions[0].avg_heart_rate;
        // const max_heart_rate = jsonData.activity.sessions[0].max_heart_rate;
        // const avg_cadence = jsonData.activity.sessions[0].avg_cadence;
        // const max_cadence = jsonData.activity.sessions[0].max_cadence;
        console.log(`this.activity: ${JSON.stringify(this.activity)}`)
    }

    processFitFile() {
        //let fileToUpload = this.state.fitFileToUpload;
        return new Promise((resolve, reject) => {

            if (this.fitFile) {
                let reader = new FileReader();
                reader.readAsArrayBuffer(this.fitFile, "UTF-8");
                reader.onload = (evt) => {
                    let content = evt.target.result;

                    var easyFit = new EasyFit({
                        force: true,
                        speedUnit: 'mph',
                        lengthUnit: 'mi',
                        temperatureUnit: 'farhenheit',
                        elapsedRecordField: true,
                        mode: 'cascade',
                    });

                    // Parse your file
                    easyFit.parse(content, (error, data) => {
                        // Handle result of parse method
                        if (error) {
                            console.error(`error parsing fit file ${error}`);
                            reject(`error parsing fit file ${error}`);
                        } else {
                            // console.log(JSON.stringify(data));
                            this.parseIntoActivity(data);
                            resolve(this.activity);
                        }
                    });
                }
                reader.onerror = function (evt) {
                    console.error(`error reading file ${evt.error}`);
                    reject(`error reading file ${evt.error}`);
                }
            }

        });
    }
} // class

export default FitActivity;