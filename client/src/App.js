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
import Results from './components/Results/Results';
import Activities from './components/Activity/Activities';
import ActivityPage from './components/Activity/ActivityPage';
import ActivityForm from './components/Activity/ActivityForm';
import UserPage from './components/User/UserPage';
import UserForm from './components/User/UserForm';
import Register from './components/Auth/Register/Register';
import Challenges from './components/Challenges/Challenges';
import Teams from './components/Team/Teams';
import OAuthRedirect from './components/Strava/OAuthRedirect.jsx';
import { Toolbar } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

// Auth components
import SignInForm from './components/Auth/SignIn/SignIn';
import PasswordForgetPage from './components/Auth/PasswordForget/PasswordForget';

// Session/State Info for all components
import provideAuthUserContext from './components/Auth/Session/provideAuthUserContext';

const styles = theme => ({
  toolbar: {
    [theme.breakpoints.up('md')]: {
      minHeight: "95px",
    },
    minHeight: "65px"
  }
});


class App extends React.Component {

  render() {
    const { classes } = this.props;

    return (

      <Router>
        <div>
          <Navigation />
          <Toolbar className={classes.toolbar} />
          <Route exact path="/" component={LandingPage} />
          <Route exact path="/signin" component={SignInForm} />
          <Route exact path="/pw-forget" component={PasswordForgetPage} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/results" component={Results} />
          <Route exact path="/challenges" component={Challenges} />
          <Route exact path="/teams" component={Teams} />
          <Route exact path="/account" component={Account} />
          <Route exact path="/admin" component={Admin} />
          <Route exact path="/activities" component={Activities} />
          <Route exact path="/activitypage" component={ActivityPage} />
          <Route exact path="/activityform" component={ActivityForm} />
          <Route exact path="/userpage" component={UserPage} />
          <Route exact path="/userform" component={UserForm} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/oauthredirect" component={OAuthRedirect} />
        </div>
      </Router>

    );
  }
}

export default provideAuthUserContext(withStyles(styles)(App));