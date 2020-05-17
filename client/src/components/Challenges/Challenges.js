import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Container, Typography, makeStyles, Grid } from '@material-ui/core';
import ChallengeDB from "./ChallengeDB"
import ChallengeForm from './ChallengeForm';
import Challenge from "./Challenge"
import UserDB from "../User/UserDB.js"
import { ORG } from "../Environment/Environment"

const useStyles = makeStyles(theme => ({
    root: {
        [theme.breakpoints.up('md')]: {
            marginLeft: "57px",
            height: "calc(100vh - 95px)"
        },
        background: `url(/images/${ORG}/repeating-background.png) center center fixed`,
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

const Challenges = (props) => {
    const classes = useStyles();

    const [challenges, setChallenges] = useState([{}]);

    const [currentChallengeId, setCurrentChallengeId] = useState();
    const [message, setMessage] = useState();

    // When editting. make sure you set the id to ensure form gets proper record.
    const handleEditChallenge = (id) => {
        setCurrentChallengeId(id);
    }

    // When an update occurs you must also clear the current challnge ID since it needs to be NULL/undefined
    const handleUpdateChallenge = (id) => {
        setCurrentChallengeId(undefined);
        fetchData();
    }

    const handleDeleteChallenge = (challenge) => {
        if (challenge) {
            ChallengeDB.delete(challenge).then(res => {
                fetchData();
            }).catch(err => {
                setMessage(`Error deleting challenge with id: ${challenge.id}, error: ${err}`);
            });
        }
    }

    const handleJoinChallenge = (challenge) => {
        UserDB.updateChallenge(props.user.uid, challenge.id).then(() => {
            // User now assigned to new challenge
            setMessage(`joined challenge ${challenge.name}`);
            props.history.push({
                pathname: '/teams'
            });
        }).catch(err => {
            console.error(`Error joining challenge: ${challenge.id} for user: ${props.uid}`);
        });
    }


    // MAIN START : --
    // get challenges at load - this is like compnent
    const fetchData = () => {
        ChallengeDB.getFiltered().then(challenges => {
            setChallenges(challenges);
            // Each time you refresh, make sure the currnt id is cleared
        })
            .catch(err => setMessage(err));
    }

    // Make sure useEffect only gets called once --
    // i.e. if you dont use optional parameter (array of properities to watch), it
    // will fire this function every single time the component is refreshed which isnt cool.
    useEffect(() => {
        fetchData();
    }, []);

    const userCanUpdateChallenge = (props.user && props.user.isAdmin) ? true : false;

    return (
        <div className={classes.root}>
            <Container className={classes.container} maxWidth="xl">
                {message ? <Typography color="primary" variant="subtitle1" align="center">{message}</Typography> : ""}
                <Grid style={{ marginTop: '10px' }} container spacing={2} justify="center" alignItems="center">
                    {userCanUpdateChallenge ?
                        <Grid item xs={12} md={8}>
                            <ChallengeForm id={currentChallengeId}
                                handleUpdateChallenge={handleUpdateChallenge}
                            />
                        </Grid> : null
                    }

                </Grid>
                <Grid container spacing={2} justify="center" alignItems="stretch">
                    {challenges.map((challenge, index) => {
                        return (<Challenge key={index} challenge={challenge}
                            handleEditChallenge={handleEditChallenge}
                            handleDeleteChallenge={handleDeleteChallenge}
                            handleJoinChallenge={handleJoinChallenge}
                        />)
                    })
                    }
                </Grid>
            </Container>
        </div>
    )
}

export default withAuthUserContext(withRouter(Challenges));