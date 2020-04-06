// For upload fit file
import EasyFit from "easy-fit";
import moment from "moment";

class FitActivity {
    fitFile = undefined;
    activity = {};

    constructor(fitFileToUpload) {
        this.fitFile = fitFileToUpload;
    }

    parseNormalActivity(pActivity, jsonData) {
        let activity = pActivity;
        
        const nbrSessions = jsonData.activity.num_sessions;
        const event = jsonData.activity.event;

        if (nbrSessions > 0 && event.toLowerCase() === "activity") {
            // Date stamp is common so far
            let activityDateEST = new Date(jsonData.activity.sessions[0].start_time).toLocaleString("en-US", {
                timeZone: "America/New_York"
            });
            activityDateEST = new Date(activityDateEST);
            activity.activityDateTime = activityDateEST;
            activity.activityDateTimeString = moment(activityDateEST).format("MM-DD-YYYY");

            const sport = jsonData.activity.sessions[0].sport;

            activity.activityType = "Other";
            if (sport.toLowerCase() === "cycling") {
                activity.activityType = "Bike";
            } else if (sport.toLowerCase() === "running") {
                activity.activityType = "Run";
            } else if (sport.toLowerCase() === "swimming") {
                activity.activityType = "Swim";
            }
            // No name on Fit File???
            activity.activityName = `${activity.activityType} on ${activity.activityDateTimeString}`;
    
            const total_distance = jsonData.activity.sessions[0].total_distance;
            activity.distance = Number(total_distance).toFixed(2);
            activity.distanceUnits = "Miles";

            if (activity.sport === "Swim") {
                activity.distance = activity.distance * 1760;
                activity.distance = Number(total_distance).toFixed(0);
                activity.distanceUnits = "Yards";         
            }
    
            const total_timer_time = jsonData.activity.sessions[0].total_timer_time;
            activity.duration = (Number(total_timer_time) / 3600).toFixed(2);
    
            console.log(`activity: ${JSON.stringify(activity)}`)    
        } else {
            console.error(`Error parsing FIT JSON file.  No valid activity sessions found`);
            return undefined;
        }

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

        return activity;
    }

    parseIntoActivity(jsonData) {
        let activity = {
            activityName: "",
            activityDateTime: null,
            activityDateTimeString: "",
            activityType: "",
            distance: 0,
            distanceUnits: "Miles",
            duration: 0
        }

        // const manufacturer = jsonData.file_id.manufacturer;
        activity = this.parseNormalActivity(activity, jsonData);

        return activity;
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
                            let activity = this.parseIntoActivity(data);
                            if (activity) {
                                this.activity = activity;
                                resolve(this.activity);
                            } else {
                                reject(` -- parsing error -- please check with support`);                             
                            }
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