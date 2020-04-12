import React, { useEffect } from 'react';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Container, makeStyles, Typography, Grid } from '@material-ui/core';
import queryString from 'query-string'
import StravaAPI from "./StravaAPI.js"
import Button from '@material-ui/core/Button';
import DirectionsBikeIcon from '@material-ui/icons/DirectionsBike';
import CachedIcon from '@material-ui/icons/Cached';
import HistoryIcon from '@material-ui/icons/History';
import DeleteIcon from '@material-ui/icons/Delete';

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
            }).catch (err => {
                console.error(`Error  StravaAPI.getOAuthToken: ${err}`)
            });
        }

    }, [error, state, code, props.user.uid]);

    const sendAuthorizationRequest = () => {
        StravaAPI.sendAuthRequestExpress();
    }
    const refreshStravaToken = () => {
        if (props.user.uid && props.user.stravaRefreshToken) {
            StravaAPI.refreshStravaToken(props.user.uid, props.user.stravaRefreshToken).then( data => {
                setMessage(`StravaAPI.refreshStravaToken Successful`);    
            }).catch (err => {
                console.error(`StravaAPI.refreshStravaToken: error ${err}`);
                setMessage(`StravaAPI.refreshStravaToken: error ${err}`);    
            });
        } else {
            console.error(`refreshStravaToken: user info not ready, try again in a few minutes ...`);
            setMessage(`refreshStravaToken: user info not ready, try again in a few minutes ...`);
        }
    }
    const deauthorizeStrava = () => {
        if (props.user.uid && props.user.stravaAccessToken) {
            StravaAPI.deauthorizeStrava(props.user.uid, props.user.stravaAccessToken).then( data => {
                setMessage(`StravaAPI.deauthorizeStrava Successful`);    
            }).catch (err => {
                console.error(`StravaAPI.deauthorizeStrava: error ${err}`);
                setMessage(`StravaAPI.deauthorizeStrava: error ${err}`);    
            });
        } else {
            console.error(`deauthorizeStrava: user info not ready, try again in a few minutes ...`);
            setMessage(`deauthorizeStrava: user info not ready, try again in a few minutes ...`);
        }
    }
    const getStravaActivities = () => {
        if (props.user.uid && props.user.stravaAccessToken) {
            StravaAPI.getStravaActivities(props.user.uid, props.user.stravaAccessToken).then( data => {
                setMessage(`StravaAPI.getStravaActivities Successful`);    
            }).catch (err => {
                console.error(`StravaAPI.getStravaActivities: error ${err}`);
                setMessage(`StravaAPI.getStravaActivities: error ${err}`);    
            });
        } else {
            console.error(`getStravaActivities: user info not ready, try again in a few minutes ...`);
            setMessage(`getStravaActivities: user info not ready, try again in a few minutes ...`);
        }
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
                        startIcon={<DeleteIcon />}
                        onClick={deauthorizeStrava}
                        >
                        Deauthorize Strava
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