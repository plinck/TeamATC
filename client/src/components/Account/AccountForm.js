import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import TextField from '@material-ui/core/TextField';
import NumberFormat from 'react-number-format';
import localStyles from './Account.module.css';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';

// For select input field
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import CircularProgress from '@material-ui/core/CircularProgress';

import UserDB from "../User/UserDB";
import TeamDB from "../Team/TeamDB";
import { Container, Grid, Card, CardContent, Typography, CardActions } from '@material-ui/core';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        margin: theme.spacing(1),
        width: 300,
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 300,
    }
});

function NumberFormatPhone(props) {
    const { inputRef, onChange, ...other } = props;

    return (
        <NumberFormat
            {...other}
            className={localStyles.input}
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

class AccountForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user : {
                id: this.props.uid,
                uid: this.props.uid,
                teamUid: "",
                teamName: "",
                firstName: "",
                lastName: "",
                photoURL: "",
                phoneNumber: "",
                email: "",
                primaryRole: "",
                isAdmin: false,
                isTeamLead: false,
                isModerator: false,
                isUser: false,
            },
            message: "",
            teams: null,
            teamLookup: null
        };
    }

    fetchUser = (id) => {
        UserDB.get(id)
            .then(user => {
                this.setState({
                    user : user
                });
                // Dont need to get custom primaryRole since they are passed in props from context
                // and can not be changed here
            })
            .catch(err => {
                console.error(`Error getting user ${err}`);
                this.setState({ message: `Error getting user ${err}` });
            });
    };

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

    componentDidMount() {
        console.log(`authUser.uid: ${this.state.user.uid}`);
        // since t hey are auth, uid == id
        this.fetchUser(this.state.user.uid);
        this.fetchTeams();  // for pulldown so doesnt matter if user exists yet

    }

    updateUser = (e) => {
        e.preventDefault();
        // Update current user in firestore (and auth for some fields)
        console.log(`updating db with user.uid:${this.state.user.id}`);
        const user = this.state.user;
        // set team name from ID
        user.teamName = this.state.teamLookup[this.state.user.teamUid]

        UserDB.updateCurrent(user).then(user => {
            // set message to show update
            this.setState({ message: "Account Updated" });
        }).catch(err => {
            // set message to show update
            this.setState({ message: `Error updating account ${err}` });
        });
    };

    onChange = event => {
        const name = event.target.name;
        const value = event.target.value;
        this.setState((prevState) => ({
            user: {                   // object that we want to update
                ...prevState.user,    // keep all other key-value pairs
                [name]: value       // update the value of specific key
            }
        }))
        // this.setState({
        //     [event.target.name]: event.target.value
        // });
    };

    handleChange = pname => event => {
        const name = pname;
        const value = event.target.value;
        this.setState((prevState) => ({
            user: {                   // object that we want to update
                ...prevState.user,    // keep all other key-value pairs
                [name]: value       // update the value of specific key
            }
        }))
    };

    render() {
        const { classes } = this.props;

        const {
            user,
            message,
            teams
        } = this.state;

        const isValid = user.firstName !== "" && user.lastName !== "" && user.phoneNumber !== "";
        var isRoleEditEnabled = false;

        if (typeof this.state.teams === 'undefined') {
            console.error("Fatal Error")
            return (<div> <p>FATAL ERROR Gettng teams, something goofy going on ...</p> </div>)
        }
        if (this.state.teams === null) {
            console.log("No teams yet")
            return (<div> <CircularProgress className={classes.progress} /> <p>Loading ...</p> </div>)
        }

        return (
            <Container style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                <Grid container>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle2">{message}</Typography>
                                <Typography gutterBottom component="h2" variant="h5">User Profile (Role: {user.primaryRole}, challenge: {this.props.user.challengeName})</Typography>
                                <form className={classes.container} onSubmit={this.updateUser} >

                                    <FormControl variant="outlined" required className={classes.formControl}>
                                        <InputLabel id="teamNameLabel">Team Name</InputLabel>
                                        <Select
                                            labelId="teamNameLabel"
                                            id="teamUid"
                                            value={user.teamUid}
                                            onChange={this.onChange}
                                            label="Team Name"
                                            name="teamUid"
                                            type="text">

                                            {teams.map((team, i) => {
                                                return (
                                                    <MenuItem key={i} value={team.id}>{team.name}</MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>

                                    <TextField disabled={true}
                                        id="email"
                                        name="email"
                                        label="Email"
                                        placeholder="example@gmail.com"
                                        className={classes.textField}
                                        variant="outlined"
                                        type="email"
                                        autoComplete="email"
                                        value={user.email}
                                        onChange={this.onChange}
                                    />

                                    <TextField
                                        id="firstName"
                                        name="firstName"
                                        label="First Name"
                                        value={user.firstName}
                                        variant="outlined"
                                        placeholder="John"
                                        className={classes.textField}
                                        type="text"
                                        onChange={this.onChange}
                                    />

                                    <TextField
                                        id="lastName"
                                        name="lastName"
                                        label="Last Name"
                                        value={user.lastName}
                                        variant="outlined"
                                        placeholder="Smith"
                                        className={classes.textField}
                                        type="text"
                                        onChange={this.onChange}
                                    />

                                    <TextField
                                        id="phoneNumber"
                                        label="Phone Number"
                                        name="phoneNumber"
                                        className={classes.textField}
                                        variant="outlined"
                                        margin='normal'
                                        value={user.phoneNumber}
                                        onChange={this.handleChange('phoneNumber')}
                                        InputProps={{
                                            inputComponent: NumberFormatPhone,
                                        }}
                                        inputProps={{
                                            style: { padding: "18px", width: "100%" }
                                        }}
                                    />
                                    <TextField
                                        id="photoURL"
                                        name="photoURL"
                                        value={user.photoURL ? user.photoURL : ""}
                                        label="Photo URL"
                                        multiline
                                        variant="outlined"
                                        placeholder="http://www.image.com/image.png"
                                        className={classes.textField}
                                        type="text"
                                        onChange={this.onChange}
                                    />

                                </form>

                                <form className="Container">
                                    <br />
                                    {isRoleEditEnabled ? <hr /> : ""}
                                    {isRoleEditEnabled ?
                                        <FormControl component="fieldset" className={classes.formControl}>
                                            <FormLabel component="legend">Current Roles <i>(can not edit your own roles)</i></FormLabel>
                                            <FormGroup row >
                                                <FormControlLabel
                                                    disabled={!isRoleEditEnabled}
                                                    control={<Checkbox checked={user.isTeamLead} />}
                                                    label="TeamLead"
                                                />
                                                <FormControlLabel
                                                    disabled={!isRoleEditEnabled}
                                                    control={
                                                        <Checkbox checked={user.isAdmin} />
                                                    }
                                                    label="Admin"
                                                />
                                                <FormControlLabel
                                                    disabled={!isRoleEditEnabled}
                                                    control={
                                                        <Checkbox checked={user.isModerator} />
                                                    }
                                                    label="Moderator"
                                                />
                                                <FormControlLabel
                                                    disabled={!isRoleEditEnabled}
                                                    control={
                                                        <Checkbox checked={user.isUser} />
                                                    }
                                                    label="User"
                                                />
                                            </FormGroup>
                                        </FormControl> :
                                        ""}
                                </form>
                            </CardContent>
                            <CardActions>
                                <Button disabled={!isValid} onClick={this.updateUser} variant="contained" color="primary" className={classes.button}>
                                    Update
                        </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Container >
        );
    }
}

export default withStyles(styles)(withAuthUserContext(AccountForm));