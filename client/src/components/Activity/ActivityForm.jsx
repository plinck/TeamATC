import React from "react";
import { withRouter } from 'react-router';

// Date picker component
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './Activity.css'


import { withContext } from "../Auth/Session/Context";
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
import { Fab, Container, Grid, Card, CardContent, Button, CardActions, Typography } from "@material-ui/core";
import FormControl from '@material-ui/core/FormControl';
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import moment from "moment";

import TeamDB from "../Team/TeamDB"
import ActivityDB from "./ActivityDB"
import UserDB from "../User/UserDB"
import ChallengeDB from "../Challenges/ChallengeDB"
import FitActivity from "./FitActivity.js"


const INITIAL_STATE = {
    activity: {
        id: undefined,
        activityName: "",
        activityDateTime: "",
        activityType: "",
        challengeUid: "",
        displayName: "",
        distance: "",
        distanceUnits: "",
        duration: "",
        email: "",
        stravaActivity: false,
        stravaActivityId: "",
        teamUid: "",
        teamName: "",
        uid: "",
    },

    dateTimeString: "",

    fitFileToUpload: null,
    fitFileLoaded: false,

    updateButtonDisabled: true,

    challenge: undefined,

    challenges: undefined,
    challengeLookup: undefined,

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
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
    },
    formControl: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
    }
});

class ActivityForm extends React.Component {
    constructor(props) {
        super(props);

        this._isMounted = false;

        this.state = { ...INITIAL_STATE };
        this.state.activity.id = this.props.id;

        //set the date field to be current date by default
        let jsDate = new Date();
        this.state.activity.activityDateTime = jsDate;

        const dateTimeString = moment(jsDate).format("MM-DD-YYYY");
        this.state.dateTimeString = dateTimeString;
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    componentDidMount() {
        this._mounted = true;
        
        if (this.props.context.challengeUid) {
            // only get activity if its an update, otherwise assume new
            if (this.state.activity.id) {
                this.fetchActivity(this.state.activity.id);
            }  else {
                const teamName = this.props.context.teamName ? this.props.context.teamName : "";
                const teamUid = this.props.context.teamUid ? this.props.context.teamUid: "";
                this.setState((prevState) => ({
                    activity: {                   
                        ...prevState.activity,    
                        teamUid: teamUid,      
                        teamName: teamName,      
                    }}));    
            }
            // Get current challenge info - should be part of state maybe eventually
            this.fetchCurrentChallenge(this.props.context.challengeUid);
            this.fetchTeams();  // for pulldown so doesnt matter if user exists yet
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.context.challengeUid && this.props.context.challengeUid !== prevProps.user.challengeUid) {
            if (this.state.activity.id) {
                this.fetchActivity(this.state.activity.id);
            }  else {
                const teamName = this.props.context.teamName ? this.props.context.teamName : "";
                const teamUid = this.props.context.teamUid ? this.props.context.teamUid: "";
                this.setState((prevState) => ({
                    activity: {                   
                        ...prevState.activity,    
                        teamUid: teamUid,      
                        teamName: teamName,      
                    }}));    
            }
            console.log(this.props.context.challengeUid)
            this.fetchCurrentChallenge(this.props.context.challengeUid);
            this.fetchTeams();  // for pulldown so doesnt matter if user exists yet
        }
    }

    enableButton = () => {
        if (this.state.activity.activityName && 
            this.state.activity.activityDateTime &&
            this.state.activity.activityType &&
            this.state.activity.distance &&
            this.state.activity.duration) {
                this.setState({ updateButtonDisabled: false });
        } else {
            this.setState({ updateButtonDisabled: true });
        }
    }

    handleChange = event => {
        const name = event.target.name;
        const value = event.target.value;

        this.setState((prevState) => ({
            activity: {                   
                ...prevState.activity,    
                [name]: value,      
            }}), () => this.enableButton());    
    };

    handlePullownChange = event => {
        const name = event.target.name;
        const value = event.target.value;
        const teamName = this.state.teamLookup[value];

        console.log(`handlePullownChange name: ${name} value: ${value}`)

        this.setState((prevState) => ({
            activity: {                   
                ...prevState.activity,    
                [name]: value,      
                teamName: teamName,      
            }}), () => this.enableButton());    
    };

    handleAutoCompleteChanges = pname => (event, values) => {
        const name = pname;
        const value = values;

        // Set Units
        let distanceUnits = "Miles";
        if (name === "activityType") {
            switch (value) {
                case "Swim":
                    distanceUnits = "Yards";
                    break;
                default:
                    distanceUnits = "Miles";
            }
            //this.setState({ [name]: parseInt(event.target.value) }, () => this.enableButton());

            this.setState((prevState) => ({
                activity: {                   // object that we want to update
                    ...prevState.activity,    // keep all other key-value pairs
                    [name]: value,      // update the value of specific key
                    distanceUnits: distanceUnits
                }}), () => this.enableButton());    
        } else {
            this.setState((prevState) => ({
                activity: {                   
                    ...prevState.activity,    
                    [name]: value,      
                }}), () => this.enableButton());    
        }
    };

    // validate valid float as its being typed in
    // The trick is it has to validate AS its being typed in -- before its all complete
    floatNumberOnChange = (event) => {
        const floatRegExp = /^\d{0,6}\.{0,1}(\d{0,2})?$/;

        const name = event.target.name;
        const value = event.target.value
        if (value === '' || floatRegExp.test(value)) {
            this.setState((prevState) => ({
                activity: {                   
                    ...prevState.activity,    
                    [name]: value,      
                }}), () => this.enableButton());    
        }
    }

    // validate valid date as its being typed in
    // The trick is it has to validate AS its being typed in -- before its all complete
    dateNumberOnChange = (event) => {
        const floatRegExp = /^\d{0,2}-{0,1}\d{0,2}-{0,1}(\d{0,4})$/;

        const name = event.target.name;
        const value = event.target.value
        if (value === '' || floatRegExp.test(value)) {
            this.setState((prevState) => ({
                activity: {                   
                    ...prevState.activity,    
                    [name]: value,      
                }}), () => this.enableButton());    
            }
    }

    // Handle Date Picker Change
    handleDateChange = date => {
        this.setState((prevState) => ({
            activity: {                   
                ...prevState.activity,    
                activityDateTime: date,      
            }}), () => this.enableButton());    
        };

    fitFileChange = (event) => {
        event.preventDefault();

        if (event.target.files.length > 0) {
            console.log(event.target.files[0]);
            let fitFileToUpload = event.target.files[0];

            // Make sure its file type === fit
            let fileExt = fitFileToUpload.name.split('.').pop()
            if (!fileExt || fileExt.toLowerCase() !== "fit") {
                this.setState({ message: `Error - File MUST be of type ".fit"` });
                return;
            }

            console.log(`Uploading file ${fitFileToUpload.name}... `);
            let fitData = new FitActivity(fitFileToUpload);
            fitData.processFitFile().then(activity => {
                // add the additional fields from state/props
                this.setState((prevState) => ({
                    activity: {                   
                        ...prevState.activity,  
                        activityName: activity.activityName,
                        activityDateTime: activity.activityDateTime,
                        activityType: activity.activityType,
                        challengeUid: this.props.context.challengeUid,
                        displayName: this.props.context.displayName,
                        distance: activity.distance,
                        distanceUnits: activity.distanceUnits,
                        duration: activity.duration,      
                        email: this.props.context.authUser.email,
                        stravaActivity: false,
                        stravaActivityId: "",
                        teamName: this.props.context.teamName,
                        teamUid: this.props.context.teamUid,
                        uid: this.props.context.authUser.uid,
                    },
                    dateTimeString: activity.activityDateTimeString,
                    message: `Uploaded FIT file, make any changes and hit <CREATE> to save`
                    }), () => this.enableButton());    
            }).catch(err => {
                this.setState({ message: `Error processing fit file ${err}` });
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
                activity: {    
                    ...activity,  
                },
                dateTimeString: dateTimeString,
                }, () => this.enableButton());    
        });
    }

    // Get the users info
    fetchUser() {
        UserDB.getCurrentUser().then(user => {
            this.setState((prevState) => ({
                activity: {    
                    ...prevState.activity,  
                    teamName: user.teamName
                }
            }));
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
        }).catch(err => {
            console.error(`Error getting teams ${err}`);
            this.setState({ message: `Error getting teams ${err}` });
        });
    }

    // get current challenge for this user
    fetchCurrentChallenge(challengeId) {
        console.log(`Current challengeId: ${challengeId}`);
        ChallengeDB.get(challengeId).then(challenge => {
            this.setState({
                challenge: challenge
            });
        }).catch(err => {
            console.error(`Error getting current challenge ${err}`);
            this.setState({ message: `Error getting current challenge ${err}` });
        });
    }

    validateActivity() {
        // Using date picker, so date is date -- create string from date
        let activity = this.state.activity;

        // Validate Date to be no later than today and within the range of the challenge
        let now = new Date().getTime();
        let endOfDay = moment(now).endOf("day").toDate();
        if (activity.activityDateTime > endOfDay) {
            this.setState({ message: `Activity Date can not be later than today` });
            return false;
        }

        endOfDay = moment(this.state.challenge.endDate).endOf("day").toDate();
        if (activity.activityDateTime > endOfDay) {
            this.setState({ message: `Activity Date can not be later than end of challenge` });
            return false;
        }

        let startOfDay = moment(this.state.challenge.startDate).startOf("day").toDate();
        if (activity.activityDateTime < startOfDay) {
            this.setState({ message: `Activity Date can not be earlier than beginning of challenge` });
            return false;
        }

        // If NEW activity, set the info to the current users info, if not use what is there so admiin can update
        if (!this.state.activity.id) {
            activity.displayName = this.props.context.displayName;
            activity.challengeUid = this.props.context.challengeUid;
            activity.email = this.props.context.authUser.email;
            activity.teamName = activity.teamName ? activity.teamName : this.props.context.teamName;
            activity.teamUid = activity.teamUid ? activity.teamUid : this.props.context.teamUid;
            activity.uid = this.props.context.authUser.uid;
        }

        if (!activity.uid || activity.uid.length < 1) {
            this.setState({ message: `User info missing - Maybe User Profile Needs Repair` });
            return false;
        }

        if (!activity.email || activity.email.length < 1) {
            this.setState({ message: `Email missing - Maybe User Profile Needs Repair` });
            return false;
        }

        if (!activity.displayName || activity.displayName.length < 1) {
            this.setState({ message: `User name missing - Maybe User Profile Needs Repair` });
            return false;
        }

        if (!activity.uid || activity.uid.length < 1) {
            this.setState({ message: `User info missing - User Profile Needs Repair` });
            return false;
        }

        if (!activity.teamName || activity.teamName.length < 1) {
            this.setState({ message: `Team Name missing - Join team (using Account Update Form) before adding activity` });
            return false;
        }

        if (!activity.teamUid || activity.teamUid.length < 1) {
            this.setState({ message: `Team Uid missing - Join team before adding activity` });
            return false;
        }

        if (activity.activityName.length < 1) {
            this.setState({ message: `Activity Name must not be blank` });
            return false;
        }

        if (activity.activityType.length < 1) {
            this.setState({ message: `Activity Type must not be blank` });
            return false;
        }

        if (activity.distanceUnits.length < 1) {
            this.setState({ message: `Distance Units must not be blank` });
            return false;
        }

        if (activity.distance === "" || isNaN(activity.distance)) {
            this.setState({ message: `Distance must be a valid number, you entered: ${activity.distance}` });
            return false;
        }
        activity.distance = Number(activity.distance);

        if (activity.duration === "" || isNaN(activity.duration)) {
            this.setState({ message: `Duration must be a valid number, you entered: ${activity.duration}` });
            return false;
        }
        activity.duration = Number(activity.duration);

        // If all good, update or it to firestore
        if (this.state.activity.id) {
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
                pathname: '/activities'
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
                pathname: '/activities'
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
        if (!this.props.context) {
            return (<Grid container style={{ marginTop: '10px' }} justify="center"><CircularProgress /> <p>Loading ...</p> </Grid>)
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

        let activity = this.state.activity;
        let { message, teams } = this.state;
        console.log(`Activity Team: ${activity.teamUid}/${activity.teamName}`);

        // Dont use props to set the team and user for activity unless its NEW, if exissts use from state / current record
        if (!activity.id) {
            // console.log(`using current users session info for activity add`);
            activity.displayName = this.props.context.displayName;
            activity.challengeUid = this.props.context.challengeUid;
            activity.email = this.props.context.authUser.email;
            activity.teamName = activity.teamName ? activity.teamName : this.props.context.teamName;
            activity.teamUid = activity.teamUid ? activity.teamUid : this.props.context.teamUid;
            activity.uid = this.props.context.authUser.uid;
        } else {
            // console.log(`using current activity info for activity updates`);
            console.log(`user/team info is uid: ${activity.uid}, email: ${activity.email}, displayName: ${activity.displayName}, teamUid: ${activity.teamUid}, teamName: ${activity.teamName}, `);
        }

        console.log(`Activity Team: ${activity.teamUid}/${activity.teamName}`);

        if (this.props.context.authUser) {
            return (
                <Container>
                    <Grid container>
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    {message != null ? <p className="blue-text">{message}</p> : ""}
                                    <Typography variant="h5" gutterBottom component="h2">New Activity for {activity.displayName} on Team "{activity.teamName}"</Typography>

                                    <label>{`Activity Date: `}
                                    </label>
                                    <DatePicker
                                        id="activityDateTime"
                                        name="activityDateTime"
                                        value={activity.activityDateTime}

                                        selected={activity.activityDateTime}
                                        onSelect={date => this.handleDateChange(date)} //when day is clicked
                                        onChange={date => this.handleDateChange(date)} //only when value has changed

                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        timeCaption="time"
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                    />

                                    <div className="row">
                                        <div className="col s12">
                                            <form className={classes.container} noValidate autoComplete="off">

                                                <TextField
                                                    id="activityName"
                                                    name="activityName"
                                                    value={activity.activityName}
                                                    label="Activity Name"
                                                    placeholder="Silk Sheets Long Ride"
                                                    inputProps={{
                                                        style: { padding: 18 }
                                                    }}
                                                    className={classes.textField}
                                                    variant="outlined"
                                                    autoComplete="text"
                                                    margin="normal"
                                                    onChange={this.handleChange}
                                                />
                                                <Autocomplete
                                                    id="activityType"
                                                    value={activity.activityType}
                                                    name="activityType"
                                                    autoHighlight
                                                    margin="normal"
                                                    style={{ marginTop: 16, padding: 0 }}
                                                    onChange={this.handleAutoCompleteChanges("activityType")}
                                                    options={[
                                                        'Swim',
                                                        'Bike',
                                                        'Run',
                                                        'Other'
                                                    ]}
                                                    getOptionLabel={option => option}
                                                    renderInput={params =>
                                                        <TextField {...params}
                                                            label="Type"
                                                            className={classes.textField}
                                                            variant="outlined"
                                                        />}
                                                />
                                                <TextField
                                                    id="distance"
                                                    name="distance"
                                                    value={activity.distance}
                                                    label="Distance"
                                                    placeholder="20.0"
                                                    inputProps={{
                                                        style: { padding: 18 }
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
                                                    value={activity.distanceUnits}
                                                    label="Units"
                                                    placeholder="30.0"
                                                    inputProps={{
                                                        style: { padding: 18 }
                                                    }}
                                                    className={classes.textField}
                                                    variant="outlined"
                                                    autoComplete="text"
                                                    margin="normal"
                                                    onChange={this.handleChange}
                                                />

                                                <TextField
                                                    id="duration"
                                                    name="duration"
                                                    value={activity.duration}
                                                    label="Duration (hours)"
                                                    placeholder="1.5"
                                                    inputProps={{
                                                        style: { padding: 18 }
                                                    }}
                                                    className={classes.textField}
                                                    variant="outlined"
                                                    autoComplete="text"
                                                    margin="normal"
                                                    onChange={this.floatNumberOnChange}
                                                />

                                            <FormControl variant="outlined" required className={classes.formControl}>
                                                <InputLabel id="teamNameLabel">Team Name</InputLabel>
                                                <Select
                                                    labelId="teamNameLabel"
                                                    id="teamUid"
                                                    value={activity.teamUid}
                                                    name="teamUid"
                                                    style={{ marginTop: 16, padding: 0 }}
                                                    onChange={this.handlePullownChange}
                                                    label="Team Name"
                                                    type="text">
                                                    {teams.map((team, i) => {
                                                        return (
                                                            <MenuItem key={i} value={team.id}>{team.name}</MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
        
                                            </form>

                                        </div>
                                    </div>
                                </CardContent>
                                <CardActions>

                                    <Button disabled={this.state.updateButtonDisabled}
                                        variant="contained"
                                        color="primary"
                                        name="action"
                                        type="submit"
                                        onClick={this.onSubmitHandler}>
                                        {activity.id ? "Update" : "Create"}
                                    </Button>

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
                                </CardActions>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            )
        } else {
            return (
                <Redirect to="/" />
            )
        }

    }
};

export default withStyles(styles)(withContext(withRouter(ActivityForm)));