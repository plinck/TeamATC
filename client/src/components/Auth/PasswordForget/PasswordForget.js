import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { withFirebase } from '../Firebase/FirebaseContext';
import { Container, Card, CardContent, Typography, Grid } from '@material-ui/core';

const PasswordForgetPage = () => (
  <div>
    <PasswordForgetForm />
  </div>
);

const styles = theme => ({
  root: {
    [theme.breakpoints.up('md')]: {
      height: "calc(100vh - 64px)",
      marginTop: "-31px"
    },
    background: 'url(/images/ATC-repeating-background.png) center center fixed',
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
  inputFix: {
    marginTop: 5
  },
  menu: {
    width: 200,
  }
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

      <div className={classes.root}>
        <Container className={classes.container}>
          <Grid container
            justify="center">
            <Grid style={{ marginTop: '70px' }} xs={11} md={6} item>

              <Card>
                <CardContent>
                  <Typography variant="h5">Reset Password</Typography>
                  <form className={classes.formContainer}>
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

                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
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