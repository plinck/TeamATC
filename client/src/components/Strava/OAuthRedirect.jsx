import React, { useEffect } from 'react';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Container, makeStyles, Typography, Grid } from '@material-ui/core';
import queryString from 'query-string'
import StravaAPI from "./StravaAPI.js"
import Button from '@material-ui/core/Button';
import DirectionsBikeIcon from '@material-ui/icons/DirectionsBike';
import CachedIcon from '@material-ui/icons/Cached';
import HistoryIcon from '@material-ui/icons/History';

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
            }).catch (err => {
                console.error(`Error  StravaAPI.getOAuthToken: ${err}`)
            });
        }

    }, [error, state, code, props.user.uid]);

    const sendAuthorizationRequest = () => {
        StravaAPI.sendAuthRequestExpress();
    }
    const refreshStravaToken = () => {
        StravaAPI.refreshStravaToken();
    }
    const getStravaActivities = () => {
        StravaAPI.getStravaActivities();
    }

    return (
        <div className={classes.root}>
            <Container className={classes.container} maxWidth="xl">
                {error ? 
                    <Typography color="error" variant="subtitle1" align="center">
                        Error {error}
                    </Typography>
                    : 
                    <Typography variant="subtitle1" align="center">
                        <Grid className={classes.messages}>Strava OAuth Code: {code} State: {state}</Grid>
                    </Typography>
                    }
                <Grid align="center">
                    <Button style={{justifyContent: 'center'}}
                        variant="contained"
                        color="primary"
                        startIcon={<DirectionsBikeIcon />}
                        onClick={sendAuthorizationRequest}
                        >
                        Send Strava Auth Request
                    </Button>
                </Grid>
                <br></br>
                <Grid align="center">
                    <Button style={{justifyContent: 'center'}}
                        variant="contained"
                        color="primary"
                        startIcon={<HistoryIcon />}
                        onClick={refreshStravaToken}
                        >
                        Refresh Strava Token
                    </Button>
                </Grid>
                <br></br>
                <Grid align="center">
                    <Button style={{justifyContent: 'center'}}
                        variant="contained"
                        color="primary"
                        startIcon={<CachedIcon />}
                        onClick={getStravaActivities}
                        >
                        Get Activities
                    </Button>
                </Grid>
            
            </Container>
        </div>
    )
}

export default withAuthUserContext(OAuthRedirect);