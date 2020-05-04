import React from 'react';
import { withRouter } from 'react-router-dom'
import { Redirect } from 'react-router-dom'

import { withFirebase } from '../Firebase/FirebaseContext';
import AuthUserContext from '../Session/AuthUserContext';
import { Button } from '@material-ui/core';

class SignOutButton extends React.Component {

  handleSignout = async (event) => {
    await this.props.firebase.doSignOut();
    console.log("Logged out");
    this.props.history.push("/");
  }

  render() {
    return (
      <div className="center-align">
        <AuthUserContext.Consumer>
          {user => user.authUser ? null : <Redirect to="/signin" />}
        </AuthUserContext.Consumer>

        <Button variant="contained" color="secondary" onClick={this.handleSignout}>
          Logout
        </Button>
      </div>
    )
  }
}

export default withRouter(withFirebase(SignOutButton));