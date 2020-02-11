import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import Navigation from '../Navigation/Navigation';
import LandingPage from '../Landing';
import HomePage from '../Dashboard';
import Account from '../Account/Account';
import Admin from '../Admin/Admin';
import Payment from '../Payment/Payment';
import Deposit from '../Dashboard/Deposit/Deposit';
import UserPage from '../User/UserPage';
import UserForm from '../User/UserForm';
import Register from '../Register/Register';
import DepositList from '../Deposits/DepositsList';
import Banker from '../Banker/Banker';
import Prospects from '../Banker/Prospects';

// Auth components
import SignUpForm from '../Auth/SignUp/SignUp';
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
          <Route exact path="/signup" component={SignUpForm} />
          <Route exact path="/signin" component={SignInForm} />
          <Route exact path="/pw-forget" component={PasswordForgetPage} />
          <Route exact path="/dashboard" component={HomePage} />
          <Route exact path="/account" component={Account} />
          <Route exact path="/admin" component={Admin} />
          <Route exact path="/payment" component={Payment} />
          <Route exact path="/userpage" component={UserPage} />
          <Route exact path="/userform" component={UserForm} />
          <Route exact path="/dashboard/payment" component={Payment} />
          <Route exact path="/dashboard/deposit" component={Deposit} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/depositlist" component={DepositList} />
          <Route exact path="/banker" component={Banker} />
          <Route exact path="/prospects" component={Prospects} />
        </div>
      </Router>

    );
  }
}

export default provideAuthUserContext(App);