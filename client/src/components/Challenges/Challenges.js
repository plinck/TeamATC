import React, { useState } from 'react';
import { Container, makeStyles, Grid, Card, CardContent, Typography, Button, Divider } from '@material-ui/core';
import CreateChallenge from './CreateChallenge';
import JoinChallenge from './JoinChallenge';

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

const Challenge = (props) => {
    const classes = useStyles();
    const [creating, setCreating] = useState();
    const [selection, setSelection] = useState(false);

    return (
        <div className={classes.main}>
            <div className={classes.root}>
                <Container maxWidth="xl">
                    <Grid container style={{ minHeight: "75vh" }} spacing={2} justify="center" alignItems="center">
                        {selection ? creating ? <Grid item xs={12} md={5}>
                            <CreateChallenge />
                        </Grid>
                            :
                            <Grid item xs={12} md={5}>
                                <JoinChallenge />
                            </Grid>
                            :
                            <Grid item xs={12} md={5}>
                                <Card>
                                    <CardContent style={{ textAlign: "center" }}>
                                        <Typography variant="h5">Challenges</Typography>
                                        <Button className={classes.button} variant="contained" color="primary">Join Challenge</Button>
                                        <Divider></Divider>
                                        <Button className={classes.button} variant="contained" color="primary">Create New Challenge</Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        }


                    </Grid>
                </Container>
            </div>
        </div>
    )
}

export default Challenge;