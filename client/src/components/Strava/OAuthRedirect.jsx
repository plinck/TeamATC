import React, { useEffect } from 'react';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Container, makeStyles, Typography, Grid } from '@material-ui/core';
import queryString from 'query-string'
import StravaAPI from "./StravaAPI.js"

const useStyles = makeStyles(theme => ({
    root: {
        [theme.breakpoints.up('md')]: {
            marginLeft: "57px",
            height: "calc(100vh - 95px)"
        },
        background: 'url(/images/ATC-repeating-background.png) center center fixed',
        backgroundSize: "cover",
        height: 'calc(100vh - 65px)',
        overflow: "hidden"
    },
    container: {
        height: "100%",
        overflowY: "auto"
    },
    button: {
        margin: '15px'
    },
    errormessages: {
        color: 'red'
    },
    messages: {
        color: 'white'
    }
    
}))

const OAuthRedirect = (props) => {
    const classes = useStyles();
    let error = undefined;
    let state = undefined;
    let code = undefined;

    const [search, setSearch] = React.useState();
    const [message, setMessage] = React.useState();

    if (props.location.search && !search) {
        setSearch(props.location.search);
    }

    if (search) {
        const values = queryString.parse(search);
        error = values.error;
        state = values.state;
        code = values.code;
    }

    useEffect(() => {
        console.log(`error ${error}`);// "top"
        console.log(`state ${state}`);// "top"
        console.log(`code ${code}`);// "top"

        // If no error process the OAuth return by storing in user record
        if (!error && state && code && props.user.uid) {
            console.log("next Step after OAUTH Returns success");
            StravaAPI.getOAuthToken(props.user.uid, code).then(res => {
                // console.log(`Success in StravaAPI.getOAuthToken, res: ${JSON.stringify(res)}`);
                // redirect with message - how to show on dashboard
                setMessage(`Succesfully Authorized Strava!`)
            }).catch (err => {
                console.error(`Error  StravaAPI.getOAuthToken: ${err}`)
                setMessage(`Strava Authorization not Apporoved`)
            });
        }

    }, [error, state, code, props.user.uid]);

    const sendAuthorizationRequest = () => {
        StravaAPI.sendAuthRequestExpress();
    }

    return (
        <div className={classes.root}>
            <Container className={classes.container} maxWidth="xl">
                {message ? 
                    <Typography color="error" variant="subtitle1" align="center">
                        {message}
                    </Typography>
                    : ""}

                {error ? 
                    <Typography color="error" variant="subtitle1" align="center">
                        Error {error}
                    </Typography>
                    : 
                    <Typography variant="h4" align="center">
                        <br />
                        <Grid className={classes.messages}>Authorize Strava</Grid>
                    </Typography>
                    }
                <Grid align="center">
                    <img src="/images/stravaConnectWithLight.png" alt="connect with strava" onClick={sendAuthorizationRequest}/>
                </Grid>
                <br></br>
                <Grid className={classes.messages} align="center">
                    Click the above button to go to Strava and Authorize it to sync your activities
                    <br />
                    <hr />
                    <br />
                    Note: The actual syncing of activities is not yet complete. Coming soon!
                    <br />
                    <img src="/images/stravaPoweredBy.png" height="60" alt="Powered by Strava"/>
                </Grid>
            
            </Container>
        </div>
    )
}

export default withAuthUserContext(OAuthRedirect);