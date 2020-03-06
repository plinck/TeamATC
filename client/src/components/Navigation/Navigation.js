import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import SignOutButton from '../Auth/SignOut/SignOut';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { withRouter } from 'react-router-dom';
import AccountMenu from "../Account/AccountMenu";
import './Navigation.css';
import { Button, Typography, Container, Toolbar, IconButton, SwipeableDrawer } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    color: 'white',
    textDecoration: 'none'
  },
  title: {
    flexGrow: 1,
  },
  titleText: {
    verticalAlign: "super",
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  navButtonsHide: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

let Navigation = (props) => {
  const classes = useStyles();
  let name = 'TeamATC Challenge';

  const [state, setState] = React.useState({
    left: false,
  });

  const toggleDrawer = (side, open) => event => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [side]: open });
  };


  const navigationAdminMobile =
    <ul>
      <li><NavLink to="/dashboard">Home</NavLink></li>
      <li><NavLink to="/activities">Activities</NavLink></li>
      <li><NavLink to="/activitypage" className="waves-effect waves-light btn">New Workut</NavLink></li>
      <li><NavLink to="/account">Account</NavLink></li>
      <li><NavLink to="/admin">Admin</NavLink></li>
      {/* this.props.user.isModerator ? <li><NavLink onClick={this.forceCloseSideNav} to="/moderator">Moderator</NavLink></li> : "" */}
      <li><SignOutButton /></li>
    </ul>
    ;

  const navigationAdmin =
    <ul>
      <li><NavLink to="/dashboard">Home</NavLink></li>
      <li><NavLink to="/activities">Activities</NavLink></li>
      <li><NavLink to="/activitypage" className="waves-effect waves-light btn">New Workut</NavLink></li>
      <li><AccountMenu /></li>
      <li><NavLink to="/admin">Admin</NavLink></li>
    </ul>
    ;

  const navigationAuthMobile =
    <ul>
      <li><NavLink to="/dashboard">Home</NavLink></li>
      <li><NavLink to="/activities">Activities</NavLink></li>
      <li><NavLink to="/activitypage" className="waves-effect waves-light btn">New Workut</NavLink></li>
      <li><NavLink to="/account">Account</NavLink></li>
      <li > <SignOutButton /></li>
    </ul>
    ;




  const navigationAuth =
    <>
      <Button><NavLink className={classes.menuButton} to="/dashboard">Home</NavLink></Button>
      <Button><NavLink className={classes.menuButton} to="/activities">Activities</NavLink></Button>
      <Button variant="contained" color="secondary"><NavLink className={classes.menuButton} to="/activitypage" >New Workut</NavLink></Button>
      <Button><AccountMenu /></Button>
    </>
    ;

  const navigationNonAuthMobile =
    <ul>
      <li><NavLink to="/">Landing</NavLink></li>
      <li><NavLink to="/signin">Sign In</NavLink></li>
    </ul>
    ;

  const navigationNonAuth =
    <div className={classes.navButtonsHide}>
      <Button><NavLink className={classes.menuButton} to="/">Landing</NavLink></Button>
      <Button><NavLink className={classes.menuButton} to="/signin">Sign In</NavLink></Button>
    </div>

  // get auth user from react-context firebase
  // Not the AuthUSerContext Provider passes the authUser
  // in its value={} paramater (see withAuthentication component in Auth/Session)
  // ANY COMPONENT that needs authUser info uses consumer this way

  let navBar, navBarMobile;
  if (props.user.authUser && props.user.isAdmin) {
    navBar = navigationAdmin;
    navBarMobile = navigationAdminMobile;
  } else if (props.user.authUser) {
    navBar = navigationAuth;
    navBarMobile = navigationAuthMobile;
  } else {
    navBar = navigationNonAuth;
    navBarMobile = navigationNonAuthMobile;
  }

  return (
    <div>
      <SwipeableDrawer
        open={state.left}
        onClose={toggleDrawer('left', false)}
        onOpen={toggleDrawer('left', true)}
      >
        {navBarMobile}
      </SwipeableDrawer>

      <AppBar>
        <Container>
          <Toolbar>
            <Typography variant="h4" className={classes.title}>
              <img className="logo" src="../images/logo.png" alt="TeamATC Challenge Logo" /> <span className={classes.titleText}>{name}</span>
            </Typography>
            {navBar}
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={toggleDrawer('left', true)}
              className={classes.navIconHide}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar >

    </div >
  );
} //class

export default withAuthUserContext(withRouter(Navigation));