import React, { useState, useEffect } from 'react';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Container, makeStyles, Grid } from '@material-ui/core';
import ChallengeDB from "./ChallengeDB"
import ChallengeForm from './ChallengeForm';
import Challenge from "./Challenge"
import UserDB from "../User/UserDB.js"

const useStyles = makeStyles(theme => ({
    main: {
        background: 'url(/images/ATC-repeating-background.png) center center fixed',
        backgroundSize: "cover",
        height: 'calc(100vh - 64px)',
        overflow: "hidden"
    },
    root: {
        [theme.breakpoints.up('md')]: {
            marginLeft: "57px",
        },
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

    const handleDeleteChallenge = (id) => {
        if (id) {
            ChallengeDB.delete(id).then(res => {
                fetchData();
            }).catch(err => {
                setMessage(`Error deleting challenge with id: ${id}, error: ${err}`);
            });
        }
    }

    const handleJoinChallenge = (challengeUid) => {
        UserDB.updateChallenge(props.user.uid, challengeUid).then(() => {
            // User now assigned to new challenge
            setMessage(`joined challenge with ID ${challengeUid}`);
        }).catch(err => {
            console.error(`Error joining challenge: ${challengeUid} for user: ${props.uid}`);
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
        <div className={classes.main}>
            <div className={classes.root}>
                <Container maxWidth="xl">{message ? <h5 className={classes.messages}>{message}</h5> : ""}
                    <Grid container style={{ minHeight: "75vh" }} spacing={2} justify="center" alignItems="center">
                        {userCanUpdateChallenge ?
                            <Grid item xs={12} md={5}>
                                <ChallengeForm id={currentChallengeId}
                                    handleUpdateChallenge={handleUpdateChallenge}
                                />
                            </Grid> : ""
                        }
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
        </div>
    )
}

export default withAuthUserContext(Challenges);