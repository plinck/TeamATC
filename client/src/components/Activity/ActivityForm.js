import React from "react";
import { withRouter } from 'react-router';

import M from "materialize-css/dist/js/materialize.min.js";
import Modal from "./ActivityModal";
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Redirect } from "react-router";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";

// For select input field
// import FormControl from '@material-ui/core/FormControl';
// import InputLabel from "@material-ui/core/InputLabel";
// import MenuItem from "@material-ui/core/MenuItem";
// import Select from "@material-ui/core/Select";
// Changed select to autocomplete so keyboard would work
import Autocomplete from '@material-ui/lab/Autocomplete';
 
import CircularProgress from '@material-ui/core/CircularProgress';
import moment from "moment";

import TeamAPI from "../Team/TeamAPI"
import ActivityDB from "./ActivityDB"
import UserAPI from "../User/UserAPI"

// For upload fit file
import EasyFit from "easy-fit";


const INITIAL_STATE = {
    uid: "",
    email: "",
    displayName: "",
    teamUid: "",
    teamName: "",
    activityName: "",
    activityDateTime: "",
    activityDateTimeString: "",
    activityType: "",           
    distance: "",
    distanceUnits: "",
    duration: "",

    teams: null,
    teamLookup: null,

    message: null
}

const styles = theme => ({
    container: {
        display: "flex",
        flexWrap: "wrap",
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 300,
    },
    formControl: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 300,
    }
});

class ActivityForm extends React.Component {
    constructor(props) {
        super(props);
    
        this._isMounted = false;
    
        this.state = { ...INITIAL_STATE };
        this.state.id = this.props.id;

        this.state.fitFileToUpload = null;
        this.state.fitFileLoaded = false;

        //set the date field to be current date by default
        let jsDate = new Date();
        const dateTimeString = moment(jsDate).format("MM-DD-YYYY");
        this.state.activityDateTimeString = dateTimeString;
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    componentDidMount() {
        this._mounted = true;
        this.fetchTeams();  // for pulldown so doesnt matter if user exists yet
        
        // only get activity if its an update, otherwise assume new
        if (this.state.id) {
          this.fetchActivity(this.state.id);
        } else {
        }
    
        let elem = document.querySelector(".modal");
        M.Modal.init(elem);
    }

    handleChange = name => event => {
        if (event.target.value) {
            this.setState({ [name]: parseInt(event.target.value) });
        }
        else {
            this.setState({ [name]: 0 });
        }
    };

    // used for autocomplete component
    onTagsChange = (event, value) => {
        //console.log(`Values: ${value}`)
        let distanceUnits = "Miles";
        switch(value) {
            case "Swim":
                distanceUnits = "Yards";
                break;
            case "Bike":                            
                distanceUnits = "Miles";
                break;
            case "Run":
                distanceUnits = "Miles";
                break;
            default:
                distanceUnits = "Miles";
            }     
        this.setState({
            activityType: value,
            distanceUnits: distanceUnits
        });
    }
    
    onChange = event => {
        // Set Units
        let distanceUnits = "Miles";
        if (event.target.name === "activityType") {
            switch(event.target.value) {
                case "Swim":
                    distanceUnits = "Yards";
                    break;
                case "Bike":                            
                    distanceUnits = "Miles";
                    break;
                case "Run":
                    distanceUnits = "Miles";
                    break;
                default:
                    distanceUnits = "Miles";
              }     
            this.setState({
                [event.target.name]: event.target.value,
                distanceUnits: distanceUnits
            });
        } else {
            this.setState({
                [event.target.name]: event.target.value,
            });
        }
    };

    // validate valid float as its being typed in
    // The trick is it has to validate AS its being typed in -- before its all complete
    floatNumberOnChange = (event) => {
        const floatRegExp = /^\d{0,6}\.{0,1}(\d{0,2})?$/;

        const value = event.target.value
        if (value === '' || floatRegExp.test(value)) {
            this.setState({
                [event.target.name]: event.target.value,
            });
        }
    }

    // validate valid date as its being typed in
    // The trick is it has to validate AS its being typed in -- before its all complete
    dateNumberOnChange = (event) => {
        const floatRegExp = /^\d{0,2}-{0,1}\d{0,2}-{0,1}(\d{0,4})$/;

        const value = event.target.value
        if (value === '' || floatRegExp.test(value)) {
            this.setState({
                [event.target.name]: event.target.value,
            });
        }
    }

    saveFITFileToState(jsonData) {
        let activity = {
            uid: this.props.user.authUser.uid,
            email: this.props.user.authUser.email,
            displayName: this.props.user.displayName,
            teamName: this.props.user.teamName,
            teamUid: this.props.user.teamUid,

            activityName: "",
            activityDateTime: null,
            activityDateTimeString: "",
            activityType: "",   
            distance: 0,
            distanceUnits: "Miles",
            duration: 0
        }

        var activityDateEST = new Date(jsonData.activity.timestamp).toLocaleString("en-US", {timeZone: "America/New_York"});
        activityDateEST = new Date(activityDateEST); 
        activity.activityDateTime = activityDateEST;
        activity.activityDateTimeString = moment(activityDateEST).format("MM-DD-YYYY");

        const sport = jsonData.sport.sport;

        activity.activityType = "Other";
        if (sport.toLowerCase() === "cycling") {
            activity.activityType ="Bike";
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
        
        const total_timer_time = jsonData.activity.total_timer_time;
        activity.duration = (Number(total_timer_time) / 3600).toFixed(2);
        
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
      
        console.log(`Ready to upload activity: ${JSON.stringify(activity, null, 4)}`);
        this.setState({
            uid: activity.uid,
            email: activity.email,
            displayName: activity.displayName,
            teamName: activity.teamName,
            teamUid: activity.teamUid,

            activityName: activity.activityName,
            activityDateTime: activity.activityDateTime,
            activityDateTimeString: activity.activityDateTimeString,
            activityType:activity.activityType,   
            distance: activity.distance,
            distanceUnits: activity.distanceUnits,
            duration: activity.duration,
            message: `Uploaded FIT file, hit <CREATE> to save`
        })

        // for now, set the state so user cn name it and fix errors
        // this.createActivity(activity);
    }

    readFitFile(fileToUpload) {
        //let fileToUpload = this.state.fitFileToUpload;
        if (fileToUpload) {
            let reader = new FileReader();
            reader.readAsArrayBuffer(fileToUpload, "UTF-8");
            reader.onload = (evt) => {
                console.log("OK reading file");
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
                  easyFit.parse(content,  (error, data) => {
                    // Handle result of parse method
                    if (error) {
                      console.log(error);
                    } else {
                      // console.log(JSON.stringify(data));
                      this.saveFITFileToState(data);
                    }
                  });
            }
            reader.onerror = function (evt) {
                console.error(`error reading file ${evt.error}`);
            }
        }
    }
    
    fitFileChange = (event) => {
        event.preventDefault();

        if (event.target.files.length > 0) {
            console.log(event.target.files[0]);

            this.setState({
                fitFileToUpload: event.target.files[0],
                fitFileLoaded: false
            });
        }
    }
       
    uploadFitFile = (event) => {
        event.preventDefault();
        // Here is where we grab and parse the file and upload it
        // Send a spinner while its happening

        if (this.state.fitFileToUpload && this.state.fitFileToUpload !== null) {
            let fileToUpload = this.state.fitFileToUpload;
            console.log(`Uploading file ${fileToUpload.name}... `);
            this.readFitFile(fileToUpload);  // use direct for now
        }
    }

    // Get the activity info
    fetchActivity(id) {
        ActivityDB.get(id).then(activity => {
            let jsDate = new Date(activity.activityDateTime);
            const dateTimeString = moment(jsDate).format("MM-DD-YYYY");
        
            this.setState({
                activityName: activity.activityName,
                activityDateTimeString: dateTimeString,
                activityType: activity.activityType,   
                distance: activity.distance,
                distanceUnits: activity.distanceUnits,
                duration: activity.duration,
                uid: activity.uid,
                displayName: activity.displayName,
                email: activity.email,
                teamUid: activity.teamUid,
                teamName: activity.teamName
            });
        });
    }

    // Get the users info
    fetchUser() {
        UserAPI.getCurrentUser().then(user => {
            this.setState({
                teamName: user.teamName
            });
        });
    }

    // get available teams for select list
    fetchTeams() {
        TeamAPI.getTeams().then(teams => {
            // Convert array of teams to key value unqie pairs for easy lookup on primary key
            let teamLookup = {}
            teams.forEach(team => {
                teamLookup[team.id] = team.name;
            });
                
            this.setState({
                teams: teams,
                teamLookup: teamLookup
            });
        // Dont need to get custom claims since they are passed in props from context
        // and can not be changed here
        })
        .catch(err => {
            console.error(`Error getting teams ${err}`);
            this.setState({message: `Error getting teams ${err}`});
        });
    }

    validateActivity() {
        // Deal with Date - convert MM/DD/YYYY to date object and then Firestore timestamp
        let jsDateArray = [];
        let jsDateString = this.state.activityDateTimeString;
        if (jsDateString.length === 10) {
            jsDateArray = jsDateString.split("-");
            if (jsDateArray.length < 3) {
                this.setState({ message: `Bad Date - Activity Update Failed: ${this.state.activityDateTimeString}`});
                return false;
            }
        } else {
            this.setState({ message: `Bad Date - Activity Update Failed: ${this.state.activityDateTimeString}`});
            return false;
        }
        let dateString = this.state.activityDateTimeString;
        let momentObj = moment(dateString, 'MM-DD-YYYY');
        let jsDate = new Date(momentObj);
        
        let activity = this.state;
        activity.activityDateTime = jsDate;
        
        // If NEW activity, set the info to the current users info, if not use what is there so admiin can update
        if (!this.state.id) {
            activity.email = this.props.user.authUser.email;
            activity.displayName = this.props.user.displayName;
            activity.uid = this.props.user.authUser.uid;
            activity.teamName = this.props.user.teamName;
            activity.teamUid = this.props.user.teamUid;
        }
        
        if (!activity.uid || activity.uid.length < 1) {
            this.setState({ message: `User info missing - Maybe User Profile Needs Repair`});
            return false;
        } 

        if (!activity.email || activity.email.length < 1) {
            this.setState({ message: `Email missing - Maybe User Profile Needs Repair`});
            return false;
        }     
        
        if (!activity.displayName || activity.displayName.length < 1) {
            this.setState({ message: `User name missing - Maybe User Profile Needs Repair`});
            return false;
        }     

        if (!activity.uid || activity.uid.length < 1) {
            this.setState({ message: `User info missing - User Profile Needs Repair`});
            return false;
        } 

        if (!activity.teamName || activity.teamName.length < 1) {
            this.setState({ message: `Team Name missing - Join team (using Account Update Form) before adding activity`});
            return false;
        } 

        if (!activity.teamUid || activity.teamUid.length < 1) {
            this.setState({ message: `Team Uid missing - Join team before adding activity`});
            return false;
        } 

        if (activity.activityName.length < 1) {
            this.setState({ message: `Activity Name must not be blank`});
            return false;
        }    

        if (activity.activityType.length < 1) {
            this.setState({ message: `Activity Type must not be blank`});
            return false;
        } 

        if (activity.distanceUnits.length < 1) {
            this.setState({ message: `Distance Units must not be blank`});
            return false;
        } 

        if (activity.distance === "" || isNaN(activity.distance)) {
            this.setState({ message: `Distance must be a valid number, you entered: ${activity.distance}`});
            return false;
        } 
        activity.distance = Number(activity.distance);

        if (activity.duration === "" || isNaN(activity.duration)) {
            this.setState({ message: `Duration must be a valid number, you entered: ${activity.duration}`});
            return false;
        } 
        activity.duration = Number(activity.duration);

        // If all good, update or it to firestore
        if (this.state.id) {
            this.updateActivity(activity);
        } else {
            this.createActivity(activity);
        }
  

        return true;
    }
    
    updateActivity = (activity) => {
        // console.log(`Activity Info:${JSON.stringify(activity, null, 2)}`)
        ActivityDB.update(activity).then(res => {
            this.setState({ message: `Activity Successfully Updated` });
            // Redirect to dashboard
            this.props.history.push({
                pathname: '/dashboard'
            });
        }).catch(err => {
            this.setState({ message: `Error updating activity ${err}` });
        });  
    }

    createActivity = (activity) => {
        // console.log(`Activity Info:${JSON.stringify(activity, null, 2)}`)
        ActivityDB.create(activity).then(res => {
            this.setState({ message: `Activity Successfully Created` });
            // Redirect to dashboard
            this.props.history.push({
                pathname: '/dashboard'
            });
        }).catch(err => {
            this.setState({ message: `Error creating activity ${err}` });
        });  
    }

    onSubmitHandler = (event) => {
        event.preventDefault();

        if (!this.validateActivity()) {
            console.error(`${this.state.message}`);
        };
    }

    render() {
        const { classes } = this.props;

        // Some props take time to get ready so return null when uid not avaialble
        if (this.props.user.uid === null) {
            return null;
        }
        
        if (typeof this.state.teams === 'undefined') {
            console.error("Fatal Error")
            return (<div> <p>FATAL ERROR Gettng teams, something goofy going on ...</p> </div>)
        }
        if (this.state.teams === null) {
            // console.log("No teams yet")
            return (<div> <CircularProgress className={classes.progress} /> <p>Loading ...</p> </div>)
        }

        // Commented out the state vars that dont get mutated on this screen
        // these may be needed if a admin is editting
        var {
            uid,
            email,
            displayName,
            teamUid,
            teamName,
            activityName,
            activityDateTimeString,
            activityType,           // swim, bike, run
            distance,
            distanceUnits,
            duration,
            message
        } = this.state;

        // Dont use props to set the team and user for activity unless its NEW, if exissts use from state / current record
        if (!this.state.id) {
            // console.log(`using current users session info for activity add`);
            if (this.props.user.authUser) { 
                uid = this.props.user.uid ? this.props.user.uid : "";
                email = this.props.user.email ? this.props.user.email : "";
                displayName = this.props.user.displayName ? this.props.user.displayName : "";
                teamUid = this.props.user.teamUid ? this.props.user.teamUid : "";
                teamName = this.props.user.teamName ? this.props.user.teamName : "";
            }
        } else {
            // console.log(`using current activity info for activity updates`);
            console.log(`user/team info is uid: ${uid}, email: ${email}, displayName: ${displayName}, teamUid: ${teamUid}, teamName: ${teamName}, `);
        }
    
        if (this.props.user.authUser) {
            return (
                <div className="container">
                    <Modal distance={this.state.distance} />
                    <div className="col s12">
                        <div className="card">
                            <div className="card-content pCard">
                                <span className="card-title">New Activity for {displayName} on Team "{teamName}"</span>
                                <div className="row">
                                    <div className="col s12">
                                        {message != null ? <p className="blue-text">{message}</p> : ""}
                                        <form className={classes.container} noValidate autoComplete="off">

                                        <TextField
                                            disabled
                                            id="displayName"
                                            name="displayName"
                                            label="Name"
                                            placeholder="John"
                                            inputProps={{
                                                style: {padding: 18} 
                                            }}                              
                                            className={classes.textField}
                                            variant="outlined"
                                            autoComplete="text"
                                            margin="normal"
                                            value={displayName}
                                            onChange={this.onChange}
                                        />        
                          
                                        <TextField
                                            id="activityName"
                                            name="activityName"
                                            value={activityName}
                                            label="Activity Name"
                                            placeholder="Silk Sheets Long Ride"
                                            inputProps={{
                                                style: {padding: 18} 
                                            }}                              
                                            className={classes.textField}
                                            variant="outlined"
                                            autoComplete="text"
                                            margin="normal"
                                            onChange={this.onChange}
                                        />        
                          
                                        <TextField
                                            id="activityDateTimeString"
                                            name="activityDateTimeString"
                                            value={activityDateTimeString}
                                            label="Date"
                                            placeholder="12-09-2019"
                                            inputProps={{
                                                style: {padding: 18} 
                                            }}                              
                                            className={classes.textField}
                                            variant="outlined"
                                            autoComplete="date"
                                            margin="normal"
                                            onChange={this.dateNumberOnChange}
                                        />     

                                        <Autocomplete
                                        id="activityType"
                                        value={activityType}
                                        name="activityType"
                                        autoHighlight
                                        margin="normal"
                                        style={{marginTop: 16, padding: 0}}
                                        onChange={this.onTagsChange}
                                        options={[
                                            'Swim',
                                            'Bike',
                                            'Run',
                                        ]}
                                        getOptionLabel={option => option}
                                        renderInput={params => 
                                            <TextField {...params} 
                                                label="Type" 
                                                className={classes.textField} 
                                                variant="outlined" 
                                            />}
                                        />

                                        {/*
                                        <FormControl variant="outlined" required>
                                            <InputLabel id="activityTypeLabel">Activity Type</InputLabel>
                                            <Select
                                                labelId="activityTypeLabel"
                                                id="activityType"
                                                value={activityType}
                                                name="activityType"
                                                type="text"
                                                margin="normal"
                                                style={{marginTop: 16, padding: 0}}
                                                className={classes.textField}
                                                autoHighlight
                                                autoComplete="text"
                                                onChange={this.onChange}
                                                >
                                                <MenuItem value={"Swim"}>Swim</MenuItem>
                                                <MenuItem value={"Bike"}>Bike</MenuItem>
                                                <MenuItem value={"Run"}>Run</MenuItem>
                                            </Select>
                                        </FormControl>
                                        */}
                      
                                        <TextField
                                            id="distance"
                                            name="distance"
                                            value={distance}
                                            label="Distance"
                                            placeholder="20.0"
                                            inputProps={{
                                                style: {padding: 18} 
                                            }}                              
                                            className={classes.textField}
                                            variant="outlined"
                                            autoComplete="text"
                                            margin="normal"
                                            onChange={this.floatNumberOnChange}
                                        />        
                      
                                        <TextField
                                            disabled
                                            id="distanceUnits"
                                            name="distanceUnits"
                                            value={distanceUnits}
                                            label="Units"
                                            placeholder="30.0"
                                            inputProps={{
                                                style: {padding: 18} 
                                            }}                              
                                            className={classes.textField}
                                            variant="outlined"
                                            autoComplete="text"
                                            margin="normal"
                                            onChange={this.onChange}
                                        />        
                      
                                        <TextField
                                            id="duration"
                                            name="duration"
                                            value={duration}
                                            label="Duration"
                                            placeholder="1.5"
                                            inputProps={{
                                                style: {padding: 18} 
                                            }}                              
                                            className={classes.textField}
                                            variant="outlined"
                                            autoComplete="text"
                                            margin="normal"
                                            onChange={this.floatNumberOnChange}
                                        />        
                      
                                        </form>

                                    </div>
                                </div>
                            </div>
                            <div className="card-action pCard row">
                                <div className="col s2 m2">
                                    <button className="btn waves-effect waves-light blue darken-4 modal-trigger m2"
                                        type="submit" href="#modal1" onClick={this.onSubmitHandler} name="action">{this.state.id ? "Update" : "Create"}
                                    </button>
                                </div>

                                {/* UPLOAD FILE */}
                                <div className="col s5 offset-s2 m5 offset-m2">
                                    <input type="file" name="file" onChange={this.fitFileChange}/>
                                </div>
                                <div className="col s3 m3">
                                    <button className="btn waves-effect waves-light blue darken-4 modal-trigger m2"
                                        onClick={this.uploadFitFile}>Upload Fit 
                                    </button>
                                </div>
                                {/* UPLOAD FILE*/}
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <Redirect to="/dashboard" />
            )
        }

    }
};

export default withStyles(styles)(withAuthUserContext(withRouter(ActivityForm)));