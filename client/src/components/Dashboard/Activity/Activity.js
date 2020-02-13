import React from 'react';
import Util from '../../Util/Util';
import M from "materialize-css/dist/js/materialize.min.js";
import Modal from './ActivityModal';
import { withAuthUserContext } from '../../Auth/Session/AuthUserContext';
import { Redirect } from 'react-router';
import NumberFormat from 'react-number-format';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

const INITIAL_STATE = {
    displayName: '',
    team: '',
    activityDateTime: '',
    activityType: '', // swim, bike, run
    distance: '',
    distanceUnits: '',
    duration: ''
};  

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
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
        let datePicker = document.querySelector(".datepicker");
        M.init(datePicker);
        datePicker.pickadate({
            selectMonths: true, // Creates a dropdown to control month
            selectYears: 15 // Creates a dropdown of 15 years to control year
        });

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

        db.collection('activities').add({
            team: this.state.team,
            activityDateTime: this.state.activityDateTime,
            activityType: this.state.activityType,
            distance: this.state.distance,
            distanceUnits: this.state.distanceUnits,
            duration: this.state.duration,
            email: this.props.user.authUser.email,
            uid: this.props.user.authUser.uid
        }).catch(function (error) {
            alert("Activity Update Failed: ", error);
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

                                        <TextField className='datepicker'
                                            id="activityDateTime"
                                            label="Date"
                                            placeholder="02/01/2020"
                                            multiline
                                            className={classes.textField}
                                            type="date"
                                            name="activityDateTime"
                                            autoComplete="text"
                                            margin="normal"
                                            data-value={activityDateTime}
                                            onChange={this.handleDateChange}
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
                                            onChange={this.handleChange('distance')}
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
                                            onChange={this.handleChange('duration')}
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