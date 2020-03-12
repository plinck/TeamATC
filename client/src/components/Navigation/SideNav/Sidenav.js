import React from 'react';
import clsx from 'clsx';
import { Link, NavLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Typography, Button } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import DashboardIcon from '@material-ui/icons/Dashboard';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        border: 'none',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        border: "none",
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: theme.spacing(.75),
        color: 'white',
        backgroundColor: 'black',
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    sideText: {
        textDecoration: 'none',
        color: "grey"
    },
    menuButton: {
        color: 'white',
        textDecoration: 'none',
    },
}));

export default function MiniDrawer() {
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
                        <img className="logo" src="../images/logo.png" alt="TeamATC Challenge Logo" />
                        <span style={{ display: "inline", verticalAlign: "super", marginLeft: "17px" }}><Typography style={{ display: "inline", verticalAlign: "super" }} variant="h4">TeamATC</Typography></span>
                    </Link>
                </div>
                <Divider />
                <List>
                    <NavLink className={classes.sideText} to="/dashboard"> <ListItem button><ListItemIcon><DashboardIcon /></ListItemIcon><ListItemText>Home</ListItemText></ListItem></NavLink>
                    <NavLink className={classes.sideText} to="/activities"><ListItem button><ListItemIcon><DirectionsRunIcon /></ListItemIcon><ListItemText>Activities</ListItemText></ListItem></NavLink>
                    <NavLink className={classes.sideText} to="/account"><ListItem button><ListItemIcon><PersonIcon /></ListItemIcon><ListItemText>Account</ListItemText></ListItem></NavLink>
                    <Divider></Divider>
                    <ListItem style={{ textAlign: 'center' }}>{open ? <ListItemText><Button variant="contained" color="primary" style={{ marginLeft: "3px" }}><NavLink className={classes.menuButton} to="/activitypage" >New Workout</NavLink></Button></ListItemText> : null}</ListItem>

                </List>
            </Drawer>
        </div >
    );
}