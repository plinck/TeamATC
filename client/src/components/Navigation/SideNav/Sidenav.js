import React from "react";
import clsx from "clsx";
import { Link, NavLink } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Typography, Button } from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import PeopleIcon from "@material-ui/icons/People";
import DirectionsRunIcon from "@material-ui/icons/DirectionsRun";
import DashboardIcon from "@material-ui/icons/Dashboard";
// import EqualizerIcon from '@material-ui/icons/Equalizer';
import TimerIcon from "@material-ui/icons/Timer";
import MailIcon from "@material-ui/icons/Mail";
import DirectionsBikeIcon from "@material-ui/icons/DirectionsBike";
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents';
import FilterHdrIcon from '@material-ui/icons/FilterHdr';

import { ORG } from "../../Environment/Environment";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    border: "none",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    border: "none",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(7) + 1,
    },
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "4px",
    color: "white",
    backgroundColor: "black",
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  sideText: {
    textDecoration: "none",
    color: "grey",
  },
  menuButton: {
    color: "white",
    textDecoration: "none",
  },
}));


export default function SideNav(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <Drawer
        onMouseEnter={handleDrawerOpen}
        onMouseLeave={handleDrawerClose}
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.toolbar}>
          <Link style={{ textDecoration: "none", color: "white" }} to="/">
            <img
              className="logo"
              src={`../images/${ORG}/logo.png`}
              alt="Club Challenge Logo"
            />
            <span
              style={{
                display: "inline",
                verticalAlign: "super",
                marginLeft: "17px",
              }}
            >
              <Typography
                style={{ display: "inline", verticalAlign: "super" }}
                variant="h4"
              >{`Team${ORG}`}</Typography>
            </span>
          </Link>
        </div>
        <Divider />
        <List>
          <NavLink className={classes.sideText} to="/dashboard">
            {" "}
            <ListItem
              selected={window.location.pathname === "/dashboard"}
              button
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText>Home</ListItemText>
            </ListItem>
          </NavLink>
          <NavLink className={classes.sideText} to="/results">
            <ListItem
              selected={window.location.pathname === "/results"}
              button
            >
              <ListItemIcon>
                <EmojiEventsIcon />
              </ListItemIcon>
              <ListItemText>Results</ListItemText>
            </ListItem>
          </NavLink>
          <NavLink className={classes.sideText} to="/hillrepeatsdash">
            <ListItem
              selected={window.location.pathname === "/hillrepeatsdash"}
              button
            >
              <ListItemIcon>
                <FilterHdrIcon />
              </ListItemIcon>
              <ListItemText>Hill Repeats</ListItemText>
            </ListItem>
          </NavLink>
          <NavLink className={classes.sideText} to="/activities">
            <ListItem
              selected={window.location.pathname === "/activities"}
              button
            >
              <ListItemIcon>
                <DirectionsRunIcon />
              </ListItemIcon>
              <ListItemText>Activities</ListItemText>
            </ListItem>
          </NavLink>
          <NavLink className={classes.sideText} to="/account">
            <ListItem selected={window.location.pathname === "/account"} button>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText>Account</ListItemText>
            </ListItem>
          </NavLink>
          <NavLink className={classes.sideText} to="/challenges">
            <ListItem
              selected={window.location.pathname === "/challenges"}
              button
            >
              <ListItemIcon>
                <TimerIcon />
              </ListItemIcon>
              <ListItemText>Challenges</ListItemText>
            </ListItem>
          </NavLink>
          <NavLink className={classes.sideText} to="/teams">
            <ListItem selected={window.location.pathname === "/teams"} button>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText>Teams</ListItemText>
            </ListItem>
          </NavLink>
          <Divider></Divider>
          <a className={classes.sideText} href="mailto:info@atlantatriclub.com">
            <ListItem button>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText>Contact Support</ListItemText>
            </ListItem>
          </a>
          {props.context && props.context.isAdmin ?  
            <div>
              <Divider></Divider>
              <NavLink className={classes.sideText} to="/admin">
                <ListItem selected={window.location.pathname === "/admin"} button>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText>Users</ListItemText>
                </ListItem>
              </NavLink>
              <NavLink className={classes.sideText} to="/adminfunctions">
                <ListItem selected={window.location.pathname === "/adminfunctions"} button>
                  <ListItemIcon>
                    <DirectionsBikeIcon />
                  </ListItemIcon>
                  <ListItemText>Admin</ListItemText>
                </ListItem>
              </NavLink>
            </div>
           : <div></div>}
          <Divider></Divider>
          <ListItem style={{ textAlign: "center" }}>
            {open ? (
              <ListItemText>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginLeft: "3px" }}
                >
                  <NavLink className={classes.menuButton} to="/activitypage">
                    New Workout
                  </NavLink>
                </Button>
              </ListItemText>
            ) : null}
          </ListItem>
          <NavLink to="/oauthredirect">
            <ListItem>
              {open ? (
                <img
                  style={{ margin: "0 auto" }}
                  src="/images/stravaConnectWith.png"
                  alt="connect with strava"
                />
              ) : null}
            </ListItem>
          </NavLink>
        </List>
      </Drawer>
    </div>
  );
}
