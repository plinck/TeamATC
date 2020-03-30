import React from "react";
import { withRouter } from 'react-router';

// Date picker component
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


import ActivityModal from "./ActivityModal";
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
import AddIcon from "@material-ui/icons/Add";
import { Fab, Grid} from "@material-ui/core";

import moment from "moment";

import TeamDB from "../Team/TeamDB"
import ActivityDB from "./ActivityDB"
import UserDB from "../User/UserDB"
import ChallengeDB from "../Challenges/ChallengeDB"
import FitActivity from "./FitActivity.js"


const INITIAL_STATE = {
    updateButtonDisabled: true,
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

    challenge: undefined,

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
        this.state.activityDateTime = jsDate;

        const dateTimeString = moment(jsDate).format("MM-DD-YYYY");
        this.state.activityDateTimeString = dateTimeString;
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    componentDidMount() {
        this._mounted = true;
        
        if (this.props.user.challengeUid) {
            // only get activity if its an update, otherwise assume new
            if (this.state.id) {
                this.fetchActivity(this.state.id);
            }  
            // this.fetchTeams();  // for pulldown so doesnt matter if user exists yet
            // Get current challenge info - should be part of state maybe eventually
            this.fetchCurrentChallenge(this.props.user.challengeUid);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.user.challengeUid && this.props.user.challengeUid !== prevProps.user.challengeUid) {
            console.log(this.props.user.challengeUid)
            this.fetchCurrentChallenge(this.props.user.challengeUid);
            if (this.state.id) {
                this.fetchActivity(this.state.id);
            }  
        }
    }

    enableButton = () => {
        if (this.state.activityName && this.state.activityDateTime && this.state.activityDateTimeString && this.state.activityType && this.state.distance && this.state.duration) {
            this.setState({ updateButtonDisabled: false });
        } else {
            this.setState({ updateButtonDisabled: true });
        }
    }

    handleChange = name => event => {
        if (event.target.value) {
            this.setState({ [name]: parseInt(event.target.value) }, () => this.enableButton());
        }
        else {
            this.setState({ [name]: 0 }, () => this.enableButton());
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
        }, () => this.enableButton());
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
            }, () => this.enableButton());
        } else {
            this.setState({
                [event.target.name]: event.target.value,
            }, () => this.enableButton());
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
            }, () => this.enableButton());
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
            }, () => this.enableButton());
        }
    }

    // Handle Date Picker Change
    handleDateChange = date => {
        this.setState({
          activityDateTime: date
        });
      };


    fitFileChange = (event) => {
        event.preventDefault();

        if (event.target.files.length > 0) {
            console.log(event.target.files[0]);
            let fitFileToUpload = event.target.files[0];

            // Make sure its file type === fit
            let fileExt = fitFileToUpload.name.split('.').pop()
            if (!fileExt || fileExt !== "fit") {
                this.setState({message: `Error - File MUST be of type ".fit"`});
                return;
            }

            console.log(`Uploading file ${fitFileToUpload.name}... `);
            let fitData = new FitActivity(fitFileToUpload);
            fitData.processFitFile().then(activity => {
                // add the additional fields from state/props
                this.setState({
                    uid: this.props.user.authUser.uid,
                    email: this.props.user.authUser.email,
                    displayName: this.props.user.displayName,
                    teamName: this.props.user.teamName,
                    teamUid: this.props.user.teamUid,
            
                    activityName: activity.activityName,
                    activityDateTime: activity.activityDateTime,
                    activityDateTimeString: activity.activityDateTimeString,
                    activityType:activity.activityType,   
                    distance: activity.distance,
                    distanceUnits: activity.distanceUnits,
                    duration: activity.duration,
                    message: `Uploaded FIT file, make any changes and hit <CREATE> to save`
                }, () => this.enableButton());
            }).catch (err => {
                this.setState({message: `Error processing fit file ${err}`});
                return;
            });  
        }
    }
       
    // Get the activity info
    fetchActivity(id) {
        ActivityDB.get(id).then(activity => {
            let jsDate = new Date(activity.activityDateTime);
            const dateTimeString = moment(jsDate).format("MM-DD-YYYY");
        
            this.setState({
                activityName: activity.activityName,
                activityDateTime: activity.activityDateTime,
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
            }, () => this.enableButton());
        });
    }

    // Get the users info
    fetchUser() {
        UserDB.getCurrentUser().then(user => {
            this.setState({
                teamName: user.teamName
            });
        });
    }

    // get available teams for select list
    fetchTeams() {
        TeamDB.getTeams().then(teams => {
            // Convert array of teams to key value unqie pairs for easy lookup on primary key
            let teamLookup = {}
            teams.forEach(team => {
                teamLookup[team.id] = team.name;
            });
                
            this.setState({
                teams: teams,
                teamLookup: teamLookup
            });
        })
        .catch(err => {
            console.error(`Error getting teams ${err}`);
            this.setState({message: `Error getting teams ${err}`});
        });
    }

    // get current challenge for this user
    fetchCurrentChallenge(challengeId) {
        console.log(`Current challengeId: ${challengeId}`);
        ChallengeDB.get(challengeId).then(challenge => {
            this.setState({
                challenge: challenge
            });
        })
        .catch(err => {
            console.error(`Error getting current challenge ${err}`);
            this.setState({message: `Error getting current challenge ${err}`});
        });
    }

    validateActivity() {
        // Using date picker, so date is date -- create string from date
        let activity = this.state;
        // activity.activityDateTime = jsDate;
        activity.activityDateTimeString = moment(activity.activityDateTime ).format('MM-DD-YYYY');

        // Validate Date to be no later than today and within the range of the challenge
        let now = new Date().getTime();
        let endOfDay = moment(now).endOf("day").toDate(); 
        if (activity.activityDateTime > endOfDay) {
            this.setState({ message: `Activity Date can not be later than today`});
            return false;
        } 

        endOfDay = moment(this.state.challenge.endDate).endOf("day").toDate(); 
        if (activity.activityDateTime > endOfDay) {
            this.setState({ message: `Activity Date can not be later than end of challenge`});
            return false;
        } 
        if (activity.activityDateTime < this.state.challenge.startDate) {
            this.setState({ message: `Activity Date can not be earlier than beginning of challenge`});
            return false;
        } 

        
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
            console.error(`Error validating activity --- not saved`);
        };
    }

    render() {
        const { classes } = this.props;

        // Some props take time to get ready so return null when uid not avaialble
        if (this.props.user.uid === null) {
            return (<Grid container style={{ marginTop: '10px' }} justify="center"><CircularProgress /> <p>Loading ...</p> </Grid>)
        }
        
        // if (typeof this.state.teams === 'undefined') {
        //     console.error("Fatal Error")
        //     return (<div> <p>FATAL ERROR Gettng teams, something goofy going on ...</p> </div>)
        // }
        // if (this.state.teams === null) {
        //     // console.log("No teams yet")
        //     return (<div> <CircularProgress className={classes.progress} /> <p>Loading ...</p> </div>)
        // }

        // Commented out the state vars that dont get mutated on this screen
        // these may be needed if a admin is editting
        var {
            uid,
            email,
            displayName,
            teamUid,
            teamName,
            activityName,
            activityDateTime,
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
                    <ActivityModal distance={this.state.distance} />
                    <div className="col s12">
                        <div className="card">
                            <div className="card-content pCard">
                                {message != null ? <p className="blue-text">{message}</p> : ""}
                                <span className="card-title">New Activity for {displayName} on Team "{teamName}"</span>
                
                                <label>Activity Date:
                                <DatePicker
                                    id="activityDateTime"
                                    name="activityDateTime"
                                    value={activityDateTime}

                                    selected={activityDateTime}
                                    onSelect={date => this.handleDateChange(date)} //when day is clicked
                                    onChange={date => this.handleDateChange(date)} //only when value has changed

                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    timeCaption="time"
                                    dateFormat="MMMM d, yyyy h:mm aa"
                                />
                                </label>

                                <div className="row">
                                    <div className="col s12">
                                        <form className={classes.container} noValidate autoComplete="off">

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
                                                
                                        {/*
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
                                        */}   

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
                                    <button disabled={this.state.updateButtonDisabled}
                                        className="btn waves-effect waves-light blue darken-4 modal-trigger m2"
                                        name="action"
                                        type="submit"
                                        href="#modal1"
                                        onClick={this.onSubmitHandler}>
                                        {this.state.id ? "Update" : "Create"}
                                    </button>
                                </div>

                                <label htmlFor="file">
                                    <input
                                        id="file"
                                        name="file"
                                        type="file"
                                        onChange={this.fitFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    <Fab
                                        color="secondary"
                                        size="small"
                                        component="span"
                                        aria-label="add"
                                        variant="extended">
                                        <AddIcon /> Upload FIT File 
                                    </Fab>
                                </label>
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