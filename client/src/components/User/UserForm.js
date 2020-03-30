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

// For select input field
// import InputLabel from "@material-ui/core/InputLabel";
// import MenuItem from "@material-ui/core/MenuItem";
// import Select from "@material-ui/core/Select";
// import CircularProgress from '@material-ui/core/CircularProgress';

import UserAuthAPI from "./UserAuthAPI";
import UserDB from "./UserDB"
import TeamDB from "../Team/TeamDB";
import { Container, Card, CardContent, Typography, CardActions } from '@material-ui/core';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  inputFix: {
    marginTop: 5
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 300,
  },
  menu: {
    width: 200,
  },
  formControl: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    minWidth: 300,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
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
      id: this.props.id,
      firstName: "",
      lastName: "",
      photoURL: "",
      phoneNumber: "",
      email: "",
      uid: "",
      primaryRole: "noauth",
      isAdmin: false,
      isTeamLead: false,
      isModerator: false,
      isUser: false,
      challengeUid: "",
      teamUid: "",
      teamName: "",

      message: "",
      teams: null,
      teamLookup: null
    };
  }

  fetchUser = (id) => {
    UserDB.get(id)
      .then(user => {
        this.setState({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          photoURL: user.photoURL || "",
          phoneNumber: user.phoneNumber || "",
          uid: user.uid,
          challengeUid: user.challengeUid || "",
          teamUid: user.teamUid || "",
          teamName: user.teamName || "",
          primaryRole: user.primaryRole,
          isAdmin: user.isAdmin,
          isTeamLead: user.isTeamLead,
          isModerator: user.isModerator,
          isUser: user.isUser,
          email: user.email
        });
      })
      .catch(err => {
        console.error(`Error getting user ${err}`);
        this.setState({ error: `Error getting user ${err}` });
      });
  };

  // get available teams for select list
  // Dont use for now
  fetchTeams() {
    TeamDB.getTeams()
      .then(teams => {

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
        this.setState({ error: `Error getting teams ${err}` });
      });

  }

  componentDidMount() {
    // console.log(`id: ${this.state.id}`);
    // dont fetch teams for now since we need to based on challenge they are in so we need that first
    // this.fetchTeams();  // for pulldown so doesnt matter if user exists yet

    // only get user if its an update, otherwise assume new
    if (this.state.id) {
      this.fetchUser(this.state.id);
    } else {
    }
  }

  // Create a new user 
  // Create the user in firebase AUTH with email and random password
  // Save that user in firestore
  // -- The above is like the sign up process
  // Then, generate change password link for user and send to their email address
  createUser = () => {
    // eslint-disable-next-line no-unused-vars
    const user = this.state;

    // set team name from ID - Save for later when callenge is also selected
    // user.teamName = this.state.teamLookup[this.state.teamUid]

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
        this.props.firebase.doPasswordReset(user.email).then(() => {
          this.setState({
            message: "New User Added.  Password reset Link sent - user must reset password login",
            id: id
          });
        }).catch(err => {
          console.error(`Error resettting user pw in firebase.doPasswordReset ${err}`);
          this.setState({ message: err.message });
        });
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
    console.log(`updating db with user.uid:${this.state.uid}`);

    const user = this.state;
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
    if (this.state.id) {
      this.updateUser();
    } else {
      this.createUser();
    }
  };

  onChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  // Make Admin
  userMakeAdmin = (id) => {

    UserDB.makeAdmin(id)
      .then(res => {
        console.log(`Made User ${id} Admin`);
        this.setState({ message: `Made User Admin` });
        this.fetchUser(id);
      })
      .catch(err => {
        this.setState({ message: `Error: ${err}` });
        console.error(err);
      });
  }

  // Make TeamLead
  userMakeTeamLead = (id) => {
    UserDB.makeTeamLead(id)
      .then(res => {
        console.log(`Made User ${id} TeamLead`);
        this.setState({ message: `Made user a TeamLead` });
        this.fetchUser(id);
      })
      .catch(err => {
        this.setState({ message: `Error: ${err}` });
        console.error(err);
      });
  }

  // Make User - essentailly dispables the user
  userMakeUser = (id) => {
    UserDB.makeUser(id)
      .then(res => {
        console.log(`Made User ${id} Athlete`);
        this.setState({ message: `Made user an Athlete` });
        this.fetchUser(id);
      })
      .catch(err => {
        this.setState({ message: `Error: ${err}` });
        console.error(err);
      });
  }

  // Make Moderator
  userMakeModerator = (id) => {
    UserDB.makeModerator(id)
      .then(res => {
        console.log(`Made User ${id} Moderator`);
        this.setState({ message: `Made user a Moderator` });
        this.fetchUser(id);
      })
      .catch(err => {
        this.setState({ message: `Error: ${err}` });
        console.error(err);
      });
  }

  render() {
    const { classes } = this.props;

    const {
      firstName,
      lastName,
      photoURL,
      phoneNumber,
      email,
      primaryRole,
      message,
    } = this.state;

    let buttonText, emailEnabled;
    if (this.state.id) {
      buttonText = "Update";
      emailEnabled = false;
    } else {
      buttonText = "Create";
      emailEnabled = true;
    }

    const isValid =
      firstName !== "" &&
      lastName !== "" &&
      phoneNumber !== "";

    // if (typeof this.state.teams === 'undefined') {
    //     console.error("Fatal Error")
    //     return (<div> <p>FATAL ERROR Gettng teams, something goofy going on ...</p> </div>)
    // }
    // if (this.state.teams === null) {
    //     console.log("No teams yet")
    //     return (<div> <CircularProgress className={classes.progress} /> <p>Loading ...</p> </div>)
    // }

    return (
      <div className={classes.root}>
        <Container>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">User (Role: {primaryRole}, challenge: {this.props.user.challengeName})</Typography>
              <p>{message}</p>
              <form onSubmit={this.saveUser} >

                {/* Dont usee teams for now - wait unti l you have challenge properly integrated
            <FormControl variant="outlined" required className={classes.formControl}>
            <InputLabel id="teamNameLabel">Team Name</InputLabel>
            <Select
            labelId="teamNameLabel"
            id="teamUid"
            name="teamUid"
            type="text"
            margin="normal"
            style={{marginTop: 16, marginBottom: 16, marginLeft: 0, marginRight: 0, padding: 0}}
            value={teamUid}
            onChange={this.onChange}
            className={classes.textField}>
            
            {teams.map((team) => {
              return (
                <MenuItem value={team.id}>{team.name}</MenuItem>
                );
              })} 
              </Select>
              </FormControl>
            */}

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
                  value={email}
                  onChange={this.onChange}
                />

                <TextField
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  variant="outlined"
                  value={firstName}
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
                  value={lastName}
                  placeholder="Smith"
                  className={classes.textField}
                  type="text"
                  margin="normal"
                  onChange={this.onChange}
                />

                <TextField
                  id="phoneNumber"
                  name="phoneNumber"
                  value={phoneNumber}
                  label="Phone Number"
                  variant="outlined"
                  inputProps={{
                    style: { padding: 18, width: "100%" }
                  }}
                  className={classes.textField}
                  margin="normal"
                  onChange={this.handleChange('phoneNumber')}
                  InputProps={{
                    inputComponent: NumberFormatPhone,
                  }}
                />

                <TextField
                  id="photoURL"
                  name="photoURL"
                  value={photoURL ? photoURL : ""}
                  label="Photo URL"
                  variant="outlined"
                  placeholder="http://www.image.com/image.png"
                  className={classes.textField}
                  type="text"
                  margin="normal"
                  onChange={this.onChange}
                />

              </form>

              {/* Only display roles if user exists */}
              {this.state.id ?
                <form >
                  <br />
                  <hr />
                  <FormControl component="fieldset" className={classes.formControl}>
                    <FormLabel component="legend">Current Roles</FormLabel>
                    <FormGroup row>
                      <FormControlLabel
                        disabled={this.state.isTeamLead}
                        control={
                          <Checkbox checked={this.state.isTeamLead} onClick={() => this.userMakeTeamLead(this.state.id)} />
                        }
                        label="TeamLead"
                      />
                      <FormControlLabel
                        disabled={this.state.isAdmin}
                        control={
                          <Checkbox checked={this.state.isAdmin} onClick={() => this.userMakeAdmin(this.state.id)} />
                        }
                        label="Admin"
                      />
                      <FormControlLabel
                        disabled={this.state.isModerator}
                        control={
                          <Checkbox checked={this.state.isModerator} onClick={() => this.userMakeModerator(this.state.id)} />
                        }
                        label="Moderator"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox checked={this.state.isUser} onClick={() => this.userMakeUser(this.state.id)} />
                        }
                        label="Athlete"
                      />
                    </FormGroup>
                  </FormControl>
                </form>
                : ""}
            </CardContent>
            <CardActions>
              <Button disabled={!isValid} onClick={this.saveUser} variant="contained" color="primary">
                {buttonText}
              </Button>
            </CardActions>
          </Card>
        </Container>
      </div>
    );
  }
}

export default withFirebase(withAuthUserContext(withRouter(withStyles(styles)(UserForm))));