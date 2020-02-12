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

import UserAPI from "../User/UserAPI";

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

    state = {
        id: this.props.uid,
        uid: this.props.uid,
        firstName: "",
        lastName: "",
        photoURL: "",
        phoneNumber: "",
        email: "",
        claims: "",
        isAdmin: false,
        isCashier: false,
        isBanker: false,
        isUser: false,    
        message: ""
    };

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
                    claims: user.claims || "user",
                    isAdmin: user.isAdmin,
                    isCashier: user.isCashier,
                    isBanker: user.isBanker,
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

    componentDidMount() {
        // since t hey are auth, uid == id
        console.log(`authUser.uid: ${this.state.uid}`);
        this.fetchUser(this.state.uid);
    }

    updateUser = (e) => {
        e.preventDefault();
        // Update current user in firestore (and auth for some fields)
        console.log(`updating db with user.uid:${this.state.uid}`);
        const user = this.state;
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
            isCashier,
            isBanker,
            isUser,        
            message
        } = this.state;

        const isValid = firstName !== "" && lastName !== "" && phoneNumber !== "";
        var isRoleEditEnabled = false;

        // DO NOT allow users to edit their own role even if admin as bad
        // things can happen
        // if (isAdmin) {
        //     isRoleEditEnabled = true;
        // }

        return ( 
            <div className="container">
            <div className="card">
                <div className="card-content">
                    <span className="card-title">User Profile (Role: {claims})</span>
                    <form className={classes.container} onSubmit={this.updateUser} >
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
                                control={<Checkbox checked={isCashier}/>}
                            label="Cashier"
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
                                <Checkbox checked={isBanker}/>
                                }
                                label="Banker"
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