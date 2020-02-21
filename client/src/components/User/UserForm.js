import React from 'react';
import { withRouter } from 'react-router-dom';

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
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import CircularProgress from '@material-ui/core/CircularProgress';

import { withFirebase } from '../Auth/Firebase/FirebaseContext';
import UserAPI from "./UserAPI";
import TeamAPI from "../Team/TeamAPI";
  
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
      teamUid: "",
      teamName: "",
      claims: "noauth",
      isAdmin: false,
      isTeamLead: false,
      isModerator: false,
      isUser: false,
      message: "",
      teams: null,
      teamLookup: null
    };
  }

  fetchUser = (id) => {
    UserAPI.get(id)
    .then(user => {
      this.setState({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        photoURL: user.photoURL || "",
        phoneNumber: user.phoneNumber || "",
        uid: user.uid,
        teamUid: user.teamUid || "",
        teamName: user.teamName || "",    
        claims: user.claims,
        isAdmin: user.isAdmin,
        isTeamLead: user.isTeamLead,
        isModerator: user.isModerator,
        isUser: user.isUser,
        email: user.email
      });
      // Dont need to get custom claims since they are passed in props from context
      // and can not be changed here
    })
    .catch(err => {
      console.error(`Error getting user ${err}`);
      this.setState({error: `Error getting user ${err}`});
    });
  };

  // get available teams for select list
  fetchTeams() {
    TeamAPI.getTeams()
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

      // Dont need to get custom claims since they are passed in props from context
      // and can not be changed here
    })
    .catch(err => {
      console.error(`Error getting teams ${err}`);
      this.setState({error: `Error getting teams ${err}`});
    });

  }

  componentDidMount() {
    // console.log(`id: ${this.state.id}`);
    this.fetchTeams();  // for pulldown so doesnt matter if user exists yet

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
    // set team name from ID
    user.teamName = this.state.teamLookup[this.state.teamUid]

    // First, create the auth user in firebase
    // must be done on server for security reasons
    UserAPI.createAuthUser(user)
      .then(response => {
        const authUser = {};
        authUser.user = response.data;
        // Temp override these due to errors in stroing null values.
        authUser.user.phoneNumber = user.phoneNumber;
        authUser.user.photoURL = user.photoURL;
        // Now Create the user in firestore
        UserAPI.addAuthUserToFirestore(authUser, user).then( (id) => {
          this.props.firebase.doPasswordReset(user.email).then(() => {
            this.setState({
              message: "New User Added.  Password reset Link sent - user must reset password login",
              id: id
            });
          }).catch(err => {
            this.setState({ message: err.message });
          });    
        }).catch(err => {
            this.setState({ message: `Error adding user ${err}` });
        });  
      })
      .catch(err => {
        this.setState({ message: `Error adding user ${err}` });
    });  
  }

  updateUser = () => {
    console.log(`updating db with user.uid:${this.state.uid}`);

    const user = this.state;
    // set team name from ID
    user.teamName = this.state.teamLookup[this.state.teamUid]

    UserAPI.update(user).then (user => {
      this.setState({message: "User Updated"});
      // should we go to user list page??  Passing message??
      this.props.history.push({
        pathname: '/admin',
        state: {message: "User Updated" }
      });
    }).catch (err => {
      // set message to show update
      this.setState({message: `Error updating user ${err}`});
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

    console.log(`Trying to make User ${id} Admin`);

    UserAPI.makeAdmin( id )
    .then(res => {
        console.log(`Made User ${id} Admin`);
        this.setState({message: `Made User Admin`});
        this.fetchUser(id);
    })
    .catch(err => {
      this.setState({message: `Error: ${err}`});
      console.error(err); 
    });
  }        
  
  // Make TeamLead
  userMakeTeamLead = (id) => {
      UserAPI.makeTeamLead( id )
      .then(res => {
          console.log(`Made User ${id} TeamLead`);
          this.setState({message: `Made User TeamLead`});
          this.fetchUser(id);
      })
      .catch(err => {
        this.setState({message: `Error: ${err}`});
        console.error(err); 
      });
  }   

  // Make User - essentailly dispables the user
  userMakeUser = (id) => {
      UserAPI.makeUser( id )
      .then(res => {
          console.log(`Made User ${id} User`);
          this.setState({message: `Disabled User (i.e. made them a user)`});
          this.fetchUser(id);
      })
      .catch(err => {
        this.setState({message: `Error: ${err}`});
        console.error(err); 
      });
  }       

  // Make Moderator
  userMakeModerator = (id) => {
      UserAPI.makeModerator( id )
      .then(res => {
          console.log(`Made User ${id} Moderator`);
          this.setState({message: `Made User Moderator`});
          this.fetchUser(id);
      })
      .catch(err => {
        this.setState({message: `Error: ${err}`});
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
      claims,
      message,
      teamUid,
      teams
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

    if (typeof this.state.teams === 'undefined') {
        console.error("Fatal Error")
        return (<div> <p>FATAL ERROR Gettng teams, something goofy going on ...</p> </div>)
    }
    if (this.state.teams === null) {
        console.log("No teams yet")
        return (<div> <CircularProgress className={classes.progress} /> <p>Loading ...</p> </div>)
    }

    return ( 
      <div className="container">
        <div className="card">
          <div className="card-content">
            <span className="card-title">User (Role: {claims})</span>

            <form onSubmit={this.saveUser} >
            <FormControl required className={classes.formControl}>
              <InputLabel id="teamNameLabel">Team Name</InputLabel>
              <Select
                labelId="teamNameLabel"
                id="teamUid"
                name="teamUid"
                multiline
                type="text"
                margin="normal"
                value={teamUid}
                onChange={this.onChange}
                className={classes.textField}>

                {teams.map((team) => {
                  return (
                    <MenuItem value={team.id}>{team.name}</MenuItem>
                  );
                })} 
                {/*}
                <MenuItem value={"SePT3HTDR8EUbQgHCkf1"}>Rahuligan</MenuItem>
                <MenuItem value={"QwUhcThKRBQQE7nIu3ys"}>Scottie</MenuItem>
              */}
              </Select>
            </FormControl>
    
            <TextField
            disabled={!emailEnabled}
            id="email"
            name="email"
            label="Email"
            multiline
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
              multiline
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
              multiline
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
              multiline
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
              multiline
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
                      <Checkbox checked={this.state.isTeamLead} onClick={() => this.userMakeTeamLead(this.state.id)}/>
                    }
                    label="TeamLead"
                  />
                  <FormControlLabel
                    disabled={this.state.isAdmin}
                    control={
                      <Checkbox checked={this.state.isAdmin} onClick={() => this.userMakeAdmin(this.state.id)}/>
                    }
                    label="Admin"
                  />
                  <FormControlLabel
                    disabled={this.state.isModerator}
                    control={
                      <Checkbox checked={this.state.isModerator} onClick={() => this.userMakeModerator(this.state.id)}/>
                    }
                    label="Moderator"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={this.state.isUser} onClick={() => this.userMakeUser(this.state.id)}/>
                    }
                    label="User"
                  />
                </FormGroup>
              </FormControl>
            </form>
            : ""}  
            <hr />
            <br />
            <div className="row">
                <Button disabled={!isValid} onClick={this.saveUser} variant="contained" color="primary" className={classes.button}>
                  {buttonText}
                </Button>
            </div>
            <p>{message}</p>

          </div>
        </div>
      </div>
    );  
  }
}

export default withFirebase(withRouter(withStyles(styles)(UserForm)));