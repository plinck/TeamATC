import React from 'react';
import { withRouter } from 'react-router-dom'
import { Redirect } from 'react-router-dom'

import { withFirebase } from '../Firebase/FirebaseContext';
import AuthUserContext from '../Session/AuthUserContext';

class SignOutButton extends React.Component {

  handleSignout = async (event) => {
    await this.props.firebase.doSignOut();
    console.log("Logged out");
    this.props.history.push("/signin"); 
  }

  render() {
    return(
      <div className="center-align">
        <AuthUserContext.Consumer>
          {user => user.authUser ? null : <Redirect to="/signin" />}
        </AuthUserContext.Consumer>

        <button className="btn blue darken-4" onClick={this.handleSignout}>
          Logout
        </button>
      </div>
    )
  }
}

export default withRouter(withFirebase(SignOutButton));