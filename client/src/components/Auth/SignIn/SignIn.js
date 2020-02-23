import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { InputAdornment } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

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
            return(UserAPI.addAuthUserToFirestore(authUser));
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
            <div className="card">
                <div className="card-content">
                    <span className="card-title">Sign In</span>
                    <form className={classes.container} onSubmit={this.signInUser} >

                        <TextField
                            id="email"
                            label="Email"
                            value={email}
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
                            onChange={this.onChange}
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
                            variant="outlined"
                            margin="normal"
                            onChange={this.onChange}
                            error={!!this.state.errorText}
                            helperText={this.state.errorText}
                        />
                    </form>
                    <div className="row">
                        <Button disabled={isInvalid} onClick={this.signInUser} variant="contained" color="primary" className={classes.button}>
                            Login
                        </Button>
                    </div>
                    <div className="row">
                        {error && <p>{error.message}</p>}
                    </div>
                    <p>
                        <Link to="/pw-forget">Forgot Password?</Link>
                    </p>
                    <br />
                    <hr />
                    <br />
                    <p>Don't have an account? <Link to="/register">Register Now</Link></p>
                    <br />
                    {/* This works, but I am disabling until I can verify they are member of the club */}
                    {/*
                    <button onClick={this.handleGoogleLogin} className="btn lighten-1 z-depth-0"> SignIn With Google</button>
                    */}
                </div>
            </div>;
        }

        return (
            <div className="container">
              <AuthUserContext.Consumer>
                {user => user.authUser ? <Redirect to="/dashboard" /> : null}
              </AuthUserContext.Consumer>
              {SignInScreen}
            </div>
        );   
    }
}

const SignInForm = withRouter(withFirebase(SignInFormBase));
export default withStyles(styles)(SignInForm);
