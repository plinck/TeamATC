import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import NumberFormat from 'react-number-format';
import locatStyles from './Register.module.css';
import Button from '@material-ui/core/Button';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { InputAdornment } from '@material-ui/core';
import { RemoveRedEye } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';


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
            className={locatStyles.input}
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
            className={locatStyles.input}
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
        email: "",
        passwrod: "",
        phone: "",
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
        // 0. check to ensure thet are not already registered
        // 1. Validate they are club memmber
        // 2. Sign the up as user - Auth and user DB
        // for initial test, just sign them up.

        alert("Thank you for registering! Start entering workouts.");

        // const propspect = this.state;
        // axios.post("/api/prospect", propspect)
        //     .then(res => console.log(res.data))
        //     .then(alert("Thank you for registering! We will contact you shortly."))
        //     .then(this.setState({
        //         errorText: "",
        //         firstName: "",
        //         lastName: "",
        //         email: "",
        //         password: "",
        //         phone: ""
        //     }))
    }

    render() {
        const { classes } = this.props;
        const { showPassword, password, confirmPassword } = this.state;

        return (
            <div className="container">
                <div className="card">
                    <div className="card-content">
                        <span className="card-title">Register Now</span>
              
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
                                value={password}
                                inputProps={
                                    {
                                        style: {
                                            margin: 50,
                                            padding: 18
                                        }, 
                                        startAdornment: (
                                            <InputAdornment position="start">
                                              <AccountCircle />
                                            </InputAdornment>
                                          ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="Toggle password visibility"
                                                    onClick={this.handleClickShowPassword}>
                                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }
                                className={classes.textField}
                                variant="outlined"
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                margin="normal"
                                onChange={this.handleChange('password')}
                                error={!!this.state.errorText}
                                helperText={this.state.errorText}
                            />

                            <TextField
                                id="confirmPassword"
                                label="Confirm Password"
                                inputProps={{
                                    style: {margin: 5, padding: 18} 
                                }}                              
                                className={classes.textField}
                                variant="outlined"
                                type="password"
                                name="password"
                                autoComplete="password"
                                margin="normal"
                                onChange={this.handlePasswordValidator}
                                error={!!this.state.errorText}
                                helperText={this.state.errorText}
                            />

                            <TextField
                                id="phone"
                                label="Phone Number"
                                inputProps={{
                                    style: {margin: 5, padding: 18} 
                                }}                              
                                className={classes.textField}
                                variant="outlined"
                                margin="normal"
                                value={this.state.phone}
                                onChange={this.handleChange('phone')}
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
                </div >
            </div>
        );
    }
}

Register.propTypes = {
    classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(Register);