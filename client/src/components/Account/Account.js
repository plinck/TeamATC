import React from 'react';
import { Redirect } from 'react-router';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import AccountForm from "./AccountForm";
import PasswordChangeForm from '../Auth/PasswordForget/PasswordChange';
import { withStyles } from '@material-ui/core/styles';



const styles = theme => ({
  root: {
    [theme.breakpoints.up('md')]: {
      marginLeft: "57px",
    },
    paddingTop: "10px"
  }
});

class Account extends React.Component {

  onChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  render() {

    const { classes } = this.props;

    // deconstrcut prop from authContext
    let {
      uid,
      displayName,
      email,
      phoneNumber,
      primaryRole
    } = this.props.user;
    displayName = displayName || "";
    email = email || "";
    phoneNumber = phoneNumber || "";
    primaryRole = primaryRole || "";

    // Some props take time to get ready so return null when uid not avaialble
    if (uid === null) {
      return null;
    }

    if (this.props.user.authUser) {
      return (
        <div className={classes.root}>
          <AccountForm
            uid={uid}
            displayName={displayName}
            email={email}
            phoneNumber={phoneNumber}
            primaryRole={primaryRole}
          />
          <PasswordChangeForm />
        </div>
      );
    } else {
      return (
        <Redirect to="/signin" />
      );
    }
  }
}

export default withAuthUserContext(withStyles(styles)(Account));