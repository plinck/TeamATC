import React, { Component } from 'react';
// access to hostory for redirects etc
import { withRouter } from 'react-router-dom';
// for firebase conext and access to firebase app
import { withFirebase } from '../Firebase/FirebaseContext';
import UserAPI from "../../User/UserAPI";

const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  error: null,
};

class SignUpForm extends Component {
  constructor(props) {
    super(props);
    console.log(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    event.preventDefault();

    // eslint-disable-next-line no-unused-vars
    const { username, email, passwordOne } = this.state;
    console.log(this.props);

    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        // clear the userinout fields
        this.setState({ ...INITIAL_STATE });
        // Now Create the user in firestore
        return(UserAPI.addAuthUserToFirestore(authUser));
      })
      .then(() => {
        // redirect home
        this.props.history.push("/dashboard"); 
      })
      .catch(error => {
        this.setState({ error });
    });
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';

    return (
      <div className="container">
        <form className="white" onSubmit={this.onSubmit}>
          <h5 className="grey-text text-darken-3">Sign Up</h5>
          <div className="input-field">
            <label htmlFor="username">User Name</label>
            <input type="text" name='username' value={username} onChange={this.onChange} />
          </div>
          <div className="input-field">
            <label htmlFor="email">Email</label>
            <input type="email" name='email' value={email} onChange={this.onChange} />
          </div>
          <div className="input-field">
            <label htmlFor="passwordOne">Password</label>
            <input type="password" name='passwordOne' value={passwordOne} onChange={this.onChange} />
          </div>
          <div className="input-field">
            <label htmlFor="passwordTwo">Confirm Password</label>
            <input type="password" name='passwordTwo' value={passwordTwo} onChange={this.onChange} />
          </div>
          <div className="input-field">
            <button disabled={isInvalid} className="btn lighten-1 z-depth-0">Sign Up</button>
            {error && <p>{error.message}</p>}
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(withFirebase(SignUpForm));