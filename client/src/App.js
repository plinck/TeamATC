import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import Navigation from './components/Navigation/Navigation';
import LandingPage from './components/Landing/Landing';
import Dashboard from './components/Dashboard/dashboard';
import Account from './components/Account/Account';
import Admin from './components/Admin/Admin';
import Activities from './components/Activity/Activities';
import ActivityPage from './components/Activity/ActivityPage';
import ActivityForm from './components/Activity/ActivityForm';
import UserPage from './components/User/UserPage';
import UserForm from './components/User/UserForm';
import Register from './components/Auth/Register/Register';
import { Toolbar } from '@material-ui/core';

// Auth components
import SignInForm from './components/Auth/SignIn/SignIn';
import PasswordForgetPage from './components/Auth/PasswordForget/PasswordForget';

// Session/State Info for all components
import provideAuthUserContext from './components/Auth/Session/provideAuthUserContext';

class App extends React.Component {
  render() {
    return (

      <Router>
        <div>
          <Navigation />
          <Toolbar />
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