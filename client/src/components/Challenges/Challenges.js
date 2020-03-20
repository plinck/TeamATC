import React, { useState, useEffect } from 'react';
import { Container, makeStyles, Grid, Card, CardContent, Typography, Button, Divider } from '@material-ui/core';
import ChallengeDB from "./ChallengeDB"
import ChallengeForm from './ChallengeForm';
import JoinChallenge from './JoinChallenge';
import Challenge from "./Challenge"

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
    }
}))

const Challenges = (props) => {
    const classes = useStyles();

    const [challenges, setChallenges] = useState([{}]);

    const [message, setMessage] = useState();
    const [creating, setCreating] = useState();
    const [selection, setSelection] = useState(false);

    const handleJoin = () => {
        setCreating(false)
        setSelection(true)
    }

    const handleCreate = () => {
        setCreating(true)
        setSelection(true)
    }

    // MAIN START : --
    // get challenges at load - this is like compnent
    const test = () => {
        ChallengeDB.getFiltered().then (challenges => {
            setChallenges(challenges);
        })
    }

    async function fetchData() {
        ChallengeDB.getFiltered().then (challenges => {
            setChallenges(challenges);
        })
          .catch(err => setMessage(err));
    }
    
    useEffect(() => {
        fetchData();
    });

    return (
        <div className={classes.main}>
            <div className={classes.root}>
                <Container maxWidth="xl">
                    <Grid container style={{ minHeight: "75vh" }} spacing={2} justify="center" alignItems="center">
                        <Grid item xs={12} md={5}>
                            <ChallengeForm />
                        </Grid> : ""
                        {challenges.map( challenge => {
                            return (<Challenge challenge={challenge} />)
                            })
                        }
                    </Grid>
                </Container>
            </div>
        </div>
    )
}

export default Challenges;