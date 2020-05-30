import React from 'react';
import { withRouter } from 'react-router-dom'
import { Redirect } from 'react-router-dom'

import { withFirebase } from '../Firebase/FirebaseContext';
import Context from '../Session/Context';
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
        <Context.Consumer>
          {user => user.authUser ? null : <Redirect to="/signin" />}
        </Context.Consumer>

        <Button variant="contained" color="secondary" onClick={this.handleSignout}>
          Logout
        </Button>
      </div>
    )
  }
}

export default withRouter(withFirebase(SignOutButton));