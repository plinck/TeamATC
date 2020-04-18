import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import NumberFormat from 'react-number-format';
import Button from '@material-ui/core/Button';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { InputAdornment, Container, Card, CardContent, Grid, Typography, Box, Divider } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import UserAuthAPI from "../../User/UserAuthAPI";
import UserDB from "../../User/UserDB";
import MemberDB from "../../User/MemberDB";
import { ORG } from "../../Environment/Environment"

// TODO: Remove input props once materialize is removed.
const styles = theme => ({
    root: {
        [theme.breakpoints.up('md')]: {
            height: "calc(100vh - 64px)",
            marginTop: "-31px"
        },
        background: `url(/images/${ORG}/repeating-background.png) center center fixed`,
        backgroundSize: "cover",
        height: 'calc(100vh - 65px)',
        overflow: "hidden"
    },
    container: {
        height: "100%",
        overflowY: "auto"
    },
    textField: {
        margin: theme.spacing(1),
        width: 250,
    },
    resize: {
        fontSize: 200
    },
    menu: {
        width: 200,
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
        MemberDB.getByEmail(user.email).then(_ => {
            // First, create the auth user in firebase
            // Should actually update auth profile after this is done but not 100% needed as user stuff comes from firestore
            UserAuthAPI.registerNewUser(user).then(authUser => {
                // Now Create the user in firestore
                UserDB.addAuthUserToFirestore(authUser, user).then((id) => {
                    this.setState({ message: "New User Added. " });
                    this.props.history.push("/dashboard");
                }).catch(err => {
                    this.setState({ message: err.message });
                });
            }).catch(err => {
                // try to refresh token
                this.setState({ message: `Error adding user ${err}` });
            });
        }).catch(_ => {
            const message = <div>Can not register - Not a valid ATC Member <a href="mailto:info@atlantatriclub.com">Contact Support</a></div>
            this.setState({ message: message });
        });
    }

    render() {
        const { classes } = this.props;
        const { showPassword } = this.state;

        return (
            <div className={classes.root}>
                <Container className={classes.container}>
                    <Grid container
                        justify="center">
                        <Grid style={{ marginTop: '70px' }} xs={11} md={6} item>

                            <Card>
                                <CardContent>
                                    {this.state.message ? <Typography variant="subtitle1"><Box fontWeight="fontWeightLight" color="warning.main" fontStyle="oblique">{this.state.message}</Box></Typography> : ""}
                                    <Typography variant="h5">Register Now</Typography>
                                    <Typography variant="subtitle1"><Box fontWeight="fontWeightLight" color="info.main" fontStyle="oblique">Use your ATC Member Email to register</Box></Typography>

                                    <TextField
                                        id="firstName"
                                        label="First Name"
                                        placeholder="John"
                                        className={classes.textField}
                                        variant="outlined"
                                        margin="normal"
                                        value={this.state.firstName}
                                        onChange={this.handleChange('firstName')}
                                        inputProps={{
                                            style: { padding: '18px' }
                                        }}
                                    />

                                    <TextField
                                        id="lastName"
                                        label="Last Name"
                                        placeholder="Doe"
                                        className={classes.textField}
                                        variant="outlined"
                                        margin="normal"
                                        value={this.state.lastName}
                                        onChange={this.handleChange('lastName')}
                                        inputProps={{
                                            style: { padding: '18px' }
                                        }}
                                    />

                                    <TextField
                                        id="email"
                                        label="Email"
                                        placeholder="JohnDoe@gmail.com"
                                        className={classes.textField}
                                        variant="outlined"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        margin="normal"
                                        value={this.state.email}
                                        onChange={this.handleChange('email')}
                                        inputProps={{
                                            style: { padding: '18px' }
                                        }}
                                    />
                                    <TextField
                                        id="phoneNumber"
                                        label="Phone Number"
                                        className={classes.textField}
                                        variant="outlined"
                                        margin="normal"
                                        value={this.state.phoneNumber}
                                        onChange={this.handleChange('phoneNumber')}
                                        InputProps={{
                                            inputComponent: NumberFormatPhone,
                                        }}
                                        inputProps={{
                                            style: { padding: '18px' }
                                        }}
                                    />
                                    <Divider />
                                    <TextField
                                        id="password"
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        margin="normal"
                                        className={classes.textField}
                                        InputProps={{
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
                                        inputProps={{
                                            style: { padding: '18px' }
                                        }}
                                    />

                                    <TextField
                                        id="confirmPassword"
                                        label="Confirm Password"
                                        type={showPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        margin="normal"
                                        className={classes.textField}
                                        InputProps={{
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
                                        inputProps={{
                                            style: { padding: '18px' }
                                        }}
                                    />
                                    <div style={{ textAlign: "center" }}>
                                        <Button disabled={this.state.disabled} onClick={this.registerUser} id="submit" variant="contained" color="primary" className={classes.button}>
                                            Register
                                        </Button>
                                    </div>
                                    <Typography variant="subtitle1">Having trouble registering? <a href="mailto:info@atlantatriclub.com">Contact Support</a></Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </div>
        );
    }
}

Register.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Register);