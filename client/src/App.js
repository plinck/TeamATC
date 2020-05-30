import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import Navigation from './components/Navigation/Navigation.jsx';
import LandingPage from './components/Landing/Landing';
import Dashboard from './components/Dashboard/dashboard.jsx';
import DashboardBackend from './components/Dashboard/DashboardBackend.jsx';
import Account from './components/Account/Account';
import Admin from './components/Admin/Admin.jsx';
import AdminFunctions from './components/Admin/AdminFunctions.jsx';
import Results from './components/Results/Results';
import Activities from './components/Activity/Activities.jsx';
import ActivityPage from './components/Activity/ActivityPage.jsx';
import ActivityForm from './components/Activity/ActivityForm.jsx';
import UserPage from './components/User/UserPage.jsx';
import UserForm from './components/User/UserForm.jsx';
import Register from './components/Auth/Register/Register.jsx';
import Challenges from './components/Challenges/Challenges';
import Teams from './components/Team/Teams.jsx';
import OAuthRedirect from './components/Strava/OAuthRedirect.jsx';
import StravaTestPage from './components/Strava/StravaTestPage.jsx';
import { Toolbar } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { BACKDASH } from "./components/Environment/Environment";


// Auth components
import SignInForm from './components/Auth/SignIn/SignIn';
import PasswordForgetPage from './components/Auth/PasswordForget/PasswordForget';

// Session/State Info for all components
import provideContext from './components/Auth/Session/provideContext';

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
          {BACKDASH === "0" ?
            <>
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/dashboardalternate" component={DashboardBackend} />
            </>
            :
            <>
            <Route exact path="/dashboard" component={DashboardBackend} />
            <Route exact path="/dashboardalternate" component={Dashboard} />   
            </>       
          }
          <Route exact path="/challenges" component={Challenges} />
          <Route exact path="/teams" component={Teams} />
          <Route exact path="/results" component={Results} />
          <Route exact path="/account" component={Account} />
          <Route exact path="/admin" component={Admin} />
          <Route exact path="/adminfunctions" component={AdminFunctions} />
          <Route exact path="/activities" component={Activities} />
          <Route exact path="/activitypage" component={ActivityPage} />
          <Route exact path="/activityform" component={ActivityForm} />
          <Route exact path="/userpage" component={UserPage} />
          <Route exact path="/userform" component={UserForm} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/oauthredirect" component={OAuthRedirect} />
          <Route exact path="/stravatestpage" component={StravaTestPage} />
        </div>
      </Router>

    );
  }
}

export default provideContext(withStyles(styles)(App));