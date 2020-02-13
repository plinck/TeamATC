import React from "react";
import Util from "../../Util/Util";
import M from "materialize-css/dist/js/materialize.min.js";
import Modal from "./ActivityModal";
import { withAuthUserContext } from "../../Auth/Session/AuthUserContext";
import { Redirect } from "react-router";
import NumberFormat from "react-number-format";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";

// import DateFnsUtils from '@date-io/date-fns';
// import {
//     MuiPickersUtilsProvider,
//     KeyboardTimePicker,
//     KeyboardDatePicker
//   } from "@material-ui/pickers";
  
  

const INITIAL_STATE = {
    displayName: "",
    team: "",
    activityDateTime: "",
    activityType: "", // swim, bike, run
    distance: "",
    distanceUnits: "",
    duration: ""
};  

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

function NumberFormatPhone(props) {
    const { inputRef, onChange, ...other } = props;

    return (
        <NumberFormat
            {...other}
            getInputRef={inputRef}
            onValueChange={values => {
                onChange({
                    target: {
                        value: values.value,
                    },
                });
            }}
            format="(###) ###-####"
            mask=""
        />
    );
}

function NumberFormatDate(props) {
    const { inputRef, onChange, ...other } = props;

    return (
        <NumberFormat
            {...other}
            getInputRef={inputRef}
            onValueChange={values => {
                console.log(`Date value: ${values.value}`)            
                onChange({
                    target: {
                        value: values.value,
                    },
                });
            }}
            format="##/##/####"
            mask=""
        />
    );
}

function NumberFormatCustom(props) {
    const { inputRef, onChange, ...other } = props;

    return (
        <NumberFormat
            {...other}
            other={other}
            // className={locatStyles.input}
            getInputRef={inputRef}
            onValueChange={values => {
                onChange({
                    target: {
                        value: values.value,
                    },
                });
            }}
            thousandSeparator
        />
    );
}


class Activity extends React.Component {
    constructor(props) {
        super(props);
    
        this._isMounted = false;
    
        this.state = { ...INITIAL_STATE };
        // this.setState({
        //     distanceTotal: res.data.distanceTotal,
        //     durationTotal: res.data.durationTotal,
        // })

        // this.state.firstName = this.props.user.authUser.firstName
        // this.state.lastName = this.props.user.authUser.lastName
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    componentDidMount() {
        this._mounted = true;

        Util.apiGet("/api/firestore/activities")
            .then(res => {
                if (this._mounted) {
                    this.setState({ activities: res.data }, () => this.calculate())
                }
            })
            .catch(err => console.error(err));

        let elem = document.querySelector(".modal");
        M.Modal.init(elem);

    }

    calculate = () => {

        Util.apiGet("/api/firestore/getActivityTotals")
            .then(res => {
                if (this._mounted) {
                    this.setState({
                        distanceTotal: res.data.distanceTotal,
                        durationTotal: res.data.durationTotal,
                    })
                }
            })
            .catch(err => console.error(err));
    }

    handleChange = name => event => {
        if (event.target.value) {
            this.setState({ [name]: parseInt(event.target.value) });
        }
        else {
            this.setState({ [name]: 0 });
        }
    };
    
    handleDateChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    onChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    updateDatabase = () => {
        const db = Util.getFirestoreDB();
        const fb = Util.getFirebaseFirestore();

        // Deal with Date - convert MM/DD/YYYY to date object and then Firestore timestamp
        let jsDateArray = [];
        let jsDateString = this.state.activityDateTime;
        if (jsDateString.length == 10) {
            jsDateArray = jsDateString.split("/");
            if (jsDateArray.length < 3) {
                alert(`Bad Date - Activity Update Failed: ${this.state.activityDateTime}`);
                return;
            }
        } else {
            alert(`Bad Date - Activity Update Failed: ${this.state.activityDateTime}`);
            return;
        }

        const jsDate = new Date(jsDateArray[2], jsDateArray[0], jsDateArray[1]);

        db.collection("activities").add({
            team: this.state.team,
            activityDateTime: jsDate,
            activityType: this.state.activityType,
            distance: this.state.distance,
            distanceUnits: this.state.distanceUnits,
            duration: this.state.duration,
            email: this.props.user.authUser.email,
            uid: this.props.user.authUser.uid
        }).catch( (error) => {
            alert("Activity Update Failed: ", error);
        }).then( () => {
            alert("Activity Update Successful: ");
        });
    }

    onSubmitHandler = (event) => {
        event.preventDefault();

        this.updateDatabase();
    }

    render() {
        const { classes } = this.props;

        var {
            displayName,
            team,
            activityDateTime,
            activityType, // swim, bike, run
            distance,
            distanceUnits,
            duration
        } = this.state;
    
        // wait for props to get ready
        if (this.props.user.authUser) { 
            displayName = this.props.user.authUser.displayName
        }

        if (this.props.user.authUser) {
            return (
                <div className="container">
                    <Modal distance={this.state.distance} />
                    <div className="col s12">
                        <div className="card">
                            <div className="card-content pCard">
                                <span className="card-title">New Activity</span>
                                <div className="row">
                                    <div className="col s12">
                                        <form className={classes.container} noValidate autoComplete="off">

                                        <TextField
                                            disabled
                                            id="displayName"
                                            name="displayName"
                                            label="displayName"
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
                                            id="team"
                                            label="team"
                                            placeholder="Team"
                                            multiline
                                            className={classes.textField}
                                            type="text"
                                            name="team"
                                            autoComplete="text"
                                            margin="normal"
                                            value={team}
                                            onChange={this.onChange}
                                        />

                                        {/*
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <KeyboardDatePicker
                                                id="activityDateTime"
                                                name="activityDateTime"
                                                label="Date"
                                                variant="inline"
                                                format="MM/dd/yyyy"
                                                margin="normal"
                                                value={activityDateTime}
                                                onChange={this.handleDateChange}
                                                KeyboardButtonProps={{
                                                'aria-label': 'change date',
                                            }}
                                            />  
                                        </MuiPickersUtilsProvider>   
                                        */}                     

                                        <TextField className="datepicker"
                                            id="activityDateTime"
                                            name="activityDateTime"
                                            label="Date"
                                            placeholder="MM/DD/YYYY"
                                            multiline
                                            className={classes.textField}
                                            type="date"
                                            autoComplete="text"
                                            margin="normal"
                                            value={activityDateTime}
                                            onChange={this.onChange}
                                        />

                                        <TextField
                                            id="activityType"
                                            name="activityType"
                                            label="Activity Type"
                                            placeholder="swim,bike,or run"
                                            multiline
                                            className={classes.textField}
                                            type="text"
                                            autoComplete="text"
                                            margin="normal"
                                            value={activityType}
                                            onChange={this.onChange}
                                        />

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
                                            onChange={this.handleChange("distance")}
                                            InputProps={{
                                                inputComponent: NumberFormatCustom
                                            }}
                                        />

                                        <TextField
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
                                            onChange={this.handleChange("duration")}
                                            InputProps={{
                                                inputComponent: NumberFormatCustom
                                            }}
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

export default withStyles(styles)(withAuthUserContext(Activity));