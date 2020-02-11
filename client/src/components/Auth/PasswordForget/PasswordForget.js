import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { withFirebase } from '../Firebase/FirebaseContext';

const PasswordForgetPage = () => (
  <div>
    <PasswordForgetForm />
  </div>
);

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

const INITIAL_STATE = {
  email: '',
  message: null,
};
class PasswordForgetFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { email } = this.state;

    this.props.firebase
      .doPasswordReset(email)
      .then(() => {
        this.props.history.push({
          pathname: '/signin',
        });  
      })
      .catch(error => {
        this.setState({ message: error.message });
      });

    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { classes } = this.props;

    const { email, message } = this.state;

    const isInvalid = email === '';

    return (
        <div className="container">
            <div className="card">
                <div className="card-content">
                    <span className="card-title">Reset Password</span>
                    <form className={classes.container}>
                        <TextField
                        id="email"
                        label="Email"
                        placeholder="example@gmail.com"
                        multiline
                        className={classes.textField}
                        type="email"
                        name="email"
                        autoComplete="email"
                        margin="normal"
                        value={email}
                        onChange={this.onChange}
                        />

                    </form>
                    <br />
                    <div className="row">
                        <Button disabled={isInvalid} onClick={this.onSubmit} variant="contained" color="primary" className={classes.button}>
                            Reset My Password
                        </Button>
                    </div>
                    <p>{message}</p>

                </div>
            </div>
      </div>
    );
  }
}

const PasswordForgetLink = () => (
  <p>
    <Link to="/pw-forget">Forgot Password?</Link>
  </p>
);

export default PasswordForgetPage;

const PasswordForgetForm = withRouter(withStyles(styles)(withFirebase(PasswordForgetFormBase)));

export { PasswordForgetForm, PasswordForgetLink };