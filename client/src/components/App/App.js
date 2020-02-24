import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import Navigation from '../Navigation/Navigation';
import LandingPage from '../Landing/Landing';
import Dashboard from '../Dashboard';
import Account from '../Account/Account';
import Admin from '../Admin/Admin';
import Activities from '../Activity/Activities';
import ActivityPage from '../Activity/ActivityPage';
import ActivityForm from '../Activity/ActivityForm';
import UserPage from '../User/UserPage';
import UserForm from '../User/UserForm';
import Register from '../Auth/Register/Register';

// Auth components
import SignInForm from '../Auth/SignIn/SignIn';
import PasswordForgetPage from '../Auth/PasswordForget/PasswordForget';

// Session/State Info for all components
import provideAuthUserContext from '../Auth/Session/provideAuthUserContext';

class App extends React.Component {
  render() {
    return (

      <Router>
        <div>
          <Navigation />
          <Route exact path="/" component={LandingPage} />
          <Route exact path="/signin" component={SignInForm} />
          <Route exact path="/pw-forget" component={PasswordForgetPage} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/account" component={Account} />
          <Route exact path="/admin" component={Admin} />
          <Route exact path="/activities" component={Activities} />
          <Route exact path="/activitypage" component={ActivityPage} />
          <Route exact path="/activityform" component={ActivityForm} />
          <Route exact path="/userpage" component={UserPage} />
          <Route exact path="/userform" component={UserForm} />
          <Route exact path="/register" component={Register} />
        </div>
      </Router>

    );
  }
}

export default provideAuthUserContext(App);