import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { InputAdornment, Box, Typography, Container, Grid, CardActions, Link as L } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { Card, CardContent } from '@material-ui/core';

import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase/FirebaseContext';
import Context from '../Session/Context';
import UserDB from "../../User/UserDB.js";
import { ORG } from "../../Environment/Environment"

const INITIAL_STATE = {
    email: '',
    password: '',
    message: null,
    showPassword: false
};

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
    formContainer: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        width: '100%',
    },
    menu: {
        width: 200,
    },
    formControl: {
        minWidth: 300,
    },
    background: {
        height: 'calc(100vh - 64px)',
        backgroundSize: "cover",
        background: `url(/images/${ORG}/repeating-background.png) center center fixed`,
    }
});

class SignInFormBase extends React.Component {
    constructor(props) {
        super(props);

        this._isMounted = false;

        this.state = { ...INITIAL_STATE };
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleClickShowPassword = (e) => {
        e.preventDefault();

        this.setState(state => ({ showPassword: !state.showPassword }));
    };

    signInUser = e => {
        e.preventDefault();

        const { email, password } = this.state;

        // dont reset unless goood login
        // this.setState({ ...INITIAL_STATE });  
        this.props.firebase
            .doSignInWithEmailAndPassword(email, password)
            .then((authUser) => {
                // NOTE : DO NOT RESET STATE if component unmounts since we are going to redirect
                // this causes memory leaks - Igot an error explaining all that
                if (this._isMounted) {
                    this.setState({ ...INITIAL_STATE });
                }
            }).catch(err => {
                if (this._isMounted) {
                    this.setState({ message: `Error sigining in: ${err}` });
                }
            });
    };

    handleGoogleLogin = (e) => {
        e.preventDefault();

        this.props.firebase
            .doSignInWithGoogle()
            .then((authUser) => {
                console.log("Logged in with google to firebase");
                return (UserDB.addAuthUserToFirestore(authUser));
            }).then(() => {
                console.log("Added to firebase");
            }).catch(err => {
                console.error(`Error logging in with google ${err}`);
                if (this._isMounted) {
                    this.setState({ message: `Error logging in with google ${err}` });
                }
            });
    }

    render() {
        const { classes } = this.props;

        let firebaseAuthKey;
        const { email, password, showPassword, message } = this.state;

        const isInvalid = password === '' || email === '';

        let SignInScreen;

        if (localStorage.getItem(firebaseAuthKey) === "1") {
            SignInScreen = <p>Loading New Page After Google Login ...</p>;
        }
        else {
            SignInScreen =
                <Card>
                    <CardContent>
                        {message ? 
                            <Typography variant="subtitle1">
                                <Box fontWeight="fontWeightLight" color="warning.main" fontStyle="oblique">
                                    {message}
                                </Box>
                            </Typography> : ""}
                        <Typography variant="h5">Sign In</Typography>
                        <form className={classes.formContainer} onSubmit={this.signInUser} >

                            <TextField
                                id="email"
                                label="Email"
                                name="email"
                                value={email}
                                placeholder="JohnDoe@gmail.com"
                                className={classes.textField}
                                variant="outlined"
                                type="email"
                                autoComplete="email"
                                margin="normal"
                                onChange={this.onChange}
                                inputProps={{
                                    style: { padding: '18px' }
                                }}
                            />

                            <TextField
                                id="password"
                                name="password"
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
                                onChange={this.onChange}
                                inputProps={{
                                    style: { padding: '18px' }
                                }}
                            />
                            <Button disabled={isInvalid} onClick={this.signInUser} variant="contained" color="primary" className={classes.button}>
                                Login
                        </Button>
                        </form>

                        <Link to="/pw-forget">Forgot Password?</Link>
                        <Typography variant="subtitle1">Having trouble signing in? <L href="mailto:info@atlantatriclub.com">Contact Support</L></Typography>

                    </CardContent>
                    <CardActions>
                        Don't have an account? <Link to="/register">Register Now</Link>
                        {/* This works, but I am disabling until I can verify they are member of the club */}
                        {/*
                    <button onClick={this.handleGoogleLogin} className="btn lighten-1 z-depth-0"> SignIn With Google</button>
                    */}
                    </CardActions>
                </Card>;
        }

        return (
            <div className={classes.root}>
                <Container className={classes.container}>
                    <Context.Consumer>
                        {user => user.authUser ? <Redirect to="/dashboard" /> : null}
                    </Context.Consumer>
                    <Grid container
                        justify="center">
                        <Grid style={{ marginTop: '70px' }} xs={11} md={6} item>
                            {SignInScreen}
                        </Grid>
                    </Grid>
                </Container>
            </div>
        );
    }
}

const SignInForm = withRouter(withFirebase(SignInFormBase));
export default withStyles(styles)(SignInForm);
