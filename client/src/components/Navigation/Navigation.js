import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import SignOutButton from '../Auth/SignOut/SignOut';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { withRouter } from 'react-router-dom';
import AccountMenu from "../Account/AccountMenu";
import './Navigation.css';
import { Button, Typography, Container, Toolbar, IconButton, SwipeableDrawer, ListItem, ListItemText, List, ListItemIcon } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import HomeIcon from '@material-ui/icons/Home'
import PersonIcon from '@material-ui/icons/Person';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import DashboardIcon from '@material-ui/icons/Dashboard';
import SettingsIcon from '@material-ui/icons/Settings';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    color: 'white',
    textDecoration: 'none'
  },
  mobileButton: {
    color: 'gray',
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
    <List onClick={toggleDrawer('left', false)}>
      <ListItem><ListItemIcon><DashboardIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/dashboard">Home</NavLink></ListItemText></ListItem>
      <ListItem><ListItemIcon><DirectionsRunIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/activities">Activities</NavLink></ListItemText></ListItem>
      <ListItem><ListItemIcon><PersonIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/account">Account</NavLink></ListItemText></ListItem>
      <ListItem><ListItemText><Button variant="contained" color="secondary"><NavLink className={classes.menuButton} to="/activitypage" >New Workout</NavLink></Button></ListItemText></ListItem>
      <ListItem><ListItemIcon><SettingsIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/admin">Admin</NavLink></ListItemText></ListItem>
      <ListItem><ListItemText> <SignOutButton /></ListItemText></ListItem>
      {/* this.props.user.isModerator ? <li><NavLink onClick={this.forceCloseSideNav} to="/moderator">Moderator</NavLink></li> : "" */}
    </List >
    ;

  const navigationAdmin =
    <div className={classes.navButtonsHide}>
      <Button><NavLink className={classes.menuButton} to="/dashboard">Home</NavLink></Button>
      <Button><NavLink className={classes.menuButton} to="/activities">Activities</NavLink></Button>
      <Button variant="contained" color="secondary"><NavLink className={classes.menuButton} to="/activitypage" >New Workout</NavLink></Button>
      <Button><AccountMenu /></Button>
      <Button><NavLink className={classes.menuButton} to="/admin">Admin</NavLink></Button>
    </div>
    ;

  const navigationAuthMobile =
    <List onClick={toggleDrawer('left', false)}>
      <ListItem><ListItemIcon><DashboardIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/dashboard">Home</NavLink></ListItemText></ListItem>
      <ListItem><ListItemIcon><DirectionsRunIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/activities">Activities</NavLink></ListItemText></ListItem>
      <ListItem><ListItemIcon><PersonIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/account">Account</NavLink></ListItemText></ListItem>
      <ListItem><ListItemText><Button variant="contained" color="secondary"><NavLink className={classes.menuButton} to="/activitypage" >New Workout</NavLink></Button></ListItemText></ListItem>
      <ListItem><ListItemText> <SignOutButton /></ListItemText></ListItem>
    </List>
    ;




  const navigationAuth =
    <div className={classes.navButtonsHide}>
      <Button><NavLink className={classes.menuButton} to="/dashboard">Home</NavLink></Button>
      <Button><NavLink className={classes.menuButton} to="/activities">Activities</NavLink></Button>
      <Button variant="contained" color="secondary"><NavLink className={classes.menuButton} to="/activitypage" >New Workout</NavLink></Button>
      <Button><AccountMenu /></Button>
    </div>
    ;

  const navigationNonAuthMobile =
    <List onClick={toggleDrawer('left', false)}>
      <ListItem><ListItemIcon><HomeIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/">Landing</NavLink></ListItemText></ListItem>
      <ListItem><ListItemIcon><PersonIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/signin">Sign In</NavLink></ListItemText></ListItem>
    </List >
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

      <AppBar color="primary">
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