import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { InputAdornment, Typography, Container, Grid, CardActions } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { Card, CardContent } from '@material-ui/core';

import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase/FirebaseContext';
import AuthUserContext from '../Session/AuthUserContext';
import UserAPI from "../../User/UserAPI";

const INITIAL_STATE = {
    email: '',
    password: '',
    error: null,
    showPassword: false
};

const styles = theme => ({
    container: {
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
        background: 'url(/images/loginGif2.gif) center center fixed'
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
            })
            .catch(error => {
                if (this._isMounted) {
                    this.setState({ error });
                }
            });
    };

    handleGoogleLogin = (e) => {
        e.preventDefault();

        this.props.firebase
            .doSignInWithGoogle()
            .then((authUser) => {
                console.log("Logged in with google to firebase");
                return (UserAPI.addAuthUserToFirestore(authUser));
            })
            .then(() => {
                console.log("Added to firebase");
            })
            .catch(err => {
                console.error("Error logging in with google", err);
                if (this._isMounted) {
                    this.setState({ error: err });
                }
            });
    }

    render() {
        const { classes } = this.props;

        let firebaseAuthKey;
        const { email, password, showPassword, error } = this.state;

        const isInvalid = password === '' || email === '';

        let SignInScreen;

        if (localStorage.getItem(firebaseAuthKey) === "1") {
            SignInScreen = <p>Loading New Page After Google Login ...</p>;
        }
        else {
            SignInScreen =
                <Card>
                    <CardContent>
                        <Typography variant="h5">Sign In</Typography>
                        <form className={classes.container} onSubmit={this.signInUser} >

                            <TextField
                                id="email"
                                label="Email"
                                name="email"
                                value={email}
                                placeholder="JohnDoe@gmail.com"
                                className={classes.textField}
                                multiline // TODO: Remove this once materialize is gone.
                                variant="outlined"
                                type="email"
                                autoComplete="email"
                                margin="normal"
                                onChange={this.onChange}
                            />

                            <TextField
                                id="password"
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                margin="normal"
                                multiline // TODO: Remove this once materialize is gone.
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
                                error={!!this.state.errorText}
                                helperText={this.state.errorText}
                            />
                            <Button disabled={isInvalid} onClick={this.signInUser} variant="contained" color="primary" className={classes.button}>
                                Login
                        </Button>
                        </form>

                        {error && <p>{error.message}</p>}
                        <p>
                            <Link to="/pw-forget">Forgot Password?</Link>
                        </p>

                    </CardContent>
                    <CardActions>
                        <p>Don't have an account? <Link to="/register">Register Now</Link></p>
                        {/* This works, but I am disabling until I can verify they are member of the club */}
                        {/*
                    <button onClick={this.handleGoogleLogin} className="btn lighten-1 z-depth-0"> SignIn With Google</button>
                    */}
                    </CardActions>
                </Card>;
        }

        return (
            <div className={classes.background}>
                <Container>
                    <AuthUserContext.Consumer>
                        {user => user.authUser ? <Redirect to="/dashboard" /> : null}
                    </AuthUserContext.Consumer>
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
