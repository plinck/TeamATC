import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import SignOutButton from '../Auth/SignOut/SignOut';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { withRouter } from 'react-router-dom';
import AccountMenu from "../Account/AccountMenu";
import './Navigation.css';
import { Fab, Button, Typography, Container, Toolbar, IconButton, SwipeableDrawer, ListItem, ListItemText, List, ListItemIcon, Divider } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import HomeIcon from '@material-ui/icons/Home'
import PersonIcon from '@material-ui/icons/Person';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import DashboardIcon from '@material-ui/icons/Dashboard';
import SettingsIcon from '@material-ui/icons/Settings';
import Sidenav from './SideNav/Sidenav';
import TimerIcon from '@material-ui/icons/Timer';
// import EqualizerIcon from '@material-ui/icons/Equalizer';
import AddIcon from '@material-ui/icons/Add';
import MailIcon from '@material-ui/icons/Mail';
import PeopleIcon from '@material-ui/icons/People';
import { ORG } from "../Environment/Environment.js"

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
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  nonAuthTitle: {
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
  toolBarFlex: {
    [theme.breakpoints.up('md')]: {
      justifyContent: 'flex-end',
    },
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'space-between',
    },
  },
  nonAuthToolBarFlex: {
    justifyContent: 'space-between'
  },
  subHeader: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
    minHeight: "20px !important",
    maxHeight: "30px !important",
    margin: "0px 0px 0px 30px",
    display: 'flex',
    justifyContent: "space-between"
  }
}));

let Navigation = (props) => {
  const classes = useStyles();
  let name = `${ORG} Club Challenge`;

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
      <ListItem><ListItemIcon><TimerIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/challenges">Challenges</NavLink></ListItemText></ListItem>
      <ListItem><ListItemIcon><PeopleIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/teams">Teams</NavLink></ListItemText></ListItem>
      <Divider></Divider>
      <ListItem><ListItemIcon><SettingsIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/admin">Admin</NavLink></ListItemText></ListItem>
      <Divider></Divider>
      <ListItem><ListItemText><Button variant="contained" color="primary"><NavLink className={classes.menuButton} to="/activitypage" >New Workout</NavLink></Button></ListItemText></ListItem>
      <ListItem><ListItemIcon><MailIcon /></ListItemIcon><ListItemText><a className={classes.mobileButton} href="mailto:info@atlantatriclub.com">Contact Support</a></ListItemText></ListItem>
      <ListItem><ListItemText> <SignOutButton /></ListItemText></ListItem>
    </List>
    ;

  const navigationAdmin =
    <div className={classes.navButtonsHide}>
      <Sidenav></Sidenav>

      <NavLink className={classes.menuButton} to="/activitypage" >
        <Fab size="small" color="primary" aria-label="add">
          <AddIcon />
        </Fab>
      </NavLink>

      <Button><AccountMenu /></Button>
      <Button><NavLink className={classes.menuButton} to="/admin">Admin</NavLink></Button>
    </div>
    ;

  const navigationAuthMobile =
    <List onClick={toggleDrawer('left', false)}>
      <ListItem><ListItemIcon><DashboardIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/dashboard">Home</NavLink></ListItemText></ListItem>
      <ListItem><ListItemIcon><DirectionsRunIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/activities">Activities</NavLink></ListItemText></ListItem>
      <ListItem><ListItemIcon><PersonIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/account">Account</NavLink></ListItemText></ListItem>
      <ListItem><ListItemIcon><TimerIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/challenges">Challenges</NavLink></ListItemText></ListItem>
      <ListItem><ListItemIcon><PeopleIcon /></ListItemIcon><ListItemText><NavLink className={classes.mobileButton} to="/teams">Teams</NavLink></ListItemText></ListItem>
      <Divider></Divider>
      <ListItem><ListItemText><Button variant="contained" color="primary"><NavLink className={classes.menuButton} to="/activitypage" >New Workout</NavLink></Button></ListItemText></ListItem>
      <ListItem><ListItemIcon><MailIcon /></ListItemIcon><ListItemText><a className={classes.mobileButton} href="mailto:info@atlantatriclub.com">Contact Support</a></ListItemText></ListItem>
      <ListItem><ListItemText> <SignOutButton /></ListItemText></ListItem>
    </List>
    ;


  const navigationAuth =
    <div className={classes.navButtonsHide}>
      <Sidenav></Sidenav>
      <div style={{ textAlign: "right" }}>
        <Button ><AccountMenu /></Button>
        <NavLink className={classes.menuButton} to="/activitypage" >
          <Fab size="small" color="primary" aria-label="add">
            <AddIcon />
          </Fab>
        </NavLink>
      </div>
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
      <Button variant="contained" color="primary"><NavLink className={classes.menuButton} to="/signin">Login</NavLink></Button>
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

      <AppBar color="secondary">
        <Container maxWidth="xl">
          <Toolbar style={{ minHeight: "64px" }} className={props.user.authUser ? classes.toolBarFlex : classes.nonAuthToolBarFlex} >
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={toggleDrawer('left', true)}
              className={classes.navIconHide}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h4" className={props.user.authUser ? classes.title : classes.nonAuthTitle}>
              <Link style={{ textDecoration: "none", color: "white" }} to="/">
                <img className="logo" src={`../images/${ORG}/logo.png`} alt="Challenge Logo" /> <span className={classes.titleText}>{name}</span>
              </Link>
            </Typography>

            {navBar}

          </Toolbar>
        </Container>
        {props.user.authUser ?
          <Container maxWidth="xl" style={{ backgroundColor: "red" }}>
            <Toolbar className={classes.subHeader}>
              <Typography variant="subtitle1">
                Team: {props.user.teamName}
              </Typography>
              <Typography variant="subtitle1">
                Challenge: {props.user.challengeName}
              </Typography>
            </Toolbar>
          </Container>
          : null}
      </AppBar >

    </div >
  );
} //class

export default withAuthUserContext(withRouter(Navigation));