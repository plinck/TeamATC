import React from "react";
import M from "materialize-css/dist/js/materialize.min.js";
import Modal from "./ActivityModal";
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Redirect } from "react-router";
import NumberFormat from "react-number-format";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";

// For select input field
import FormControl from '@material-ui/core/FormControl';
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import CircularProgress from '@material-ui/core/CircularProgress';
import moment from "moment";

import TeamAPI from "../Team/TeamAPI"
import ActivityDB from "./ActivityDB"
import UserAPI from "../User/UserAPI"

const INITIAL_STATE = {
    displayName: "",
    activityName: "",
    activityDateTime: "",
    activityDateTimeString: "",
    activityType: "",           
    distance: "",
    distanceUnits: "",
    duration: "",
    teamName: null,

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
    }
});

class ActivityForm extends React.Component {
    constructor(props) {
        super(props);
    
        this._isMounted = false;
    
        this.state = { ...INITIAL_STATE };

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
        
        const jsDate = new Date(jsDateArray[2], jsDateArray[0], jsDateArray[1]);
        
        let activity = this.state;
        activity.email = this.props.user.authUser.email;
        activity.displayName = this.props.user.authUser.displayName;
        activity.uid = this.props.user.authUser.uid;
        activity.activityDateTime = jsDate;
        activity.teamName = this.state.teamName;
        
        if (activity.activityName.length < 1) {
            this.setState({ message: `Activity Name must not be blank`});
            return false;
        }

        if (activity.teamName.length < 1) {
            this.setState({ message: `Team Name must not be blank`});
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

        // If all good, add it to firestore
        this.addActivity(activity);

        return true;
    }
    
    addActivity = (activity) => {

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

        // Set prop info for user
        let displayName = "";
        if (this.props.user.authUser) { 
            displayName = this.props.user.authUser.displayName

            // Get the user tea if we dont already have it
            if (this.state.teamName === null) {
                this.fetchUser();
            }
        }

        var {
            activityName,
            activityDateTimeString,
            activityType,           // swim, bike, run
            distance,
            distanceUnits,
            duration,
            teamName,
            message
        } = this.state;

        var {
            teams
        } = this.state;
    
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
                                            placeholder="Name"
                                            multiline
                                            className={classes.textField}
                                            type="text"
                                            autoComplete="text"
                                            margin="normal"
                                            value={displayName}
                                            onChange={this.onChange}
                                        />
                          
                                        <TextField
                                            id="activityName"
                                            name="activityName"
                                            label="Activity Name"
                                            placeholder="Activity Name"
                                            multiline
                                            className={classes.textField}
                                            type="text"
                                            autoComplete="text"
                                            margin="normal"
                                            value={activityName}
                                            onChange={this.onChange}
                                        />

                                        <TextField
                                            id="activityDateTimeString"
                                            name="activityDateTimeString"
                                            label="Date"
                                            placeholder="MM-DD-YYYY"
                                            multiline
                                            className={classes.textField}
                                            type="text"
                                            autoComplete="text"
                                            margin="normal"
                                            value={activityDateTimeString}
                                            onChange={this.dateNumberOnChange}
                                        />

                                        <FormControl required className={classes.formControl}>
                                            <InputLabel id="activityTypeLabel">Activity Type</InputLabel>
                                            <Select
                                                labelId="activityTypeLabel"
                                                id="activityType"
                                                name="activityType"
                                                multiline
                                                type="text"
                                                margin="normal"
                                                value={activityType}
                                                onChange={this.onChange}
                                                className={classes.textField}>
                                                <MenuItem value={"Swim"}>Swim</MenuItem>
                                                <MenuItem value={"Bike"}>Bike</MenuItem>
                                                <MenuItem value={"Run"}>Run</MenuItem>
                                            </Select>
                                        </FormControl>
                      
                                        <TextField
                                            id="distance"
                                            label="Distance"
                                            placeholder="20.0"
                                            multiline
                                            className={classes.textField}
                                            type="text"
                                            name="distance"
                                            autoComplete="text"
                                            margin="normal"
                                            value={distance}
                                            onChange={this.floatNumberOnChange}
                                        />

                                        <TextField
                                            disabled
                                            id="distanceUnits"
                                            name="distanceUnits"
                                            label="Units"
                                            placeholder="miles"
                                            multiline
                                            className={classes.textField}
                                            type="text"
                                            autoComplete="text"
                                            margin="normal"
                                            value={distanceUnits}
                                            onChange={this.onChange}
                                        />

                                        <TextField
                                            id="duration"
                                            label="Duration"
                                            placeholder="2.5"
                                            multiline
                                            className={classes.textField}
                                            type="text"
                                            name="duration"
                                            autoComplete="text"
                                            margin="normal"
                                            value={duration}
                                            onChange={this.floatNumberOnChange}
                                        />

                                        </form>

                                    </div>
                                </div>
                            </div>
                            <div className="card-action pCard">
                                <div className="center-align ">
                                    <button className="btn waves-effect waves-light blue darken-4 modal-trigger"
                                        type="submit" href="#modal1" onClick={this.onSubmitHandler} name="action">Submit
                                    </button>
                                </div>
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

export default withStyles(styles)(withAuthUserContext(ActivityForm));