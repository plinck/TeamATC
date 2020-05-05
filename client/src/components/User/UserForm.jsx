import React from 'react';
import { withRouter } from 'react-router-dom';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { withFirebase } from '../Auth/Firebase/FirebaseContext';
import { withStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import NumberFormat from 'react-number-format';
import localStyles from './User.module.css';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import CircularProgress from '@material-ui/core/CircularProgress';

import UserAuthAPI from "./UserAuthAPI";
import UserDB from "./UserDB"
import TeamDB from "../Team/TeamDB";
import ChallengeDB from "../Challenges/ChallengeDB";
import { Container, Grid, Card, CardContent, Typography, CardActions } from '@material-ui/core';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  inputFix: {
    marginTop: 5
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300,
  },
  menu: {
    width: 200,
  },
  formControl: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    minWidth: 300,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  root: {
    [theme.breakpoints.up('md')]: {
      marginLeft: "57px",
    },
    paddingTop: "10px"
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
class UserForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user : {
                id: this.props.id,
                challengeUid : "",
                displayName : "",
                email: "",
                firstName: "",
                isAdmin: false,
                isTeamLead: false,
                isModerator: false,
                isUser: false,
                lastName: "",
                phoneNumber: "",
                photoURL: "",
                primaryRole: "",
                stravaAccessToken: "",
                stravaAthleteId : "",
                stravaExpiresAt: null,
                stravaRefreshToken: "",
                stravaUserAuth : false,
                teamName: "",
                teamUid: "",
                uid: this.props.id
            },

            challenge: "",

            challenges: [],
            challengeLookup: {},

            teams: [],
            teamLookup: {},
            
            message: "",
        };
    }

    fetchUser = (id) => {
        UserDB.get(id).then(user => {
            this.setState({ user : user });
            if (user.challengeUid) {
                this.fetchTeams(user.challengeUid); 
            }
        }).catch(err => {
            console.error(`Error getting user ${err}`);
            this.setState({ error: `Error getting user ${err}` });
        });
    };

    // get available teams for select list
    // Dont use for now
    fetchTeams(challengeUid) {
        console.log(`Fetching teams for challengeUid: ${challengeUid}`);
        if (challengeUid) {
            TeamDB.getTeamsInChallenge(challengeUid).then(teams => {
                // Convert array of teams to key value unqie pairs for easy lookup on primary key
                let teamLookup = {}
                teams.forEach(team => {
                    teamLookup[team.id] = team.name;
                });
                console.log(`Fetched teams: ${JSON.stringify(teams, null,2)}`);
                this.setState({
                    teams: teams,
                    teamLookup: teamLookup
                });
            }).catch(err => {
                console.error(`Error getting teams ${err}`);
                this.setState({ error: `Error getting teams ${err}` });
            });
        }
    }

    // get available teams for select list
    // Dont use for now
    fetchChallenges() {
        ChallengeDB.getFiltered().then(challenges => {
            // Convert array of teams to key value unqie pairs for easy lookup on primary key
            let challengeLookup = {}
            challenges.forEach(challenge => {
                challengeLookup[challenge.id] = challenge.name;
            });

            this.setState({
                challenges: challenges,
                challengeLookup: challengeLookup
            });
        }).catch(err => {
            console.error(`Error getting teams ${err}`);
            this.setState({ error: `Error getting teams ${err}` });
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

    componentDidMount() {
        // only get user if its an update, otherwise assume new
        if (this.state.user.id) {
            this.fetchUser(this.state.user.id);
        } 
        let currentChallengeUid = undefined;
        if (this.state.user.challengeUid) {
            currentChallengeUid = this.state.user.challengeUid;
        } 
        // this.fetchCurrentChallenge(currentChallengeUid);
        this.fetchChallenges();  // for pulldown so doesnt matter if user exists yet
        this.fetchTeams(currentChallengeUid);  // for pulldown so doesnt matter if user exists yet
    }

    componentDidUpdate(prevProps) {
        console.log(`component did update`);
        if (this.props.user.challengeUid && this.props.user.challengeUid !== prevProps.user.challengeUid) {
            if (this.state.user.id) {
                this.fetchUser(this.state.user.id);
            }  
            let currentChallengeUid = undefined;
            if (this.state.user.challengeUid) {
                currentChallengeUid = this.state.user.challengeUid;
            } 
            // this.fetchCurrentChallenge(currentChallengeUid);
            this.fetchChallenges();  // for pulldown so doesnt matter if user exists yet
            this.fetchTeams(currentChallengeUid);  // for pulldown so doesnt matter if user exists yet
        }
    }

    // Create a new user 
    // Create the user in firebase AUTH with email and random password
    // Save that user in firestore
    // -- The above is like the sign up process
    // Then, generate change password link for user and send to their email address
    createUser = () => {
        // eslint-disable-next-line no-unused-vars
        const user = this.state.user;

        // set team name from ID - Save for later when callenge is also selected
        // user.teamName = this.state.teamLookup[user.teamUid]

        // First, create the auth user in firebase
        // must be done on server for security reasons
        UserAuthAPI.createAuthUser(user).then(authUser => {
            // Temp override these due to errors in storing null values.
            authUser.user.displayName = user.displayName ? user.displayName : "";
            authUser.user.lastName = user.lastName ? user.lastName : "";
            authUser.user.firstName = user.firstName ? user.firstName : "";
            authUser.user.phoneNumber = user.phoneNumber ? user.phoneNumber : "";
            authUser.user.photoURL = user.photoURL ? user.photoUR : "";

           // Now Create the user in firestore
            UserDB.addAuthUserToFirestore(authUser, user).then((id) => {
                this.setState((prevState) => ({
                    user: {                   
                        ...prevState.user,   
                        [id]: id      
                    },
                    message: "New User Added.",
                }));
            
                // comment out doing password reset on create as it confuses people and always 
                // times out by the time they get the email to reset
                // this.props.firebase.doPasswordReset(user.email).then(() => {
                //   this.setState({
                //     message: "New User Added.  Password reset Link sent - user must reset password login",
                //     id: id
                //   });
                // }).catch(err => {
                //   console.error(`Error resettting user pw in firebase.doPasswordReset ${err}`);
                //   this.setState({ message: err.message });
                // });
            }).catch(err => {
                console.error(`Error adding user in UserDB.addAuthUserToFirestore ${err}, msg: ${err.message}`);
                this.setState({ message: `Error adding user in UserDB.addAuthUserToFirestore ${err}, msg: ${err.message}` });
            });
        }).catch(err => {
            console.error(`Error adding user in UserAuthAPI.createAuthUser(user) ${err}`);
            this.setState({ message: `Error adding auth user in UserAuthAPI.createAuthUser msg: ${err}` });
        });
    }

    updateUser = () => {
        console.log(`updating db with user.uid:${this.state.user.uid}`);

        const user = this.state.user;
        console.log(`user.teamName: ${user.teamName}`);
        // set team name from ID - SAVE THIS FOR LATER SINCE IT NEEDS TO BE BASED ON Selected Challenge
        // remove team stuff when adding user
        // user.teamName = this.state.teamLookup[this.state.teamUid]

        UserDB.update(user).then(user => {
            this.setState({ message: "User Updated" });
            // should we go to user list page??  Passing message??
            this.props.history.push({
                pathname: '/admin',
                state: { message: "User Updated" }
            });
        }).catch(err => {
            // set message to show update
            this.setState({ message: `Error updating user ${err}` });
        });
    }

    saveUser = (e) => {
        e.preventDefault();
        // Update current user in firestore (and auth for some fields)
        if (this.state.user.id) {
            this.updateUser();
        } else {
            this.createUser();
        }
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

    handleChallengeChange = event => {
        const name = event.target.name;
        const value = event.target.value;
        const challengeUid = value;

        console.log(`handleChallengeChange name: ${name} value: ${value}`)

        this.fetchTeams(challengeUid);  // for pulldown so doesnt matter if user exists yet

        this.setState((prevState) => ({
            user: {                   
                ...prevState.user,    
                [name]: value,      
            }}));  
    };

    handleTeamChange = event => {
        const name = event.target.name;
        const value = event.target.value;
        const teamName = this.state.teamLookup[value];

        console.log(`handleTeamChange name: ${name} value: ${value}`)

        this.setState((prevState) => ({
            user: {                   
                ...prevState.user,    
                [name]: value,  
                teamName: teamName    
            }}));    
    };

    // Make Admin
    userMakeAdmin = (id) => {

        UserDB.makeAdmin(id).then(res => {
            console.log(`Made User ${id} Admin`);
            this.setState({ message: `Made User Admin` });
            this.fetchUser(id);
        }).catch(err => {
            this.setState({ message: `Error: ${err}` });
            console.error(err);
        });
    }

    // Make TeamLead
    userMakeTeamLead = (id) => {
        UserDB.makeTeamLead(id).then(res => {
            console.log(`Made User ${id} TeamLead`);
            this.setState({ message: `Made user a TeamLead` });
            this.fetchUser(id);
        }).catch(err => {
            this.setState({ message: `Error: ${err}` });
            console.error(err);
        });
    }

    // Make Moderator
    userMakeModerator = (id) => {
        UserDB.makeModerator(id).then(res => {
            console.log(`Made User ${id} Moderator`);
            this.setState({ message: `Made user a Moderator` });
            this.fetchUser(id);
        }).catch(err => {
            this.setState({ message: `Error: ${err}` });
            console.error(err);
        });
    }
    
    // Make User - essentailly dispables the user
    userMakeUser = (id) => {
        UserDB.makeUser(id).then(res => {
            console.log(`Made User ${id} Athlete`);
            this.setState({ message: `Made user an Athlete` });
            this.fetchUser(id);
        }).catch(err => {
            this.setState({ message: `Error: ${err}` });
            console.error(err);
        });
    }

    render() {
        const { classes } = this.props;

        if (!this.props.user) {
            console.log("No user yet")
            return (<div> <CircularProgress className={classes.progress} /> <p>Loading ...</p> </div>)
        }

        const {
            user,
            message,
        } = this.state;

        const challenges = this.state.challenges;
        const teams = this.state.teams;

        let buttonText, emailEnabled;
        if (this.state.user.id) {
            buttonText = "Update";
            emailEnabled = false;
        } else {
            buttonText = "Create";
            emailEnabled = true;
        }

        const isValid =
            user.firstName !== "" &&
            user.lastName !== "" &&
            user.phoneNumber !== "";

            

        // if (typeof this.state.teams === 'undefined') {
        //     console.error("Fatal Error")
        //     return (<div> <p>FATAL ERROR Gettng teams, something goofy going on ...</p> </div>)
        // }
        // if (!challenges || challenges === null) {
        //     console.log("No challenges yet")
        //     return (<div> <CircularProgress className={classes.progress} /> <p>Loading ...</p> </div>)
        // }
        // if (!teams || teams === null) {
        //     console.log("No teams yet")
        //     return (<div> <CircularProgress className={classes.progress} /> <p>Loading ...</p> </div>)
        // }

        console.log(`rendering with ${challenges.length} challenges and ${teams ? teams.length : 0} teams `);

        return (
            <div className={classes.root}>
                <Container>
                <Card>
                    <CardContent>
                    <p>{message}</p>
                    <Typography gutterBottom variant="h5" component="h2">User (Role: {user.primaryRole}, challenge: {user.challengeName})</Typography>
                    <form onSubmit={this.saveUser} >

                        <TextField
                            disabled={!emailEnabled}
                            id="email"
                            name="email"
                            label="Email"
                            variant="outlined"
                            placeholder="example@gmail.com"
                            className={classes.textField}
                            type="email"
                            autoComplete="email"
                            margin="normal"
                            value={user.email}
                            onChange={this.onChange}
                        />

                        <TextField
                            id="firstName"
                            name="firstName"
                            label="First Name"
                            variant="outlined"
                            value={user.firstName}
                            placeholder="John"
                            className={classes.textField}
                            type="text"
                            margin="normal"
                            onChange={this.onChange}
                        />

                        <TextField
                            id="lastName"
                            name="lastName"
                            label="Last Name"
                            variant="outlined"
                            value={user.lastName}
                            placeholder="Smith"
                            className={classes.textField}
                            type="text"
                            margin="normal"
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
                                style: { padding: 18, width: "100%" }
                            }}
                        />

                        <TextField
                            id="photoURL"
                            name="photoURL"
                            value={user.photoURL ? user.photoURL : ""}
                            label="Photo URL"
                            variant="outlined"
                            placeholder="http://www.image.com/image.png"
                            className={classes.textField}
                            type="text"
                            margin="normal"
                            onChange={this.onChange}
                        />
                        <FormControl variant="outlined" required className={classes.formControl}>
                            <InputLabel id="challengeNameLabel">Challenge Name</InputLabel>
                            <Select
                                labelId="challengeNameLabel"
                                id="challengeUid"
                                value={user.challengeUid}
                                name="challengeUid"
                                style={{ marginTop: 16, padding: 0 }}
                                onChange={this.handleChallengeChange}
                                label="Challenge Name"
                                type="text">
                                {challenges.map((challenge, i) => {
                                    return (
                                        <MenuItem key={i} value={challenge.id}>{challenge.name}</MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" required className={classes.formControl}>
                            <InputLabel id="teamNameLabel">Team Name</InputLabel>
                            <Select
                                labelId="teamNameLabel"
                                id="teamUid"
                                value={user.teamUid}
                                name="teamUid"
                                style={{ marginTop: 16, padding: 0 }}
                                onChange={this.handleTeamChange}
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

                    {/* Only display roles if user exists */}
                    {user.id ?
                        <form >
                        <br />
                        <hr />
                        <FormControl component="fieldset" className={classes.formControl}>
                            <FormLabel component="legend">Current Roles</FormLabel>
                            <FormGroup row>
                            <FormControlLabel
                                disabled={this.props && this.props.user && this.props.user.isAdmin ? false : true}
                                control={
                                <Checkbox checked={user.isTeamLead} onClick={() => this.userMakeTeamLead(user.id)} />
                                }
                                label="TeamLead"
                            />
                            <FormControlLabel
                                disabled={this.props && this.props.user && this.props.user.isAdmin ? false : true}
                                control={
                                <Checkbox checked={user.isAdmin} onClick={() => this.userMakeAdmin(user.id)} />
                                }
                                label="Admin"
                            />
                            <FormControlLabel
                                disabled={this.props && this.props.user && this.props.user.isAdmin ? false : true}
                                control={
                                <Checkbox checked={user.isModerator} onClick={() => this.userMakeModerator(user.id)} />
                                }
                                label="Moderator"
                            />
                            <FormControlLabel
                                disabled={this.props && this.props.user && this.props.user.isAdmin ? false : true}
                                control={
                                <Checkbox checked={user.isUser} onClick={() => this.userMakeUser(user.id)} />
                                }
                                label="Athlete"
                            />
                            </FormGroup>
                        </FormControl>
                        </form>
                        : ""}
                        <Button disabled={!isValid} onClick={this.saveUser} variant="contained" color="primary">
                            {buttonText}
                        </Button>
                        <br />
                        <hr />
                        {user.stravaUserAuth ? 
                            <Typography variant="subtitle2">
                                <Grid item xs={12}>
                                    Strava authorized - Strava Id:{user.stravaAthleteId}
                                </Grid>
                            </Typography>
                            : 
                            <Typography variant="subtitle2">
                                <Grid item xs={12} fontWeight="fontWeightLight" color="warning.main" fontStyle="oblique">
                                    Strava Not Authorized for this user
                                </Grid>
                            </Typography>
                        }
                    </CardContent>
                    <CardActions>
                    </CardActions>
                </Card>
                </Container>
            </div>
        );
    }
}

export default withFirebase(withAuthUserContext(withRouter(withStyles(styles)(UserForm))));