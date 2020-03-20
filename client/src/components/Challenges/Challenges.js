import React, { useState, useEffect } from 'react';
import { Container, makeStyles, Grid } from '@material-ui/core';
import ChallengeDB from "./ChallengeDB"
import ChallengeForm from './ChallengeForm';
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

    const [currentChallengeId, setCurrentChallengeId] = useState();
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

    const handleEditChallenge = (id) => {
        setCurrentChallengeId(id); 
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

    // MAIN START : --
    // get challenges at load - this is like compnent
    const fetchData = () => {
        ChallengeDB.getFiltered().then (challenges => {
            setChallenges(challenges);
        })
          .catch(err => setMessage(err));
    }
    
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className={classes.main}>
            <div className={classes.root}>
                <Container maxWidth="xl">
                    <Grid container style={{ minHeight: "75vh" }} spacing={2} justify="center" alignItems="center">
                        <Grid item xs={12} md={5}>
                            <ChallengeForm id={currentChallengeId}
                                fetchData={fetchData}
                            />
                        </Grid> : ""
                        {challenges.map( challenge => {
                            return (<Challenge challenge={challenge} 
                                handleEditChallenge={handleEditChallenge}
                                handleDeleteChallenge={handleDeleteChallenge}
                                />)
                            })
                        }
                    </Grid>
                </Container>
            </div>
        </div>
    )
}

export default Challenges;