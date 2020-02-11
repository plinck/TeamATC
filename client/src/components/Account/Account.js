import React from 'react';
import { Redirect } from 'react-router';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import AccountForm from "./AccountForm";
import PasswordChangeForm from '../Auth/PasswordForget/PasswordChange';

  
class Account extends React.Component {

  onChange = event => {
      this.setState({
          [event.target.name]: event.target.value
      });
  };

  render() {

    // deconstrcut prop from authContext
    let {
      uid,
      displayName,
      email,
      phoneNumber,
      claims
    } = this.props.user;
    displayName = displayName || "";
    email = email || "";
    phoneNumber = phoneNumber || "";
    claims = claims || "";

    // Some props take time to get ready so return null when uid not avaialble
    if (uid === null) {
      return null;
    }

    if (this.props.user.authUser) {
      return ( 
        <div>
          <AccountForm 
            uid={uid}
            displayName={displayName}
            email={email}
            phoneNumber={phoneNumber}
            claims={claims}
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

export default withAuthUserContext(Account);