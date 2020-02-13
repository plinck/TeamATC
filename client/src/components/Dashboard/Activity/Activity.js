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
    firstName: '',
    lastName: '',
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
        // prefix="$"
        />
    );
}


class Activity extends React.Component {
    constructor(props) {
        super(props);
    
        this._isMounted = false;
    
        this.state = { ...INITIAL_STATE };
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    componentDidMount() {
        this._mounted = true;

        Util.apiGet("/api/firestore/activities")
            .then(res => {
                if (this._mounted) {
                    this.setState({ activitys: res.data }, () => this.calculate())
                }
            })
            .catch(err => console.error(err));

        let elem = document.querySelector(".modal");
        M.Modal.init(elem);
    }

    calculate = () => {

        Util.apiGet("/api/firestore/getTotalActivities")
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

    updateDatabase = () => {
        const db = Util.getFirestoreDB();

        db.collection('activitys').add({
            firstName: this.state.firstName,
            LastName: this.state.lastName,
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

    }

    render() {
        const { classes } = this.props;

        const {
            firstName,
            lastName,
            team,
            activityDateTime,
            activityType, // swim, bike, run
            distance,
            distanceUnits,
            duration
        } = this.state;

        if (this.props.user.authUser) {
            return (
                <div className="container">
                    <Modal amount={this.state.amount} />
                    <div className="col s12">
                        <div className="card">
                            <div className="card-content pCard">
                                <span className="card-title">New Activity</span>
                                <div className="row">
                                    <div className="col s12">
                                        <form className={classes.container} noValidate autoComplete="off">

                                        <TextField
                                            disabled
                                            id="firstName"
                                            label="firstName"
                                            placeholder="FirstName"
                                            multiline
                                            className={classes.textField}
                                            type="text"
                                            name="firstName"
                                            autoComplete="text"
                                            margin="normal"
                                            value={firstName}
                                            onChange={this.onChange}
                                            />
                                        />

                                        <TextField
                                            disabled
                                            id="lastName"
                                            label="lastName"
                                            placeholder="LastName"
                                            multiline
                                            className={classes.textField}
                                            type="text"
                                            name="lastName"
                                            autoComplete="text"
                                            margin="normal"
                                            value={lastName}
                                            onChange={this.onChange}
                                            />
                                        />

                                        <TextField
                                            disabled
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
                                        />

                                        <TextField
                                            id="activityDateTime"
                                            label="Date"
                                            placeholder="02/01/2020"
                                            multiline
                                            className={classes.textField}
                                            type="text"
                                            name="activityDateTime"
                                            autoComplete="text"
                                            margin="normal"
                                            value={activityDateTime}
                                            onChange={this.onChange}
                                            />
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
                                            onChange={this.onChange}
                                            />
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
                                            onChange={this.onChange}
                                            />
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