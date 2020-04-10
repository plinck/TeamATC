import React, { useEffect } from 'react';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Container, makeStyles, Typography, Grid } from '@material-ui/core';
import queryString from 'query-string'
import StravaAPI from "./StravaAPI.js"
import Button from '@material-ui/core/Button';
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
    messages: {
        color: 'red'
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
        if (!error && state && code) {
            console.log("next Step after OAUTH Returns success");
            StravaAPI.refreshToken(code, state);
        }

    }, [error, state, code]);

    const sendAuthorizationRequest = () => {
        StravaAPI.sendAuthRequestExpress();
    }

    return (
        <div className={classes.root}>
            <Container className={classes.container} maxWidth="xl">
                {error ? 
                    <Typography color="primary" variant="subtitle1" align="center">
                        Error {error}
                    </Typography>
                    : 
                    <Typography color="primary" variant="subtitle1" align="center">
                        Strava OAuth Code: {code} State: {state}
                    </Typography>
                    }
                <Grid align="center">
                    <Button style={{justifyContent: 'center'}}
                        variant="contained"
                        color="primary"
                        startIcon={<DeleteIcon />}
                        onClick={sendAuthorizationRequest}
                        >
                        Send Strava Auth Request
                    </Button>
                </Grid>
            
            </Container>
        </div>
    )
}

export default withAuthUserContext(OAuthRedirect);