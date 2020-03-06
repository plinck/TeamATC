import React from 'react';
import './Landing.css';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { Redirect } from 'react-router';
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { Container, Button, Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    container: {
        height: '100vh',
        backgroundImage: 'url(/images/landingPageBackground2.jpg)',
        backgroundSize: "cover",
        [theme.breakpoints.down('md')]: {
            backgroundPositionX: "54%"
        },
        [theme.breakpoints.down('sm')]: {
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1.8) 3%, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 0.65) 100%), url(/images/landingPageBackground2.jpg)',
            backgroundPositionX: "54%"
        }
    },
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    homeButton: {
        margin: "0px 20px 0px 0px",
    }
}));

const Landing = (props) => {
    const history = useHistory();
    const classes = useStyles()

    if (props.user.authUser) {
        return (
            <Redirect to="/dashboard" />
        );
    }

    const handleClick = (link) => {
        history.push(link)
    }

    return (
        <div className={classes.container}>
            <Container maxWidth='lg' style={{ height: "100%" }}>
                <Grid
                    style={{ height: "100%", paddingTop: '100px' }}
                    container
                    spacing={3}
                >
                    <Grid item xs={12} md={5}>
                        <Typography variant="h3">The Atlanta Triathlon Club Team Challenge</Typography>
                        <Typography variant="h6">The Team ATC Challenge Web App lets you track your workout activities, manage your team and score, and keep an eye on the challenge leaderboards – all in real time. </Typography>
                        <div style={{ textAlign: "center" }}>
                            <Button onClick={() => handleClick("/signin")} className={classes.homeButton} variant="contained" color="primary">Login</Button>
                            <Button onClick={() => handleClick("/register")} className={classes.homeButton} variant='contained'>Sign Up</Button>
                        </div>
                    </Grid>
                </Grid>


            </Container>
            <br />
            <footer className="page-footer blue darken-4">
                <div className="footer-copyright">
                    <div className="container">
                        © 2020 Copyright
                        </div>
                </div>
            </footer>

        </div >
    );
}
export default withAuthUserContext(Landing);