import React from 'react';
import { withStyles } from '@material-ui/core/styles';
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

import UserAPI from "../User/UserAPI";
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

class AccountForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: this.props.uid,
            uid: this.props.uid,
            teamUid: "",
            teamName: "", 
            firstName: "",
            lastName: "",
            photoURL: "",
            phoneNumber: "",
            email: "",
            claims: "",
            isAdmin: false,
            isTeamLead: false,
            isModerator: false,
            isUser: false,    
            message: "",
            teams: null,
            teamLookup: null
        };
    }

    fetchUser = (uid) => {
        UserAPI
            .get(uid)
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
        this.fetchTeams();  // for pulldown so doesnt matter if user exists yet

        // since t hey are auth, uid == id
        console.log(`authUser.uid: ${this.state.uid}`);
        this.fetchUser(this.state.uid);
    }

    updateUser = (e) => {
        e.preventDefault();
        // Update current user in firestore (and auth for some fields)
        console.log(`updating db with user.uid:${this.state.uid}`);
        const user = this.state;
        // set team name from ID
        user.teamName = this.state.teamLookup[this.state.teamUid]
    
        UserAPI
            .updateCurrent(user)
            .then(user => {
                // set message to show update
                this.setState({message: "Account Updated"});
            })
            .catch(err => {
                // set message to show update
                this.setState({message: `Error updating account ${err}`});
            });
    };

    onChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    };

    render() {
        const { classes } = this.props;

        const {
            firstName,
            lastName,
            photoURL,
            phoneNumber,
            email,
            claims,
            isAdmin,
            isTeamLead,
            isModerator,
            isUser,        
            message,      
            teamUid,
            teams
        } = this.state;

        const isValid = firstName !== "" && lastName !== "" && phoneNumber !== "";
        var isRoleEditEnabled = false;

        // DO NOT allow users to edit their own role even if admin as bad
        // things can happen
        // if (isAdmin) {
        //     isRoleEditEnabled = true;
        // }

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
                    <span className="card-title">User Profile (Role: {claims})</span>
                    <form className={classes.container} onSubmit={this.updateUser} >
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
      
                        <TextField disabled={true}
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
                        value={firstName}
                        multiline
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
                        value={lastName}
                        multiline
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
                        margin="normal"
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
                                control={<Checkbox checked={isTeamLead}/>}
                            label="TeamLead"
                            /> 
                            <FormControlLabel
                                disabled={!isRoleEditEnabled}
                                control={
                                <Checkbox checked={isAdmin}/>
                                }
                                label="Admin"
                            />
                            <FormControlLabel
                                disabled={!isRoleEditEnabled}
                                control={
                                <Checkbox checked={isModerator}/>
                                }
                                label="Moderator"
                            />
                            <FormControlLabel
                                disabled={!isRoleEditEnabled}
                                control={
                                <Checkbox checked={isUser}/>
                                }
                                label="User"
                            />
                        </FormGroup>
                    </FormControl> :
                    ""}
                    </form>
                    <hr />    
                    <br />
                    <div className="row">
                        <Button disabled={!isValid} onClick={this.updateUser} variant="contained" color="primary" className={classes.button}>
                            Update
                        </Button>
                    </div>
        
                    <p>{message}</p>
    
                </div>
            </div>
        </div>
        ); 
    }
}

export default  withStyles(styles)(AccountForm);