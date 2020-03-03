import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import NumberFormat from 'react-number-format';
import localStyles from './Register.module.css';
import Button from '@material-ui/core/Button';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { InputAdornment } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import UserAPI from "../../User/UserAPI";
import MemberDB from "../../User/MemberDB";

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    inputFix: {
        marginTop: 50
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 300,
    },
        //style for font size
    resize:{
        fontSize:200
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

function NumberFormatCustom(props) {
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
            thousandSeparator
            prefix="$"
        />
    );
}

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
NumberFormatCustom.propTypes = {
    inputRef: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};

class Register extends React.Component {
    state = {
        disabled: true,
        noError: false,
        firstName: "",
        lastName: "",
        photoURL: "",
        email: "",
        password: "",
        phoneNumber: "",
        uid: "",
        teamUid: "",
        teamName: "",
        primaryRole: "noauth",
        errorText: "",
        showPassword: false
    };

    handleChange = name => event => {
        this.setState({ [name]: event.target.value }, () => this.enableButton());

    };

    enableButton = () => {
        if (this.state.firstName && this.state.lastName && this.state.email && this.state.password
            && this.state.noError === true) {
            this.setState({ disabled: false });
        } else {
            this.setState({ disabled: true });
        }
    }

    handlePasswordValidator = event => {
        if (event.target.value !== this.state.password) {
            this.setState({ errorText: "Passwords do not match!", noError: false }, () => this.enableButton())
        } else {
            this.setState({ errorText: "", noError: true }, () => this.enableButton())
        }
    }

    handleClickShowPassword = (e) => {
        e.preventDefault();

        this.setState(state => ({ showPassword: !state.showPassword }));
    };

    registerUser = event => {
        // Just allow them to register as long as they arte member of the club
        // 1. Validate they are club memmber
        const user = this.state;
        MemberDB.getByEmail(user.email).then (_ => {
            // First, create the auth user in firebase
            // Should actually update auth profile after this is done but not 100% needed as user stuff comes from firestore
            UserAPI.registerNewUser(user).then(authUser => {
                // Now Create the user in firestore
                UserAPI.addAuthUserToFirestore(authUser, user).then( (id) => {
                    this.setState({message: "New User Added. "});
                    this.props.history.push("/dashboard"); 
                }).catch(err => {
                    this.setState({ message: err.message });
                });    
            }).catch(err => {
                // try to refresh token
                this.setState({ message: `Error adding user ${err}` });
            });
        }).catch (_ => {
            this.setState({ message: `Can not register - Not a valid ATC Member - Please check with club admin` });
        });        
    }

    render() {
        const { classes } = this.props;
        const { showPassword } = this.state;

        return (
            <div className="container">
                <div className="card">
                    <div className="card-content">
                        <span className="card-title">Register Now</span>
                        {this.state.message ? <div className="red-text">{this.state.message}</div> : ""}
              
                            <TextField
                                id="firstName"
                                label="First Name"
                                placeholder="John"
                                inputProps={{
                                    style: {margin: 5, padding: 18} 
                                }}                              
                                className={classes.textField}
                                variant="outlined"
                                margin="normal"
                                value={this.state.firstName}
                                onChange={this.handleChange('firstName')}
                            />

                            <TextField
                                id="lastName"
                                label="Last Name"
                                placeholder="Doe"
                                inputProps={{
                                    style: {margin: 5, padding: 18} 
                                }}                              
                                className={classes.textField}
                                variant="outlined"
                                margin="normal"
                                value={this.state.lastName}
                                onChange={this.handleChange('lastName')}
                            />

                            <TextField
                                id="email"
                                label="Email"
                                placeholder="JohnDoe@gmail.com"
                                inputProps={{
                                    style: {margin: 5, padding: 18}
                                }}                              
                                className={classes.textField}
                                variant="outlined"
                                type="email"
                                name="email"
                                autoComplete="email"
                                margin="normal"
                                value={this.state.email}
                                onChange={this.handleChange('email')}
                            />

                            <TextField
                                id="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                margin="normal"
                                className={classes.textField}
                                InputProps={{
                                    style: {
                                        padding: 18
                                    }, 
                                    endAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton
                                                aria-label="Toggle password visibility"
                                                onClick={this.handleClickShowPassword}>
                                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                onChange={this.handleChange('password')}
                                error={!!this.state.errorText}
                                helperText={this.state.errorText}
                            />
                          
                            <TextField
                                id="confirmPassword"
                                label="Confirm Password"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                margin="normal"
                                className={classes.textField}
                                InputProps={{
                                    style: {
                                        padding: 18
                                    }, 
                                    endAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton
                                                aria-label="Toggle password visibility"
                                                onClick={this.handleClickShowPassword}>
                                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                onChange={this.handlePasswordValidator}
                                error={!!this.state.errorText}
                                helperText={this.state.errorText}
                            />
                          
                            <TextField
                                id="phoneNumber"
                                label="Phone Number"
                                inputProps={{
                                    style: {margin: 5, padding: 18} 
                                }}                              
                                className={classes.textField}
                                variant="outlined"
                                margin="normal"
                                value={this.state.phoneNumber}
                                onChange={this.handleChange('phoneNumber')}
                                InputProps={{
                                    inputComponent: NumberFormatPhone,
                                }}
                            />
                            <br />
                            <div className="center-align">
                                <Button disabled={this.state.disabled} onClick={this.registerUser} id="submit" variant="contained" color="primary" className={classes.button}>
                                    Register
                                </Button>
                            </div>
                    </div>
                </div>
            </div>
        );
    }
}

Register.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Register);