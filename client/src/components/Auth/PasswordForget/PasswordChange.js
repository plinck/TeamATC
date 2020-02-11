import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import { withFirebase } from '../Firebase/FirebaseContext';

const INITIAL_STATE = {
    passwordOne: '',
    passwordTwo: '',
    message: "",
    showPasswordOne: false,
    showPasswordTwo: false,
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

class PasswordChangeForm extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    event.preventDefault();

    const { passwordOne } = this.state;

    this.props.firebase
      .doPasswordUpdate(passwordOne)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
      })
      .catch(error => {
        this.setState({ error });
      });

  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { classes } = this.props;

    const {
        passwordOne,
        passwordTwo,
        showPasswordOne,
        showPasswordTwo,  
        message
      } = this.state;
  
    const isInvalid = passwordOne !== passwordTwo || passwordOne === '';

    return (
        <div className="container">
        <div className="card">
          <div className="card-content">
            <span className="card-title">Password Change</span>
            <form className={classes.container}>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="passwordOne">Password</InputLabel>
                <Input
                id="passwordOne"
                name="passwordOne"
                type={showPasswordOne ? 'text' : 'password'}
                value={passwordOne}
                onChange={this.onChange}
                endAdornment={
                    <IconButton
                        aria-label="Toggle password visibility"
                        onClick={this.handleClickShowPasswordOne}
                    >
                        {showPasswordOne ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                }
                />
              </FormControl>
              
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="passwordTwo">Confirm Password</InputLabel>
                <Input
                id="passwordTwo"
                name="passwordTwo"
                type={showPasswordTwo ? 'text' : 'password'}
                value={passwordTwo}
                onChange={this.onChange}
                endAdornment={
                    <IconButton
                        aria-label="Toggle password visibility"
                        onClick={this.handleClickShowPasswordTwo}
                    >
                        {showPasswordTwo ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                }
                />
              </FormControl>
              
            </form>
            <br />
            <div className="row">
                <Button disabled={isInvalid} onClick={this.onSubmit} variant="contained" color="primary" className={classes.button}>
                    Change Password
                </Button>
            </div>
            <p>{message}</p>

          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(withFirebase(PasswordChangeForm));